import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { randomUUID } from 'crypto';
import { Project } from 'src/project/Project';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import type { Role } from './access-control';
import { RoleName } from './access-control';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    username: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column({ nullable: true })
    totp_secret?: string;
    @Column({ default: false })
    totp_enabled!: boolean;
    @Column('text', { nullable: true })
    totp_backup_codes?: string;
    @Column({ type: 'varchar', nullable: true })
    password_reset_token_hash?: string | null;
    @Column({ type: 'timestamp', nullable: true })
    password_reset_expires_at?: Date | null;
    @Column({ nullable: true })
    webauthn_credential_id?: string;
    @Column('text', { nullable: true })
    webauthn_public_key?: string;
    @Column({ default: 0 })
    webauthn_counter!: number;
    @Column({ default: false })
    webauthn_enabled!: boolean;
    @ManyToOne('Role', 'users', { nullable: false })
    @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
    role!: Role;
    @OneToMany(() => Project, project => project.user)
    projects!: Project[];
    constructor(username: string, email: string, password: string, id?: string, role?: Role) {
        this.id = id ?? randomUUID();
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role as Role;
    }
}

export class CreateUserDto {
    @IsString()
    username: string;
    @IsString()
    email: string;
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsOptional()
    @IsEnum(RoleName)
    roleName?: RoleName;

    constructor(username: string, email: string, password: string, roleName?: RoleName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roleName = roleName;
    }
}