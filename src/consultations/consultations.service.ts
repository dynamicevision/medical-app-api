import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/models/users.model';
import { Between, DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Member } from '../members/entities/member.entity';
import { FamilyMember } from '../members/entities/family-member.entity';
import { Consultation } from './entities/consultation.entity';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class ConsultationsService {
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
  ) {}

  async create(
    createConsultationDto: CreateConsultationDto,
    creatingMemberId: number,
  ) {
    const {
      familyMemberId,
      memberId,
      doctorId,
      force,
      dateOfAppointment,
      fees,
    } = createConsultationDto;
    if (familyMemberId) {
      const fm = await this.fmRepo.findOneBy({
        id: familyMemberId,
        memberRelatedTo: {
          id: creatingMemberId,
        },
      });
      if (!fm) {
        throw new BadRequestException('Family member is not related to member');
      }
      //check if already in future for same doc and same fmid.
      const extCon =
        await this.findFuturePendingConsultationForFamilyMemberAndDoctor(
          createConsultationDto.doctorId,
          createConsultationDto.familyMemberId,
        );
      if (!extCon || force) {
        //create it
        const familyMember = await this.fmRepo.findOne({
          where: {
            id: familyMemberId,
          },
        });
        const doctor = await this.doctorRepo.findOne({
          where: {
            id: doctorId,
          },
        });
        const consultCode = authenticator.generate(
          this.configService.get<string>('OTP_SECRET'),
        );
        const { qrImageLoc, url } =
          await this.generateConsultationQrCodeAndLink(consultCode);
        const consultation = await this.consultRepo.save({
          familyMember,
          doctor,
          dateOfAppointment,
          status: 'pending',
          code: consultCode,
          qrCodeImageLocation: qrImageLoc,
          directLink: url,
          fees,
          createdBy: creatingMemberId,
        });
        return this.findOne(consultation.id, creatingMemberId, familyMember.id);
      } else {
        throw new BadRequestException('Appointment for doc already present.');
      }
    } else if (memberId) {
      console.log(
        'memberid: ',
        memberId,
        ' creating memeber: ',
        creatingMemberId,
      );
      if (memberId !== creatingMemberId) {
        throw new BadRequestException(
          'Member can only create for self, not for another member.',
        );
      }
      //check if already in future for same doc same memberId.
      const extCon = await this.findFuturePendingConsultationForMemberAndDoctor(
        createConsultationDto.doctorId,
        createConsultationDto.memberId,
      );
      if (!extCon || force) {
        //create it
        const member = await this.memberRepository.findOne({
          where: {
            id: memberId,
          },
        });
        const doctor = await this.doctorRepo.findOne({
          where: {
            id: doctorId,
          },
        });
        const consultCode = authenticator.generate(
          this.configService.get<string>('OTP_SECRET'),
        );
        const { qrImageLoc, url } =
          await this.generateConsultationQrCodeAndLink(consultCode);
        const consultation = await this.consultRepo.save({
          member,
          doctor,
          dateOfAppointment,
          status: 'pending',
          code: consultCode,
          qrCodeImageLocation: qrImageLoc,
          directLink: url,
          fees,
          createdBy: creatingMemberId,
        });
        return this.findOne(consultation.id, creatingMemberId);
      } else {
        throw new BadRequestException('Appointment for doc already present.');
      }
    } else {
      throw new BadRequestException(
        'Cannot process without memberId or familyMemberId',
      );
    }
  }

  async generateConsultationQrCodeAndLink(consultCode: string) {
    //ui base url + /
    const url =
      this.configService.get('UI_BASE_URL') +
      '/#/doctor/consultation/' +
      consultCode;

    const fileName = `images/${consultCode}_qrcode.png`;
    QRCode.toFile(
      fileName,
      url,
      {
        color: {
          dark: '#00F', // Blue dots
          light: '#0000', // Transparent background
        },
      },
      function (err) {
        if (err) throw err;
        console.log('done');
      },
    );
    return {
      qrImageLoc: fileName,
      url,
    };
  }

  async findAll(creatingMemberId: number) {
    const allResults = [];
    const memberConsult = await this.consultRepo.find({
      where: {
        member: {
          id: creatingMemberId,
        },
      },
      relations: ['member', 'doctor'],
    });
    allResults.push(...memberConsult);

    const fmConsult = await this.consultRepo.find({
      where: {
        familyMember: {
          memberRelatedTo: { id: creatingMemberId },
        },
      },
      relations: ['familyMember', 'doctor'],
    });
    allResults.push(...fmConsult);
    return allResults;
  }

  async findAllForDoctor(docId: number) {
    const doc = await this.doctorRepo.findOne({
      where: {
        user: {
          id: docId,
        },
      },
    });
    if (!doc) {
      throw new BadRequestException('Cannot local doctor.');
    }
    const allResults = [];
    const docConsult = await this.consultRepo.find({
      where: {
        doctor: {
          id: doc.id,
        },
      },
      relations: ['member', 'familyMember', 'doctor'],
    });
    allResults.push(...docConsult);
    return allResults;
  }

  async findOneById(consultId: number) {
    const consultation = await this.consultRepo.findOne({
      where: {
        id: consultId,
      },
      relations: ['member', 'familyMember', 'doctor'],
    });
    return consultation;
  }

  async findOne(consultId: number, memberId: number, familyMemberId?: number) {
    let where;
    if (familyMemberId) {
      where = {
        id: consultId,
        familyMember: {
          id: familyMemberId,
          memberRelatedTo: {
            id: memberId,
          },
        },
      };
    } else if (memberId && !familyMemberId) {
      where = {
        id: consultId,
        member: {
          id: memberId,
        },
      };
    } else {
      throw new BadRequestException(
        'Cannot find out which member or family member this consult is for.',
      );
    }

    const consultation = await this.consultRepo.findOne({
      where,
      relations: ['member', 'familyMember', 'doctor'],
    });
    return consultation;
  }

  async update(
    id: number,
    updateConsultationDto: UpdateConsultationDto,
    updatingMemberId: number,
  ) {
    const consultation = await this.consultRepo.findOne({
      where: {
        id,
      },
      relations: ['member', 'familyMember'],
    });
    if (consultation) {
      if (consultation.familyMember) {
        const extFm = await this.fmRepo.findOne({
          where: {
            id: consultation.familyMember.id,
            memberRelatedTo: {
              id: updatingMemberId,
            },
          },
        });

        if (!extFm) {
          throw new BadRequestException(
            'Family member is not related to member. Cannot update',
          );
        }
        consultation.fees = updateConsultationDto.fees;
        consultation.dateOfAppointment =
          updateConsultationDto.dateOfAppointment;
        consultation.lastModifiedBy = updatingMemberId;
        await this.consultRepo.save(consultation);
        return this.findOne(consultation.id, updatingMemberId, extFm.id);
      } else if (consultation.member) {
        if (consultation.member.id !== updatingMemberId) {
          throw new BadRequestException(
            'Cannot update consultation that does not belong to member',
          );
        }
        consultation.fees = updateConsultationDto.fees;
        consultation.dateOfAppointment =
          updateConsultationDto.dateOfAppointment;
        consultation.lastModifiedBy = updatingMemberId;
        await this.consultRepo.save(consultation);
        return this.findOne(consultation.id, updatingMemberId);
      } else {
        throw new BadRequestException(
          'Cannot find any member or family member to update the consultation',
        );
      }
    } else {
      throw new NotFoundException('Cannot find consultation');
    }
  }

  async remove(id: number, deletingMemberId: number) {
    const consultation = await this.consultRepo.findOne({
      where: {
        id,
      },
      relations: ['member', 'familyMember'],
    });
    if (consultation) {
      if (consultation.familyMember) {
        const extFm = await this.fmRepo.findOne({
          where: {
            id: consultation.familyMember.id,
            memberRelatedTo: {
              id: deletingMemberId,
            },
          },
        });

        if (!extFm) {
          throw new BadRequestException(
            'Family member is not related to member. Cannot update',
          );
        }

        await this.consultRepo.remove(consultation);
        return {
          message: 'Deleted consultation',
        };
      } else if (consultation.member) {
        if (consultation.member.id !== deletingMemberId) {
          throw new BadRequestException('Cannot delete others consultation');
        }
        await this.consultRepo.remove(consultation);
        return {
          message: 'Deleted consultation',
        };
      } else {
        throw new BadRequestException(
          'Cannot find any member or family member to delete the consultation',
        );
      }
    } else {
      throw new NotFoundException('Cannot found consultation');
    }
  }

  private async findFuturePendingConsultationForFamilyMemberAndDoctor(
    doctorId: number,
    familyMemberId: number,
  ): Promise<Consultation> {
    const consultations = await this.consultRepo.findBy({
      doctor: {
        id: doctorId,
      },
      familyMember: {
        id: familyMemberId,
      },
      dateOfAppointment: MoreThanOrEqual(new Date()),
      status: 'pending',
    });
    if (consultations?.length > 0) {
      return consultations[0];
    } else {
      return undefined;
    }
  }

  private async findFuturePendingConsultationForMemberAndDoctor(
    doctorId: number,
    memberId: number,
  ) {
    const consultations = await this.consultRepo.findBy({
      doctor: {
        id: doctorId,
      },
      member: {
        id: memberId,
      },
      dateOfAppointment: MoreThanOrEqual(new Date()),
      status: 'pending',
    });
    if (consultations?.length > 0) {
      return consultations[0];
    } else {
      return undefined;
    }
  }

  public async validateConsultation(consultationId: number, inputCode: string) {
    const extConsult = await this.consultRepo.findOne({
      where: {
        id: consultationId,
        code: inputCode,
      },
    });
    if (!extConsult) {
      throw new BadRequestException('Cannot find consultation');
    }
    if (extConsult.status !== 'pending') {
      throw new BadRequestException(
        'Cannot validate consultation. its not in pending.',
      );
    }
    const token = extConsult.code;
    try {
      const isValid = authenticator.check(
        inputCode,
        this.configService.get('OTP_SECRET'),
      );
      // or
      // const isValid = authenticator.verify({ token, secret: this.configService.get<string>('OTP_SECRET') });
      if (!isValid) {
        throw new BadRequestException('Token invalid refetch');
      } else {
        return true;
      }
    } catch (err) {
      // Possible errors
      // - options validation
      // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
      throw new BadRequestException(err);
    }
  }

  /* async findConsultationLink(consultId: number, memberId: number) {
    const belongsToMember = await this.consultBelongsToMember(
      consultId,
      memberId,
    );
    if (!belongsToMember) {
      throw new NotFoundException('Cannot find consult for member.');
    }
    const valid = await this.validateConsultation(consultId, inputCode);
    if (valid) {
      return {
        url:
          this.configService.get('UI_BASE_URL') +
          '/#/doctor/consultation/' +
          consultId,
      };
    } else {
      throw new BadRequestException('Code is invalid');
    }
  }*/

  private async consultBelongsToMember(consultId: number, memberId: number) {
    const consultation = await this.consultRepo.findOne({
      where: {
        id: consultId,
      },
    });
    if (!consultation) {
      return false;
    }
    if (consultation) {
      if (consultation.familyMember) {
        const extFm = await this.fmRepo.findOne({
          where: {
            id: consultation.familyMember.id,
            memberRelatedTo: {
              id: memberId,
            },
          },
        });

        if (!extFm) {
          return false;
        }
        return true;
      } else if (consultation.member) {
        if (consultation.member.id !== memberId) {
        }
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  async getDoctorConsultationsForCode(doctorId: number, consultCode: string) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const extConsult = await this.consultRepo.findOne({
      where: {
        code: consultCode,
        status: 'pending',
        doctor: {
          id: doctorId,
        },
      },
      relations: ['doctor', 'member', 'familyMember'],
    });

    if (!extConsult) {
      throw new NotFoundException(
        'No consultation in pending state with that code found.',
      );
    }
  }

  async getDoctorConsultations(doctorId: number, status: string = 'pending') {
    if (!status) {
      status = 'pending';
    }
    const doctor = await this.doctorRepo.findOne({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const extConsult = await this.consultRepo.findOne({
      where: {
        status: status,
        doctor: {
          id: doctorId,
        },
      },
      relations: ['doctor', 'member', 'familyMember'],
    });

    if (!extConsult) {
      throw new NotFoundException(
        'No consultation in pending state with that code found.',
      );
    }
  }
}
