import { PreRunItemType } from '../enums/pre-run-item-type.enum';

export interface PreRunItem {
  id: string;
  employeeId: string;
  type: PreRunItemType; // SIGNING_BONUS, RESIGNATION_BENEFIT, TERMINATION_BENEFIT
  amount: number;
  approved: boolean;
  reason?: string;       // why approved / rejected, optional
}
