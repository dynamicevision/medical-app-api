import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/models/users.model';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Member } from '../members/entities/member.entity';
import { FamilyMember } from '../members/entities/family-member.entity';
import { Consultation } from './entities/consultation.entity';
import { ConfigService } from '@nestjs/config';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Prescription } from './entities/prescription.entity';
import { authenticator } from 'otplib';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { validateAndTransformDto } from '../common/utils';
import { VerifyPrescriptionDto } from './dto/verify-prescription.dto';

@Injectable()
export class PrescriptionServices {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(FamilyMember)
    private fmRepo: Repository<FamilyMember>,
    @InjectRepository(Consultation)
    private consultRepo: Repository<Consultation>,
    private readonly configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(
    consultationId: number,
    payload: CreatePrescriptionDto,
    docUserId: number,
  ) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        id: docUserId,
      },
    });
    if (!(user && user.role === 'doctor')) {
      throw new BadRequestException('Doctor not found');
    }
    const doctor: Doctor = await this.doctorRepo.findOne({
      where: {
        user: {
          id: docUserId,
        },
      },
    });
    const consultation: Consultation = await this.consultRepo.findOne({
      where: {
        id: consultationId,
        doctor: {
          id: doctor.id,
        },
      },
      relations: ['member', 'familyMember'],
    });

    if (!consultation && consultation.status !== 'Pending') {
      throw new BadRequestException('Consultation not found.');
    }
    const { errors, validatedObj } = await validateAndTransformDto(
      CreatePrescriptionDto,
      payload,
    );
    if (errors.length) {
      throw new BadRequestException(errors.join(';'));
    }
    console.log('Payload: ', payload);

    const { notes, drugDetails, labTests, diagnosis } = payload;

    const otpCode = authenticator.generate(
      this.configService.get<string>('OTP_SECRET'),
    );
    console.log(
      '##### Otp: ',
      otpCode,
      this.configService.get<string>('OTP_SECRET'),
    );
    const otpExpiry = new Date();

    const insertResult = await this.prescriptionRepository.save({
      notes,
      doctor,
      diagnosis,
      consultation,
      status: 'Pending',
      familyMember: consultation.familyMember,
      drugDetails,
      member: consultation.member,
      labTests,
      otpCode,
      otpExpiry,
      createdBy: docUserId,
      createdOn: new Date(),
    } as DeepPartial<Prescription>);
    console.log(insertResult);

    return this.findById(insertResult.id);
  }

  async findById(id: number) {
    const pres = await this.prescriptionRepository.findOne({
      where: {
        id,
      },
      relations: ['doctor', 'consultation', 'familyMember', 'member'],
    });
    if (pres) {
      pres.otpCode = undefined;
      delete pres.otpCode;
    }
    return pres;
  }

  async verifyPrescription(
    prescriptionId: number,
    consultationId: number,
    docUserId: number,
    payload: VerifyPrescriptionDto,
  ) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        id: docUserId,
      },
    });
    if (!(user && user.role === 'doctor')) {
      throw new BadRequestException('Doctor user not found');
    }
    const doctor: Doctor = await this.doctorRepo.findOne({
      where: {
        user: {
          id: docUserId,
        },
      },
    });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }
    const consultation = await this.consultRepo.findOne({
      where: {
        id: consultationId,
        doctor: {
          id: doctor.id,
        },
      },
    });
    if (!consultation) {
      throw new BadRequestException('Cannot find consultation');
    }
    const pres = await this.prescriptionRepository.findOne({
      where: {
        id: prescriptionId,
        consultation: {
          id: consultationId,
        },
        doctor: {
          id: doctor.id,
        },
      },
    });
    if (!pres) {
      throw new BadRequestException(
        'Prescription is not found for this consultation and doctor.',
      );
    }
    if (pres.otpCode !== payload.otpCode) {
      throw new BadRequestException('Cannot validate otp');
    }
    const valid = authenticator.verify({
      token: payload.otpCode,
      secret: this.configService.get<string>('OTP_SECRET'),
    });
    console.log(
      'otp validation: ',
      payload,
      valid,
      this.configService.get<string>('OTP_SECRET'),
    );
    if (!valid) {
      throw new BadRequestException('Cannot validate otp. Wrong otp.');
    }

    pres.status = 'Verified';
    await this.prescriptionRepository.save(pres);
    consultation.status = 'Complete';
    await this.consultRepo.save(consultation);

    return {
      message: 'Done',
    };
  }

  async update(
    consultationId: number,
    prescriptionId: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
    docUserId: number,
  ) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        id: docUserId,
      },
    });
    if (!(user && user.role === 'doctor')) {
      throw new BadRequestException('Doctor not found');
    }
    const doctor: Doctor = await this.doctorRepo.findOne({
      where: {
        user: {
          id: docUserId,
        },
      },
    });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }
    const { notes, drugDetails, labTests, diagnosis } = updatePrescriptionDto;

    await this.prescriptionRepository.update(
      {
        id: prescriptionId,
        consultation: {
          id: consultationId,
        },
        doctor: {
          id: doctor.id,
        },
      },
      {
        notes,
        drugDetails,
        labTests,
        diagnosis,
        lastModifiedBy: docUserId,
        lastModifiedOn: new Date(),
      } as QueryDeepPartialEntity<Prescription>,
    );

    return this.findById(prescriptionId);
  }

  async delete(
    consultationId: number,
    prescriptionId: number,
    docUserId: number,
  ) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        id: docUserId,
      },
    });
    if (!(user && user.role === 'doctor')) {
      throw new BadRequestException('Doctor not found');
    }
    const doctor: Doctor = await this.doctorRepo.findOne({
      where: {
        user: {
          id: docUserId,
        },
      },
    });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    const pres = await this.prescriptionRepository.findOne({
      where: {
        id: prescriptionId,
        consultation: {
          id: consultationId,
        },
        doctor: {
          id: doctor.id,
        },
      },
    });
    if (!pres) {
      throw new BadRequestException(
        'Prescription is not found for this consultation and doctor.',
      );
    }
    await this.prescriptionRepository.remove([pres]);

    return {
      message: 'Done',
    };
  }
}
