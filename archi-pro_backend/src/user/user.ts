import { IsString, MinLength } from 'class-validator';
import { randomUUID } from 'crypto';
import { Project } from 'src/project/Project';
import { Entity, Column, OneToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
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
    @OneToMany(() => Project, project => project.user)
    projects!: Project[];
    constructor(username: string, email: string, password: string, id?: string) {
        this.id = id ?? randomUUID();
        this.username = username;
        this.email = email;
        this.password = password;
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

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}