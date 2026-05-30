const API_BASE = 'http://localhost:3000/api/v1';

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('speedmed_access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('speedmed_refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('speedmed_access_token', access);
  localStorage.setItem('speedmed_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('speedmed_access_token');
  localStorage.removeItem('speedmed_refresh_token');
  localStorage.removeItem('speedmed_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('speedmed_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: Record<string, unknown> | null) {
  localStorage.setItem('speedmed_user', JSON.stringify(user));
}

// ─── Fetch wrapper ───────────────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Try to refresh if 401
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({}));
        throw new ApiError(retryRes.status, err?.error?.message || err?.message || 'Erro na requisição', err?.error?.code);
      }
      return retryRes.json();
    } else {
      clearTokens();
      window.location.href = '/';
      throw new ApiError(401, 'Sessão expirada');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err?.error?.message || err?.message || 'Erro na requisição', err?.error?.code);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const payload = data.data || data;
    setTokens(payload.access_token, payload.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, senha: string) {
  const res = (await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })) as Record<string, unknown>;
  const payload = (res.data || res) as { access_token: string; refresh_token: string; user: Record<string, unknown> };
  setTokens(payload.access_token, payload.refresh_token);
  setStoredUser(payload.user);
  return payload;
}

export async function apiLogout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // ignore logout errors
    }
  }
  clearTokens();
}

export async function apiGetMe() {
  const res = (await apiFetch('/auth/me')) as Record<string, unknown>;
  return res.data || res;
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export async function apiGetDoctors(query?: Record<string, string>) {
  const params = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = (await apiFetch(`/doctors${params}`)) as Record<string, unknown>;
  return res.data || res;
}

export async function apiGetDoctor(id: number) {
  const res = (await apiFetch(`/doctors/${id}`)) as Record<string, unknown>;
  return res.data || res;
}

export async function apiCreateDoctor(data: Record<string, unknown>) {
  const res = (await apiFetch('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  })) as Record<string, unknown>;
  return res.data || res;
}

export async function apiUpdateDoctor(id: number, data: Record<string, unknown>) {
  const res = (await apiFetch(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })) as Record<string, unknown>;
  return res.data || res;
}

export async function apiDeleteDoctor(id: number) {
  await apiFetch(`/doctors/${id}`, { method: 'DELETE' });
}

export async function apiUpdateDoctorSchedule(id: number, schedule: Record<string, unknown>[]) {
  const res = (await apiFetch(`/doctors/${id}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  })) as Record<string, unknown>;
  return res.data || res;
}

// ─── Patients ────────────────────────────────────────────────────────────────

export async function apiGetPatients(query?: Record<string, string>) {
  const params = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = (await apiFetch(`/patients${params}`)) as Record<string, unknown>;
  return res.data || res;
}

export async function apiGetPatient(id: number) {
  const res = (await apiFetch(`/patients/${id}`)) as Record<string, unknown>;
  return res.data || res;
}

export async function apiCreatePatient(data: Record<string, unknown>) {
  const res = (await apiFetch('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  })) as Record<string, unknown>;
  return res.data || res;
}

export async function apiUpdatePatient(id: number, data: Record<string, unknown>) {
  const res = (await apiFetch(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })) as Record<string, unknown>;
  return res.data || res;
}

export async function apiDeletePatient(id: number) {
  await apiFetch(`/patients/${id}`, { method: 'DELETE' });
}
