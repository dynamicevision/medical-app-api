import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { createReadStream } from 'fs';
import { Response } from 'express';

@AuthGuard(AuthType.Bearer)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@Body() createConsultationDto: CreateConsultationDto, @Req() request) {
    const currentSub = request.user;
    console.log('Current sub: ', currentSub);
    return this.consultationsService.create(
      createConsultationDto,
      +currentSub.sub,
    );
  }

  @Get()
  findAll(@Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findAll(+currentSub.sub);
  }

  @Get('/doctor')
  findAllForDoctor(@Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findAllForDoctor(+currentSub.sub);
  }

  @Get('/find/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findOne(+id, currentSub.sub);
  }

  /*@Get(':id/link')
  findConsultationLink(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.findConsultationLink(+id, currentSub.sub);
  }*/

  @AuthGuard(AuthType.None)
  @Get('/:id/qrcode')
  async findConsultationLinkQrCode(
    @Res({ passthrough: true }) res: Response,
    @Param('id') consultId: number,
    @Req() request,
  ): Promise<StreamableFile> {
    res.set({ 'Content-Type': 'image/png' });
    const extConsult = await this.consultationsService.findOneById(consultId);
    let imageLocation = 'images/placeholder.png';
    if (extConsult.qrCodeImageLocation) {
      imageLocation = process.cwd() + '/' + extConsult.qrCodeImageLocation;
    }
    const file = createReadStream(imageLocation);
    return new StreamableFile(file);
  }

  @AuthGuard(AuthType.None)
  @Get('/:id/link')
  async findConsultationLink(
    @Res({ passthrough: true }) res: Response,
    @Param('id') consultId: number,
    @Req() request,
  ) {
    const extConsult = await this.consultationsService.findOneById(consultId);
    return {
      url: extConsult.directLink,
    };
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
      currentSub.sub,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {
    const currentSub = request.user;
    return this.consultationsService.remove(+id, currentSub.sub);
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
