import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilsModule } from '../shared/utils/utils.module';
import { UsersModule } from '../users/users.module';
import { ChangePasswordModule } from './change-password/change-password.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { MembersModule } from '../members/members.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    LoginModule,
    RegisterModule,
    UsersModule,
    ForgotPasswordModule,
    ChangePasswordModule,
    UtilsModule,
    forwardRef(() => MembersModule),
    forwardRef(() => DoctorsModule),
  ],
  providers: [JwtService],
})
export class IamModule {}
