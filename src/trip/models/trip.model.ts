import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Storable } from "../../storable/models/storable.model.js";
import { Truck } from "../../truck/models/truck.model.js";

@ObjectType()
export class Trip {
  @Field(() => ID) id: string;
  @Field({ nullable: true }) commodity?: string;
  @Field(() => Float, { nullable: true }) base_rate?: number;

  // Map the long Prisma names to clean GraphQL fields
  @Field(() => Truck, { nullable: true })
  truck?: Truck;

  @Field(() => Storable, { nullable: true })
  port?: any; 

  @Field(() => Storable, { nullable: true })
  container?: any;

  @Field(() => Storable, { nullable: true })
  warehouse?: any;
}

@ObjectType()
export class TripPaginationResponse {
  @Field(() => [Trip])
  items: Trip[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
