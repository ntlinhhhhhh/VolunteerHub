export enum Permission {
    // User Management
    USER_CREATE = 'user:create',
    USER_READ = 'user:read',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',
    USER_LOCK = 'user:lock',
    USER_UNLOCK = 'user:unlock',

    // Event Management
    EVENT_CREATE = 'event:create',
    EVENT_READ = 'event:read',
    EVENT_UPDATE = 'event:update',
    EVENT_UPDATE_OWN = 'event:update:own',
    EVENT_DELETE = 'event:delete',
    EVENT_DELETE_OWN = 'event:delete:own',
    EVENT_APPROVE = 'event:approve',
    EVENT_REJECT = 'event:reject',

    // Registration Management
    REGISTRATION_CREATE = 'registration:create',
    REGISTRATION_READ = 'registration:read',
    REGISTRATION_CANCEL = 'registration:cancel',
    REGISTRATION_APPROVE = 'registration:approve',
    REGISTRATION_MARK_COMPLETE = 'registration:mark_complete',

    // Communication
    POST_CREATE = 'post:create',
    POST_READ = 'post:read',
    POST_UPDATE = 'post:update',
    POST_UPDATE_OWN = 'post:update:own',
    POST_DELETE = 'post:delete',
    POST_DELETE_OWN = 'post:delete:own',
    COMMENT_CREATE = 'comment:create',
    COMMENT_DELETE = 'comment:delete',

    // Dashboard & Reports
    DASHBOARD_VIEW = 'dashboard:view',
    REPORT_VIEW = 'report:view',
    REPORT_EXPORT = 'report:export',

    // System
    SYSTEM_SETTINGS = 'system:settings',
    ROLE_MANAGE = 'role:manage',
}