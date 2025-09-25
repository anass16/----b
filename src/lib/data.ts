import { Employee, EmployeeStatus, LeaveRequest } from '@/types';

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User extends Employee {
  name: string;
  role: Role;
  worksSaturday: boolean;
  createdAt: string;
}

// This is the initial data used ONLY if localStorage is empty.
// It is now populated with a default admin user to bypass login.
export const initialMockEmployees: User[] = [
  {
    id: 'ADMIN001',
    matricule: 'ADMIN001',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    department: 'Administration',
    role: 'ADMIN',
    status: 'Active',
    worksSaturday: true,
    createdAt: new Date().toISOString(),
    email: 'admin@example.com',
    phone: '123-456-7890',
    hireDate: '2025-01-01',
  }
];

export const initialMockLeaveRequests: LeaveRequest[] = [];
