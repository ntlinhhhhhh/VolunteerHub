import { UserRole } from './user-role.entity'
import { Permission } from './permission.enum';

export class Auth {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly roleId: string,
    public readonly isLocked: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly role?: UserRole,
  ) {}

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  isAccountLocked(): boolean {
    return this.isLocked;
  }

  isActive(): boolean {
    return !this.isLocked;
  }

  canLogin() {
    return !this.isLocked;
  }

  hasPermission(permission: Permission): boolean {
    return this.role?.hasPermission(permission) || false;
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return this.role?.hasAnyPermission(permissions) || false;
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return this.role?.hasAllPermissions(permissions) || false;
  }

  isAdmin(): boolean {
    return this.role?.name === 'admin';
  }

  isEventManager(): boolean {
    return this.role?.name === "event_manager";
  }

  isVolunteer(): boolean {
    return this.role?.name === 'volunteer';
  }

  canManagerUsers(): boolean {
    return this.role?.canManagerUsers() || false;
  }

  canManagerEvents(): boolean {
    return this.role?.canManagerEvents() || false;
  }

  hasLoginInBofore(): boolean {
    return this.lastLoginAt !== null;
  }

  daysSinceLastLogin(): number | null {
    if (!this.lastLoginAt) {
      return null;
    }
    
    const now = new Date();
    const diff = now.getTime() - this.lastLoginAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // inactive if not active > 90 day
  isInActive(days: number = 90): boolean {
    const daySince = this.daysSinceLastLogin();
    if (daySince === null) {
      return true;
    }

    return daySince > days;
  }

  createLockedEvent() {
    return {
      type: 'AUTH.ACCOUNT_LOCKED',
      userId: this.id,
      email: this.email,
      timestamp: new Date(),
    };
  }

  createUnlockedEvent() {
    return {
      type: 'AUTH.ACCOUNT_UNLOCKED',
      userId: this.id,
      email: this.email,
      timestamp: new Date(),
    };
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      roleId: this.roleId,
      roleName: this.role?.name,
      isLocked: this.isLocked,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      role: this.role ? {
        id: this.role.id,
        name: this.role.name,
        description: this.role.description,
      } : null,
      isLocked: this.isLocked,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
    };
  }
}