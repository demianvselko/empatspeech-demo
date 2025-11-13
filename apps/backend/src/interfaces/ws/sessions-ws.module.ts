import { Module } from '@nestjs/common';
import { MongoPersistenceModule } from '@infrastructure/persistence/database/mongoose/mongoose.module';
import { SESSION_REPOSITORY_TOKEN } from '@infrastructure/persistence/database/mongoose/tokens';
import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';
import { SystemClock } from '@domain/ports/clock.port';
import { AppendTrialUC } from '@application/use-cases/sessions/append-trial.uc';
import { PatchNotesUC } from '@application/use-cases/sessions/patch-notes.uc';
import { FinishSessionUC } from '@application/use-cases/sessions/finish-session.uc';
import { SessionGateway } from './session.gateway';

@Module({
  imports: [MongoPersistenceModule],
  providers: [
    {
      provide: AppendTrialUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new AppendTrialUC(sessions, SystemClock),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: PatchNotesUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new PatchNotesUC(sessions),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    {
      provide: FinishSessionUC,
      useFactory: (sessions: SessionRepositoryPort) =>
        new FinishSessionUC(sessions, SystemClock),
      inject: [SESSION_REPOSITORY_TOKEN],
    },
    SessionGateway,
  ],
})
export class SessionsWsModule {}
