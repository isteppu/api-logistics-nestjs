import { Field, ObjectType, ID, Int, InputType } from '@nestjs/graphql';

@InputType()
export class CreateShipmentInput {
  @Field() id: string;
  @Field() blno: string;
  @Field() contract_no: string;
  @Field() entry_no: string;
  @Field() reference: string;
  @Field() registry_no: string;
  @Field() port_id: string;
  @Field() shipping_line: string;
  @Field() estimated_time_arrival: Date;
  @Field() customer_username: string;
  @Field() issuer_username: string;

  @Field(() => Int, { nullable: true })
  volumex?: number;

  @Field(() => Int, { nullable: true })
  volumey?: number;

// Change these from ID to String
  @Field({ nullable: true }) actual_time_arrival?: Date;
}