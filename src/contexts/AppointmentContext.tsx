import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockAppointments, Appointment } from '@/data/mockData';

interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'new_appointment' | 'confirmation' | 'reminder' | 'new_file';
}

export interface PatientFile {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  content?: string;
}

export interface DoctorReport {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  content: string;
  status: 'draft' | 'sent';
}

interface AppointmentContextType {
  appointments: Appointment[];
  notifications: Notification[];
  patientFiles: PatientFile[];
  doctorReports: DoctorReport[];
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  markNotificationRead: (id: string) => void;
  clearPatientNotifications: () => void;
  clearPatientFileNotifications: () => void;
  saveDoctorReport: (report: Omit<DoctorReport, 'id'>) => void;
  sendFileToPatient: (file: Omit<PatientFile, 'id'>, reportId?: string) => void;
  unreadCount: number;
  pendingAppointmentsCount: number;
  patientUnreadCount: number;
  patientFilesUnreadCount: number;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([
    { id: 'f1', name: 'Resultado Hemograma Completo', type: 'PDF', date: '20/02/2026', size: '245 KB' },
    { id: 'f2', name: 'Raio-X Torax', type: 'Imagem', date: '15/02/2026', size: '1.2 MB' },
    { id: 'f3', name: 'Receita Médica - Dr. José', type: 'PDF', date: '25/02/2026', size: '98 KB' },
  ]);
  const [doctorReports, setDoctorReports] = useState<DoctorReport[]>([]);

  const addAppointment = useCallback((appt: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = { ...appt, id: `appt-${Date.now()}` };
    setAppointments(prev => [...prev, newAppt]);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        message: `Novo agendamento: ${appt.patientName} em ${appt.date} às ${appt.time}`,
        time: new Date(),
        read: false,
        type: 'new_appointment',
      },
      ...prev,
    ]);
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          message: `Agendamento de ${appt.patientName} foi ${status}`,
          time: new Date(),
          read: false,
          type: 'confirmation',
        },
        ...prev,
      ]);
    }
  }, [appointments]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearPatientNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => n.type === 'confirmation' ? { ...n, read: true } : n));
  }, []);

  const clearPatientFileNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => n.type === 'new_file' ? { ...n, read: true } : n));
  }, []);

  const saveDoctorReport = useCallback((report: Omit<DoctorReport, 'id'>) => {
    const newReport = { ...report, id: `rep-${Date.now()}` };
    setDoctorReports(prev => [newReport, ...prev]);
  }, []);

  const sendFileToPatient = useCallback((file: Omit<PatientFile, 'id'>, reportId?: string) => {
    const newFile = { ...file, id: `file-${Date.now()}` };
    setPatientFiles(prev => [newFile, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        message: `Novo arquivo recebido: ${file.name}`,
        time: new Date(),
        read: false,
        type: 'new_file',
      },
      ...prev,
    ]);

    if (reportId) {
      setDoctorReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'sent' } : r));
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read && n.type !== 'confirmation' && n.type !== 'new_file').length;
  const patientUnreadCount = notifications.filter(n => !n.read && n.type === 'confirmation').length;
  const patientFilesUnreadCount = notifications.filter(n => !n.read && n.type === 'new_file').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pendente').length;

  return (
    <AppointmentContext.Provider value={{
      appointments, notifications, patientFiles, doctorReports,
      addAppointment, updateAppointmentStatus, markNotificationRead, clearPatientNotifications, clearPatientFileNotifications,
      saveDoctorReport, sendFileToPatient,
      unreadCount, pendingAppointmentsCount, patientUnreadCount, patientFilesUnreadCount
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
};
