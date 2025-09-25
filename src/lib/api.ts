import { localDB } from './local-db';
import { User } from './data';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, startOfMonth, endOfMonth } from 'date-fns';

// Mock holidays for demonstration
const holidays: Record<string, string> = {
  '2025-01-01': 'New Year\'s Day',
  '2025-05-01': 'Labour Day',
  '2025-07-30': 'Throne Day',
  '2025-12-25': 'Christmas Day',
};

export const employeeApi = {
  getAll: () => localDB.employees.findMany(),
  getOne: (matricule: string) => localDB.employees.findOne(matricule),
  create: (data: Omit<User, 'createdAt' | 'matricule' | 'id' | 'firstName' | 'lastName' | 'worksSaturday'>) => localDB.employees.create(data),
  update: (matricule: string, data: Partial<User>) => localDB.employees.update(matricule, data),
  delete: (matricule: string) => localDB.employees.delete(matricule),
}

export const leaveApi = {
  getAll: () => localDB.leave.findMany(),
  create: (data: any) => localDB.leave.create(data),
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
    }
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
  }
}
