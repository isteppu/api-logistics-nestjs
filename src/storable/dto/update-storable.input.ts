import { CreateStorableInput } from './create-storable.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateStorableInput extends PartialType(CreateStorableInput) {
  @Field(() => Int)
  id: string;
}
