import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsIn, ValidateNested, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTripInput {
  @Field()
  @IsString()
  container_id: string;

  @Field()
  @IsString()
  truck_id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warehouse_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  base_rate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  volumex?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  volumey?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  port_id?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  commodity?: string;

  @Field(() => [TripFinanceRowInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripFinanceRowInput)
  finances?: TripFinanceRowInput[];
}

@InputType()
export class TripFinanceRowInput {
  @Field()
  @IsString() 
  title: string;

  @Field()
  @IsString()
  @IsIn(['amount', 'percentage']) 
  type: string;

  @Field(() => Float)
  @IsNumber()
  value: number;
}