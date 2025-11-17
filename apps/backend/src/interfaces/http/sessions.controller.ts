import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { CreateSessionUC } from '@application/use-cases/sessions/create-session.uc';
import { AppendTrialUC } from '@application/use-cases/sessions/append-trial.uc';
import { FinishSessionUC } from '@application/use-cases/sessions/finish-session.uc';
import { PatchNotesUC } from '@application/use-cases/sessions/patch-notes.uc';

import { Result } from '@domain/shared/result/result';
import { BaseError } from '@domain/shared/error/base.error';

import type {
  CreateSessionInput,
  CreateSessionOutput,
} from '@application/use-cases/sessions/dtos/create-session.dto';
import type {
  AppendTrialInput,
  AppendTrialOutput,
} from '@application/use-cases/sessions/dtos/append-trial.dto';
import type { FinishSessionOutput } from '@application/use-cases/sessions/dtos/finish-session.dto';
import type {
  PatchNotesInput,
  PatchNotesOutput,
} from '@application/use-cases/sessions/dtos/patch-notes.dto';

import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';
import type { JwtPayload } from '@infrastructure/auth/jwt.types';
import { emailToUserId } from '@infrastructure/auth/email-user-id.util';
import { SessionDifficulty } from '@domain/entities/session/session.props';
import { GetSessionSummaryUC } from '@application/use-cases/sessions/get-session-summary.uc';
import type { GetSessionSummaryOutput } from '@application/use-cases/sessions/dtos/get-session-summary.dto';
import { SessionGateway } from '@interfaces/ws/session.gateway';

type AuthedRequest = FastifyRequest & { user: JwtPayload };

type CreateSessionBody = {
  studentEmail: string;
  notes?: string;
  seed?: number;
  difficulty?: SessionDifficulty;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly createSession: CreateSessionUC,
    private readonly appendTrial: AppendTrialUC,
    private readonly finishSession: FinishSessionUC,
    private readonly patchNotes: PatchNotesUC,
    private readonly getSessionSummary: GetSessionSummaryUC,
    private readonly sessionGateway: SessionGateway,
  ) { }

  @Post()
  @Roles('Teacher')
  async create(
    @Req() req: AuthedRequest,
    @Body() body: CreateSessionBody,
  ): Promise<CreateSessionOutput> {
    const { sub } = req.user;

    const slpId = sub;
    const studentId = emailToUserId(body.studentEmail);

    const input: CreateSessionInput = {
      slpId,
      studentId,
      notes: body.notes,
      seed: body.seed,
      difficulty: body.difficulty,
    };

    const result = await this.createSession.execute(input);
    return this.unwrap<CreateSessionOutput>(result);
  }

  @Post(':id/trials')
  @Roles('Teacher', 'Student')
  async addTrial(
    @Param('id') id: string,
    @Body() body: Omit<AppendTrialInput, 'sessionId' | 'performedBy'>,
  ): Promise<AppendTrialOutput> {
    const result = await this.appendTrial.execute({
      sessionId: id,
      correct: body.correct,
      performedBy: 'student',
    });
    return this.unwrap<AppendTrialOutput>(result);
  }

  @Post(':id/finish')
  @Roles('Teacher')
  async finish(@Param('id') id: string): Promise<FinishSessionOutput> {
    const result = await this.finishSession.execute({ sessionId: id });
    const output = this.unwrap<FinishSessionOutput>(result);
    await this.sessionGateway.broadcastSessionState(id);

    return output;
  }

  @Patch(':id/notes')
  @Roles('Teacher')
  async updateNotes(
    @Param('id') id: string,
    @Body() body: Omit<PatchNotesInput, 'sessionId'>,
  ): Promise<PatchNotesOutput> {
    const result = await this.patchNotes.execute({
      sessionId: id,
      notes: body.notes,
    });
    return this.unwrap<PatchNotesOutput>(result);
  }

  @Get(':id/summary')
  @Roles('Teacher')
  async getSummary(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<GetSessionSummaryOutput> {
    const { sub } = req.user;
    const result = await this.getSessionSummary.execute({
      sessionId: id,
      slpId: sub,
    });
    return this.unwrap<GetSessionSummaryOutput>(result);
  }

  private unwrap<T>(r: Result<T, BaseError>): T {
    if (r.isSuccess()) return r.getValue();
    throw r.getErrors();
  }
}
