import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';

@AuthGuard(AuthType.Bearer)
@Controller('/doctor-consultation')
export class DoctorConsultationController {
  constructor(private readonly consultationService: ConsultationsService) {}

  @Get()
  public getDoctorConsultations(
    @Req() request,
    @Query('status') status?: string,
  ) {
    const currentUser = request.user;
    return this.consultationService.getDoctorConsultations(
      currentUser.sub,
      status,
    );
  }

  @Get(':code')
  public getDoctorConsultationsForCode(
    @Param('code') consultCode: string,
    @Req() request,
  ) {
    const currentUser = request.user;
    return this.consultationService.getDoctorConsultationsForCode(
      currentUser.sub,
      consultCode,
    );
  }
}
