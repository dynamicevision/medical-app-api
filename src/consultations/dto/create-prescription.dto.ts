import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DrugDetailsDto } from './drug-details.dto';
import { LabTestPrescribedDto } from './lab-test-prescribed.dto';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested()
  @Type(() => DrugDetailsDto)
  drugDetails?: DrugDetailsDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => LabTestPrescribedDto)
  @IsObject({ each: true })
  labTests?: LabTestPrescribedDto[];
}
