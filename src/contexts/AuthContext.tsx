import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  extractApiError,
  getErrorMessage,
  type AuthUser,
  type RegisterPayload,
} from '@/services/auth.service';
import { getAccessToken } from '@/services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Role → route mapping ─────────────────────────────────────────────────────

const ROLE_ROUTES: Record<AuthUser['role'], string> = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getMeApi();
        setUser(me);
      } catch {
        // Token is invalid or expired and refresh also failed (handled by api.ts interceptor)
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const { user: loggedUser } = await loginApi({ email, password });
        setUser(loggedUser);
        navigate(ROLE_ROUTES[loggedUser.role]);
        return true;
      } catch (error) {
        const apiErr = extractApiError(error);
        toast.error(getErrorMessage(apiErr.code), {
          description: apiErr.message,
          duration: 5000,
        });
        return false;
      }
    },
    [navigate]
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterPayload): Promise<boolean> => {
      try {
        const { user: newUser } = await registerApi(data);
        setUser(newUser);
        toast.success('Cadastro realizado com sucesso! Bem-vindo(a)!');
        navigate(ROLE_ROUTES[newUser.role]);
        return true;
      } catch (error) {
        const apiErr = extractApiError(error);
        toast.error(getErrorMessage(apiErr.code), {
          description: apiErr.message,
          duration: 5000,
        });
        return false;
      }
    },
    [navigate]
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      navigate('/');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
