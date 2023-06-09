import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { Repository } from 'typeorm';
import { Users } from '../users/models/users.model';
import { FamilyMember } from '../members/entities/family-member.entity';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}
  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const { userId, ...options } = createDoctorDto;
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    const existingDoc = await this.findOneByLicenseNumber(
      createDoctorDto.licenseNumber,
    );
    if (existingDoc) {
      throw new BadRequestException('License number already present.');
    }
    const doc = await this.doctorRepo.save({
      user,
      ...options,
    });
    return doc;
  }

  async findAll(): Promise<Doctor[]> {
    const docs = await this.doctorRepo.find({
      relations: ['user'],
    });

    return docs.map((value) => {
      if (value.user) {
        value.user.password = undefined;
      }
      return value;
    });
  }

  async findOne(id: number) {
    const doc = await this.doctorRepo.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
    if (!doc) {
      throw new NotFoundException('Cannot find doctor');
    }
    if (doc.user) {
      doc.user.password = undefined;
    }
    return doc;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doc = await this.doctorRepo.findOne({
      where: {
        id,
      },
    });
    if (!doc) {
      throw new NotFoundException('Cannot find doctor');
    }
    doc.licenseNumber = updateDoctorDto.licenseNumber;
    doc.specialization = updateDoctorDto.specialization;
    await this.doctorRepo.save(doc);
    return this.findOne(id);
  }

  async remove(id: number) {
    const doc = await this.doctorRepo.findOne({
      where: {
        id,
      },
    });
    if (!doc) {
      throw new NotFoundException('Cannot find doctor');
    }
    await this.doctorRepo.remove([doc]);
    return {
      message: 'Deleted doctor',
    };
  }

  private async findOneByLicenseNumber(licenseNumber: string) {
    return this.doctorRepo.findOne({
      where: {
        licenseNumber,
      },
    });
  }
}
