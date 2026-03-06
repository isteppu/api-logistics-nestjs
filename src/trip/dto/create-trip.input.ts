import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsIn, ValidateNested, IsArray, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

@InputType()
export class CreateTripInput {
  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  container_id: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  truck_id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  warehouse_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  base_rate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  volumex?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  volumey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  port_id?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
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
  @Transform(({ value }) => value?.toUpperCase()) 
  title: string;

  @Field()
  @IsString()
  @IsIn(['amount', 'percentage']) 
  type: string;

  @Field(() => Float)
  @IsNumber()
  value: number;
}