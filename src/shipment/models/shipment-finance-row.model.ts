import { Field, ObjectType, Float } from '@nestjs/graphql';
import { IsIn, IsNumber, IsString } from 'class-validator';

@ObjectType()
export class ShipmentFinanceRow {
  @Field()
  @IsString()
  title?: string;

  @Field()
  @IsString() 
  @IsIn(['amount', 'percentage']) 
  type?: string;

  @Field(() => Float)
  @IsNumber() 
  value?: number;
}