import { Controller, Get, Param, Query } from '@nestjs/common';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import {
  GetStudentProfileInput,
  GetStudentProfileOutput,
  GetStudentProfileUC,
} from '@application/queries/get-student-profile.query';

@Controller('api/students')
export class ProfilesController {
  constructor(private readonly getProfile: GetStudentProfileUC) {}

  @Get(':id/profile')
  async getProfileById(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<GetStudentProfileOutput> {
    const input: GetStudentProfileInput = {
      studentId: id,
      limit: limit ? Number(limit) : undefined,
    };
    const result = await this.getProfile.execute(input);
    return this.unwrap<GetStudentProfileOutput>(result);
  }

  private unwrap<T>(r: Result<T, BaseError>): T {
    if (r.isSuccess()) return r.getValue();
    throw r.getErrors();
  }
}
