export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id?: string; // Kept for potential future DB use
  matricule: string;
  firstName: string;
  lastName: string;
  department?: string;
  email?: string;
  phone?: string;
  hireDate?: string; // YYYY-MM-DD
  status?: EmployeeStatus;
}

// For the parser output
export interface ParsedEmployeeRow extends Partial<Employee> {
  __row: number;
  __errors: string[];
}

export interface ParseResult {
  rows: ParsedEmployeeRow[];
  errors: string[]; // Global errors, e.g., "Missing matricule header"
  duplicateMatriculesInFile: string[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    departments: string[];
  };
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Holiday';

export interface AttendanceRecord {
  id: string;
  matricule: string;
  name: string;
  date: string;
  status: AttendanceStatus;
  firstIn: string | null;
  lastOut: string | null;
  hours: number;
}

export interface LeaveRequest {
  id: string;
  matricule: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
