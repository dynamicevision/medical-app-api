import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QrcodeService {
  constructor(private readonly configService: ConfigService) {}
  async getDoctorRegistrationLink() {
    //generate the doc registration site address.
    const url = this.configService.get<string>('DOCTOR_REGISTRATION_URL');
    //generate a qrcode with the site address.
    const dataurl = await QRCode.toDataURL(url);
    //await QRCode.toFile(docQrCodeSavePath, url);
    return {
      url,
      pathToQrCode: dataurl,
    };
  }
}
