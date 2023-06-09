import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Member } from '../../members/entities/member.entity';
import { FamilyMember } from '../../members/entities/family-member.entity';
import { CommonEntity } from '../../common/common.entity';

@Entity()
export class Consultation extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (d) => d.consultations, { nullable: false })
  doctor: Doctor;

  @ManyToOne(() => Member, (m) => m.consultations, { nullable: true })
  member?: Member;
  @ManyToOne(() => FamilyMember, (fm) => fm.consultations, { nullable: true })
  familyMember?: FamilyMember;

  @Column({ nullable: false })
  dateOfAppointment: string;

  @Column({ nullable: false, default: 'pending' })
  status: string;

  @Column({ nullable: true })
  fees?: number;
}
