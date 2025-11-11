import { BaseProps } from '@domain/base/base-props.type';
import { CreatedAtVO, StringVO, UuidVO } from '@domain/shared/valid-objects';

export type Trial = Readonly<{ correct: boolean; ts: number }>;

export type SessionProps = Readonly<
  BaseProps & {
    slpId: UuidVO;
    studentId: UuidVO;
    seed: number;
    notes?: StringVO;
    endedAt?: CreatedAtVO;
    trials: Trial[];
  }
>;

export type SessionPrimitives = Readonly<{
  id?: string;
  active?: boolean;
  createdAt?: Date | string | number;

  slpId: string;
  studentId: string;
  seed: number;
  notes?: string;
  endedAt?: Date | string | number;
  trials?: Trial[];
}>;
