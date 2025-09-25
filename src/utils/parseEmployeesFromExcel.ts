import * as XLSX from 'xlsx';
import { Employee, EmployeeStatus, ParsedEmployeeRow, ParseResult } from '@/types';
import { localDB } from '@/lib/local-db';

const HEADER_MAP: Record<string, keyof Employee | 'fullName'> = {
  'matricule': 'matricule', 'matricule.': 'matricule', 'id': 'matricule', 'code': 'matricule',
  'firstname': 'firstName', 'first name': 'firstName', 'prénom': 'firstName', 'prenom': 'firstName',
  'lastname': 'lastName', 'last name': 'lastName', 'nom de famille': 'lastName',
  'name': 'fullName', 'nom': 'fullName', 'full name': 'fullName',
  'department': 'department', 'departement': 'department', 'département': 'department', 'service': 'department', 'dept': 'department',
  'email': 'email', 'mail': 'email',
  'phone': 'phone', 'mobile': 'phone', 'telephone': 'phone',
  'hiredate': 'hireDate', 'hire date': 'hireDate', "date d'embauche": 'hireDate', 'date embauche': 'hireDate',
  'status': 'status', 'statut': 'status',
};

const REQUIRED_FIELDS: (keyof Employee)[] = ['matricule', 'firstName', 'lastName'];

function excelDateToYYYYMMDD(serial: any): string | null {
  if (typeof serial === 'number') {
    const date = XLSX.SSF.parse_date_code(serial);
    if (date) {
      const year = date.y;
      const month = String(date.m).padStart(2, '0');
      const day = String(date.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  if (typeof serial === 'string') {
    const d = new Date(serial);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function parseEmployeesFromFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (data.length < 2) {
    return { errors: ["File is empty or has no data rows."], rows: [], stats: { total: 0, valid: 0, invalid: 0, departments: [] }, duplicateMatriculesInFile: [] };
  }

  const headers = data[0].map(h => String(h).toLowerCase().trim());
  const normalizedHeaders = headers.map(h => HEADER_MAP[h]);

  if (!normalizedHeaders.includes('matricule')) {
    return { errors: ["Required header 'matricule' (or synonym) not found."], rows: [], stats: { total: 0, valid: 0, invalid: 0, departments: [] }, duplicateMatriculesInFile: [] };
  }

  const rows: ParsedEmployeeRow[] = [];
  const fileMatricules = new Set<string>();
  const duplicateMatriculesInFile = new Set<string>();
  const departments = new Set<string>();
  const existingMatricules = localDB.employees.getMatriculesSet();

  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    const employee: ParsedEmployeeRow = { __row: i + 1, __errors: [] };

    normalizedHeaders.forEach((key, index) => {
      if (!key) return;
      let value = rowData[index];

      if (key === 'fullName') {
        const nameParts = String(value).trim().split(/\s+/);
        employee.firstName = nameParts.shift() || '';
        employee.lastName = nameParts.join(' ');
      } else {
        (employee as any)[key] = value;
      }
    });

    // --- Validation ---
    REQUIRED_FIELDS.forEach(field => {
      if (!employee[field] || String(employee[field]).trim() === '') {
        employee.__errors.push(`Missing required field: ${field}`);
      }
    });

    if (employee.matricule) {
      const matriculeStr = String(employee.matricule).trim();
      if (fileMatricules.has(matriculeStr)) {
        employee.__errors.push(`Duplicate matricule in file: ${matriculeStr}`);
        duplicateMatriculesInFile.add(matriculeStr);
      } else {
        fileMatricules.add(matriculeStr);
      }
      if (existingMatricules.has(matriculeStr)) {
        employee.__errors.push(`Duplicate matricule in store: ${matriculeStr}`);
      }
    }

    if (employee.email && !validateEmail(String(employee.email))) {
      employee.__errors.push("Invalid email format");
    }

    if (employee.status) {
      const status = String(employee.status).trim();
      if (status.toLowerCase() !== 'active' && status.toLowerCase() !== 'inactive') {
        employee.__errors.push("Status must be 'Active' or 'Inactive'");
      } else {
        employee.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() as EmployeeStatus;
      }
    }

    if (employee.hireDate) {
      const formattedDate = excelDateToYYYYMMDD(employee.hireDate);
      if (formattedDate) {
        employee.hireDate = formattedDate;
      } else {
        employee.__errors.push("Invalid hire date format");
      }
    }

    if (employee.department) {
      departments.add(String(employee.department).trim());
    }

    rows.push(employee);
  }

  const validRows = rows.filter(r => r.__errors.length === 0).length;

  return {
    rows,
    errors: [],
    duplicateMatriculesInFile: Array.from(duplicateMatriculesInFile),
    stats: {
      total: rows.length,
      valid: validRows,
      invalid: rows.length - validRows,
      departments: Array.from(departments),
    },
  };
}

export function rebuildCorrectedWorkbook(rows: ParsedEmployeeRow[]): void {
  const headers: (keyof Employee)[] = ['matricule', 'firstName', 'lastName', 'department', 'email', 'phone', 'hireDate', 'status'];
  const data = rows.map(row => headers.map(header => row[header] || ''));
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Corrected Employees');
  XLSX.writeFile(workbook, 'corrected_employees.xlsx');
}
