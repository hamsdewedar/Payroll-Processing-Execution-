import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * Roles decorator for role-based access control
 * Usage: @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.PAYROLL_SPECIALIST)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: SystemRole[]) => SetMetadata(ROLES_KEY, roles);

