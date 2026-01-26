import { CreateShipmentInput } from "../dto/create-shipment.input.js";
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShipmentInput extends PartialType(CreateShipmentInput) {
  @Field(() => Int)
  id: string;
  @Field({ nullable: true }) blno?: string;
  @Field({ nullable: true }) contract_no?: string;
  @Field({ nullable: true }) entry_no?: string;
  @Field({ nullable: true }) reference?: string;
  @Field({ nullable: true }) registry_no?: string;
  @Field({ nullable: true }) port_id?: string;
  @Field({ nullable: true }) shipping_line?: string;
  @Field({ nullable: true }) estimated_time_arrival?: Date;
  @Field({ nullable: true }) customer_username?: string;
  @Field({ nullable: true }) issuer_username?: string;
  @Field(() => Int, { nullable: true }) volumex?: number;
  @Field(() => Int, { nullable: true }) volumey?: number;
  @Field({ nullable: true }) actual_time_arrival?: Date;
}
