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
    login: (role: UserRole, id?: string) => void;
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

    const login = useCallback((role: UserRole, id?: string) => {
        setUserRole(role);
        if (id) {
            setCurrentUserId(id);
        } else {
            // Default fallback for demo
            if (role === 'admin') setCurrentUserId(admins[0]?.id || null);
            if (role === 'doctor') setCurrentUserId(doctors[0]?.id || null);
            if (role === 'patient') setCurrentUserId(patients[0]?.id || null);
        }
    }, [admins, doctors, patients]);

    const logout = useCallback(() => {
        setUserRole(null);
        setCurrentUserId(null);
    }, []);

    const registerDoctor = useCallback((doctorData: Omit<Doctor, 'id'>) => {
        const newDoc: Doctor = { ...doctorData, id: `d${Date.now()}` };
        setDoctors(prev => [...prev, newDoc]);
        toast.success('Médico cadastrado com sucesso!');
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
