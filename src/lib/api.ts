import { localDB } from './local-db';
import { generateDailyAttendance, generateMonthlyAttendance } from './attendance-generator';
import { User } from './data';

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
        const employees = await localDB.employees.findMany();
        return generateDailyAttendance(employees, date);
    },
    getMonthlyAttendance: async (matricule: string, year: number, month: number) => {
        const employee = await localDB.employees.findOne(matricule);
        if (!employee) return [];
        return generateMonthlyAttendance(employee, year, month);
    }
}

export const analyticsApi = {
  getSummary: async () => {
    const employees = await localDB.employees.findMany();
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = await attendanceApi.getDailyAttendance(today);

    const presentToday = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const lateArrivals = attendanceRecords.filter(r => r.status === 'Late').length;

    return {
      totalEmployees: employees.length,
      presentToday,
      lateArrivals,
      avgWorkHours: 8.2,
    };
  },
  getAnalyticsData: async () => {
    const employees = await localDB.employees.findMany();
    
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

    return { departmentDistribution, statusDistribution };
  }
}
