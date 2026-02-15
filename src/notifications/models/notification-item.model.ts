import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class NotificationItem {
  @Field(() => ID) id: number;
  @Field() message: string;
  @Field() type: string;
  @Field({ nullable: true }) reference_id?: string;
  @Field() is_read: boolean;
  @Field() created_at: Date;
  @Field() user_id: string;
}