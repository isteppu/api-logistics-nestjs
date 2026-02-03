import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTruckInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
