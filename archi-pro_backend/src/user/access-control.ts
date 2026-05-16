import { randomUUID } from 'crypto';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum RoleName {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum PermissionCode {
    PROJECT_VIEW = 'PROJECT_VIEW',
    PROJECT_CREATE = 'PROJECT_CREATE',
    PROJECT_UPDATE = 'PROJECT_UPDATE',
    PROJECT_DELETE = 'PROJECT_DELETE',
    MANAGE_PROJECTS = 'MANAGE_PROJECTS',
    CHAT = 'CHAT',
    USER_MANAGE = 'USER_MANAGE',
    ROLE_MANAGE = 'ROLE_MANAGE',
    PERMISSION_MANAGE = 'PERMISSION_MANAGE',
}

@Entity({ name: 'permission' })
export class Permission {
    @PrimaryGeneratedColumn('uuid', { name: 'permissionId' })
    id: string;

    @Column({ unique: true })
    code: PermissionCode;

    @Column()
    description: string;

    @ManyToMany('Role', 'permissions')
    roles!: Role[];

    constructor(code: PermissionCode, description: string, id?: string) {
        this.id = id ?? randomUUID();
        this.code = code;
        this.description = description;
    }
}

@Entity({ name: 'role' })
export class Role {
    @PrimaryGeneratedColumn('uuid', { name: 'roleId' })
    id: string;

    @Column({ unique: true })
    name: RoleName;

    @Column()
    description: string;

    @ManyToMany('Permission', 'roles')
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    })
    permissions!: Permission[];

    @OneToMany('User', 'role')
    users!: unknown[];

    constructor(name: RoleName, description: string, permissions?: Permission[], id?: string) {
        this.id = id ?? randomUUID();
        this.name = name;
        this.description = description;
        if (permissions) {
            this.permissions = permissions;
        }
    }
}