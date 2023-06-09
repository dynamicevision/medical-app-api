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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { AllergyDto } from './dto/allergy-dto';

@AuthGuard(AuthType.Bearer)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }

  @Get(':id/get-family-member')
  getFamilyMember(@Param('id') id: number, @Req() request) {
    console.log('Request, ', request.user);
    return this.membersService.getAllFamilyMembers(+id);
  }

  @Post(':id/add-family-member')
  addFamilyMember(
    @Param('id') id: number,
    @Body() createFamilyMember: CreateFamilyMemberDto,
    @Req() request,
  ) {
    console.log('Request, ', request.user);
    return this.membersService.createFamilyMember(+id, createFamilyMember);
  }

  @Delete(':id/delete-family-member/:fmId')
  deleteFamilyMember(
    @Param('id') id: number,
    @Param('fmId') fmId: number,
    @Req() request,
  ) {
    console.log('Request, ', request.user);
    return this.membersService.deleteFamilyMember(+id, +fmId);
  }

  @Post(':id/add-allergies')
  addMemberAllergies(
    @Param('id') id: number,
    @Body() payload: AllergyDto[],
    @Req() request,
  ) {
    console.log('Request, ', request.user);
    return this.membersService.addAllergiesToMember(+id, payload);
  }

  @Delete(':id/remove-allergies')
  removeMemberAllergies(@Param('id') id: number, @Req() request) {
    console.log('Request, ', request.user);
    return this.membersService.removeAllergiesOfMember(+id);
  }

  @Post(':id/family-members/:fmId/add-allergies')
  addFamilyMemberAllergies(
    @Param('id') id: number,
    @Param('fmId') fmId: number,
    @Body() payload: AllergyDto[],
    @Req() request,
  ) {
    console.log('Request, ', request.user);
    return this.membersService.addAllergiesToFamilyMember(+id, fmId, payload);
  }

  @Delete(':id/family-members/:fmId/remove-allergies')
  removeFamilyMemberAllergies(
    @Param('id') id: number,
    @Param('fmId') fmId: number,
    @Req() request,
  ) {
    console.log('Request, ', request.user);
    return this.membersService.removeAllergiesOfFamilyMember(+id, fmId);
  }
}
