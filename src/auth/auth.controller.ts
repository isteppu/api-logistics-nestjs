import { Controller, Post, Body, Res, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import type { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: FastifyReply,
    ) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid login credentials');
        }

        const token = await this.authService.login(user);

        res.setCookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400, // 1 day
        });

        return {
            message: 'Login successful',
            user: { username: user.username, role: user.role_id, first_name: user.first_name, last_name: user.last_name },
        };
    }

}
