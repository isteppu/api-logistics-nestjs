import { Field, ObjectType, ID, Int, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePasswordInput {
  @Field() id: string;
  @Field() password: string;
}