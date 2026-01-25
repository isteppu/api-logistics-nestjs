import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShipmentInput {
  @Field() id: string;
  @Field() blno: string;
  @Field() contract_no: string;
  @Field() entry_no: string;
  @Field() reference: string;
  @Field() registry_no: string;

  @Field({ nullable: true }) customer_id?: string;
  @Field({ nullable: true }) issuer_id?: string;
  @Field(() => Int, { nullable: true }) volumex?: number;
}
