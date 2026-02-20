import { IsString, IsNotEmpty } from 'class-validator';

export class NotificationItems {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  details: string;
}
