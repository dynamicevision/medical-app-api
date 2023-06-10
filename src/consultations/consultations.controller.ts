import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@AuthGuard(AuthType.Bearer)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@Body() createConsultationDto: CreateConsultationDto, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.create(
      createConsultationDto,
      currentSub.id,
    );
  }

  @Get()
  findAll(@Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findAll(+currentSub.id);
  }

  @Get('/doctor')
  findAllForDoctor(@Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findAllForDoctor(+currentSub.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findOne(+id, currentSub.id);
  }

  @Get(':id/link')
  findConsultationLink(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findConsultationLink(+id, currentSub.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @Req() request,
  ) {
    const currentSub = request.user;
    return this.consultationsService.update(
      +id,
      updateConsultationDto,
      currentSub.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.remove(+id, currentSub.id);
  }

  @Post(':id/prescription')
  createNewPrescription(
    @Param('id') id: number,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @Req() request,
  ) {}

  @Post(':id/prescription/:pid')
  updatePrescription(
    @Param('id') id: number,
    @Param('pid') prescriptionId: number,
    @Body() createPrescriptionDto: UpdatePrescriptionDto,
    @Req() request,
  ) {}
}
