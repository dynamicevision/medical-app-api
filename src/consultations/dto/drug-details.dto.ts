export class DrugDetailsDto {
  genericName: string;
  brandName: string;
  dosageInMg: number;
  frequency: number;
  duration: number;
  firstTimeOrRefill: 'first-time' | 'refill' | null | undefined;
  substitutionAllowed: boolean;
}
