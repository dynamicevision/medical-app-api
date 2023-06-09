import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/models/users.model';
import { FamilyMember } from './family-member.entity';
import { Exclude } from 'class-transformer';
import { AllergyDto } from '../dto/allergy-dto';
import { PlanCoverageDto } from '../dto/plan-coverage.dto';
import { Consultation } from '../../consultations/entities/consultation.entity';
import { CommonEntity } from '../../common/common.entity';

@Entity('members')
export class Member extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Users, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ nullable: true })
  age?: number;
  @Column({ nullable: true })
  gender?: string;
  @Column({ nullable: true })
  govtId?: string;

  @OneToMany(() => FamilyMember, (m) => m.memberRelatedTo)
  familyMembers?: FamilyMember[];

  @Column({ nullable: true, type: 'jsonb' })
  allergies?: AllergyDto[];

  @Column({ nullable: true, type: 'jsonb' })
  planCoverage?: PlanCoverageDto;

  @OneToMany(() => Consultation, (c) => c.doctor)
  consultations?: Consultation[];
}
