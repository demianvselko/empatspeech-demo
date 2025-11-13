// test/setup/mocks/mock-fastify-register.ts (opcional)
export type Registered = Array<{
  plugin: unknown;
  opts?: Record<string, unknown>;
}>;
export const makeFastifyLike = () => {
  const registered: Registered = [];
  return {
    fastify: {
      register: (plugin: unknown, opts?: Record<string, unknown>) => {
        registered.push({ plugin, opts });
      },
    },
    registered,
  };
};
