import * as XLSX from 'xlsx';
import { AttendanceParseResult, ParsedAttendanceRow, AttendanceRecord } from '@/types';
import { localDB } from '@/lib/local-db';

const HEADER_MAP: Record<string, keyof ParsedAttendanceRow> = {
  // Legacy format
  'matricule': 'matricule', 'id': 'matricule', 'code': 'matricule',
  'name': 'name', 'nom': 'name', 'full name': 'name',
  'department': 'department', 'departement': 'department', 'département': 'department', 'service': 'department', 'dept': 'department',
  'date': 'date',
  'in': 'in', 'check in': 'in',
  'out': 'out', 'check out': 'out',
  'hours': 'hours', 'heures': 'hours',
  'delay': 'delayMin', 'retard': 'delayMin',
  'status': 'status', 'statut': 'status',

  // SAHAR format (with tolerance for accents, spacing, dots)
  'matricule.': 'matricule',
  'nom.': 'name',
  'temps.': 'timestamp',
  'temps': 'timestamp',
  'e/s.': 'es',
  'e/s': 'es',
  'e/s calculée.': 'es_calc',
  'e/s calculée': 'es_calc',
  'note.': 'note',
  'note': 'note',
  'opération.': 'operation',
  'opération': 'operation',
  'retard(min)': 'delayMin',
};

const IN_PUNCHES = new Set(['c/in', 'e', 'entrée']);
const OUT_PUNCHES = new Set(['c/out', 's', 'sortie']);

const holidays: Record<string, string> = {
  '2025-01-01': 'New Year\'s Day', '2025-05-01': 'Labour Day', '2025-07-30': 'Throne Day',
  '2026-01-01': 'New Year\'s Day', '2026-05-01': 'Labour Day', '2026-07-30': 'Throne Day',
};

function parseSaharTimestamp(field: any): { date: string | null, time: string | null } {
    if (field === null || field === undefined || field === '') return { date: null, time: null };

    let d: Date;
    if (typeof field === 'number') {
        const excelDate = XLSX.SSF.parse_date_code(field);
        if (!excelDate) return { date: null, time: null };
        d = new Date(excelDate.y, excelDate.m - 1, excelDate.d, excelDate.H, excelDate.M, excelDate.S);
    } else if (typeof field === 'string') {
        let dateObj: Date | null = null;
        const matchDDMMYYYY = field.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{1,2}):(\d{2}))?/);
        if (matchDDMMYYYY) {
            const [_, day, month, year, hour = '0', minute = '0'] = matchDDMMYYYY;
            dateObj = new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
        } else {
            dateObj = new Date(field);
        }
        if (dateObj && !isNaN(dateObj.getTime())) d = dateObj;
        else return { date: null, time: null };
    } else if (field instanceof Date) {
        d = field;
    } else {
        return { date: null, time: null };
    }

    if (isNaN(d.getTime())) return { date: null, time: null };

    const date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    
    const hasTime = d.getHours() > 0 || d.getMinutes() > 0 || d.getSeconds() > 0;

    return { date, time: hasTime ? time : null };
}

