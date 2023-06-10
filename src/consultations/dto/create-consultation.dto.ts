import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateConsultationDto {
  @IsInt()
  doctorId: number;
  @IsInt()
  @IsOptional()
  memberId?: number;
  @IsInt()
  @IsOptional()
  familyMemberId?: number;
  @IsDate()
  @IsOptional()
  dateOfAppointment?: Date;
  @IsBoolean()
  @IsOptional()
  force?: boolean;

  @IsNumber()
  @IsOptional()
  fees?: number;
}
