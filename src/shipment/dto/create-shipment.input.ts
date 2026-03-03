import { Field, ID, Int, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate, IsArray, ValidateNested } from 'class-validator';
import { FinanceRowInput } from './sync-shipment-finance.input.js';

@InputType()
export class CreateShipmentInput {
  
  @Field()
  @IsString()
  @IsNotEmpty()
  selectivity: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  blno: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contract_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  entry_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  registry_no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  port_id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  warehouse_id?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issuer_username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  volumex?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  volumey?: string;

  @Field({ nullable: true })
  @IsOptional()
  actual_time_arrival?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
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
  @IsNotEmpty()
  container_id: string;

  @Field({ nullable: true})
  @IsString()
  @IsOptional() 
  warehouse_id: string;
}
