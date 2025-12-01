import { Controller, Post, Body, Param, UsePipes, ValidationPipe, Get, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '../payroll-execution/gaurds/auth.guard';  // Import AuthGuard
import { RolesGuard } from './gaurds/roles.guard';  // Import RolesGuard
import { Roles } from './decorator/roles.decorator';  // Decorator to define roles
import { SystemRole } from '../employee-profile/enums/employee-profile.enums'; // Enum for roles
import { PayrollExecutionService } from './payroll-execution.service';  // Make sure this is the correct path
import { CreatePayrollRunDto } from './dto/CreatePayrollRunDto.dto'; 
import { EmployeePayrollDetailsUpsertDto } from './dto/EmployeePayrollDetailsUpsertDto.dto';
import { PublishRunForApprovalDto } from './dto/PublishRunForApprovalDto.dto';
import { FlagPayrollExceptionDto } from './dto/FlagPayrollExceptionDto.dto';
import { LockPayrollDto } from './dto/LockPayrollDto.dto';
import { UnlockPayrollDto } from './dto/UnlockPayrollDto.dto';
import { SigningBonusReviewDto } from './dto/SigningBonusReviewDto.dto';
import { SigningBonusEditDto } from './dto/SigningBonusEditDto.dto';
import { TerminationBenefitReviewDto } from './dto/TerminationBenefitReviewDto.dto';
import { TerminationBenefitEditDto } from './dto/TerminationBenefitEditDto.dto';
import { GeneratePayrollDraftDto } from './dto/GeneratePayrollDraftDto.dto';
import { ManagerApprovalReviewDto } from './dto/ManagerApprovalReviewDto.dto';
import { FinanceDecisionDto } from './dto/FinanceDecisionDto.dto';

@Controller('payroll')
export class PayrollExecutionController {
  constructor(private readonly payrollService: PayrollExecutionService) {}

  // REQ-PY-23: Allow PAYROLL_SPECIALIST to create payroll runs
  @Post('create')
  @UsePipes(ValidationPipe) 
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can create payroll runs
  async createPayrollRun(@Body() createPayrollRunDto: CreatePayrollRunDto) {
    return this.payrollService.createPayrollRun(createPayrollRunDto);
  }

  // REQ-PY-24: Allow PAYROLL_MANAGER to review payroll runs
  @Post(':id/review')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)  // Only PAYROLL_MANAGER can review payroll runs
  async reviewPayroll(@Param('id') id: string, @Body() publishRunForApprovalDto: PublishRunForApprovalDto) {
    return this.payrollService.reviewPayroll(id, publishRunForApprovalDto);
  }

  // REQ-PY-5: Allow PAYROLL_SPECIALIST to generate payroll details
  @Post('generate-details')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can generate payroll details
  async generateEmployeePayrollDetails(@Body() employeePayrollDetailsDto: EmployeePayrollDetailsUpsertDto) {
    return this.payrollService.generateEmployeePayrollDetails(employeePayrollDetailsDto);
  }

  // REQ-PY-5: Allow PAYROLL_SPECIALIST to flag payroll exceptions
  @Post('flag-exception')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can flag payroll exceptions
  async flagPayrollException(@Body() flagPayrollExceptionDto: FlagPayrollExceptionDto) {
    return this.payrollService.flagPayrollException(flagPayrollExceptionDto.payrollRunId, flagPayrollExceptionDto.code, flagPayrollExceptionDto.message);
  }

  // REQ-PY-5: Auto-detect irregularities (salary spikes, missing bank accounts, negative net pay)
  @Post('detect-irregularities/:payrollRunId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async detectIrregularities(@Param('payrollRunId') payrollRunId: string) {
    return this.payrollService.detectIrregularities(payrollRunId);
  }

  // REQ-PY-7: Allow PAYROLL_MANAGER to lock payroll
  @Post(':id/lock')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)  // Only PAYROLL_MANAGER can lock payroll
  async lockPayroll(@Param('id') id: string) {
    return this.payrollService.lockPayroll(id);
  }

  // REQ-PY-19: Allow PAYROLL_MANAGER to unlock payroll
  @Post(':id/unlock')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)  // Only PAYROLL_MANAGER can unlock payroll
  async unlockPayroll(@Param('id') id: string, @Body() unlockPayrollDto: UnlockPayrollDto) {
    return this.payrollService.unlockPayroll(id, unlockPayrollDto.unlockReason);
  }

  // REQ-PY-7: Freeze finalized payroll (alternative terminology - functionally same as lock)
  // Note: Freeze and Lock are functionally the same - both set status to LOCKED
  @Post(':id/freeze')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)  // Only PAYROLL_MANAGER can freeze payroll
  async freezePayroll(@Param('id') id: string) {
    return this.payrollService.freezePayroll(id);
  }

  // REQ-PY-19: Unfreeze payrolls with reason (alternative terminology - functionally same as unlock)
  // Note: Unfreeze and Unlock are functionally the same - both set status to UNLOCKED
  @Post(':id/unfreeze')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)  // Only PAYROLL_MANAGER can unfreeze payroll
  async unfreezePayroll(@Param('id') id: string, @Body() unlockPayrollDto: UnlockPayrollDto) {
    // Unfreeze uses the same DTO as unlock (both require a reason)
    return this.payrollService.unfreezePayroll(id, unlockPayrollDto.unlockReason);
  }

  // REQ-PY-23: Allow PAYROLL_SPECIALIST to process payroll initiation
  @Post('process-initiation')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can process payroll initiation
  async processPayrollInitiation(@Body() body: { 
    payrollPeriod: string; 
    entity: string; 
    payrollSpecialistId: string;
    currency?: string; // Optional currency code (e.g., 'USD', 'EUR', 'GBP')
  }) {
    // BR 20: Multi-currency support - currency stored in entity field format: "Entity Name|CURRENCY_CODE"
    return this.payrollService.processPayrollInitiation(
      new Date(body.payrollPeriod),
      body.entity,
      body.payrollSpecialistId,
      body.currency
    );
  }

  // REQ-PY-24: Allow PAYROLL_SPECIALIST to review and approve processed payroll initiation
  // Note: The workflow/UI is handled on the frontend, but the backend endpoint is accessible to Payroll Specialist
  // REQ-PY-26: Edit payroll initiation (period) if rejected - rejected payrolls can be re-edited
  @Post('review-initiation/:runId')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // As per REQ-PY-24: "As a Payroll Specialist, I want to review and approve processed payroll initiation"
  async reviewPayrollInitiation(
    @Param('runId') runId: string,
    @Body() body: { approved: boolean; reviewerId: string; rejectionReason?: string }
  ) {
    return this.payrollService.reviewPayrollInitiation(runId, body.approved, body.reviewerId, body.rejectionReason);
  }

  // REQ-PY-26: Allow PAYROLL_SPECIALIST to manually edit payroll initiation when needed
  @Put('edit-initiation/:runId')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // As per REQ-PY-26: "As a Payroll Specialist, I want to manually edit payroll initiation when needed"
  async editPayrollInitiation(
    @Param('runId') runId: string,
    @Body() updates: Partial<CreatePayrollRunDto>
  ) {
    return this.payrollService.editPayrollInitiation(runId, updates);
  }

  // REQ-PY-27: Allow PAYROLL_SPECIALIST to process signing bonuses
  @Post('process-signing-bonuses')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can process signing bonuses
  async processSigningBonuses() {
    return this.payrollService.processSigningBonuses();
  }

  // REQ-PY-28: Allow PAYROLL_SPECIALIST to review and approve processed signing bonuses
  @Post('review-signing-bonus')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // As per REQ-PY-28: "As a Payroll Specialist, I want to review and approve processed signing bonuses"
  async reviewSigningBonus(@Body() reviewDto: SigningBonusReviewDto) {
    return this.payrollService.reviewSigningBonus(reviewDto);
  }

  // REQ-PY-29: Allow PAYROLL_SPECIALIST to edit signing bonus
  @Put('edit-signing-bonus')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can edit signing bonus
  async editSigningBonus(@Body() editDto: SigningBonusEditDto) {
    return this.payrollService.editSigningBonus(editDto);
  }

  // REQ-PY-30 & REQ-PY-33: Allow PAYROLL_SPECIALIST to process benefits upon resignation/termination
  @Post('process-termination-benefits')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can process termination benefits
  async processTerminationResignationBenefits() {
    return this.payrollService.processTerminationResignationBenefits();
  }

  // REQ-PY-31: Allow PAYROLL_SPECIALIST to review and approve processed benefits upon resignation
  @Post('review-termination-benefit')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // As per REQ-PY-31: "As a Payroll Specialist, I want to review and approve processed benefits upon resignation"
  async reviewTerminationBenefit(@Body() reviewDto: TerminationBenefitReviewDto) {
    return this.payrollService.reviewTerminationBenefit(reviewDto);
  }

  // REQ-PY-32: Allow PAYROLL_SPECIALIST to manually edit termination benefits
  @Put('edit-termination-benefit')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)  // Only PAYROLL_SPECIALIST can edit termination benefits
  async editTerminationBenefit(@Body() editDto: TerminationBenefitEditDto) {
    return this.payrollService.editTerminationBenefit(editDto);
  }

  // REQ-PY-1: Automatically calculate salaries, allowances, deductions, and contributions
  // Note: baseSalary is optional - if not provided, will be fetched from employee's PayGrade configuration
  @Post('calculate-payroll')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async calculatePayroll(@Body() body: { employeeId: string; payrollRunId: string; baseSalary?: number }) {
    return this.payrollService.calculatePayroll(body.employeeId, body.payrollRunId, body.baseSalary);
  }

  // REQ-PY-2: Calculate prorated salaries for mid-month hires, terminations
  @Post('calculate-prorated-salary')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async calculateProratedSalary(@Body() body: {
    employeeId: string;
    baseSalary: number;
    startDate: string;
    endDate: string;
    payrollPeriodEnd: string;
  }) {
    return this.payrollService.calculateProratedSalary(
      body.employeeId,
      body.baseSalary,
      new Date(body.startDate),
      new Date(body.endDate),
      new Date(body.payrollPeriodEnd)
    );
  }

  // REQ-PY-3: Auto-apply statutory rules (income tax, pension, insurance, labor law deductions)
  // Note: Uses baseSalary per BR 35 (Taxes = % of Base Salary)
  @Post('apply-statutory-rules')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async applyStatutoryRules(@Body() body: { baseSalary: number; employeeId: string }) {
    return this.payrollService.applyStatutoryRules(body.baseSalary, body.employeeId);
  }

  // REQ-PY-4: Generate draft payroll runs automatically at the end of each cycle
  // Automatically processes signing bonuses and termination benefits before generating draft
  // Base salaries are fetched from PayGrade configuration for each employee
  // BR 20: Multi-currency support
  @Post('generate-draft')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async generateDraftPayrollRun(@Body() body: {
    payrollPeriod: string;
    entity: string;
    payrollSpecialistId: string;
    currency?: string; // Optional currency code (e.g., 'USD', 'EUR', 'GBP')
  }) {
    // BR 20: Multi-currency support - currency stored in entity field format: "Entity Name|CURRENCY_CODE"
    return this.payrollService.generateDraftPayrollRun(
      new Date(body.payrollPeriod),
      body.entity,
      body.payrollSpecialistId,
      body.currency
    );
  }

  // REQ-PY-6: Review system-generated payroll results in a preview dashboard
  // BR 20: Multi-currency support with optional currency conversion
  @Get('preview/:payrollRunId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayrollPreview(
    @Param('payrollRunId') payrollRunId: string,
    @Query('currency') currency?: string // Optional query parameter for currency conversion
  ) {
    return this.payrollService.getPayrollPreview(payrollRunId, currency);
  }

  // Requirement 0: Get pre-initiation validation status
  // Returns detailed information about pending items that need review before payroll initiation
  @Get('pre-initiation-validation')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPreInitiationValidationStatus() {
    return this.payrollService.getPreInitiationValidationStatus();
  }

  // REQ-PY-8: Automatically generate and distribute employee payslips
  @Post('generate-payslips')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async generateAndDistributePayslips(@Body() body: {
    payrollRunId: string;
    distributionMethod?: 'PDF' | 'EMAIL' | 'PORTAL';
  }) {
    return this.payrollService.generateAndDistributePayslips(
      body.payrollRunId,
      body.distributionMethod || 'PORTAL'
    );
  }

  // REQ-PY-12: Send payroll run for approval to Manager and Finance
  @Post('send-for-approval')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async sendForApproval(@Body() body: {
    payrollRunId: string;
    managerId: string;
    financeStaffId: string;
  }) {
    return this.payrollService.sendForApproval(body.payrollRunId, body.managerId, body.financeStaffId);
  }

  // REQ-PY-15: Finance Staff approve payroll disbursements before execution
  @Post('finance-approval')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.FINANCE_STAFF)
  async approvePayrollDisbursement(@Body() financeDecisionDto: FinanceDecisionDto) {
    return this.payrollService.approvePayrollDisbursement(financeDecisionDto);
  }

  // REQ-PY-20: Payroll Manager resolve escalated irregularities
  // BR 9: Exception resolution workflow
  @Post('resolve-irregularity')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)
  async resolveIrregularity(@Body() body: {
    payrollRunId: string;
    employeeId: string;
    exceptionCode: string;
    resolution: string;
    managerId: string;
  }) {
    return this.payrollService.resolveIrregularity(
      body.payrollRunId,
      body.employeeId,
      body.exceptionCode,
      body.resolution,
      body.managerId
    );
  }

  // BR 9: Get exceptions for a specific employee
  @Get('employee-exceptions/:employeeId/:payrollRunId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getEmployeeExceptions(
    @Param('employeeId') employeeId: string,
    @Param('payrollRunId') payrollRunId: string
  ) {
    return this.payrollService.getEmployeeExceptions(employeeId, payrollRunId);
  }

  // BR 9: Get all exceptions for a payroll run
  @Get('payroll-exceptions/:payrollRunId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getAllPayrollExceptions(@Param('payrollRunId') payrollRunId: string) {
    return this.payrollService.getAllPayrollExceptions(payrollRunId);
  }

  // REQ-PY-22: Payroll Manager approve payroll runs
  @Post('manager-approval')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(SystemRole.PAYROLL_MANAGER)
  async approvePayrollRun(@Body() managerApprovalDto: ManagerApprovalReviewDto) {
    return this.payrollService.approvePayrollRun(managerApprovalDto);
  }
}
