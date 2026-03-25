import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockDoctors, mockPatients, mockAdmins, Doctor, Patient, Admin } from '@/data/mockData';
import { toast } from 'sonner';

export type { Doctor, Patient, Admin };
export type UserRole = 'admin' | 'doctor' | 'patient';

interface UserContextType {
    currentUser: any;
    userRole: UserRole | null;
    doctors: Doctor[];
    patients: Patient[];
    admins: Admin[];
    login: (email: string, password?: string) => { success: boolean; role?: UserRole };
    logout: () => void;
    registerDoctor: (doctor: Omit<Doctor, 'id'>) => void;
    registerPatient: (patient: Omit<Patient, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'> & { doctorId: string }) => void;
    updateDoctorSchedule: (doctorId: string, schedule: Doctor['schedule']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const getCurrentUser = () => {
        if (!userRole || !currentUserId) return null;
        if (userRole === 'admin') return admins.find(a => a.id === currentUserId);
        if (userRole === 'doctor') return doctors.find(d => d.id === currentUserId);
        if (userRole === 'patient') return patients.find(p => p.id === currentUserId);
        return null;
    };

    const login = useCallback((email: string, password?: string) => {
        const admin = admins.find(a => a.email === email);
        if (admin) { setUserRole('admin'); setCurrentUserId(admin.id); return { success: true, role: 'admin' as UserRole }; }

        const doctor = doctors.find(d => d.email === email);
        if (doctor) { setUserRole('doctor'); setCurrentUserId(doctor.id); return { success: true, role: 'doctor' as UserRole }; }

        const patient = patients.find(p => p.email === email);
        if (patient) { setUserRole('patient'); setCurrentUserId(patient.id); return { success: true, role: 'patient' as UserRole }; }

        toast.error('Credenciais inválidas. Verifique seu e-mail e tente novamente.');
        return { success: false };
    }, [admins, doctors, patients]);

    const logout = useCallback(() => {
        setUserRole(null);
        setCurrentUserId(null);
    }, []);

    const registerDoctor = useCallback((doctorData: Omit<Doctor, 'id'>) => {
        const newDoc: Doctor = { ...doctorData, id: `d${Date.now()}` };
        setDoctors(prev => [...prev, newDoc]);
        toast.success('Médico cadastrado com sucesso!');
        if (doctorData.email) {
            toast.info(`Credenciais de acesso enviadas para ${doctorData.email}. Senha temporária: 123456`, { duration: 6000 });
        }
    }, []);

    const registerPatient = useCallback((patientData: Omit<Patient, 'id' | 'consultationHistory' | 'allergies' | 'medications' | 'heredity' | 'lastConsultation'> & { doctorId: string }) => {
        const newPatient: Patient = {
            ...patientData,
            id: `p${Date.now()}`,
            consultationHistory: [],
            allergies: [],
            medications: [],
            heredity: [],
            lastConsultation: { date: '', time: '', location: '', reason: '' }
        };
        setPatients(prev => [...prev, newPatient]);
        toast.success('Paciente cadastrado com sucesso!');
    }, []);

    const updateDoctorSchedule = useCallback((doctorId: string, schedule: Doctor['schedule']) => {
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
