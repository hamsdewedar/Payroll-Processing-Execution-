// SubSystem: Payroll Processing & Execution
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollPeriodDocument = PayrollPeriod & Document;

@Schema({ timestamps: true })
export class PayrollPeriod {
  @Prop({ required: true })
  code: string; // e.g. "2025-10"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: ['draft', 'open', 'closed'] })
  status: 'draft' | 'open' | 'closed';

  @Prop()
  description?: string;
}

export const PayrollPeriodSchema =
  SchemaFactory.createForClass(PayrollPeriod);