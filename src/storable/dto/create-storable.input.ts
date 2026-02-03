import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

@InputType()
export class CreateStorableInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string; // The specific ID/Code for the unit

  @Field()
  @IsString()
  @IsIn(['PORT', 'WAREHOUSE', 'CONTAINER'])
  type: string;

  @Field({ nullable: true })
  @IsString()
  description?: string;
}