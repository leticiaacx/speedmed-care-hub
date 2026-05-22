import { api, saveTokens, clearTokens, getRefreshToken } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  cpf?: string;
  phone?: string;
  isActive: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  senha: string;
  cpf: string;
  phone: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Authenticate user and obtain JWT tokens.
 * POST /auth/login
 */
export const loginApi = async (
  payload: LoginPayload
): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
  const { data } = await api.post('/auth/login', payload);
  const { access_token, refresh_token, user } = data.data;
  saveTokens(access_token, refresh_token);
  return { user, tokens: { access_token, refresh_token } };
};

/**
 * Register a new patient (auto-login on success).
 * POST /auth/register
 */
export const registerApi = async (
  payload: RegisterPayload
): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
  const { data } = await api.post('/auth/register', payload);
  const { access_token, refresh_token, user } = data.data;
  saveTokens(access_token, refresh_token);
  return { user, tokens: { access_token, refresh_token } };
};

/**
 * Rotate refresh token.
 * POST /auth/refresh
 */
export const refreshApi = async (): Promise<AuthTokens> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
  const { access_token, refresh_token } = data.data;
  saveTokens(access_token, refresh_token);
  return { access_token, refresh_token };
};

/**
 * Revoke the current refresh token (logout).
 * POST /auth/logout
 */
export const logoutApi = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch {
      // Best-effort: always clear local tokens even if server call fails
    }
  }
  clearTokens();
};

/**
 * Get the currently authenticated user's profile.
 * GET /auth/me
 */
export const getMeApi = async (): Promise<AuthUser> => {
  const { data } = await api.get('/auth/me');
  return data.data;
};

/**
 * Request a password reset token (printed to server console).
 * POST /auth/forgot-password
 */
export const forgotPasswordApi = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

/**
 * Apply a new password using the reset token.
 * POST /auth/reset-password
 */
export const resetPasswordApi = async (
  token: string,
  newPassword: string
): Promise<void> => {
  await api.post('/auth/reset-password', { token, nova_senha: newPassword });
};

// ─── Error helpers ────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'USER_INACTIVE'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_CPF'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

export const extractApiError = (error: unknown): ApiError => {
  const axiosError = error as {
    response?: { data?: { error?: ApiError } };
    message?: string;
  };
  return (
    axiosError?.response?.data?.error ?? {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
    }
  );
};

const ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  USER_INACTIVE: 'Sua conta está inativa. Contate o suporte.',
  RATE_LIMITED: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  DUPLICATE_EMAIL: 'Este e-mail já está cadastrado.',
  DUPLICATE_CPF: 'Este CPF já está cadastrado.',
  VALIDATION_ERROR: 'Verifique os dados informados e tente novamente.',
  INTERNAL_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
};

export const getErrorMessage = (code: ApiErrorCode): string =>
  ERROR_MESSAGES[code] ?? 'Ocorreu um erro inesperado.';
