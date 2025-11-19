export type CreateUserInput = Readonly<{
  email: string;
  password: string;
}>;

export type CreateUserOutput = Readonly<{
  userId: string;
  email: string;
  createdAtIso: string;
}>;
