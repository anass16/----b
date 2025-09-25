import { Employee, EmployeeStatus, LeaveRequest } from '@/types';

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User extends Employee {
  name: string;
  role: Role;
  worksSaturday: boolean;
  createdAt: string;
}

// This is the initial data used ONLY if localStorage is empty.
// It is now empty to ensure the app starts clean.
export const initialMockEmployees: User[] = [];

export const initialMockLeaveRequests: LeaveRequest[] = [];
