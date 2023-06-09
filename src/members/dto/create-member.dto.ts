import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AllergyDto } from './allergy-dto';
import { PlanCoverageDto } from './plan-coverage.dto';

export class CreateMemberDto {
  @IsInt()
  userId: number;
  @IsOptional()
  @IsString()
  age?: number;
  @IsOptional()
  @IsString()
  gender?: string;
  @IsOptional()
  @IsString()
  govtId?: string;

  @IsArray()
  @IsOptional()
  allergies?: AllergyDto[];

  @IsOptional()
  planCoverage?: PlanCoverageDto;
}
