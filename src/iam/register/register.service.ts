import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HashingService } from '../../shared/hashing/hashing.service';
import { MailerService } from '../../shared/mailer/mailer.service';
import { AccountsUsers } from '../../users/interfaces/accounts-users.interface';
import { UsersService } from '../../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { MembersService } from '../../members/members.service';
import { DoctorsService } from '../../doctors/doctors.service';

@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly hashingService: HashingService,
    private readonly membersService: MembersService,
    private readonly doctorsService: DoctorsService,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<AccountsUsers> {
    if (!registerUserDto.role) {
      registerUserDto.role = 'user';
    }
    if (registerUserDto.role && registerUserDto.role === 'user') {
      if (!registerUserDto.member) {
        throw new BadRequestException('Member info not found');
      }
    }

    if (registerUserDto.role && registerUserDto.role === 'doctor') {
      if (!registerUserDto.doctor) {
        throw new BadRequestException('Doctor info not found');
      }
    }
    registerUserDto.password = await this.hashingService.hash(
      registerUserDto.password,
    );

    //this.sendMailRegisterUser(registerUserDto);
    const user = await this.usersService.create(registerUserDto);
    if (registerUserDto.role && registerUserDto.role === 'user') {
      if (!registerUserDto.member) {
        throw new BadRequestException('Member info not found');
      }
      const member = await this.membersService.create({
        userId: user.id,
        age: registerUserDto.member.age,
        gender: registerUserDto.member.gender,
        govtId: registerUserDto.member.govtId,
        allergies: registerUserDto.member.allergies,
        planCoverage: registerUserDto.member.planCoverage,
      });
      user.member = {
        age: member.age,
        gender: member.gender,
        govtId: member.govtId,
        id: member.id,
      };
    } else if (registerUserDto.role && registerUserDto.role === 'doctor') {
      if (!registerUserDto.doctor) {
        throw new BadRequestException('Doc info not found');
      }

      const doc = await this.doctorsService.create({
        licenseNumber: registerUserDto.doctor.licenseNumber,
        specialization: registerUserDto.doctor.specialization,
        userId: user.id,
      });
      user.doctor = {
        licenseNumber: doc.licenseNumber,
        specialization: doc.specialization,
        id: doc.id,
      };
    }

    return user;
  }

  private sendMailRegisterUser(user): void {
    try {
      this.mailerService.sendMail({
        to: user.email,
        from: 'from@example.com',
        subject: 'Registration successful ✔',
        text: 'Registration successful!',
        template: 'index',
        context: {
          title: 'Registration successfully',
          description:
            "You did it! You registered!, You're successfully registered.✔",
          nameUser: user.name,
        },
      });
      Logger.log('[MailService] User Registration: Send Mail successfully!');
    } catch (err) {
      Logger.error('[MailService] User Registration: Send Mail failed!', err);
    }
  }
}
