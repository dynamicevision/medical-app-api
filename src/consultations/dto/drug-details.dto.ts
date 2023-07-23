import { IsBoolean, IsInt, IsString } from 'class-validator';

export class DrugDetailsDto {
  @IsString()
  genericName: string;
  @IsString()
  brandName: string;
  @IsInt()
  dosageInMg: number;
  @IsInt()
  frequency: number;
  @IsInt()
  duration: number;
  @IsString()
  firstTimeOrRefill: 'first-time' | 'refill' | null | undefined;
  @IsBoolean()
  substitutionAllowed: boolean;
}
