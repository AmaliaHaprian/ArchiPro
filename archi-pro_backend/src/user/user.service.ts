import { Injectable } from '@nestjs/common';
import { UserRepository } from './userRepository';
import { User, CreateUserDto } from './user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async registerUser(userData: CreateUserDto) {
        const user = new User(userData.username, userData.email, userData.password);
        const createdUser = await this.userRepository.save(user);
        return createdUser;
    }

    async getUserById(userId: string) {
        return await this.userRepository.findOne({ where: { id: userId } });
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    async deleteUser(userId: string) {
        return await this.userRepository.delete({ id: userId });
    }

    async loginUser(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email, password } });
        console.log(user);
        return user;
    }
}
