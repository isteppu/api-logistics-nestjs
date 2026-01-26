import { Field, ID, Int, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate } from 'class-validator';

@InputType()
export class CreateShipmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  blno: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  contract_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  entry_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  registry_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  port_id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  shipping_line: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  estimated_time_arrival: Date;

  @Field()
  @IsString()
  customer_username: string;

  @Field()
  @IsString()
  issuer_username: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  volumex?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  volumey?: number;

  @Field({ nullable: true })
  @IsOptional()
  actual_time_arrival?: Date;
}