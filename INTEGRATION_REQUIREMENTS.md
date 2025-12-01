    # Payroll Execution - Integration Requirements

## Executive Summary

This document outlines all required integrations for the Payroll Execution subsystem and specifies what data/services are needed from each subsystem.

**Status**: ✅ All integrations are currently implemented and working

---

## Integration Overview

The Payroll Execution subsystem requires integration with **6 subsystems**:

1. **Employee Profile Module** ✅
2. **Payroll Configuration Module** ✅
3. **Payroll Tracking Module** ✅
4. **Leaves Module** ✅
5. **Time Management Module** ✅
6. **Recruitment/Onboarding Module** ✅

---

## 1. Employee Profile Module Integration

### ✅ Status: Fully Integrated

### Required Services
- **Service**: `EmployeeProfileService`
- **Injection**: Direct injection (no circular dependency)

### Required Methods/Data

#### 1.1 Employee Data Retrieval
- **Method**: `findOne(employeeId: string)`
- **Purpose**: Get employee details for payroll calculation
- **Required Data**:
  - `employeeId` / `_id`
  - `dateOfHire` (for prorated salary calculation)
  - `primaryPositionId` (for position-based allowances)
  - `primaryDepartmentId` (for department-based allowances)
  - `payGradeId` (for base salary fetching - **BR 2**)
  - `contractType` (for contract-type-based allowances)
  - `workType` (for work-type-based allowances)
  - `contractStartDate` (for contract validation - **BR 1, BR 66**)
  - `contractEndDate` (for contract validation - **BR 1, BR 66**)
  - `status` (for active employee filtering - **BR 66**)
  - `bankName` (for irregularity detection)
  - `bankAccountNumber` (for irregularity detection)

#### 1.2 Employee Listing
- **Method**: `findAll(query: QueryEmployeeDto)`
- **Purpose**: Get all active employees for draft generation
- **Required Filters**:
  - `status: EmployeeStatus.ACTIVE` (for active employees only)
  - Pagination support (page, limit)

### Business Rules Satisfied
- ✅ **BR 1**: Active employment contract validation
- ✅ **BR 2**: Base salary from contract/role type
- ✅ **BR 46**: Default enrollment during onboarding
- ✅ **BR 64**: Linked to employee accounts
- ✅ **BR 66**: Contract status validation

### Current Implementation
```typescript
// Injected in constructor
private readonly employeeProfileService: EmployeeProfileService

// Usage examples:
const employee = await this.employeeProfileService.findOne(employeeId);
const employeesResult = await this.employeeProfileService.findAll({ 
  status: EmployeeStatus.ACTIVE,
  page: 1,
  limit: 10000
});
```

---

## 2. Payroll Configuration Module Integration

### ✅ Status: Fully Integrated

### Required Services
- **Service**: `PayrollConfigurationService`
- **Injection**: Direct injection (no circular dependency)

### Required Methods/Data

#### 2.1 PayGrade Configuration
- **Method**: `findOnePayGrade(payGradeId: string)`
- **Purpose**: Fetch base salary from PayGrade (automatic base salary fetching)
- **Required Data**:
  - `baseSalary` (for salary calculation - **BR 2**)
  - `status` (must be APPROVED - validation)
  - `name` / `grade` (for identification)

#### 2.2 Allowances Configuration
- **Method**: `findAllAllowances(query: QueryAllowanceDto)`
- **Purpose**: Get all approved allowances for employee-specific filtering
- **Required Data**:
  - `name` (for employee-specific matching - **BR 38, BR 39**)
  - `amount` (for gross salary calculation)
  - `status` (must be APPROVED)
  - Position/department/grade matching logic

#### 2.3 Tax Rules Configuration
- **Method**: `findAllTaxRules(query: QueryTaxRuleDto)`
- **Purpose**: Get tax rules for statutory deductions
- **Required Data**:
  - `rate` (percentage for tax calculation - **BR 35**: Tax = % of Base Salary)
  - `name` / `type` (for identification)
  - `status` (must be APPROVED)

#### 2.4 Insurance Brackets Configuration
- **Method**: `findAllInsuranceBrackets(query: QueryInsuranceBracketDto)`
- **Purpose**: Get insurance brackets for social/health insurance calculation
- **Required Data**:
  - `minSalary` (minimum salary for bracket - **BR 7, BR 8**)
  - `maxSalary` (maximum salary for bracket)
  - `employeeRate` (employee contribution percentage - **BR 8**)
  - `employerRate` (employer contribution percentage - **BR 8**)
  - `status` (must be APPROVED)

