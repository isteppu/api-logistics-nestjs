import { Field, ID, Int, InputType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate, IsArray, ValidateNested } from 'class-validator';
import { FinanceRowInput } from './sync-shipment-finance.input.js';

@InputType()
export class CreateShipmentInput {
  
  @Field()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toUpperCase())
  selectivity: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  blno: string;

  @Field({ nullable: true })
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  contract_no: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  entry_no: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  registry_no: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  port_id: string;

  @Field({ nullable: true })
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  warehouse_id?: string;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  shipping_line: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  estimated_time_arrival: Date;

  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  customer_username: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  issuer_username?: string;

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
  commodity?: string;

  @Field({ nullable: true })
  @IsOptional()
  actual_time_arrival?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  status?: string;

  @Field(() => [FinanceRowInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => FinanceRowInput)    
  finances?: FinanceRowInput[];

  @Field(() => [ContainersAndWarehouses], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => ContainersAndWarehouses)    
  containers?: ContainersAndWarehouses[];
}

@InputType()
export class ContainersAndWarehouses {
  @Field()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsNotEmpty()
  container_id: string;

  @Field({ nullable: true})
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional() 
  warehouse_id: string;
}
