import { IsString, IsInt, MinLength, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsInt()
  @IsOptional()
  role_id?: number;
}