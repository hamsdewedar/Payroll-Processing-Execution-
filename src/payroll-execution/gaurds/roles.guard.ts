import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<SystemRole[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // If no roles are defined, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;  // This is the decoded user info from the AuthGuard

    // Check if the user has one of the required roles
    return requiredRoles.some(role => user.role?.includes(role));
  }
}
