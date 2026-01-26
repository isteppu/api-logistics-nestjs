import { Field, ObjectType, ID, Int, InputType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model.js';

@ObjectType()
export class Shipment {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  blno?: string;

  @Field({ nullable: true })
  contract_no?: string;

  @Field({ nullable: true })
  entry_no?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field({ nullable: true })
  registry_no?: string;

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

@ObjectType()
export class ShipmentResponse {
  @Field(() => [Shipment])
  items: Shipment[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
