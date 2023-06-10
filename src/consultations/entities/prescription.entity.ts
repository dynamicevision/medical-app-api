import { CommonEntity } from '../../common/common.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Member } from '../../members/entities/member.entity';
import { FamilyMember } from '../../members/entities/family-member.entity';
import { Consultation } from './consultation.entity';
import { DrugDetailsDto } from '../dto/drug-details.dto';
import { LabTestPrescribedDto } from '../dto/lab-test-prescribed.dto';

@Entity()
export class Prescription extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (d) => d.consultations, { nullable: false })
  doctor: Doctor;

  @ManyToOne(() => Member, (m) => m.consultations, { nullable: true })
  member?: Member;
  @ManyToOne(() => FamilyMember, (fm) => fm.consultations, { nullable: true })
  familyMember?: FamilyMember;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true, type: 'text' })
  diagnosis?: string;

  @Column({ nullable: false, default: 'pending' })
  status: string;

  @ManyToOne(() => Consultation, { nullable: true })
  consultation?: Consultation;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  drugDetails?: DrugDetailsDto[];

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  labTests?: LabTestPrescribedDto[];

  @Column()
  otpCode?: string;
  @Column()
  otpExpiry?: string;
}
