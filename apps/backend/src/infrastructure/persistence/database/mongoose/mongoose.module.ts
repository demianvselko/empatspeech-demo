import { Module } from '@nestjs/common';
import { MongooseModule as NestMongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserSchema } from './schemas/user.schema';
import { SessionSchema } from './schemas/session.schema';

import { MongooseUserRepository } from './repositories/user.repository';
import { MongooseSessionRepository } from './repositories/session.repository';
import { MongooseSessionViewRepository } from './repositories/session.view.repository';

import {
  USER_REPOSITORY_TOKEN,
  SESSION_REPOSITORY_TOKEN,
  SESSION_VIEW_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [
    ConfigModule,

    NestMongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const uri =
          cfg.get<string>('MONGO_URI') ??
          'mongodb://localhost:27017/speech_therapy';
        const isProd =
          (cfg.get<string>('STAGE') ?? '').toLowerCase() === 'production';
        return {
          uri,
          autoIndex: !isProd,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 30000,
        };
      },
    }),

    NestMongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Session', schema: SessionSchema },
    ]),
  ],
  providers: [
    { provide: USER_REPOSITORY_TOKEN, useClass: MongooseUserRepository },
    { provide: SESSION_REPOSITORY_TOKEN, useClass: MongooseSessionRepository },
    {
      provide: SESSION_VIEW_REPOSITORY_TOKEN,
      useClass: MongooseSessionViewRepository,
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    SESSION_REPOSITORY_TOKEN,
    SESSION_VIEW_REPOSITORY_TOKEN,
    NestMongooseModule,
  ],
})
export class MongoPersistenceModule {}
