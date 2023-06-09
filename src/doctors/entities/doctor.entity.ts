import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/models/users.model';
import { Consultation } from '../../consultations/entities/consultation.entity';
import { CommonEntity } from '../../common/common.entity';
import { AddressDto } from '../../common/address.dto';

@Entity()
export class Doctor extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Users, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  specialization: string;

  @OneToMany(() => Consultation, (c) => c.doctor)
  consultations?: Consultation[];

  @Column({ nullable: true, type: 'jsonb' })
  address?: AddressDto;
}
