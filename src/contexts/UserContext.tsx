import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { mockDoctors, mockPatients, mockAdmins, MEDICO, USUARIO, CLINICA } from '@/data/mockData';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type { MEDICO, USUARIO, CLINICA };
export type UserRole = 'admin' | 'doctor' | 'patient';

interface UserContextType {
    currentUser: any;
    userRole: UserRole | null;
    doctors: MEDICO[];
    patients: USUARIO[];
    admins: CLINICA[];
    /** @deprecated Use useAuth().logout() instead */
    login: (email: string, password?: string) => { success: boolean; role?: UserRole };
    /** @deprecated Use useAuth().logout() instead */
    logout: () => void;
    registerDoctor: (doctor: Omit<MEDICO, 'id'>) => void;
    registerPatient: (patient: Omit<USUARIO, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'>) => void;
    updateDoctorSchedule: (doctorId: number, schedule: MEDICO['schedule']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser, logout: authLogout } = useAuth();

    const [doctors, setDoctors] = useState<MEDICO[]>(mockDoctors);
    const [patients, setPatients] = useState<USUARIO[]>(mockPatients);
    const [admins] = useState<CLINICA[]>(mockAdmins);

    // Derive role and currentUser from the real auth state
    const userRole = (authUser?.role ?? null) as UserRole | null;

    const getCurrentUser = () => {
        if (!authUser) return null;
        if (authUser.role === 'admin') return admins.find(a => a.email === authUser.email) ?? null;
        if (authUser.role === 'doctor') return doctors.find(d => d.email === authUser.email) ?? null;
        if (authUser.role === 'patient') return patients.find(p => p.email === authUser.email) ?? null;
        return null;
    };

    /** @deprecated — kept for backward compat. Use useAuth().login() instead. */
    const login = useCallback((_email: string, _password?: string) => {
        return { success: false };
    }, []);

    /** @deprecated — kept for backward compat. Use useAuth().logout() instead. */
    const logout = useCallback(() => {
        authLogout();
    }, [authLogout]);

    const registerDoctor = useCallback((doctorData: Omit<MEDICO, 'id'>) => {
        const newDoc: MEDICO = { ...doctorData, id: Date.now() };
        setDoctors(prev => [...prev, newDoc]);
        toast.success('Médico cadastrado com sucesso!');
        if (doctorData.email) {
            toast.info(`Credenciais enviadas para ${doctorData.email}. Senha configurada: ${doctorData.senha || 'não informada'}`, { duration: 6000 });
        }
    }, []);

    const registerPatient = useCallback((patientData: Omit<USUARIO, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'>) => {
        const newPatient: USUARIO = {
            ...patientData,
            id: Date.now(),
            consultationHistory: [],
            allergies: [],
            medications: [],
            heredity: [],
            lastConsultation: { date: '', time: '', location: '', reason: '' }
        };
        setPatients(prev => [...prev, newPatient]);
        toast.success('Paciente cadastrado com sucesso!');
    }, []);

    const updateDoctorSchedule = useCallback((doctorId: number, schedule: MEDICO['schedule']) => {
        setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, schedule } : d));
        toast.success('Agenda médica atualizada com sucesso!');
    }, []);

    return (
        <UserContext.Provider value={{
            currentUser: getCurrentUser(),
            userRole,
            doctors,
            patients,
            admins,
            login,
            logout,
            registerDoctor,
            registerPatient,
            updateDoctorSchedule
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
};
