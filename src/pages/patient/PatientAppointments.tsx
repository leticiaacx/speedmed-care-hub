import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, X, MapPin } from 'lucide-react';
import { mockDoctor } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const availableSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

const availableLocations = [
  'Clínica SpeedMed - Unidade Centro',
  'Clínica SpeedMed - Zona Sul',
  'Atendimento Online (Telemedicina)'
];

const PatientAppointments = () => {
  const { appointments, addAppointment, updateAppointmentStatus, clearPatientNotifications } = useAppointments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consulta');
  const [location, setLocation] = useState(availableLocations[0]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  useEffect(() => {
    clearPatientNotifications();
  }, [clearPatientNotifications]);

  const myAppointments = appointments.filter(a => a.patientId === '1' || a.patientName === 'José Silva');

  const bookedTimes = (date: Date) =>
    appointments.filter(a => isSameDay(parseISO(a.date), date) && a.status !== 'cancelado').map(a => a.time);

  const handleBook = () => {
    if (!bookingDate || !selectedTime) return;
    addAppointment({
      patientId: '1',
      patientName: 'José Silva',
      date: format(bookingDate, 'yyyy-MM-dd'),
      time: selectedTime,
      type: appointmentType,
      status: 'pendente',
      location: location,
      reason: reason || 'Consulta médica',
    });
    setShowBooking(false);
    setSelectedTime('');
    setReason('');
    setBookingDate(null);
    setLocation(availableLocations[0]);
    toast.success('Solicitação de agendamento enviada com sucesso!');
  };

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    realizado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <Button onClick={() => setShowBooking(true)} className="gap-2">
          <Calendar className="w-4 h-4" /> Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Overview */}
        <div className="speedmed-card h-fit">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
            <h2 className="text-base font-semibold text-foreground capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary"><ChevronRight className="w-5 h-5 text-foreground" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {daysInMonth.map(day => {
              const hasAppt = myAppointments.some(a => isSameDay(parseISO(a.date), day) && a.status !== 'cancelado');
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`relative p-1.5 rounded-lg text-sm transition-all aspect-square flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground font-bold' :
                    isToday ? 'bg-accent text-accent-foreground font-semibold' :
                      'hover:bg-secondary text-foreground'
                    }`}
                >
                  {format(day, 'd')}
                  {hasAppt && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* My appointments View */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Minhas Consultas
          </h2>
          {myAppointments.length === 0 ? (
            <div className="speedmed-card text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            </div>
          ) : (
            myAppointments
              .filter(a => !selectedDate || isSameDay(parseISO(a.date), selectedDate))
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(appt => (
                <div key={appt.id} className="speedmed-card hover:border-primary/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-foreground mb-1">
                        <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {format(parseISO(appt.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {appt.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <MapPin className="w-4 h-4 text-primary" /> {appt.location}
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{appt.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Motivo: {appt.reason}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColors[appt.status]}`}>
                        {appt.status}
                      </span>
                      {appt.status === 'pendente' && (
                        <button
                          onClick={() => {
                            updateAppointmentStatus(appt.id, 'cancelado');
                            toast.error('Consulta cancelada.');
                          }}
                          className="flex items-center gap-1 text-xs text-red-600 font-medium hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Agendar Nova Consulta</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

            {/* Left Col */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Profissional</label>
                <div className="p-3 bg-secondary/50 rounded-lg border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {mockDoctor.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{mockDoctor.name}</p>
                    <p className="text-xs text-muted-foreground">{mockDoctor.specialty}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Local de Atendimento</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Tipo de Agendamento</label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Primeira Consulta (Avaliação)</SelectItem>
                    <SelectItem value="Retorno">Retorno de Exames</SelectItem>
                    <SelectItem value="Rotina">Acompanhamento de Rotina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Data da Consulta</label>
                <Input
                  type="date"
                  className="mt-1"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => {
                    setBookingDate(e.target.value ? parseISO(e.target.value) : null);
                    setSelectedTime('');
                  }}
                />
              </div>

              {bookingDate ? (
                <div>
                  <label className="text-sm font-medium text-foreground">Horários Disponíveis (Dia {format(bookingDate, 'dd/MM')})</label>
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
                    {availableSlots.map(slot => {
                      // Se for fim de semana, sem slots? Simulation only
                      if (getDay(bookingDate) === 0 || getDay(bookingDate) === 6) {
                        return null;
                      }

                      const isBooked = bookedTimes(bookingDate).includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 rounded-lg text-sm font-semibold transition-all border ${selectedTime === slot ? 'bg-primary text-primary-foreground border-primary shadow-sm' :
                            isBooked ? 'bg-muted text-muted-foreground cursor-not-allowed line-through border-border border-dashed' :
                              'bg-background text-foreground hover:bg-secondary border-border'
                            }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                    {(getDay(bookingDate) === 0 || getDay(bookingDate) === 6) && (
                      <p className="col-span-3 text-sm text-destructive font-medium mt-2">O profissional não atende aos finais de semana.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center p-4 rounded-lg border border-dashed border-border bg-secondary/30 mt-1">
                  <p className="text-sm text-muted-foreground text-center">Selecione uma data para ver os horários do médico.</p>
                </div>
              )}
            </div>

            {/* Full Width */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Motivo (Opcional)</label>
              <Input
                className="mt-1"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex: Dores de cabeça frequentes, checkup anual..."
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground w-full sm:w-1/2">
              Ao confirmar, a clínica irá receber sua solicitação para aprovação.
            </p>
            <Button onClick={handleBook} className="w-full sm:w-auto px-8" disabled={!bookingDate || !selectedTime || getDay(bookingDate) === 0 || getDay(bookingDate) === 6}>
              Confirmar Solicitação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientAppointments;
