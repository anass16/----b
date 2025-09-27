import { User } from './data';
import { AttendanceRecord, AttendanceStatus } from '@/types';

// Mock holidays for demonstration
const holidays: Record<string, string> = {
  // 2025
  '2025-01-01': 'Nouvel An',
  '2025-01-11': 'Manifeste de l’Indépendance',
  '2025-01-14': 'Nouvel An amazigh (Yennayer)',
  '2025-03-31': 'Aïd al-Fitr (1/2)',
  '2025-04-01': 'Aïd al-Fitr (2/2)',
  '2025-05-01': 'Fête du Travail',
  '2025-06-07': 'Aïd al-Adha (1/2)',
  '2025-06-08': 'Aïd al-Adha (2/2)',
  '2025-06-27': '1er Muharram (Nouvel An hégirien)',
  '2025-07-30': 'Fête du Trône',
  '2025-08-14': 'Allégeance / Oued Eddahab',
  '2025-08-20': 'Révolution du Roi et du Peuple',
  '2025-08-21': 'Fête de la Jeunesse',
  '2025-09-05': 'Mawlid (1/2)',
  '2025-09-06': 'Mawlid (2/2)',
  '2025-11-06': 'Marche Verte',
  '2025-11-18': 'Fête de l’Indépendance',

  // 2026
  '2026-01-01': 'Nouvel An',
  '2026-01-11': 'Manifeste de l’Indépendance',
  '2026-01-14': 'Nouvel An amazigh (Yennayer)',
  '2026-03-20': 'Aïd al-Fitr (1/2)',
  '2026-03-21': 'Aïd al-Fitr (2/2)',
  '2026-05-01': 'Fête du Travail',
  '2026-05-27': 'Aïd al-Adha (1/2)',
  '2026-05-28': 'Aïd al-Adha (2/2)',
  '2026-06-17': '1er Muharram (Nouvel An hégirien)',
  '2026-07-30': 'Fête du Trône',
  '2026-08-14': 'Allégeance / Oued Eddahab',
  '2026-08-20': 'Révolution du Roi et du Peuple',
  '2026-08-21': 'Fête de la Jeunesse',
  '2026-08-26': 'Mawlid (1/2)',
  '2026-08-27': 'Mawlid (2/2)',
  '2026-11-06': 'Marche Verte',
  '2026-11-18': 'Fête de l’Indépendance',

  // 2027
  '2027-01-01': 'Nouvel An',
  '2027-01-11': 'Manifeste de l’Indépendance',
  '2027-01-14': 'Nouvel An amazigh (Yennayer)',
  '2027-03-10': 'Aïd al-Fitr (1/2)',
  '2027-03-11': 'Aïd al-Fitr (2/2)',
  '2027-05-01': 'Fête du Travail',
  '2027-05-17': 'Aïd al-Adha (1/2)',
  '2027-05-18': 'Aïd al-Adha (2/2)',
  '2027-06-06': '1er Muharram (Nouvel An hégirien)',
  '2027-07-30': 'Fête du Trône',
  '2027-08-14': 'Allégeance / Oued Eddahab',
  '2027-08-15': 'Mawlid (1/2)',
  '2027-08-16': 'Mawlid (2/2)',
  '2027-08-20': 'Révolution du Roi et du Peuple',
  '2027-08-21': 'Fête de la Jeunesse',
  '2027-11-06': 'Marche Verte',
  '2027-11-18': 'Fête de l’Indépendance',

  // 2028
  '2028-01-01': 'Nouvel An',
  '2028-01-11': 'Manifeste de l’Indépendance',
  '2028-01-14': 'Nouvel An amazigh (Yennayer)',
  '2028-02-27': 'Aïd al-Fitr (1/2)',
  '2028-02-28': 'Aïd al-Fitr (2/2)',
  '2028-05-01': 'Fête du Travail',
  '2028-05-05': 'Aïd al-Adha (1/2)',
  '2028-05-06': 'Aïd al-Adha (2/2)',
  '2028-05-25': '1er Muharram (Nouvel An hégirien)',
  '2028-07-30': 'Fête du Trône',
  '2028-08-03': 'Mawlid (1/2)',
  '2028-08-04': 'Mawlid (2/2)',
  '2028-08-14': 'Allégeance / Oued Eddahab',
  '2028-08-20': 'Révolution du Roi et du Peuple',
  '2028-08-21': 'Fête de la Jeunesse',
  '2028-11-06': 'Marche Verte',
  '2028-11-18': 'Fête de l’Indépendance',

  // 2029
  '2029-01-01': 'Nouvel An',
  '2029-01-11': 'Manifeste de l’Indépendance',
  '2029-01-14': 'Nouvel An amazigh (Yennayer)',
  '2029-02-15': 'Aïd al-Fitr (1/2)',
  '2029-02-16': 'Aïd al-Fitr (2/2)',
  '2029-04-24': 'Aïd al-Adha (1/2)',
  '2029-04-25': 'Aïd al-Adha (2/2)',
  '2029-05-01': 'Fête du Travail',
  '2029-05-15': '1er Muharram (Nouvel An hégirien)',
  '2029-07-24': 'Mawlid (1/2)',
  '2029-07-25': 'Mawlid (2/2)',
  '2029-07-30': 'Fête du Trône',
  '2029-08-14': 'Allégeance / Oued Eddahab',
  '2029-08-20': 'Révolution du Roi et du Peuple',
  '2029-08-21': 'Fête de la Jeunesse',
  '2029-11-06': 'Marche Verte',
  '2029-11-18': 'Fête de l’Indépendance',

  // 2030
  '2030-01-01': 'Nouvel An',
  '2030-01-11': 'Manifeste de l’Indépendance',
  '2030-01-14': 'Nouvel An amazigh (Yennayer)',
  '2030-02-05': 'Aïd al-Fitr (1/2)',
  '2030-02-06': 'Aïd al-Fitr (2/2)',
  '2030-04-13': 'Aïd al-Adha (1/2)',
  '2030-04-14': 'Aïd al-Adha (2/2)',
  '2030-05-01': 'Fête du Travail',
  '2030-05-04': '1er Muharram (Nouvel An hégirien)',
  '2030-07-13': 'Mawlid (1/2)',
  '2030-07-14': 'Mawlid (2/2)',
  '2030-07-30': 'Fête du Trône',
  '2030-08-14': 'Allégeance / Oued Eddahab',
  '2030-08-20': 'Révolution du Roi et du Peuple',
  '2030-08-21': 'Fête de la Jeunesse',
  '2030-11-06': 'Marche Verte',
  '2030-11-18': 'Fête de l’Indépendance',
};

