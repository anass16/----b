import { localDB } from './local-db';
import { User, AttendanceRecord, LeaveRequest, Notification } from './data';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, startOfMonth, endOfMonth } from 'date-fns';

// Mock holidays for demonstration
export const holidays: Record<string, string> = {
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

export const employeeApi = {
  getAll: () => localDB.employees.findMany(),
  getOne: (matricule: string) => localDB.employees.findOne(matricule),
  create: (data: Omit<User, 'createdAt' | 'matricule' | 'id' | 'firstName' | 'lastName' | 'worksSaturday'>) => localDB.employees.create(data),
  update: (matricule: string, data: Partial<User>) => localDB.employees.update(matricule, data),
  delete: (matricule: string) => localDB.employees.delete(matricule),
  deleteAll: () => localDB.employees.deleteAll(),
}

export const leaveApi = {
  getAll: () => localDB.leave.findMany(),
  create: (data: any) => localDB.leave.create(data),
  update: (id: string, data: Partial<Omit<LeaveRequest, 'id'>>) => localDB.leave.update(id, data),
  delete: (id: string) => localDB.leave.delete(id),
  updateStatus: (id: string, status: any) => localDB.leave.updateStatus(id, status),
}

export const attendanceApi = {
    getDailyAttendance: async (date: string) => {
        const allAttendance = await localDB.attendance.getAll();
        return allAttendance.filter(rec => rec.date === date);
    },
    getMonthlyAttendance: async (matricule: string, year: number, month: number) => {
        const allAttendance = await localDB.attendance.getAll();
        const monthStr = String(month + 1).padStart(2, '0');
        const yearStr = String(year);

        return allAttendance.filter(rec => 
            rec.matricule === matricule && rec.date.startsWith(`${yearStr}-${monthStr}`)
        );
    },
    updateRecord: (id: string, data: Partial<AttendanceRecord>) => localDB.attendance.updateRecord(id, data),
}

export const analyticsApi = {
  getSummary: async () => {
    const employees = await localDB.employees.findMany();
    const allAttendance = await localDB.attendance.getAll();
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.substring(0, 7);

    const attendanceToday = allAttendance.filter(r => r.date === todayStr);
    const attendanceThisMonth = allAttendance.filter(r => r.date.startsWith(currentMonth));

    const presentToday = attendanceToday.filter(r => r.credit > 0).length;
    const lateArrivals = attendanceToday.filter(r => r.delayMin > 10).length;

    const totalHoursThisMonth = attendanceThisMonth.reduce((sum, r) => sum + r.hours, 0);
    const workingDaysThisMonth = attendanceThisMonth.filter(r => r.hours > 0).length;
    const avgWorkHours = workingDaysThisMonth > 0 ? (totalHoursThisMonth / workingDaysThisMonth) : 0;

    return {
      totalEmployees: employees.length,
      presentToday,
      lateArrivals,
      avgWorkHours: parseFloat(avgWorkHours.toFixed(2)),
    };
  },
  getAnalyticsData: async () => {
    const employees = await localDB.employees.findMany();
    const allAttendance = await localDB.attendance.getAll();
    
    const deptCounts = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const departmentDistribution = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

    const statusCounts = employees.reduce((acc, emp) => {
        const status = emp.status || 'Inactive';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Weekly Trend Data
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyAttendanceTrend = weekDays.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const presentCount = allAttendance.filter(r => r.date === dayStr && r.credit > 0).length;
        return {
            day: format(day, 'E'), // Mon, Tue, etc.
            presentCount,
        };
    });

    return { departmentDistribution, statusDistribution, weeklyAttendanceTrend };
  },
  getMonthlyWorkedDaysReport: async (year: number, month: number) => {
    const allEmployees = await localDB.employees.findMany();
    const allAttendance = await localDB.attendance.getAll();
    
    const monthStr = String(month + 1).padStart(2, '0');
    const yearStr = String(year);

    const monthlyAttendance = allAttendance.filter(rec => rec.date.startsWith(`${yearStr}-${monthStr}`));
    
    const reportData = allEmployees.map(employee => {
        const employeeRecords = monthlyAttendance.filter(rec => rec.matricule === employee.matricule);
        const daysWorked = employeeRecords.filter(rec => rec.credit > 0).length;
        
        return {
            matricule: employee.matricule,
            name: employee.name,
            department: employee.department || 'N/A',
            daysWorked: daysWorked,
        };
    });
    
    return reportData;
  },
}

export const notificationApi = {
  getNotifications: (userId: string) => localDB.notifications.findMany(userId),
  create: (data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => localDB.notifications.create(data),
  markAsRead: (id: string) => localDB.notifications.markAsRead(id),
  markAllAsRead: (userId: string) => localDB.notifications.markAllAsRead(userId),
  deleteAll: (userId: string) => localDB.notifications.deleteAll(userId),
};
