import { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { mockAppointments, mockPatients } from '@/data/mockData';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatientRecord from '@/components/PatientRecord';

const DoctorAppointments = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);

  const appointmentsForDate = (date: Date) =>
    mockAppointments.filter(a => isSameDay(parseISO(a.date), date));

  const filteredAppointments = selectedDate
    ? appointmentsForDate(selectedDate)
    : mockAppointments.filter(a => isSameMonth(parseISO(a.date), currentMonth));

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700',
    pendente: 'bg-yellow-100 text-yellow-700',
    cancelado: 'bg-red-100 text-red-700',
    realizado: 'bg-blue-100 text-blue-700',
  };

  const selectedPatient = selectedPatientId
    ? mockPatients.find(p => p.id === selectedPatientId)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Agendamentos
      </h1>

      {/* Calendar */}
      <div className="speedmed-card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map(day => {
            const dayAppointments = appointmentsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`relative p-2 rounded-lg text-sm transition-all min-h-[48px] ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isToday
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                {format(day, 'd')}
                {dayAppointments.length > 0 && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="mt-4 text-sm text-primary font-medium hover:underline"
          >
            Ver todo o mês
          </button>
        )}
      </div>

      {/* Appointments list */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {selectedDate
            ? `Agendamentos - ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
            : `Agendamentos de ${format(currentMonth, 'MMMM', { locale: ptBR })}`
          }
        </h2>

        {filteredAppointments.length === 0 ? (
          <div className="speedmed-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map(appt => (
              <div key={appt.id} className="speedmed-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold text-sm">
                      {appt.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{appt.patientName}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(appt.date), 'dd/MM/yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {appt.location}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Motivo: {appt.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedPatientId(appt.patientId)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Ver ficha do paciente"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Record Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatientId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>Ficha do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && <PatientRecord patient={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
