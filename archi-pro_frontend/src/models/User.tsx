export interface Permission {
    id: string;
    code: string;
    description: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'USER' | string;
    permissions: string[];
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    roleName?: 'ADMIN' | 'USER' | string;
}

export interface AuthPayload {
    access_token: string;
    user: User;
}