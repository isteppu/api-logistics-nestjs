import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDate, IsIn, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTripInput {
  @Field()
  @IsString() // <--- Add this
  container_id: string;

  @Field()
  @IsString() // <--- Add this
  truck_id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString() // <--- Add this
  warehouse_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString() // <--- Add this
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