export interface User {
    userId: string;
    username: string;
    email: string;
    password: string;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
}