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
  summary?: string;
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
  id: string; // combination of matricule and date
  matricule: string;
  name: string; // denormalized for convenience
  department: string; // denormalized
  date: string; // YYYY-MM-DD
  firstIn: string | null;
  lastOut: string | null;
  hours: number; // total worked hours
  delayMin: number;
  status: AttendanceStatus;
  credit: 0 | 0.5 | 1;
  isHolidayWorked: boolean;
  reason?: string;
}

// For the attendance parser output
export interface ParsedAttendanceRow {
  __row: number;
  __errors: string[];
  matricule?: string;
  name?: string;
  department?: string;
  date?: string; // YYYY-MM-DD
  in?: string; // HH:mm
  out?: string; // HH:mm
  hours?: number;
  delayMin?: number;
  status?: 'Present' | 'Absent';
  // SAHAR Format fields
  timestamp?: any;
  es?: string;
  es_calc?: string;
  note?: string;
  operation?: string;
  punchTime?: string; // HH:mm derived from timestamp
  punchType?: string; // normalized 'es' value
}

export interface AttendanceParseResult {
  rows: ParsedAttendanceRow[];
  processedRecords: AttendanceRecord[];
  errors: string[];
  unmatchedRows: ParsedAttendanceRow[];
  stats: {
    total: number;
    matched: number;
    unmatched: number;
    period: { start: string, end: string };
    warnings: string[];
  };
}

export interface LeaveRequest {
  id: string;
  matricule: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface User extends Employee {
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  worksSaturday: boolean;
  createdAt: string;
}
