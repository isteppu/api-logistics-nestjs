import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (user && await bcrypt.compare(pass, user.password)) { 
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username, role: user.role_id };
    const token = await this.jwtService.signAsync(payload);


    const sessionBuffer = randomBytes(16);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        last_logged_in: new Date(),
        current_session: sessionBuffer,
      },
    });

    return token;
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        id: randomUUID(), 
        username: data.username,
        password: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id, 
      },
    });
  }
}