import { CreateTruckInput } from './create-truck.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTruckInput extends PartialType(CreateTruckInput) {
  @Field(() => Int)
  id: number;
}
