// import { Injectable } from '@nestjs/common';
// import { Result } from '@domain/shared/result/result';
// import { BaseError } from '@domain/shared/error/base.error';
// import { SessionFactory } from '@domain/entities/session/session.factory';
// import { Session } from '@domain/entities/session/session.entity';
// import { SessionRepositoryPort } from '@domain/ports/repository/session-repository.port';

// type Input = Readonly<{ slpId: string; studentId: string; seed?: number }>;

// @Injectable()
// export class CreateSessionUC {
//     constructor(private readonly sessions: SessionRepositoryPort) { }

//     async exec(input: Input): Promise<Result<Session, BaseError>> {
//         const sessionR = SessionFactory.newQuick(input);
//         if (sessionR.isFailure()) return Result.fail(sessionR.getErrors());

//         const s = sessionR.getValue();
//         const saved = await this.sessions.create(s);
//         if (saved.isFailure()) return Result.fail(saved.getErrors());

//         return Result.ok(s);
//     }
// }
