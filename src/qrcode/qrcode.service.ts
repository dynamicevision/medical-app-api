import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrcodeService {
  constructor(private readonly configService: ConfigService) {}
  public getDoctorRegistrationLink() {
    //generate the doc registration site address.
    const url = this.configService.get<string>('DOCTOR_REGISTRATION_URL');
    //generate a qrcode with the site address.

    return {
      url,
      pathToQrCode: '',
    };
  }
}