// Helper to create a random time string between a start and end hour
const randomTime = (start: number, end: number): string => {
  const hour = Math.floor(Math.random() * (end - start)) + start;
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// Helper to calculate hours between two time strings (HH:mm)
const calculateHours = (start: string | null, end: string | null): number => {
  if (!start || !end) return 0;
  const startTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);
  const diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Math.max(0, parseFloat(diff.toFixed(2)));
};

export function generateDailyAttendance(employees: User[], date: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date(date);
  const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

  employees.forEach((employee) => {
    let status: AttendanceStatus = 'Absent';
    let firstIn: string | null = null;
    let lastOut: string | null = null;
    const isHoliday = !!holidays[date];

    const isWeekend = dayOfWeek === 0 || (dayOfWeek === 6 && !employee.worksSaturday);

    if (employee.status === 'Active' && !isWeekend) {
      const randomFactor = Math.random();
      if (randomFactor < 0.85) { // 85% chance of being present
        status = 'Present';
        firstIn = randomTime(8, 9);
        lastOut = randomTime(17, 18);
      } else if (randomFactor < 0.95) { // 10% chance of being late
        status = 'Late';
        firstIn = randomTime(9, 10);
        lastOut = randomTime(17, 18);
      }
    } else if (isHoliday) {
        status = 'Holiday';
    }

    records.push({
      id: `${date}-${employee.matricule}`,
      matricule: employee.matricule,
      name: employee.name,
      date,
      status,
      firstIn,
      lastOut,
      hours: calculateHours(firstIn, lastOut),
    });
  });

  return records;
}

export function generateMonthlyAttendance(employee: User, year: number, month: number): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const isHoliday = !!holidays[dateStr];

        let status: AttendanceStatus = 'Absent';
        let firstIn: string | null = null;
        let lastOut: string | null = null;

        const isWeekend = dayOfWeek === 0 || (dayOfWeek === 6 && !employee.worksSaturday);

        if (employee.status === 'Active' && !isWeekend && !isHoliday) {
            const randomFactor = Math.random();
            if (randomFactor < 0.85) {
                status = 'Present';
                firstIn = randomTime(8, 9);
                lastOut = randomTime(17, 18);
            } else if (randomFactor < 0.95) {
                status = 'Late';
                firstIn = randomTime(9, 10);
                lastOut = randomTime(17, 18);
            }
        } else if (isHoliday) {
            status = 'Holiday';
            // Simulate working on a holiday
            if (Math.random() < 0.1) { // 10% chance
                firstIn = randomTime(9, 10);
                lastOut = randomTime(14, 15);
            }
        }

        records.push({
            id: `${dateStr}-${employee.matricule}`,
            matricule: employee.matricule,
            name: employee.name,
            date: dateStr,
            status,
            firstIn,
            lastOut,
            hours: calculateHours(firstIn, lastOut),
        });
    }
    return records;
}
