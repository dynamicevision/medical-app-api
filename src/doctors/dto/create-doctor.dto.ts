import { IsInt, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsInt()
  userId: number;
  @IsString()
  licenseNumber: string;
  @IsString()
  specialization: string;
}
