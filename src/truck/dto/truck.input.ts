import { InputType, Field, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateTruckInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toUpperCase())
  id: string; // Plate Number

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  operator?: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  date_added?: string;
}

@InputType()
export class UpdateTruckInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  operator?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  is_archived?: number;
}