import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExpenseService } from './expense.service.js';
import { Expense } from './entities/expense.entity.js';
import { CreateExpenseInput } from './dto/create-expense.input.js';
import { UpdateExpenseInput } from './dto/update-expense.input.js';

@Resolver(() => Expense)
export class ExpenseResolver {
  constructor(private readonly expenseService: ExpenseService) {}

  @Mutation(() => Expense)
  createExpense(@Args('createExpenseInput') createExpenseInput: CreateExpenseInput) {
    return this.expenseService.create(createExpenseInput);
  }

  @Query(() => [Expense], { name: 'expense' })
  findAll() {
    return this.expenseService.findAll();
  }

  @Query(() => Expense, { name: 'expense' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.expenseService.findOne(id);
  }

  @Mutation(() => Expense)
  updateExpense(@Args('updateExpenseInput') updateExpenseInput: UpdateExpenseInput) {
    return this.expenseService.update(updateExpenseInput.id, updateExpenseInput);
  }

  @Mutation(() => Expense)
  removeExpense(@Args('id', { type: () => Int }) id: number) {
    return this.expenseService.remove(id);
  }
}
