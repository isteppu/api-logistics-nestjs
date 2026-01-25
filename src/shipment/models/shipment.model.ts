import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { User } from '../../user/models/user.model.js';

@ObjectType()
export class Shipment {
  @Field(() => ID)
  id: string;

  @Field()
  blno: string;

  @Field()
  contract_no: string;

  @Field()
  entry_no: string;

  @Field()
  reference: string;

  @Field()
  registry_no: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  volumex?: number;

  @Field(() => Int, { nullable: true })
  volumey?: number;

  @Field({ nullable: true })
  estimated_time_arrival?: Date;

  // Simplified relations
  @Field(() => User, { nullable: true })
  customer?: User;

  @Field(() => User, { nullable: true })
  issuer?: User;
}