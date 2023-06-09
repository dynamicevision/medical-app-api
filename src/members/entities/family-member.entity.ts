import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { AllergyDto } from '../dto/allergy-dto';
import { Consultation } from '../../consultations/entities/consultation.entity';
import { CommonEntity } from '../../common/common.entity';

@Entity('family_members')
export class FamilyMember extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  age?: number;
  @Column({ nullable: true })
  gender?: string;
  @Column({ nullable: true })
  govtId?: string;

  @Column({ nullable: false })
  relation: string;

  @ManyToOne(() => Member, (m) => m.familyMembers)
  memberRelatedTo: Member;

  @Column({ nullable: true, type: 'jsonb' })
  allergies?: AllergyDto[];

  @OneToMany(() => Consultation, (c) => c.doctor)
  consultations?: Consultation[];
}
