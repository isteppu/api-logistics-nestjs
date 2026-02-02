import { Injectable } from '@nestjs/common';
import { CreateExpenseInput } from './dto/create-expense.input.js';
import { UpdateExpenseInput } from './dto/update-expense.input.js';

@Injectable()
export class ExpenseService {
  create(createExpenseInput: CreateExpenseInput) {
    return 'This action adds a new expense';
  }

  findAll() {
    return `This action returns all expense`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expense`;
  }

  update(id: number, updateExpenseInput: UpdateExpenseInput) {
    return `This action updates a #${id} expense`;
  }

  remove(id: number) {
    return `This action removes a #${id} expense`;
  }
}
