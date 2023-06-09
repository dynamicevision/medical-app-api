import { UserDto } from '../../../users/dto/user.dto';
import { CreateMemberDto } from '../../../members/dto/create-member.dto';

export class RegisterUserDto extends UserDto {
  member: CreateMemberDto;
  doctor: any;
}
