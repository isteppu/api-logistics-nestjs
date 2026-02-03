import { Injectable } from '@nestjs/common';
import { CreateStorableInput } from './dto/create-storable.input.js';
import { UpdateStorableInput } from './dto/update-storable.input.js';

@Injectable()
export class StorableService {
  create(createStorableInput: CreateStorableInput) {
    return 'This action adds a new storable';
  }

  findAll() {
    return `This action returns all storable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storable`;
  }

  update(id: number, updateStorableInput: UpdateStorableInput) {
    return `This action updates a #${id} storable`;
  }

  remove(id: number) {
    return `This action removes a #${id} storable`;
  }
}
