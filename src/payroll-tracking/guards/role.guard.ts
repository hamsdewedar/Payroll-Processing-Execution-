import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleDocument,
} from '../../employee-profile/models/employee-system-role.schema';

/**
 * RoleGuard for payroll-tracking module
 * 
 * This guard checks if the authenticated user has the required roles to access an endpoint.
 * 
 * How it works:
 * 1. Extracts required roles from @Roles() decorator
 * 2. Gets the current user ID from the request (expects req.user.userId or req.user.employeeId)
 * 3. Queries EmployeeSystemRole collection to get user's roles
 * 4. Checks if user has at least one of the required roles
 * 5. Also checks if the user's role assignment is active
 * 
 * Usage:
 * - Apply @UseGuards(RoleGuard) at controller or method level
 * - Use @Roles(SystemRole.DEPARTMENT_EMPLOYEE) to specify required roles
 * 
 * Note: This guard expects the authentication middleware to set req.user with userId or employeeId
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified, allow access (no role restriction)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is authenticated
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required. Please provide a valid authentication token.',
      );
    }

    // Extract user ID from request (supports both userId and employeeId)
    const userId =
      user.userId || user.employeeId || user.employeeProfileId || user.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User ID not found in authentication token.',
      );
    }

    try {
      // Find the user's system roles
      const userRoles = await this.employeeSystemRoleModel
        .findOne({
          employeeProfileId: userId,
          isActive: true, // Only check active role assignments
        })
        .exec();

      // If user has no roles assigned, deny access
      if (!userRoles || !userRoles.roles || userRoles.roles.length === 0) {
        throw new ForbiddenException(
          'You do not have the required permissions to access this resource.',
        );
      }

      // Check if user has at least one of the required roles
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.roles.includes(role),
      );

      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoles.roles.join(', ')}.`,
        );
      }

      // User has required role, allow access
      return true;
    } catch (error) {
      // If it's already a NestJS exception, re-throw it
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // For other errors (e.g., database errors), throw a generic forbidden error
      throw new ForbiddenException(
        'An error occurred while checking your permissions.',
      );
    }
  }
}

