import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { ProfilesController } from './profiles.controller';
import { CaseloadController } from './caseload.controller';
import { MongoPersistenceModule } from '@infrastructure/persistence/database/mongoose/mongoose.module';
import {
  SESSION_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '@infrastructure/persistence/database/mongoose/tokens';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { UserRepositoryPort } from '@domain/ports/repository/user-repository.port';
import { SystemClock } from '@domain/ports/clock.port';

import { CreateSessionUC } from '@application/use-cases/sessions/create-session.uc';
import { AppendTrialUC } from '@application/use-cases/sessions/append-trial.uc';
import { FinishSessionUC } from '@application/use-cases/sessions/finish-session.uc';
import { PatchNotesUC } from '@application/use-cases/sessions/patch-notes.uc';
import { GetStudentProfileUC } from '@application/queries/get-student-profile.query';
import { ListCaseloadUC } from '@application/queries/list-caseload.query';
import { GetSessionSummaryUC } from '@application/use-cases/sessions/get-session-summary.uc';
import { SessionGateway } from '@interfaces/ws/session.gateway';

@Module({
  imports: [MongoPersistenceModule],
  controllers: [SessionsController, ProfilesController, CaseloadController],
  providers: [
    SessionGateway,

    {
      provide: CreateSessionUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new CreateSessionUC(sessions),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: AppendTrialUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new AppendTrialUC(sessions, SystemClock),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: FinishSessionUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new FinishSessionUC(sessions, SystemClock),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: PatchNotesUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new PatchNotesUC(sessions),
      inject: [SESSION_REPOSITORY_TOKEN],
    },

    {
      provide: GetStudentProfileUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new GetStudentProfileUC(sessions),
      inject: [SESSION_REPOSITORY_TOKEN],
    },

    {
      provide: GetSessionSummaryUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new GetSessionSummaryUC(sessions),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: ListCaseloadUC,
      useFactory: (users: UserRepositoryPort) => new ListCaseloadUC(users),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
  exports: [],
})
export class SessionsModule {}
