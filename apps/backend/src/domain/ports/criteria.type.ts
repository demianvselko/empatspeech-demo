export type SortDirection = 'asc' | 'desc';

export type Pagination = Readonly<{
  limit?: number;
  offset?: number;
}>;

export type Sort<TFields extends string = string> = Readonly<{
  field: TFields;
  direction?: SortDirection;
}>;

export type FilterOp = 'eq' | 'neq' | 'in' | 'contains' | 'gte' | 'lte';

export type Filter = Readonly<{
  field: string;
  op: FilterOp;
  value: unknown;
}>;

export type Criteria<TFields extends string = string> = Readonly<{
  filters?: Filter[];
  sort?: Sort<TFields>[];
  pagination?: Pagination;
}>;
