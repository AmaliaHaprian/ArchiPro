import { Injectable } from '@nestjs/common';
import { UserRepository } from './userRepository';
import { User, CreateUserDto } from './user';
@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async registerUser(userData: CreateUserDto) {
        const user = new User(userData.username, userData.email, userData.password);
        const createdUser = await this.userRepository.saveUser(user);
        return createdUser;
    }

    async getUserById(userId: string) {
        return this.userRepository.findUserById(userId);
    }

    async getUserByEmail(email: string) {
        return this.userRepository.findUserByEmail(email);
    }

    async deleteUser(userId: string) {
        return this.userRepository.deleteUser(userId);
    }

    async loginUser(email: string, password: string) {
        console.log(`Attempting login for email: ${email}`);
        return this.userRepository.loginUser(email, password);
    }
}
