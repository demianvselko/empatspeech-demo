export type AppRole = 'Teacher' | 'Student';

export type JwtPayload = Readonly<{
  sub: string;
  role: AppRole;
  email?: string;
  iat?: number;
  exp?: number;
}>;

export type JwtLoginInput = Readonly<{
  userId: string;
  role: AppRole;
  email?: string;
}>;
