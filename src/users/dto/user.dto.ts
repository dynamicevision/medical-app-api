import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserDto {
  @IsString()
  @MaxLength(30)
  readonly name: string;

  @IsString()
  @MaxLength(40)
  readonly username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsObject()
  member?: any;
  @IsOptional()
  @IsObject()
  doctor?: any;
}
