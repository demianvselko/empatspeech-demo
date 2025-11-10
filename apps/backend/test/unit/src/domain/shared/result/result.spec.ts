import { BaseError } from '@domain/shared/error/base.error';
import { Result } from '@domain/shared/result/result';

class MyError extends BaseError {}

describe('Result', () => {
  it('ok returns value and isSuccess', () => {
    const r = Result.ok(42, 'all good');
    expect(r.isSuccess()).toBe(true);
    expect(r.isFailure()).toBe(false);
    expect(r.getValue()).toBe(42);
    expect(r.message).toBe('all good');
  });

  it('fail returns single error in array and isFailure', () => {
    const r = Result.fail(new MyError('boom', 'BOOM'), 'bad');
    expect(r.isFailure()).toBe(true);
    expect(() => r.getValue()).toThrow(
      'Tried to get value from a failed Result',
    );
    const errs = r.getErrors();
    expect(errs).toHaveLength(1);
    expect(errs[0].code).toBe('BOOM');
    expect(r.message).toBe('bad');
  });

  it('fail supports array of errors', () => {
    const e1 = new MyError('e1', 'E1');
    const e2 = new MyError('e2', 'E2');
    const r = Result.fail([e1, e2]);
    expect(r.isFailure()).toBe(true);
    const errs = r.getErrors();
    expect(errs).toHaveLength(2);
    expect(errs.map((e) => e.code)).toEqual(['E1', 'E2']);
  });

  it('getErrors throws on success', () => {
    const r = Result.ok('x');
    expect(() => r.getErrors()).toThrow(
      'Tried to get errors from a successful Result',
    );
  });
});
