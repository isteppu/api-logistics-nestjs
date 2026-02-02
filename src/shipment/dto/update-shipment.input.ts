import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateShipmentInput } from './create-shipment.input.js';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateShipmentInput extends PartialType(CreateShipmentInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string; // Required to identify which shipment to update
}