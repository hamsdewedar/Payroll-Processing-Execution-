import { Injectable } from '@nestjs/common';
import { PayrollStatus } from '../enums/payroll-status.enum';
import { dummyEmployees, dummyPreRunItems } from '../mocks/dummy-data';

// ===== In-memory types (not mongoose) =====

interface PayrollRun {
  id: string;
  period: string;
  status: PayrollStatus;
  issues: string[];
  lockedAt?: Date;
  paidAt?: Date;
}

interface PayrollEmployeeRecord {
  id: string;
  payrollRunId: string;
  employeeId: string;
  hrEventType: string;          // or import your enum if you want
  grossSalary: number;
  taxes: number;
  insurance: number;
  penalties: number;
  finalSalary: number;
  signingBonus: number;
}

interface PreRunItem {
  employeeId: string;
  type: string;
  amount: number;
  approved: boolean;
}

@Injectable()
export class PayrollProcessingService {
  // In-memory storage (no real DB yet – good for Milestone 1)
  private payrollRuns: PayrollRun[] = [];
  private employeeRecords: PayrollEmployeeRecord[] = [];
  private preRunItems: PreRunItem[] = [...dummyPreRunItems];

  private idCounter = 1;

  private generateId(prefix: string): string {
    return `${prefix}-${this.idCounter++}`;
  }

  // Phase 1 – Initiate payroll for a specific period (e.g., "2025-11")
  initiatePayroll(period: string): PayrollRun {
    const run: PayrollRun = {
      id: this.generateId('RUN'),
      period,
      status: PayrollStatus.DRAFT,
      issues: [],
    };

    this.payrollRuns.push(run);
    return run;
  }

  // Phase 1.1 – Generate draft using dummy employees and pre-run items
  generateDraft(runId: string) {
    const run = this.payrollRuns.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Payroll run not found');
    }

    // Remove old records for this run, if any
    this.employeeRecords = this.employeeRecords.filter(
      (rec) => rec.payrollRunId !== run.id,
    );

    const createdRecords: PayrollEmployeeRecord[] = [];

    for (const emp of dummyEmployees) {
      // Get approved pre-run items for this employee
      const preRunForEmp = this.preRunItems.filter(
        (item) => item.employeeId === emp.employeeId && item.approved,
      );

      const signingBonus =
        preRunForEmp
          .filter((i) => i.type === 'SIGNING_BONUS')
          .reduce((sum, i) => sum + i.amount, 0) || 0;

      const gross = emp.grossSalary + signingBonus;
      const netBeforePenalties = gross - emp.tax - emp.insurance;
      const penalties = 0; // for Milestone 1 keep it simple
      const finalSalary = netBeforePenalties - penalties;

      const record: PayrollEmployeeRecord = {
        id: this.generateId('REC'),
        payrollRunId: run.id,
        employeeId: emp.employeeId,
        hrEventType: emp.hrEventType,
        grossSalary: gross,
        taxes: emp.tax,
        insurance: emp.insurance,
        penalties,
        finalSalary,
        signingBonus,
      };

      this.employeeRecords.push(record);
      createdRecords.push(record);
    }

    run.status = PayrollStatus.UNDER_REVIEW;
    return { run, records: createdRecords };
  }

  // Phase 2 – Check anomalies (missing bank, negative salary)
  checkAnomalies(runId: string) {
    const run = this.payrollRuns.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Payroll run not found');
    }

    const records = this.employeeRecords.filter(
      (rec) => rec.payrollRunId === run.id,
    );

    const issues: string[] = [];

    for (const rec of records) {
      const emp = dummyEmployees.find(
        (e) => e.employeeId === rec.employeeId,
      );

      if (emp && !emp.hasBankAccount) {
        issues.push(`Employee ${emp.employeeId} missing bank account`);
      }

      if (rec.finalSalary < 0) {
        issues.push(`Employee ${emp?.employeeId} has negative salary`);
      }
    }

    run.issues = issues;
    return { run, issues };
  }

  // Phase 3 – Approve by Payroll Manager
  approveByPayrollManager(runId: string): PayrollRun {
    const run = this.payrollRuns.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Payroll run not found');
    }

    run.status = PayrollStatus.WAITING_FINANCE_APPROVAL;
    return run;
  }

  // Phase 3 – Approve by Finance
  approveByFinance(runId: string): PayrollRun {
    const run = this.payrollRuns.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Payroll run not found');
    }

    run.status = PayrollStatus.APPROVED;
    return run;
  }

  // Phase 5 – Freeze & mark as paid
  freezeAndPay(runId: string): PayrollRun {
    const run = this.payrollRuns.find((r) => r.id === runId);
    if (!run) {
      throw new Error('Payroll run not found');
    }

    run.status = PayrollStatus.PAID;
    run.lockedAt = new Date();
    run.paidAt = new Date();

    return run;
  }

  // Helpers for controller
  getRun(runId: string): PayrollRun | undefined {
    return this.payrollRuns.find((r) => r.id === runId);
  }

  listRuns(): PayrollRun[] {
    return this.payrollRuns;
  }
}
