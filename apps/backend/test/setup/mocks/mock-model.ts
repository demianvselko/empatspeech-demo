export const makeLeanFindById = <T>(doc: T | null) => ({
  findById: jest.fn(() => ({ lean: jest.fn(async () => doc) })),
});

export const makeChainFindSortLimitLean = <T>(docs: T[]) => ({
  find: jest.fn(() => ({
    sort: jest.fn(() => ({
      limit: jest.fn(() => ({
        lean: jest.fn(async () => docs),
      })),
    })),
  })),
});

export const makeChainFindQueryLean = <T>(docs: T[]) => ({
  find: jest.fn((_query?: unknown) => ({
    lean: jest.fn(async () => docs),
  })),
});

export const makeUpdateOne = () => ({
  updateOne: jest.fn(async () => ({ acknowledged: true })),
});