#### 2.5 Signing Bonus Configuration
- **Method**: 
  - `findAllSigningBonuses(query: QuerySigningBonusDto)`
  - `findOneSigningBonus(signingBonusId: string)`
- **Purpose**: Get signing bonus configurations for new hires
- **Required Data**:
  - `positionName` (for position matching - **BR 24, BR 56**)
  - `amount` (default amount for `givenAmount`)
  - `status` (must be APPROVED - **BR 24**)

#### 2.6 Termination/Resignation Benefits Configuration
- **Method**: 
  - `findAllTerminationBenefits(query: QueryTerminationBenefitDto)`
  - `findOneTerminationBenefit(benefitId: string)`
- **Purpose**: Get termination/resignation benefit configurations
- **Required Data**:
  - `amount` (default amount for `givenAmount`)
  - `status` (must be APPROVED - **BR 26**)
  - Benefit type/name

### Business Rules Satisfied
- ✅ **BR 2**: Base salary from PayGrade
- ✅ **BR 4**: Minimum salary brackets
- ✅ **BR 5**: Tax brackets
- ✅ **BR 6**: Multiple tax components
- ✅ **BR 7**: Social insurance brackets
- ✅ **BR 8**: Employee/employer insurance calculations
- ✅ **BR 10**: Multiple pay scales by grade/department/location
- ✅ **BR 20**: Local tax law customization
- ✅ **BR 24**: Signing bonus eligibility
- ✅ **BR 26**: Termination benefits HR clearance
- ✅ **BR 35**: Tax = % of Base Salary
- ✅ **BR 38**: Allowance structure support
- ✅ **BR 39**: Allowance types tracking
- ✅ **BR 56**: Signing bonuses as distinct component

### Current Implementation
```typescript
// Injected in constructor
private readonly payrollConfigurationService: PayrollConfigurationService

// Usage examples:
const payGrade = await this.payrollConfigurationService.findOnePayGrade(employee.payGradeId.toString());
const allowancesResult = await this.payrollConfigurationService.findAllAllowances({ status: ConfigStatus.APPROVED });
const taxRulesResult = await this.payrollConfigurationService.findAllTaxRules({ status: ConfigStatus.APPROVED });
const insuranceRulesResult = await this.payrollConfigurationService.findAllInsuranceBrackets({ status: ConfigStatus.APPROVED });
const signingBonusesResult = await this.payrollConfigurationService.findAllSigningBonuses({ status: ConfigStatus.APPROVED });
const benefitsResult = await this.payrollConfigurationService.findAllTerminationBenefits({ status: ConfigStatus.APPROVED });
```

---

## 3. Payroll Tracking Module Integration

### ✅ Status: Fully Integrated

### Required Services
- **Service**: `PayrollTrackingService`
- **Injection**: `forwardRef()` (due to potential circular dependency)

### Required Methods/Data

#### 3.1 Refunds Retrieval
- **Method**: `getRefundsByEmployeeId(employeeId: string)`
- **Purpose**: Get pending refunds to add to netPay calculation
- **Required Data**:
  - `employeeId` (for filtering)
  - `amount` (refund amount to add to netPay)
  - `status` (must be `RefundStatus.PENDING` - only pending refunds)
  - `refundDate` (for validation)
  - `description` (for auditability)

### Business Rules Satisfied
- ✅ **BR 9**: Payroll structure supports variable pay elements (refunds)
- ✅ **BR 31**: All calculation elements stored for auditability

### Current Implementation
```typescript
// Injected in constructor with forwardRef
@Inject(forwardRef(() => PayrollTrackingService)) 
private payrollTrackingService: PayrollTrackingService

// Usage:
const refunds = await this.payrollTrackingService.getRefundsByEmployeeId(employeeId);
// Filter for pending refunds: refund.status === RefundStatus.PENDING
```

---

## 4. Leaves Module Integration

### ✅ Status: Fully Integrated

### Required Services
- **Service**: `LeavesService`
- **Injection**: Direct injection (no circular dependency)

### Required Methods/Data