function excelDateToYYYYMMDD(serial: any): string | null {
  if (serial instanceof Date) return serial.toISOString().split('T')[0];
  if (typeof serial === 'number') {
    const date = XLSX.SSF.parse_date_code(serial);
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  if (typeof serial === 'string') {
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  return null;
}

function excelTimeToHHMM(serial: any): string | null {
    if (typeof serial === 'number' && serial < 1) {
        const date = XLSX.SSF.parse_date_code(serial);
        return `${String(date.H).padStart(2, '0')}:${String(date.M).padStart(2, '0')}`;
    }
    if (serial instanceof Date) return `${String(serial.getHours()).padStart(2, '0')}:${String(serial.getMinutes()).padStart(2, '0')}`;
    if (typeof serial === 'string') {
        const match = serial.match(/(\d{1,2}):(\d{2})/);
        if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return null;
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export async function parseAttendanceFromFile(file: File): Promise<AttendanceParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (data.length < 2) {
    return { errors: ["File is empty or has no data rows."], rows: [], processedRecords: [], unmatchedRows: [], stats: { total: 0, matched: 0, unmatched: 0, period: { start: '', end: '' }, warnings: [] } };
  }

  const headers = data[0].map(h => String(h).toLowerCase().trim().replace(/\s+/g, ' '));
  const normalizedHeaders = headers.map(h => HEADER_MAP[h]);
  const noteIndex = headers.findIndex(h => h === 'note' || h === 'note.');

  if (!normalizedHeaders.includes('matricule') || (!normalizedHeaders.includes('date') && !normalizedHeaders.includes('timestamp'))) {
    return { errors: ["Required headers not found. Must have 'Matricule' and either 'Date' or 'Temps.'."], rows: [], processedRecords: [], unmatchedRows: [], stats: { total: 0, matched: 0, unmatched: 0, period: { start: '', end: '' }, warnings: [] } };
  }

  const employeesMap = localDB.employees.getMatriculesMap();
  const parsedRows: ParsedAttendanceRow[] = [];
  const unmatchedRows: ParsedAttendanceRow[] = [];
  let minDate = '9999-12-31', maxDate = '1000-01-01';

  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    if (rowData.every((cell: any) => !cell)) continue;
    if (noteIndex !== -1 && String(rowData[noteIndex]).trim().toLowerCase() === 'invalid') continue;

    const parsedRow: ParsedAttendanceRow = { __row: i + 1, __errors: [] };
    normalizedHeaders.forEach((key, index) => {
      if (key) {
        if (key === 'name') (parsedRow as any)[key] = String(rowData[index] || '').trim();
        else (parsedRow as any)[key] = rowData[index];
      }
    });

    parsedRow.matricule = parsedRow.matricule ? String(parsedRow.matricule).trim() : undefined;
    if (!parsedRow.matricule) {
        parsedRow.__errors.push("Missing matricule in row");
        unmatchedRows.push(parsedRow);
        continue;
    }

    if (parsedRow.timestamp) {
        const { date, time } = parseSaharTimestamp(parsedRow.timestamp);
        if (date) {
            parsedRow.date = date;
            if (date < minDate) minDate = date;
            if (date > maxDate) maxDate = date;
        } else {
            parsedRow.__errors.push("Invalid 'Temps.' format");
        }
        if (time) {
            parsedRow.punchTime = time;
            parsedRow.punchType = String(parsedRow.es || '').toLowerCase().trim();
        }
    } else {
        const dateStr = excelDateToYYYYMMDD(parsedRow.date);
        if (!dateStr) parsedRow.__errors.push("Invalid or missing date");
        else {
            parsedRow.date = dateStr;
            if (dateStr < minDate) minDate = dateStr;
            if (dateStr > maxDate) maxDate = dateStr;
        }
    }

    if (!parsedRow.in) parsedRow.in = parsedRow.in ? excelTimeToHHMM(parsedRow.in) : undefined;
    if (!parsedRow.out) parsedRow.out = parsedRow.out ? excelTimeToHHMM(parsedRow.out) : undefined;
    if (parsedRow.hours && typeof parsedRow.hours === 'string') parsedRow.hours = parseFloat(parsedRow.hours);
    if (parsedRow.delayMin && typeof parsedRow.delayMin === 'string') parsedRow.delayMin = parseInt(parsedRow.delayMin, 10);

    parsedRows.push(parsedRow);
  }

  const grouped = new Map<string, ParsedAttendanceRow[]>();
  parsedRows.forEach(row => {
    if (row.matricule && row.date) {
      const key = `${row.matricule}|${row.date}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }
  });

  const processedRecords: AttendanceRecord[] = [];
  
  for (const [key, rows] of grouped.entries()) {
    const [matricule, date] = key.split('|');
    const employee = employeesMap.get(matricule);

    if (!employee) {
      rows.forEach(r => {
          r.__errors.push(`Matricule '${matricule}' not found in employee database.`);
          unmatchedRows.push(r);
      });
      continue;
    }
    
    const record: AttendanceRecord = {
      id: key, matricule, date,
      name: employee.name || rows[0].name || '',
      department: employee.department || 'N/A',
      firstIn: null, lastOut: null, hours: 0, delayMin: 0,
      status: 'Absent', credit: 0, isHolidayWorked: false
    };
    if (record.name === 'nan') record.name = '';

    const ins = rows.map(r => r.punchTime && IN_PUNCHES.has(r.punchType || '') ? r.punchTime : null).filter(Boolean).sort();
    const outs = rows.map(r => r.punchTime && OUT_PUNCHES.has(r.punchType || '') ? r.punchTime : null).filter(Boolean).sort();
    
    record.firstIn = ins[0] || null;
    record.lastOut = outs[outs.length - 1] || null;
    
    if (record.firstIn && record.lastOut) {
        const duration = (timeToMinutes(record.lastOut) - timeToMinutes(record.firstIn)) / 60;
        record.hours = Math.max(0, parseFloat(duration.toFixed(2)));
    }

    if (record.firstIn) {
        const scheduledStartMinutes = 8 * 60; // 08:00
        record.delayMin = Math.max(0, timeToMinutes(record.firstIn) - scheduledStartMinutes);
    }

    const isHoliday = !!holidays[date];
    const dayOfWeek = new Date(date).getUTCDay();
    const isWorkingDay = dayOfWeek !== 0 && (dayOfWeek !== 6 || employee.worksSaturday);

    if (record.hours > 0) {
        record.status = record.delayMin > 10 ? 'Late' : 'Present';
        record.credit = record.hours >= 4 ? 1 : 0.5;
        if (isHoliday) record.isHolidayWorked = true;
    } else {
        if (isHoliday) record.status = 'Holiday';
        else if (isWorkingDay) record.status = 'Absent';
        else record.status = 'Holiday';
    }

    processedRecords.push(record);
  }

  const allParsedRows = [...parsedRows, ...unmatchedRows.filter(ur => !parsedRows.find(pr => pr.__row === ur.__row))];

  return {
    rows: allParsedRows,
    processedRecords,
    unmatchedRows,
    errors: [],
    stats: {
      total: allParsedRows.length,
      matched: processedRecords.length,
      unmatched: unmatchedRows.length,
      period: { start: minDate === '9999-12-31' ? 'N/A' : minDate, end: maxDate === '1000-01-01' ? 'N/A' : maxDate },
      warnings: [],
    }
  };
}

export function downloadUnmatchedRowsAsCSV(rows: ParsedAttendanceRow[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]).filter(h => !h.startsWith('__'));
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify((row as any)[header])).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'unmatched_attendance_rows.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
