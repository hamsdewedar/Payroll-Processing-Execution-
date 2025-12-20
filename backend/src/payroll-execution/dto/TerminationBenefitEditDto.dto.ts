<<<<<<< HEAD:src/payroll-execution/dto/TerminationBenefitEditDto.dto.ts
import { IsMongoId, IsOptional, IsNumber, Min } from 'class-validator';
=======
import { IsMongoId, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { BenefitStatus } from '../enums/payroll-execution-enum';
>>>>>>> zeina-branch:backend/src/payroll-execution/dto/TerminationBenefitEditDto.dto.ts

export class TerminationBenefitEditDto {
  @IsMongoId()
  employeeTerminationResignationId: string;

  @IsOptional()
  @IsMongoId()
  benefitId?: string; // switch to a different configured benefit

  @IsOptional()
  @IsMongoId()
  terminationId?: string; // relink to a termination request if needed

  @IsOptional()
<<<<<<< HEAD:src/payroll-execution/dto/TerminationBenefitEditDto.dto.ts
=======
  @IsEnum(BenefitStatus)
  status?: BenefitStatus;

  @IsOptional()
>>>>>>> zeina-branch:backend/src/payroll-execution/dto/TerminationBenefitEditDto.dto.ts
  @IsNumber()
  @Min(0)
  givenAmount?: number; // for manually editing the benefit amount given to this employee
}
