import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PayrollProcessingService } from '../services/payroll-processing.service';

@Controller('payroll-processing')
export class PayrollProcessingController {
  constructor(
    private readonly payrollProcessingService: PayrollProcessingService,
  ) {}

  // POST /payroll-processing/runs   { "period": "2025-11" }
  @Post('runs')
  createRun(@Body('period') period: string) {
    return this.payrollProcessingService.initiatePayroll(period);
  }

  // POST /payroll-processing/runs/:id/draft
  @Post('runs/:id/draft')
  generateDraft(@Param('id') id: string) {
    return this.payrollProcessingService.generateDraft(id);
  }

  // POST /payroll-processing/runs/:id/anomalies
  @Post('runs/:id/anomalies')
  checkAnomalies(@Param('id') id: string) {
    return this.payrollProcessingService.checkAnomalies(id);
  }

  // POST /payroll-processing/runs/:id/approve/manager
  @Post('runs/:id/approve/manager')
  approveByManager(@Param('id') id: string) {
    return this.payrollProcessingService.approveByPayrollManager(id);
  }

  // POST /payroll-processing/runs/:id/approve/finance
  @Post('runs/:id/approve/finance')
  approveByFinance(@Param('id') id: string) {
    return this.payrollProcessingService.approveByFinance(id);
  }

  // POST /payroll-processing/runs/:id/freeze
  @Post('runs/:id/freeze')
  freezeAndPay(@Param('id') id: string) {
    return this.payrollProcessingService.freezeAndPay(id);
  }

  // GET /payroll-processing/runs/:id
  @Get('runs/:id')
  getRun(@Param('id') id: string) {
    return this.payrollProcessingService.getRun(id);
  }

  // GET /payroll-processing/runs
  @Get('runs')
  listRuns() {
    return this.payrollProcessingService.listRuns();
  }
}
