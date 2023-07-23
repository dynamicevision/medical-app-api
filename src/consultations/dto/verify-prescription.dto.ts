import { IsString } from 'class-validator';

export class VerifyPrescriptionDto {
  @IsString()
  otpCode: string;
}
