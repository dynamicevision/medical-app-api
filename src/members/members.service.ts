import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../users/models/users.model';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { FamilyMember } from './entities/family-member.entity';
import { AllergyDto } from './dto/allergy-dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(FamilyMember)
    private familyMemberRepo: Repository<FamilyMember>,
  ) {}
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const { userId, ...options } = createMemberDto;
    const user = await this.usersRepository.findOne({
      where: {
        id: createMemberDto.userId,
      },
    });
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    return await this.memberRepository.save({
      ...options,
      user,
    });
  }

  async findAll(): Promise<Member[]> {
    const members = await this.memberRepository.find({
      relations: ['user', 'familyMembers'],
    });
    return members.map((value) => {
      if (value.user) {
        value.user.password = undefined;
      }
      return value;
    });
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: {
        id: id,
      },
      relations: ['user', 'familyMembers'],
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }
    if (member.user) {
      member.user.password = undefined;
    }
    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.memberRepository.findOneBy({
      id: id,
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }
    member.gender = updateMemberDto.gender;
    member.govtId = updateMemberDto.govtId;
    member.age = updateMemberDto.age;
    await this.memberRepository.save(member);
    return this.findOne(id);
  }

  async remove(id: number) {
    const member = await this.memberRepository.findOneBy({
      id: id,
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }
    await this.memberRepository.remove([member]);
    return {
      message: 'Deleted member',
    };
  }

  async createFamilyMember(
    memberId: number,
    createFamilyMember: CreateFamilyMemberDto,
  ) {
    const { relation, ...options } = createFamilyMember;
    const mainMember = await this.findOne(memberId);
    if (!mainMember) {
      throw new NotFoundException('Main member id not found');
    }

    const fm = await this.familyMemberRepo.save({
      memberRelatedTo: mainMember,
      relation,
      ...options,
    });
    return fm;
  }

  async deleteFamilyMember(memberId: number, fmId: number) {
    const entity = await this.familyMemberRepo.findOne({
      where: {
        id: fmId,
      },
    });
    if (!entity) {
      throw new NotFoundException('Cannot find family member');
    }
    await this.familyMemberRepo.remove([entity]);

    return {
      message: 'Deleted family member',
    };
  }

  async getAllFamilyMembers(id: number) {
    return await this.familyMemberRepo.find({
      where: {
        memberRelatedTo: {
          id,
        },
      },
      relations: ['memberRelatedTo'],
    });
  }

  async addAllergiesToMember(memberId: number, payload: AllergyDto[]) {
    const member = await this.memberRepository.findOneBy({
      id: memberId,
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }

    if (member.allergies?.length === 0) {
      member.allergies = payload;
    } else {
      member.allergies.push(...payload);
    }
    await this.memberRepository.save(member);
    return this.findOne(memberId);
  }

  async addAllergiesToFamilyMember(
    memberId: number,
    fmId: number,
    payload: AllergyDto[],
  ) {
    const member = await this.memberRepository.findOneBy({
      id: memberId,
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }

    const familyMember = await this.familyMemberRepo.findOne({
      where: {
        id: fmId,
      },
    });
    if (!familyMember) {
      throw new NotFoundException('Cannot find family member');
    }

    if (familyMember.allergies?.length === 0) {
      familyMember.allergies = payload;
    } else {
      familyMember.allergies.push(...payload);
    }
    await this.familyMemberRepo.save(familyMember);
    return this.findOneFamilyMember(fmId);
  }

  async findOneFamilyMember(fmId: number) {
    const familyMember = await this.familyMemberRepo.findOne({
      where: {
        id: fmId,
      },
      relations: ['memberRelatedTo'],
    });
    if (!familyMember) {
      throw new NotFoundException('Cannot find family member');
    }
    return familyMember;
  }

  async removeAllergiesOfMember(memberId: number) {
    const member = await this.memberRepository.findOneBy({
      id: memberId,
    });
    if (!member) {
      throw new NotFoundException('Cannot find member');
    }
    member.allergies = null;
    await this.memberRepository.save(member);
    return this.findOne(memberId);
  }

  async removeAllergiesOfFamilyMember(memberId: number, fmId: number) {
    const familyMember = await this.familyMemberRepo.findOne({
      where: {
        id: fmId,
      },
    });
    if (!familyMember) {
      throw new NotFoundException('Cannot find family member');
    }

    familyMember.allergies = null;
    await this.familyMemberRepo.save(familyMember);
    return this.findOneFamilyMember(fmId);
  }
}
