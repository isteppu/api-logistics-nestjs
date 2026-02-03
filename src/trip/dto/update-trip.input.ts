import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTripInput } from './create-trip.input.js';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateTripInput extends PartialType(CreateTripInput) {
  @Field() @IsNotEmpty() id: string;
}