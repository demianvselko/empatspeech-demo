import {
  buildMongoFilter,
  buildMongoSort,
  normalizePagination,
  mongoQueryFromCriteria,
} from '@infrastructure/persistence/database/mongoose/criteria-to-mongo';

describe('criteria-to-mongo (unit)', () => {
  it('buildMongoFilter: eq + contains', () => {
    const f = buildMongoFilter([
      { field: 'email', op: 'eq', value: 'a@b.com' },
      { field: 'name', op: 'contains', value: 'Ada' },
    ]);
    expect(f).toEqual({
      $and: [{ email: 'a@b.com' }, { name: { $regex: 'Ada', $options: 'i' } }],
    });
  });

  it('buildMongoSort: asc/desc', () => {
    const s = buildMongoSort([
      { field: 'createdAt', direction: 'desc' },
      { field: 'email', direction: 'asc' },
    ]);
    expect(s).toEqual({ createdAt: -1, email: 1 });
  });

  it('normalizePagination caps limit and floors offset', () => {
    expect(normalizePagination(0, -5)).toEqual({ limit: 20, offset: 0 });
    expect(normalizePagination(999, 10)).toEqual({ limit: 200, offset: 10 });
  });

  it('mongoQueryFromCriteria: wiring', () => {
    const q = mongoQueryFromCriteria({
      filters: [{ field: 'active', op: 'eq', value: true }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
      pagination: { limit: 5, offset: 10 },
    });
    expect(q.limit).toBe(5);
    expect(q.offset).toBe(10);
    expect(q.sort).toEqual({ createdAt: -1 });
    expect(q.filter).toEqual({ $and: [{ active: true }] });
  });
});
