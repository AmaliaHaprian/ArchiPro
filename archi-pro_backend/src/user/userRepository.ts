import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { User } from "./user";
@Injectable()
export class UserRepository {
    private users: User[] = [];

    getAllUsers(): User[] {
        return this.users;
    }

    saveUser(user: User): User {
        this.users.push(user);
        return user;
    }

    findUserByEmail(email: string): User | undefined {
        return this.users.find(user => user.email === email);
    }

    findUserById(userId: string): User | undefined {
        return this.users.find(user => user.userId === userId);
    }

    deleteUser(userId: string): boolean {
        const index = this.users.findIndex(user => user.userId === userId);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    loginUser(email: string, password: string): User | null {
        const user = this.findUserByEmail(email);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    constructor() {
        const defaultUser = new User('johndoe', 'johndoe@example.com', 'password');
        this.saveUser(defaultUser);
    }

}