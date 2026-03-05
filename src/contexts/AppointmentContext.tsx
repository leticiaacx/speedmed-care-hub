import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockAppointments, Appointment } from '@/data/mockData';

interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'new_appointment' | 'confirmation' | 'reminder';
}

interface AppointmentContextType {
  appointments: Appointment[];
  notifications: Notification[];
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  markNotificationRead: (id: string) => void;
  clearPatientNotifications: () => void;
  unreadCount: number;
  pendingAppointmentsCount: number;
  patientUnreadCount: number;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const unreadCount = notifications.filter(n => !n.read && n.type !== 'confirmation').length;
  const patientUnreadCount = notifications.filter(n => !n.read && n.type === 'confirmation').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pendente').length;

  return (
    <AppointmentContext.Provider value={{ appointments, notifications, addAppointment, updateAppointmentStatus, markNotificationRead, clearPatientNotifications, unreadCount, pendingAppointmentsCount, patientUnreadCount }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
};
