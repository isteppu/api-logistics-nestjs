import { IsString, IsNotEmpty, IsInt, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsInt()
  role_id: number;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}