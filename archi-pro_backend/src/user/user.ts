import { IsString, MinLength } from 'class-validator';
import { randomUUID } from 'crypto';
export class User {
    userId: string;
    username: string;
    email: string;
    password: string;

    constructor(username: string, email: string, password: string) {
        this.userId = randomUUID();
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