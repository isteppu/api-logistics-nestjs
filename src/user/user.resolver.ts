import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserResponse } from './models/user.model.js';
import { PaginationArgs } from './dto/user-pagination.args.js';
import { UserService } from './user.service.js';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }
    @Query(() => UserResponse, { name: 'user' })
    async getShipments(@Args() { skip, take }: PaginationArgs) {
        return this.userService.findAll(skip, take);
    }
}
