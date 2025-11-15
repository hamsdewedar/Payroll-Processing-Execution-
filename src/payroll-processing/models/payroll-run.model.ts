import { PayrollStatus } from '../enums/payroll-status.enum';

export interface PayrollRun {
  id: string;            // simple string id (we'll generate it in code)
  period: string;        // e.g. "2025-11" for November 2025
  status: PayrollStatus; // DRAFT, UNDER_REVIEW, PAID, etc.
  issues: string[];      // list of anomaly messages
  lockedAt?: Date;       // when payroll was frozen
  paidAt?: Date;         // when salaries were marked as paid
}
