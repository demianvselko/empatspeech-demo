import { Criteria, Filter, Sort } from '@domain/ports/criteria.type';

type MongoFilter = Record<string, unknown>;
type MongoSort = Record<string, 1 | -1>;

const opMap: Record<string, (field: string, value: unknown) => MongoFilter> = {
  eq: (f, v) => ({ [f]: v }),
  neq: (f, v) => ({ [f]: { $ne: v } }),
  in: (f, v) => ({ [f]: { $in: Array.isArray(v) ? v : [v] } }),
  contains: (f, v) => ({ [f]: { $regex: String(v), $options: 'i' } }),
  gte: (f, v) => ({ [f]: { $gte: v } }),
  lte: (f, v) => ({ [f]: { $lte: v } }),
};

export function buildMongoFilter(filters?: Filter[]): MongoFilter {
  if (!filters?.length) return {};
  const ands = filters
    .map((flt) => opMap[flt.op]?.(flt.field, flt.value))
    .filter(Boolean);
  if (!ands.length) return {};
  return { $and: ands } as MongoFilter;
}

export function buildMongoSort<TFields extends string = string>(
  sort?: Sort<TFields>[],
): MongoSort | undefined {
  if (!sort?.length) return undefined;
  const out: MongoSort = {};
  for (const s of sort) out[s.field] = s.direction === 'asc' ? 1 : -1;
  return out;
}

export function normalizePagination(limit?: number, offset?: number) {
  const l =
    Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : 20;
  const o =
    Number.isFinite(offset) && (offset as number) >= 0 ? (offset as number) : 0;
  return { limit: Math.min(l, 200), offset: o };
}

export function mongoQueryFromCriteria<TFields extends string = string>(
  criteria?: Criteria<TFields>,
) {
  const filter = buildMongoFilter(criteria?.filters);
  const sort = buildMongoSort(criteria?.sort);
  const { limit, offset } = normalizePagination(
    criteria?.pagination?.limit,
    criteria?.pagination?.offset,
  );
  return { filter, sort, limit, offset };
}
