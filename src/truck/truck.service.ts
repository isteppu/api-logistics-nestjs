import { Injectable } from '@nestjs/common';
import { CreateTruckInput } from './dto/create-truck.input.js';
import { UpdateTruckInput } from './dto/update-truck.input.js';

@Injectable()
export class TruckService {
  create(createTruckInput: CreateTruckInput) {
    return 'This action adds a new truck';
  }

  findAll() {
    return `This action returns all truck`;
  }

  findOne(id: number) {
    return `This action returns a #${id} truck`;
  }

  update(id: number, updateTruckInput: UpdateTruckInput) {
    return `This action updates a #${id} truck`;
  }

  remove(id: number) {
    return `This action removes a #${id} truck`;
  }
}
