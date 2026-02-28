import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTripInput } from './create-trip.input.js';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpdateTripInput extends PartialType(CreateTripInput) {
  @Field() @IsNotEmpty() id: string;

  @Field(() => Date, { nullable: true }) @IsOptional() date_delivered: Date;
}