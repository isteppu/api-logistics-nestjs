import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserResponse, User } from './models/user.model.js';
import { PaginationArgs } from './dto/user-pagination.args.js';
import { UserService } from './user.service.js';

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) { }
    @Query(() => UserResponse, { name: 'user' })
    async getUsers(@Args() { skip, take }: PaginationArgs) {
        return this.userService.findAll(skip, take);
    }

    @ResolveField(() => String, { nullable: true })
    current_session(@Parent() user: any) {
        if (user.current_session) {
            return user.current_session.toString('hex');
        }
            return null;
    }
}
