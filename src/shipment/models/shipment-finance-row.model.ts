import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class ShipmentFinanceRow {
  @Field()
  title: string; // e.g., "Brokerage (VAT)", "Trucking (VAT)"

  @Field(() => Float)
  billing: number; // The Revenue amount

  @Field(() => Float)
  cost: number;    // The Expense amount

  @Field(() => Float)
  get net(): number {
    return this.billing - this.cost; // Calculated net profit for this row
  }
}