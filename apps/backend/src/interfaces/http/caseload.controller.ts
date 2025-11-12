import { Controller, Get, Param } from '@nestjs/common';
import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';
import {
  ListCaseloadInput,
  ListCaseloadOutput,
  ListCaseloadUC,
} from '@application/queries/list-caseload.query';

@Controller('api/slp')
export class CaseloadController {
  constructor(private readonly listCaseloadUC: ListCaseloadUC) {}

  @Get(':id/caseload')
  async listCaseload(@Param('id') id: string): Promise<ListCaseloadOutput> {
    const input: ListCaseloadInput = { slpId: id };
    const result = await this.listCaseloadUC.execute(input);
    return this.unwrap<ListCaseloadOutput>(result);
  }

  private unwrap<T>(r: Result<T, BaseError>): T {
    if (r.isSuccess()) return r.getValue();
    throw r.getErrors();
  }
}
