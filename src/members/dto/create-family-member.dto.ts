import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { AllergyDto } from './allergy-dto';

export class CreateFamilyMemberDto {
  @IsString()
  name: string;
  @IsNumber()
  @IsOptional()
  age?: number;
  @IsString()
  @IsOptional()
  gender?: string;
  @IsString()
  @IsOptional()
  govtId?: string;
  @IsString()
  relation: string;

  @IsOptional()
  @IsArray()
  allergies?: AllergyDto[];
}