#### 4.1 Leave Requests Retrieval
- **Method**: `getPastLeaveRequests(employeeId: string, filters: { startDate: Date, endDate: Date })`
- **Purpose**: Get approved unpaid leave requests for penalty calculation
- **Required Data**:
  - `employeeId` (for filtering)
  - `startDate` (leave start date - within payroll period)
  - `endDate` (leave end date - within payroll period)
  - `status` (must be `LeaveStatus.APPROVED` - only approved leaves)
  - `leaveTypeId` (to check if leave is paid/unpaid - **BR 11**)
  - `durationDays` (for penalty calculation)

#### 4.2 Leave Type Data (via db.model)
- **Model**: `LeaveType` (accessed via `db.model('LeaveType')`)
- **Purpose**: Check if leave is paid or unpaid
- **Required Data**:
  - `_id` (leaveTypeId from leave request)
  - `paid` (boolean - if false, apply penalty - **BR 11**)
  - `name` (for identification)

### Business Rules Satisfied
- ✅ **BR 11**: Deduct pay for unpaid leave days based on daily/hourly salary calculations
- ✅ **BR 34**: Deductions applied after gross, before net
- ✅ **BR 55**: Resignation entitlements (accrued leave payout)

### Current Implementation
```typescript
// Injected in constructor
private readonly leavesService: LeavesService

// Usage:
const leaveRequests = await this.leavesService.getPastLeaveRequests(employeeId, {
  startDate: periodStart,
  endDate: periodEnd
});

// Access LeaveType model directly (cross-module)
const LeaveTypeModel = this.payrollRunModel.db.model('LeaveType');
const leaveType = await LeaveTypeModel.findById(leaveRequest.leaveTypeId);
// Check: if (!leaveType.paid) { calculate penalty }
```

---

## 5. Time Management Module Integration

### ✅ Status: Fully Integrated (via db.model)

### Required Models (Direct Access)
- **Models**: `AttendanceRecord`, `TimeException`
- **Access Method**: `db.model()` (cross-module access)

### Required Data

#### 5.1 Time Exceptions
- **Model**: `TimeException`
- **Purpose**: Calculate penalties for time violations
- **Required Data**:
  - `employeeId` (for filtering)
  - `exceptionType` (LATE, EARLY_LEAVE, SHORT_TIME, MISSED_PUNCH - **BR 33**)
  - `status` (must be APPROVED or RESOLVED - only count approved exceptions)
  - `date` (within payroll period)
  - `hours` (for penalty calculation)

#### 5.2 Attendance Records
- **Model**: `AttendanceRecord`
- **Purpose**: Check for missing working days
- **Required Data**:
  - `employeeId` (for filtering)
  - `date` (within payroll period)
  - `hoursWorked` (to check if < 50% expected work time)
  - `expectedHours` (for comparison)

### Business Rules Satisfied
- ✅ **BR 33**: Deductions for misconduct penalties (lateness, etc.)
- ✅ **BR 34**: Deductions applied after gross, before net
- ✅ **BR 60**: Misconduct penalties must not reduce salary below statutory minimum wages

### Current Implementation
```typescript
// Access models directly (cross-module)
const AttendanceRecordModel = this.payrollRunModel.db.model('AttendanceRecord');
const TimeExceptionModel = this.payrollRunModel.db.model('TimeException');

// Usage:
const timeExceptions = await TimeExceptionModel.find({
  employeeId: employeeId,
  date: { $gte: periodStart, $lte: periodEnd },
  exceptionType: { $in: [TimeExceptionType.LATE, TimeExceptionType.EARLY_LEAVE, ...] },
  status: { $in: [TimeExceptionStatus.APPROVED, TimeExceptionStatus.RESOLVED] }
});

const attendanceRecords = await AttendanceRecordModel.find({
  employeeId: employeeId,
  date: { $gte: periodStart, $lte: periodEnd }
});
```

---

## 6. Recruitment/Onboarding Module Integration

### ✅ Status: Fully Integrated (via db.model)

### Required Models (Direct Access)
- **Models**: `Contract`, `Onboarding`, `TerminationRequest`
- **Access Method**: `db.model()` (cross-module access)

### Required Data

#### 6.1 Contract Data
- **Model**: `Contract`
- **Purpose**: Check signing bonus eligibility (BR 24)
- **Required Data**:
  - `_id` (contractId from Onboarding)
  - `signingBonus` (amount - if > 0, employee is eligible - **BR 24**)
  - `grossSalary` (for reference)
  - `role` (for reference)

