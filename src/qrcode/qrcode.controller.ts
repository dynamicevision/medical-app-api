import { Controller, Get } from '@nestjs/common';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { QrcodeService } from './qrcode.service';

@AuthGuard(AuthType.None)
@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('/doctor-registration-qr-code')
  public async showDocRegistrationQrCode() {
    const data = await this.qrcodeService.getDoctorRegistrationLink();
    //todo return qrcode image. data.pathToQrCode

    return data.pathToQrCode;
  }

  @Get('/show-doctor-registration-link')
  public async generateDocRegistrationLink() {
    return this.qrcodeService.getDoctorRegistrationLink();
  }
}
