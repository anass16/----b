import { User } from './data';
import { AttendanceRecord, AttendanceStatus } from '@/types';

// Mock holidays for demonstration
const holidays: Record<string, string> = {
  '2025-01-01': 'New Year\'s Day',
  '2025-05-01': 'Labour Day',
  '2025-07-30': 'Throne Day',
  '2025-12-25': 'Christmas Day',
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
