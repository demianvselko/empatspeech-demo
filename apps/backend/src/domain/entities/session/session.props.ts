import { BaseProps } from '@domain/base/base-props.type';
import { UuidVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from './validate-objects/finished-at.vo';

export type Trial = Readonly<{
  correct: boolean;
  tsEpochMs: number;
  performedBy: 'slp' | 'student';
}>;

export type SessionDifficulty = 'easy' | 'medium' | 'hard';

export type SessionProps = Readonly<
  BaseProps & {
    slpId: UuidVO;
    studentId: UuidVO;
    seed: number;
    difficulty: SessionDifficulty;
    finishedAt?: FinishedAtVO;
    notes: string[];
    trials: Trial[];
  }
>;

export type SessionPrimitives = Readonly<{
  id: string;
  active?: boolean;
  createdAt?: Date | string | number;
  slpId: string;
  studentId: string;
  seed: number;
  difficulty?: SessionDifficulty;
  finishedAt?: Date | string | number;
  notes?: string[];
  trials?: Array<{
    correct: boolean;
    tsEpochMs: number;
    performedBy?: 'slp' | 'student';
  }>;
}>;
