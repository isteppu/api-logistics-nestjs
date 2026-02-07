import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateTruckInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string; // Plate Number

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
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
  operator?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  is_archived?: number;
}