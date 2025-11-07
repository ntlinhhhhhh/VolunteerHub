import { Permission } from './permission.enum';

export class UserRole {
    constructor(
        public readonly id: string,
        public readonly name: string, //["admin", "eventManger", "volunteer"]
        public readonly permissions: Permission[],
        public readonly description?: string,
        public readonly isSystem?: boolean
    ) {}

    hasPermission(permission: Permission): boolean {
        return this.permissions.includes(permission);
    }

    hasAnyPermission(permissions: Permission[]): boolean {
        return this.permissions.some(p => this.permissions.includes(p));
    }

    hasAllPermissions(permissions: Permission[]): boolean {
        return this.permissions.every(p => this.permissions.includes(p));
    }

    canManagerUsers(): boolean {
        return this.hasPermission(Permission.USER_CREATE) ||
               this.hasPermission(Permission.USER_DELETE);
    }

    canManagerEvents(): boolean {
        return this.hasPermission(Permission.EVENT_CREATE) ||
                this.hasPermission(Permission.EVENT_APPROVE);
    }
}