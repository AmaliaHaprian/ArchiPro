import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, CreateUserDto } from './user';
import { AuthService } from 'src/auth/auth.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async getUserById(@Args('id', { type: () => ID }) id: string) {
    return this.userService.getUserById(id);
  }

  @Query(() => User, { nullable: true })
  async getUserByEmail(@Args('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @Mutation(() => User)
  async registerUser(@Args('data') data: CreateUserDto) {
    return this.authService.registerUser(data);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: string) {
    await this.userService.deleteUser(id);
    return true;
  }

  @Mutation(() => User, { nullable: true })
  async loginUser(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.loginUser(email, password);
  }
}
