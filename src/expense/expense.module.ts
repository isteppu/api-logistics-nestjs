import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service.js';
import { ExpenseResolver } from './expense.resolver.js';

@Module({
  providers: [ExpenseResolver, ExpenseService],
})
export class ExpenseModule {}
