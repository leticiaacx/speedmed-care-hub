import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type DayStatus = 'all' | 'partial' | 'none' | 'no-medication';

export interface MedicationEntry {
    patientId: number;
    date: string; // 'YYYY-MM-DD'
    status: DayStatus;
}

interface MedicationContextType {
    entries: MedicationEntry[];
    setDayStatus: (patientId: number, date: string, status: DayStatus) => void;
    getStatus: (patientId: number, date: string) => DayStatus;
    getMonthEntries: (patientId: number, year: number, month: number) => MedicationEntry[];
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

// Gera dados mock determinísticos para um paciente
const generateMockEntries = (patientId: number): MedicationEntry[] => {
    const entries: MedicationEntry[] = [];
    const year = new Date().getFullYear();
    const today = new Date();

    for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date > today) continue; // só preenche dias passados

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rand = (Math.sin(patientId * 100 + month * 31 + day) * 10000) % 1;
            const normalized = Math.abs(rand);

            let status: DayStatus = 'all';
            if (normalized > 0.92) status = 'none';
            else if (normalized > 0.80) status = 'partial';

            entries.push({ patientId, date: dateStr, status });
        }
    }
    return entries;
};

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<MedicationEntry[]>([
        ...generateMockEntries(1),
        ...generateMockEntries(2),
        ...generateMockEntries(3),
        ...generateMockEntries(4),
        ...generateMockEntries(5),
    ]);

    const setDayStatus = useCallback((patientId: number, date: string, status: DayStatus) => {
        setEntries(prev => {
            const exists = prev.find(e => e.patientId === patientId && e.date === date);
            if (exists) {
                return prev.map(e => e.patientId === patientId && e.date === date ? { ...e, status } : e);
            }
            return [...prev, { patientId, date, status }];
        });
    }, []);

    const getStatus = useCallback((patientId: number, date: string): DayStatus => {
        return entries.find(e => e.patientId === patientId && e.date === date)?.status || 'no-medication';
    }, [entries]);

    const getMonthEntries = useCallback((patientId: number, year: number, month: number): MedicationEntry[] => {
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return entries.filter(e => e.patientId === patientId && e.date.startsWith(prefix));
    }, [entries]);

    return (
        <MedicationContext.Provider value={{ entries, setDayStatus, getStatus, getMonthEntries }}>
            {children}
        </MedicationContext.Provider>
    );
};

export const useMedication = () => {
    const ctx = useContext(MedicationContext);
    if (!ctx) throw new Error('useMedication must be used within MedicationProvider');
    return ctx;
};