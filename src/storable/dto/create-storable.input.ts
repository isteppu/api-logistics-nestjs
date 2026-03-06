import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

@InputType()
export class CreateStorableInput {
  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  id: string; // The specific ID/Code for the unit

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsIn(['PORT', 'WAREHOUSE', 'CONTAINER'])
  type: string;

  @Field({ nullable: true })
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  description?: string;
}