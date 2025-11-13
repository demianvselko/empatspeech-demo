jest.mock('uuid', () => {
  const FIXED = '550e8400-e29b-41d4-a716-446655440000';

  const isUuidV4 = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s,
    );

  return {
    v4: () => FIXED,
    validate: (s: string) => isUuidV4(s),
    version: (s: string) => (isUuidV4(s) ? 4 : 0),
  };
});
