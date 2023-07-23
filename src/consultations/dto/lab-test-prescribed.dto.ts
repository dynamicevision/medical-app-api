import { IsString } from 'class-validator';

export class LabTestPrescribedDto {
  @IsString()
  testType: string;
}
