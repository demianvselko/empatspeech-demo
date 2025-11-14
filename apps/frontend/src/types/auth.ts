export type AppRole = "Teacher" | "Student";

export type JwtPayload = Readonly<{
  sub: string;
  role: AppRole;
  email?: string;
  iat?: number;
  exp?: number;
}>;

export type AuthUser = {
  userId: string;
  email: string;
  role: AppRole;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
};