#### 6.2 Onboarding Data
- **Model**: `Onboarding`
- **Purpose**: Link employee to contract for signing bonus eligibility
- **Required Data**:
  - `employeeId` (for filtering)
  - `contractId` (to fetch Contract - **BR 24**)
  - `completed` (for validation)

#### 6.3 Termination Request Data
- **Model**: `TerminationRequest`
- **Purpose**: Process termination/resignation benefits
- **Required Data**:
  - `employeeId` (for filtering)
  - `status` (must be `TerminationStatus.APPROVED` - **BR 26**)
  - `terminationDate` (for prorated salary calculation - **BR 29, BR 55**)
  - `terminationType` (RESIGNATION or TERMINATION)
  - `reason` (for reference)

### Business Rules Satisfied
- ✅ **BR 24**: Signing bonuses only for employees flagged as eligible in contracts
- ✅ **BR 26**: Termination benefits only after HR clearance and approvals
- ✅ **BR 29**: Termination entitlements according to contract and labor law
- ✅ **BR 55**: Resignation entitlements according to contract and labor law
- ✅ **BR 66**: Contract status validation

### Current Implementation
```typescript
// Access models directly (cross-module)
const ContractModel = this.payrollRunModel.db.model('Contract');
const OnboardingModel = this.payrollRunModel.db.model('Onboarding');
const TerminationRequestModel = this.payrollRunModel.db.model(TerminationRequest.name);

// Usage for signing bonuses (BR 24):
const onboarding = await OnboardingModel.findOne({ employeeId: employee._id });
if (onboarding && onboarding.contractId) {
  const contract = await ContractModel.findById(onboarding.contractId);
  if (contract && contract.signingBonus > 0) {
    // Employee is eligible
  }
}

// Usage for termination benefits:
const approvedTerminations = await TerminationRequestModel.find({
  status: TerminationStatus.APPROVED
});
```

---

## Integration Summary Table

| Subsystem | Integration Method | Service/Model | Purpose | BRs Satisfied |
|-----------|-------------------|---------------|---------|---------------|
| **Employee Profile** | Service Injection | `EmployeeProfileService` | Employee data, contracts, pay grades | BR 1, BR 2, BR 46, BR 64, BR 66 |
| **Payroll Configuration** | Service Injection | `PayrollConfigurationService` | PayGrades, allowances, taxes, insurance, bonuses, benefits | BR 2, BR 4-8, BR 10, BR 20, BR 24, BR 26, BR 35, BR 38, BR 39, BR 56 |
| **Payroll Tracking** | Service Injection (forwardRef) | `PayrollTrackingService` | Refunds | BR 9, BR 31 |
| **Leaves** | Service Injection | `LeavesService` + `db.model('LeaveType')` | Unpaid leave penalties | BR 11, BR 34, BR 55 |
| **Time Management** | Direct Model Access | `db.model('AttendanceRecord')`, `db.model('TimeException')` | Time penalties | BR 33, BR 34, BR 60 |
| **Recruitment/Onboarding** | Direct Model Access | `db.model('Contract')`, `db.model('Onboarding')`, `db.model('TerminationRequest')` | Signing bonuses, termination benefits | BR 24, BR 26, BR 29, BR 55, BR 66 |

---

## Data Flow Diagram

```
Payroll Execution
    │
    ├─── Employee Profile Module
    │    └─── Employee data, contracts, pay grades
    │
    ├─── Payroll Configuration Module
    │    └─── PayGrades, allowances, taxes, insurance, bonuses, benefits
    │
    ├─── Payroll Tracking Module
    │    └─── Refunds (pending)
    │
    ├─── Leaves Module
    │    └─── Unpaid leave requests → Penalties
    │
    ├─── Time Management Module
    │    └─── Time exceptions, attendance → Penalties
    │
    └─── Recruitment/Onboarding Module
         └─── Contracts, onboarding, termination requests
```

---

## Integration Requirements Checklist

### ✅ Employee Profile Module
- [x] Service injected
- [x] `findOne()` method available
- [x] `findAll()` method available
- [x] Employee data structure matches requirements
- [x] Contract dates available
- [x] PayGrade ID available

