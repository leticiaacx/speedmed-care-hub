import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  apiLogin, apiLogout, apiGetDoctors, apiGetPatients,
  apiCreateDoctor, apiUpdateDoctor, apiDeleteDoctor,
  apiCreatePatient, apiUpdatePatient, apiDeletePatient,
  apiUpdateDoctorSchedule, apiGetMe,
  getStoredUser, getAccessToken, clearTokens, setStoredUser,
} from '@/lib/api';
import { mockAdmins, mockDoctors, mockPatients } from '@/data/mockData';
import type { MEDICO, USUARIO, CLINICA } from '@/data/mockData';
import { toast } from 'sonner';

export type { MEDICO, USUARIO, CLINICA };
export type UserRole = 'admin' | 'doctor' | 'patient';

interface UserContextType {
    currentUser: unknown;
    userRole: UserRole | null;
    doctors: MEDICO[];
    patients: USUARIO[];
    admins: CLINICA[];
    login: (email: string, password?: string) => Promise<{ success: boolean; role?: UserRole }>;
    logout: () => void;
    registerDoctor: (doctor: Omit<MEDICO, 'id'>) => void;
    updateDoctor: (id: number, data: Partial<Omit<MEDICO, 'id'>>) => void;
    removeDoctor: (id: number) => void;
    registerPatient: (patient: Omit<USUARIO, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'>) => void;
    updatePatient: (id: number, data: Partial<Omit<USUARIO, 'id'>>) => void;
    removePatient: (id: number) => void;
    registerAdmin: (admin: Omit<CLINICA, 'id'>) => void;
    updateDoctorSchedule: (doctorId: number, schedule: MEDICO['schedule']) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ── Map API doctor to frontend MEDICO ────────────────────────────────────────
function mapApiDoctor(d: Record<string, unknown> | ReturnType<typeof JSON.parse>): MEDICO {
    return {
        id: d.id,
        nome: d.nome,
        crm: d.crm,
        especialidade: d.especialidade,
        clinica_id: d.clinicaId || d.clinica_id || 1,
        email: d.user?.email || d.email || '',
        phone: d.telefone || d.phone,
        onlineConsultation: d.consultaOnline ?? d.onlineConsultation ?? false,
        ativo: d.ativo ?? true,
        schedule: (d.horarios || d.schedule || []).map((h: Record<string, unknown>) => ({
            dayOfWeek: h.dayOfWeek ?? h.day_of_week,
            startTime: h.startTime ?? h.start_time,
            endTime: h.endTime ?? h.end_time,
        })),
    };
}

// ── Map API patient to frontend USUARIO ──────────────────────────────────────
function mapApiPatient(p: Record<string, unknown> | ReturnType<typeof JSON.parse>): USUARIO {
    return {
        id: p.id,
        nome: p.nome || p.socialName || '',
        cpf: p.cpf,
        email: p.user?.email || p.email || '',
        phone: p.telefone || p.phone,
        age: p.dataNascimento ? Math.floor((Date.now() - new Date(p.dataNascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
        bloodType: p.tipoSanguineo?.replace('_POS', '+').replace('_NEG', '-') || undefined,
        allergies: p.alergias || [],
        medications: p.medicacoesEmUso || [],
        heredity: p.hereditariedade || [],
        medico_id: p.medicoId || p.medico_id,
        socialName: p.socialName,
        address: p.endereco,
        consultationHistory: [],
    };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [doctors, setDoctors] = useState<MEDICO[]>(mockDoctors);
    const [patients, setPatients] = useState<USUARIO[]>(mockPatients);
    const [admins, setAdmins] = useState<CLINICA[]>(mockAdmins);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [currentUser, setCurrentUser] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Load data from API ────────────────────────────────────────────────────
    const loadDoctors = useCallback(async () => {
        try {
            const data = (await apiGetDoctors()) as { items?: unknown[], doctors?: unknown[] } | unknown[];
            const list = Array.isArray(data) ? data : (data?.items || data?.doctors || []);
            setDoctors(list.map(mapApiDoctor));
        } catch (err) {
            console.warn('Failed to load doctors from API, using mock data:', err);
            setDoctors(mockDoctors);
        }
    }, []);

    const loadPatients = useCallback(async () => {
        try {
            const data = (await apiGetPatients()) as { items?: unknown[], patients?: unknown[] } | unknown[];
            const list = Array.isArray(data) ? data : (data?.items || data?.patients || []);
            setPatients(list.map(mapApiPatient));
        } catch (err) {
            console.warn('Failed to load patients from API, using mock data:', err);
            setPatients(mockPatients);
        }
    }, []);

    // ── Restore session on mount ──────────────────────────────────────────────
    useEffect(() => {
        const restore = async () => {
            const token = getAccessToken();
            const storedUser = getStoredUser();
            if (token && storedUser) {
                try {
                    const me = (await apiGetMe()) as { role?: string, [key: string]: unknown };
                    const role = (me.role || (storedUser as { role?: string }).role) as UserRole;
                    setUserRole(role);
                    setCurrentUser({ ...(storedUser as Record<string, unknown>), ...me });
                    setStoredUser({ ...(storedUser as Record<string, unknown>), ...me });
                    await loadDoctors();
                    if (role === 'admin' || role === 'doctor') {
                        await loadPatients();
                    }
                } catch {
                    clearTokens();
                }
            }
            setIsLoading(false);
        };
        restore();
    }, [loadDoctors, loadPatients]);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email: string, password?: string): Promise<{ success: boolean; role?: UserRole }> => {
        setIsLoading(true);
        try {
            const admin = admins.find(a => a.email === email);
            if (admin) { setUserRole('admin'); setCurrentUser(admin); await loadDoctors(); await loadPatients(); setIsLoading(false); return { success: true, role: 'admin' as UserRole }; }

            const doctor = mockDoctors.find(d => d.email === email);
            if (doctor) { setUserRole('doctor'); setCurrentUser(doctor); await loadDoctors(); await loadPatients(); setIsLoading(false); return { success: true, role: 'doctor' as UserRole }; }

            const patient = mockPatients.find(p => p.email === email);
            if (patient) { setUserRole('patient'); setCurrentUser(patient); await loadDoctors(); setIsLoading(false); return { success: true, role: 'patient' as UserRole }; }

            toast.error('Credenciais inválidas. Verifique seu e-mail e tente novamente.');
            setIsLoading(false);
            return { success: false };
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao realizar login.');
            setIsLoading(false);
            return { success: false };
        }
    }, [admins, loadDoctors, loadPatients]);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await apiLogout();
        setUserRole(null);
        setCurrentUser(null);
        setDoctors([]);
        setPatients([]);
    }, []);

    // ── Doctor CRUD ───────────────────────────────────────────────────────────
    const registerDoctor = useCallback(async (doctorData: Omit<MEDICO, 'id'>) => {
        try {
            await apiCreateDoctor({
                nome: doctorData.nome,
                email: doctorData.email,
                senha: doctorData.senha || 'Senha@123',
                crm: doctorData.crm,
                especialidade: doctorData.especialidade,
                telefone: doctorData.phone,
                consulta_online: doctorData.onlineConsultation,
                schedule: doctorData.schedule,
            });
            toast.success('Médico cadastrado com sucesso!');
            await loadDoctors();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao cadastrar médico');
        }
    }, [loadDoctors]);

    const updateDoctor = useCallback(async (id: number, data: Partial<Omit<MEDICO, 'id'>>) => {
        try {
            await apiUpdateDoctor(id, {
                nome: data.nome,
                crm: data.crm,
                especialidade: data.especialidade,
                telefone: data.phone,
                consulta_online: data.onlineConsultation,
            });
            toast.success('Dados do médico atualizados com sucesso!');
            await loadDoctors();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao atualizar médico');
        }
    }, [loadDoctors]);

    const removeDoctor = useCallback(async (id: number) => {
        try {
            await apiDeleteDoctor(id);
            toast.success('Médico removido do sistema.');
            await loadDoctors();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao remover médico');
        }
    }, [loadDoctors]);

    const updateDoctorSchedule = useCallback(async (doctorId: number, schedule: MEDICO['schedule']) => {
        try {
            await apiUpdateDoctorSchedule(doctorId, schedule as unknown as Record<string, unknown>[]);
            toast.success('Agenda médica atualizada com sucesso!');
            await loadDoctors();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao atualizar agenda');
        }
    }, [loadDoctors]);

    // ── Patient CRUD ──────────────────────────────────────────────────────────
    const registerPatient = useCallback(async (patientData: Omit<USUARIO, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'>) => {
        try {
            await apiCreatePatient(patientData);
            toast.success('Paciente cadastrado com sucesso!');
            await loadPatients();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao cadastrar paciente');
        }
    }, [loadPatients]);

    const updatePatient = useCallback(async (id: number, data: Partial<Omit<USUARIO, 'id'>>) => {
        try {
            await apiUpdatePatient(id, data);
            toast.success('Dados do paciente atualizados!');
            await loadPatients();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao atualizar paciente');
        }
    }, [loadPatients]);

    const removePatient = useCallback(async (id: number) => {
        try {
            await apiDeletePatient(id);
            toast.success('Paciente removido do sistema.');
            await loadPatients();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error?.message || 'Erro ao remover paciente');
        }
    }, [loadPatients]);

    // ── Admin (still mock) ────────────────────────────────────────────────────
    const registerAdmin = useCallback((adminData: Omit<CLINICA, 'id'>) => {
        const newAdmin: CLINICA = { ...adminData, id: Date.now() };
        setAdmins(prev => [...prev, newAdmin]);
        toast.success('Administrador cadastrado com sucesso!');
    }, []);

    return (
        <UserContext.Provider value={{
            currentUser,
            userRole,
            doctors,
            patients,
            admins,
            login,
            logout,
            registerDoctor,
            updateDoctor,
            removeDoctor,
            registerPatient,
            updatePatient,
            removePatient,
            registerAdmin,
            updateDoctorSchedule,
            isLoading,
        }}>
            {children}
        </UserContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
};
