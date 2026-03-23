export type ActionState = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  data?: Record<string, unknown>;
};

export type User = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
};

/** Profile from `GET /auth/me` (backend API) */
export type AuthMeUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "USER";
  provider: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthError = {
  type: "CredentialsSignin" | "OAuthSignin" | "Default";
  message: string;
};

export type AuthSuccess = {
  user: User;
  redirectTo?: string;
};
