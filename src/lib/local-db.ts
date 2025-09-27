import { User, initialMockEmployees, initialMockLeaveRequests } from '@/lib/data';
import { LeaveRequest, AttendanceRecord } from "@/types";

const DB_STORAGE_KEY = 'hr_app_database';

interface Database {
  employees: User[];
  leaveRequests: LeaveRequest[];
  attendance: AttendanceRecord[];
}

// --- Private Functions ---

function readDatabase(): Database {
  try {
    const rawData = localStorage.getItem(DB_STORAGE_KEY);
    if (rawData) {
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Failed to parse database from localStorage", error);
  }
  // Return default structure if not found or error
  return { 
    employees: initialMockEmployees, 
    leaveRequests: initialMockLeaveRequests,
    attendance: [],
  };
}

function writeDatabase(db: Database): void {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

function initializeDatabase() {
    if (!localStorage.getItem(DB_STORAGE_KEY)) {
        console.log("Initializing empty local database...");
        writeDatabase({
            employees: initialMockEmployees,
            leaveRequests: initialMockLeaveRequests,
            attendance: [],
        });
    }
}

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Public API ---

export const localDB = {
  employees: {
    async findMany(): Promise<User[]> {
      await delay(200);
      const db = readDatabase();
      return db.employees;
    },
    async findOne(matricule: string): Promise<User | undefined> {
      await delay(100);
      const db = readDatabase();
      return db.employees.find(e => e.matricule === matricule);
    },
    async create(data: Omit<User, 'createdAt' | 'matricule' | 'id' | 'firstName' | 'lastName' | 'worksSaturday'>): Promise<User> {
      await delay(200);
      const db = readDatabase();
      const nameParts = data.name.split(/\s+/);
      const newId = `EMP${String(db.employees.length + 1).padStart(4, '0')}`;
      const newUser: User = { 
        id: newId,
        matricule: newId, 
        firstName: nameParts.shift() || '',
        lastName: nameParts.join(' '),
        name: data.name,
        department: data.department,
        role: data.role,
        status: data.status,
        worksSaturday: false,
        createdAt: new Date().toISOString()
      };
      db.employees.push(newUser);
      writeDatabase(db);
      return newUser;
    },
    async update(matricule: string, data: Partial<User>): Promise<User | undefined> {
      await delay(200);
      const db = readDatabase();
      let updatedUser: User | undefined;
      db.employees = db.employees.map(e => {
        if (e.matricule === matricule) {
          updatedUser = { ...e, ...data };
          return updatedUser;
        }
        return e;
      });
      writeDatabase(db);
      return updatedUser;
    },
    async delete(matricule: string): Promise<{ success: boolean }> {
      await delay(200);
      const db = readDatabase();
      db.employees = db.employees.filter(e => e.matricule !== matricule);
      writeDatabase(db);
      return { success: true };
    },
    async deleteAll(): Promise<{ success: boolean }> {
      await delay(300);
      const db = readDatabase();
      const initialLength = db.employees.length;
      // Keep admin users to prevent lockout
      db.employees = db.employees.filter(e => e.role === 'ADMIN');
      // Also clear attendance as it's linked to employees
      db.attendance = [];
      writeDatabase(db);
      return { success: db.employees.length < initialLength };
    },
    overwriteAll(newEmployees: User[]): void {
      const db = readDatabase();
      db.employees = newEmployees;
      db.attendance = []; // Clear attendance when employees are overwritten
      writeDatabase(db);
    },
    getMatriculesMap(): Map<string, User> {
      const db = readDatabase();
      return new Map(db.employees.map(e => [e.matricule, e]));
    }
  },
  leave: {
    async findMany(): Promise<LeaveRequest[]> {
        await delay(200);
        const db = readDatabase();
        return db.leaveRequests;
    },
    async create(data: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> {
        await delay(200);
        const db = readDatabase();
        const newLeave: LeaveRequest = { ...data, id: `L${String(db.leaveRequests.length + 1).padStart(4, '0')}`, status: 'PENDING' };
        db.leaveRequests.push(newLeave);
        writeDatabase(db);
        return newLeave;
    },
    async update(id: string, data: Partial<Omit<LeaveRequest, 'id'>>): Promise<LeaveRequest | undefined> {
        await delay(200);
        const db = readDatabase();
        let updatedRequest: LeaveRequest | undefined;
        db.leaveRequests = db.leaveRequests.map(l => {
            if (l.id === id) {
                updatedRequest = { ...l, ...data };
                return updatedRequest;
            }
            return l;
        });
        writeDatabase(db);
        return updatedRequest;
    },
    async delete(id: string): Promise<{ success: boolean }> {
      await delay(200);
      const db = readDatabase();
      const initialLength = db.leaveRequests.length;
      db.leaveRequests = db.leaveRequests.filter(l => l.id !== id);
      writeDatabase(db);
      return { success: db.leaveRequests.length < initialLength };
    },
    async updateStatus(id: string, status: LeaveRequest['status']): Promise<LeaveRequest | undefined> {
        await delay(200);
        const db = readDatabase();
        let updatedRequest: LeaveRequest | undefined;
        db.leaveRequests = db.leaveRequests.map(l => {
            if (l.id === id) {
                updatedRequest = { ...l, status };
                return updatedRequest;
            }
            return l;
        });
        writeDatabase(db);
        return updatedRequest;
    }
  },
  attendance: {
    async getAll(): Promise<AttendanceRecord[]> {
      await delay(100);
      const db = readDatabase();
      return db.attendance;
    },
    async overwriteAll(data: AttendanceRecord[]): Promise<void> {
      await delay(300);
      const db = readDatabase();
      db.attendance = data;
      writeDatabase(db);
    },
    async clearAll(): Promise<void> {
      const db = readDatabase();
      db.attendance = [];
      writeDatabase(db);
    },
    async updateRecord(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
        await delay(100);
        const db = readDatabase();
        let updatedRecord: AttendanceRecord | undefined;
        db.attendance = db.attendance.map(r => {
            if (r.id === id) {
                updatedRecord = { ...r, ...data };
                return updatedRecord;
            }
            return r;
        });
        writeDatabase(db);
        return updatedRecord;
    },
  },
  auth: {
    async findUser(matricule: string): Promise<User | undefined> {
      const db = readDatabase();
      return db.employees.find((u) => u.matricule.toLowerCase() === matricule.toLowerCase());
    }
  },
  clearAllData: (): void => {
    localStorage.removeItem(DB_STORAGE_KEY);
    console.log("Local database cleared.");
    initializeDatabase();
  }
};

initializeDatabase();
