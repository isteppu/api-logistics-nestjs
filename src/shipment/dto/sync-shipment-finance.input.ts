import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class FinanceRowInput {
  @Field()
  @IsString() // Add this
  title: string;

  @Field()
  @IsString() // Add this
  @IsIn(['amount', 'percentage']) // Optional: keeps data clean
  type: string;

  @Field(() => Float)
  @IsNumber() // Add this
  value: number;
}

@InputType()
export class SyncShipmentFinanceInput {
  @Field()
  @IsString() // Add this
  shipment_id: string;

  @Field(() => [FinanceRowInput])
  @IsArray() // Add this
  @ValidateNested({ each: true })
  @Type(() => FinanceRowInput)
  rows: FinanceRowInput[];
}