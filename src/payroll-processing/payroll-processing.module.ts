import { Module } from '@nestjs/common';
import { PayrollProcessingService } from './services/payroll-processing.service';
import { PayrollProcessingController } from './controllers/payroll-processing.controller';

@Module({
  providers: [PayrollProcessingService],
  controllers: [PayrollProcessingController]
})
export class PayrollProcessingModule {}