### ✅ Payroll Configuration Module
- [x] Service injected
- [x] `findOnePayGrade()` method available
- [x] `findAllAllowances()` method available
- [x] `findAllTaxRules()` method available
- [x] `findAllInsuranceBrackets()` method available
- [x] `findAllSigningBonuses()` method available
- [x] `findOneSigningBonus()` method available
- [x] `findAllTerminationBenefits()` method available
- [x] `findOneTerminationBenefit()` method available

### ✅ Payroll Tracking Module
- [x] Service injected (with forwardRef)
- [x] `getRefundsByEmployeeId()` method available
- [x] Refund status enum available

### ✅ Leaves Module
- [x] Service injected
- [x] `getPastLeaveRequests()` method available
- [x] LeaveType model accessible via db.model
- [x] Leave status enum available

### ✅ Time Management Module
- [x] AttendanceRecord model accessible via db.model
- [x] TimeException model accessible via db.model
- [x] Time exception enums available

### ✅ Recruitment/Onboarding Module
- [x] Contract model accessible via db.model
- [x] Onboarding model accessible via db.model
- [x] TerminationRequest model accessible via db.model
- [x] Termination status enum available

---

## Module Dependencies

### Current Module Imports
```typescript
@Module({ 
  imports: [
    forwardRef(() => PayrollTrackingModule),  // Circular dependency
    PayrollConfigurationModule,               // Direct dependency
    TimeManagementModule,                     // For model access
    EmployeeProfileModule,                    // Direct dependency
    LeavesModule,                            // Direct dependency
    RecruitmentModule,                       // For model access
  ]
})
```

---

## Service Method Requirements

### Required Service Methods Summary

#### EmployeeProfileService
1. `findOne(employeeId: string): Promise<EmployeeProfile>`
2. `findAll(query: QueryEmployeeDto): Promise<{ data: EmployeeProfile[], total: number }>`

#### PayrollConfigurationService
1. `findOnePayGrade(payGradeId: string): Promise<PayGrade>`
2. `findAllAllowances(query: QueryAllowanceDto): Promise<{ data: Allowance[], total: number }>`
3. `findAllTaxRules(query: QueryTaxRuleDto): Promise<{ data: TaxRule[], total: number }>`
4. `findAllInsuranceBrackets(query: QueryInsuranceBracketDto): Promise<{ data: InsuranceBracket[], total: number }>`
5. `findAllSigningBonuses(query: QuerySigningBonusDto): Promise<{ data: SigningBonus[], total: number }>`
6. `findOneSigningBonus(signingBonusId: string): Promise<SigningBonus>`
7. `findAllTerminationBenefits(query: QueryTerminationBenefitDto): Promise<{ data: TerminationBenefit[], total: number }>`
8. `findOneTerminationBenefit(benefitId: string): Promise<TerminationBenefit>`

#### PayrollTrackingService
1. `getRefundsByEmployeeId(employeeId: string): Promise<Refund[]>`

#### LeavesService
1. `getPastLeaveRequests(employeeId: string, filters: { startDate: Date, endDate: Date }): Promise<LeaveRequest[]>`

---

## Model Access Requirements

### Direct Model Access (via db.model)

#### Time Management Module
- `AttendanceRecord` - For missing working days
- `TimeException` - For time violations (LATE, EARLY_LEAVE, etc.)

#### Leaves Module
- `LeaveType` - For checking paid/unpaid status

#### Recruitment/Onboarding Module
- `Contract` - For signing bonus eligibility (BR 24)
- `Onboarding` - For linking employee to contract
- `TerminationRequest` - For termination/resignation processing

---

## Integration Status

### ✅ All Integrations Complete

**Total Subsystems**: 6
**Integrated**: 6 (100%)
**Status**: ✅ **PRODUCTION READY**

All required integrations are implemented and working correctly. The system can:
- ✅ Fetch employee data and contracts
- ✅ Get configuration data (pay grades, allowances, taxes, insurance)
- ✅ Process signing bonuses with contract validation
- ✅ Process termination/resignation benefits
- ✅ Calculate penalties from leaves and time management
- ✅ Include refunds in net pay calculation
- ✅ Validate all business rules

---

*Document Date: [Current Date]*  
*Status: ✅ COMPLETE*  
*All Integrations: ✅ IMPLEMENTED*

