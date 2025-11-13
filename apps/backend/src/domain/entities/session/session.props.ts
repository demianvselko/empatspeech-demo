import { BaseProps } from '@domain/base/base-props.type';
import { UuidVO, StringVO } from '@domain/shared/valid-objects';
import { FinishedAtVO } from './validate-objects/finished-at.vo';

export type Trial = Readonly<{ correct: boolean; tsEpochMs: number }>;

export type SessionProps = Readonly<
  BaseProps & {
    slpId: UuidVO; // Teacher.userId
    studentId: UuidVO; // Student.userId
    seed: number;
    finishedAt?: FinishedAtVO;
    notes?: StringVO;
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
  finishedAt?: Date | string | number;
  notes?: string;
  trials?: Array<{ correct: boolean; tsEpochMs: number }>;
}>;
