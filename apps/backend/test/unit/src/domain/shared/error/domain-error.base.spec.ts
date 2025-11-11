import { DomainError } from '@domain/shared/error/domain-error.base';

class MyDomainError extends DomainError {
  constructor(message = 'Domain Boom', code = 'DOMAIN_BOOM') {
    super(message, code);
  }
}

describe('DomainError', () => {
  it('crea un error con message, code y name correctos', () => {
    const err = new MyDomainError('Something went wrong', 'SOMETHING_WRONG');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);

    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('SOMETHING_WRONG');

    expect(err.name).toBe('MyDomainError');
  });

  it('usa valores por defecto si no se pasan parámetros', () => {
    const err = new MyDomainError();

    expect(err.message).toBe('Domain Boom');
    expect(err.code).toBe('DOMAIN_BOOM');
    expect(err.name).toBe('MyDomainError');
  });
});
