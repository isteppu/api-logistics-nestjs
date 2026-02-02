import { Field, ObjectType, ID, Int, InputType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model.js';

@ObjectType()
export class Shipment {
  @Field(() => ID) id: string;
  @Field() blno: string;
  @Field() contract_no: string;
  @Field() entry_no: string;
  @Field() reference: string;
  @Field() registry_no: string;
  @Field({ nullable: true }) port_id?: string;
  @Field({ nullable: true }) shipping_line?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) volumex?: number;
  @Field(() => Int, { nullable: true }) volumey?: number;
  @Field({ nullable: true }) estimated_time_arrival?: Date;
  @Field({ nullable: true }) actual_time_arrival?: Date;
  @Field(() => User, { nullable: true }) customer?: User;
  @Field(() => User, { nullable: true }) issuer?: User;
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
