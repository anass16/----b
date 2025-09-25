import { User, initialMockEmployees, initialMockLeaveRequests } from '@/lib/data';
import { LeaveRequest } from "@/types";

const DB_STORAGE_KEY = 'hr_app_database';

interface Database {
  employees: User[];
  leaveRequests: LeaveRequest[];
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
  return { employees: initialMockEmployees, leaveRequests: initialMockLeaveRequests };
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
    overwriteAll(newEmployees: User[]): void {
      const db = {
        employees: newEmployees,
        leaveRequests: []
      };
      writeDatabase(db);
    },
    getMatriculesSet(): Set<string> {
      const db = readDatabase();
      return new Set(db.employees.map(e => e.matricule));
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
