import { CreateShipmentInput } from "../dto/create-shipment.input.js";
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShipmentInput extends PartialType(CreateShipmentInput) {
  @Field(() => Int)
  id: string;
}
