import { Calendar, Clock, MapPin, Stethoscope } from 'lucide-react';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO } from 'date-fns';

const PatientHistory = () => {
  const { appointments } = useAppointments();
  const myAppointments = appointments
    .filter(a => a.patientId === '1' || a.patientName === 'José Silva')
    .sort((a, b) => b.date.localeCompare(a.date));

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    realizado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Histórico de Consultas</h1>

      {myAppointments.length === 0 ? (
        <div className="speedmed-card text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma consulta registrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myAppointments.map(appt => (
            <div key={appt.id} className="speedmed-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appt.type}</p>
                    <p className="text-xs text-muted-foreground">Motivo: {appt.reason}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(parseISO(appt.date), 'dd/MM/yyyy')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{appt.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
