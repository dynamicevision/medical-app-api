import { forwardRef, Module } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/models/users.model';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Member } from '../members/entities/member.entity';
import { FamilyMember } from '../members/entities/family-member.entity';
import { Prescription } from './entities/prescription.entity';
import { ConfigModule } from '@nestjs/config';
import { Consultation } from './entities/consultation.entity';
import { DoctorConsultationController } from './doctor-consultation.controller';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([
      Users,
      Doctor,
      Member,
      FamilyMember,
      Prescription,
      Consultation,
    ]),
  ],
  controllers: [ConsultationsController, DoctorConsultationController],
  providers: [ConsultationsService],
})
export class ConsultationsModule {}
