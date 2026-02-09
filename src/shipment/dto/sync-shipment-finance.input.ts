import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class FinanceRowInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => Float)
  @IsNumber()
  billing: number;

  @Field(() => Float)
  @IsNumber()
  cost: number;
}

@InputType()
export class SyncShipmentFinanceInput {
  @Field()
  @IsString()
  shipment_id: string;

  @Field(() => [FinanceRowInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinanceRowInput)
  rows: FinanceRowInput[];
}