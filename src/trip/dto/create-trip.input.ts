import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTripInput {
  @Field() @IsString() @IsNotEmpty() id: string;
  @Field({ nullable: true }) @IsOptional() @IsString() commodity?: string;
  
  @Field(() => Float, { nullable: true }) @IsOptional() @IsNumber() base_rate?: number;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsNumber() volumex?: number;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsNumber() volumey?: number;

  @Field() @IsDate() @Type(() => Date) date_created: Date;
  @Field({ nullable: true }) @IsOptional() @IsDate() @Type(() => Date) date_delivered?: Date;

  // Foreign Keys (Storable IDs & Truck ID)
  @Field({ nullable: true }) @IsOptional() @IsString() container_id?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() port_id?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() warehouse_id?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() truck_id?: string;
}