import { HREventType } from '../enums/hr-event-type.enum';
import { PreRunItemType } from '../enums/pre-run-item-type.enum';
import { PreRunItem } from '../models/pre-run-item.model';

// A simple type to describe an employee for our mock data
export interface DummyEmployee {
  employeeId: string;
  name: string;
  payGradeId: string;
  grossSalary: number;     // base + allowances
  tax: number;
  insurance: number;
  hasBankAccount: boolean; // to trigger anomalies
  hrEventType: HREventType;
}

// Some fake employees for testing
export const dummyEmployees: DummyEmployee[] = [
  {
    employeeId: 'E001',
    name: 'Alice',
    payGradeId: 'PG1',
    grossSalary: 20000,
    tax: 2000,
    insurance: 1000,
    hasBankAccount: true,
    hrEventType: HREventType.NORMAL,
  },
  {
    employeeId: 'E002',
    name: 'Bob',
    payGradeId: 'PG2',
    grossSalary: 15000,
    tax: 1500,
    insurance: 800,
    hasBankAccount: false, // will create a "missing bank" anomaly
    hrEventType: HREventType.NEW_HIRE,
  },
];

// Fake pre-run items (Phase 0) – signing bonus, termination benefits, etc.
export const dummyPreRunItems: PreRunItem[] = [
  {
    id: 'PR1',
    employeeId: 'E002',
    type: PreRunItemType.SIGNING_BONUS,
    amount: 3000,
    approved: true,
  },
];
