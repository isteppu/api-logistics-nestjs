import { Controller, Post, Body, Res, UnauthorizedException, HttpStatus, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import type { FastifyReply } from 'fastify';
import { UpdateUserDto } from './dto/auth-update.dto.js';

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

        if(user === -1){
            throw new UnauthorizedException('User is archived');
        }
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

        res.status(200);

        return {
            message: 'Login successful',
            user: { username: user.username, role: user.role_id, first_name: user.first_name, last_name: user.last_name },
        };
    }

    @Patch('update/:id')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string, 
        @Body() updateData: UpdateUserDto
    ) {
        try {
            const updatedUser = await this.authService.updateUserInfo(id, updateData);
            
            return {
                message: 'User information updated successfully',
                user: updatedUser,
            };
        } catch (error) {
            throw new UnauthorizedException('Could not update user information');
        }
    }

    @Patch('archive/:id')
    async archive(
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        try {
            const archiveUser = await this.authService.archiveUser(id);
            
            return {
                message: 'User archived successfully',
                user: archiveUser,
            };
        } catch (error) {
            throw new UnauthorizedException('Could not update user information');
        }
    }

}
