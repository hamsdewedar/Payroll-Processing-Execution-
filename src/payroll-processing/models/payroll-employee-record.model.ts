import { HREventType } from '../enums/hr-event-type.enum';

export interface PayrollEmployeeRecord {
  id: string;               // unique record id
  payrollRunId: string;     // links to PayrollRun.id
  employeeId: string;       // "E001", "E002", ...
  hrEventType: HREventType; // NORMAL, NEW_HIRE, RESIGNATION, TERMINATION

  grossSalary: number;      // base + allowances + signing bonus
  taxes: number;            // tax amount
  insurance: number;        // insurance amount
  penalties: number;        // lateness, unpaid days, etc.
  finalSalary: number;      // Net after penalties

  signingBonus?: number;        // optional
  terminationBenefit?: number;  // optional
  resignationBenefit?: number;  // optional
}
