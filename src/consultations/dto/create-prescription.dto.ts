export class CreatePrescriptionDto {
  memberId: number;
  familyMemberId?: number;
  notes?: string;
  diagnosis?: string;
  drugDetails?: string[];
  labTests?: string[];
}
