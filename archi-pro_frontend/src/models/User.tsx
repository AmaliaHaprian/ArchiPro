export interface Permission {
    id: string;
    code: string;
    description: string;
}

export interface Role {
    id: string;
    name: 'ADMIN' | 'USER' | string;
    description: string;
    permissions: Permission[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role?: Role;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    roleName?: Role['name'];
}