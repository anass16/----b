import { storage } from "@/utils/storage";
import { User, Role } from '@/lib/data';
import { EmployeeStatus, LeaveRequest } from "@/types";
import { generateDailyAttendance } from './attendance-generator';

interface CreateUserData {
    name: string;
    department: string;
    role: Role;
    status: EmployeeStatus;
}

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const db = {
  employees: {
    findMany: async (): Promise<User[]> => {
      await delay(300);
      return storage.getEmployees();
    },
    create: async (data: CreateUserData) => {
      await delay(300);
      const employees = storage.getEmployees();
      const nameParts = data.name.split(/\s+/);

      const newUser: User = { 
        matricule: `EMP${String(employees.length + 1).padStart(3, '0')}`, 
        firstName: nameParts.shift() || '',
        lastName: nameParts.join(' '),
        name: data.name,
        department: data.department,
        role: data.role,
        status: data.status,
        worksSaturday: false, // default value
        createdAt: new Date().toISOString()
      };
      
      employees.push(newUser);
      storage.saveEmployees(employees);
      return newUser;
    },
    update: async (matricule: string, data: Partial<User>) => {
      await delay(300);
      let employees = storage.getEmployees();
      employees = employees.map(e => e.matricule === matricule ? { ...e, ...data } : e);
      storage.saveEmployees(employees);
      return employees.find(e => e.matricule === matricule);
    },
    delete: async (matricule: string) => {
      await delay(300);
      let employees = storage.getEmployees();
      employees = employees.filter(e => e.matricule !== matricule);
      storage.saveEmployees(employees);
      return { success: true };
    }
  },
  leave: {
    findMany: async (): Promise<LeaveRequest[]> => {
        await delay(300);
        return storage.getLeaveRequests();
    },
    create: async (data: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> => {
        await delay(300);
        const requests = storage.getLeaveRequests();
        const newLeave: LeaveRequest = { ...data, id: `L${String(requests.length + 1).padStart(3, '0')}`, status: 'PENDING' };
        requests.push(newLeave);
        storage.saveLeaveRequests(requests);
        return newLeave;
    },
    updateStatus: async (id: string, status: LeaveRequest['status']): Promise<LeaveRequest | undefined> => {
        await delay(300);
        let requests = storage.getLeaveRequests();
        let updatedRequest: LeaveRequest | undefined;
        requests = requests.map(l => {
            if (l.id === id) {
                updatedRequest = { ...l, status };
                return updatedRequest;
            }
            return l;
        });
        storage.saveLeaveRequests(requests);
        return updatedRequest;
    }
  },
  auth: {
    findUser: async (matricule: string): Promise<User | undefined> => {
      const users = storage.getEmployees();
      return users.find((u) => u.matricule.toLowerCase() === matricule.toLowerCase());
    }
  }
};

export const employeeApi = {
  getAll: () => db.employees.findMany(),
  create: (data: Omit<User, 'createdAt' | 'matricule'>) => db.employees.create(data),
  update: (matricule: string, data: Partial<User>) => db.employees.update(matricule, data),
  delete: (matricule: string) => db.employees.delete(matricule),
}

export const leaveApi = {
  getAll: () => db.leave.findMany(),
  create: (data: any) => db.leave.create(data),
  updateStatus: (id: string, status: any) => db.leave.updateStatus(id, status),
}

export const attendanceApi = {
    getDailyAttendance: async (date: string) => {
        const employees = await db.employees.findMany();
        return generateDailyAttendance(employees, date);
    }
}

export const analyticsApi = {
  getSummary: async () => {
    const employees = await db.employees.findMany();
    return {
      totalEmployees: employees.length,
      presentToday: Math.floor(employees.filter(e => e.status === 'Active').length * 0.93), // 93% present
      lateArrivals: Math.floor(employees.length * 0.02), // 2% late
      avgWorkHours: 8.2,
    };
  },
  getAnalyticsData: async () => {
    const employees = await db.employees.findMany();
    
    // Department Distribution
    const deptCounts = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const departmentDistribution = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

    // Status Distribution
    const statusCounts = employees.reduce((acc, emp) => {
        const status = emp.status || 'Inactive';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    return { departmentDistribution, statusDistribution };
  }
}
