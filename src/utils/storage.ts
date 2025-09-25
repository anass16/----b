import { Employee, LeaveRequest } from '@/types';
import { initialMockEmployees, initialMockLeaveRequests, User } from '@/lib/data';

const EMPLOYEE_STORAGE_KEY = 'hr_employees_db';
const LEAVE_STORAGE_KEY = 'hr_leave_db';

// Initialize employee storage
const initializeEmployeeStorage = () => {
  if (!localStorage.getItem(EMPLOYEE_STORAGE_KEY)) {
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(initialMockEmployees));
  }
};
initializeEmployeeStorage();

// Initialize leave storage
const initializeLeaveStorage = () => {
  if (!localStorage.getItem(LEAVE_STORAGE_KEY)) {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(initialMockLeaveRequests));
  }
};
initializeLeaveStorage();


export const storage = {
  getEmployees: (): User[] => {
    try {
      const data = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to parse employees from localStorage", error);
      return [];
    }
  },
  
  saveEmployees: (employees: User[]): void => {
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
  },

  importEmployees: (batch: User[]): void => {
    // This function overwrites all existing data
    storage.saveEmployees(batch);
    // Also clear related data like leave requests to ensure consistency
    storage.saveLeaveRequests([]);
  },

  getMatriculesSet: (): Set<string> => {
    const employees = storage.getEmployees();
    return new Set(employees.map(e => e.matricule));
  },

  // --- Leave Management Functions ---
  getLeaveRequests: (): LeaveRequest[] => {
    try {
      const data = localStorage.getItem(LEAVE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error)      {
        console.error("Failed to parse leave requests from localStorage", error);
        return [];
      }
    },
  
    saveLeaveRequests: (requests: LeaveRequest[]): void => {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(requests));
    },
  };
