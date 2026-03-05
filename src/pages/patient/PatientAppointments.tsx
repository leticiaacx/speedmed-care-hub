import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { mockDoctor } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isFuture, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const availableSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

const PatientAppointments = () => {
  const { appointments, addAppointment, updateAppointmentStatus } = useAppointments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consulta');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const myAppointments = appointments.filter(a => a.patientId === '1' || a.patientName === 'José Silva');

  const bookedTimes = (date: Date) =>
    appointments.filter(a => isSameDay(parseISO(a.date), date)).map(a => a.time);

  const handleBook = () => {
    if (!bookingDate || !selectedTime) return;
    addAppointment({
      patientId: '1',
      patientName: 'José Silva',
      date: format(bookingDate, 'yyyy-MM-dd'),
      time: selectedTime,
      type: appointmentType,
      status: 'pendente',
      location: 'Clínica SpeedMed - Unidade Centro',
      reason: reason || 'Consulta médica',
    });
    setShowBooking(false);
    setSelectedTime('');
    setReason('');
    setBookingDate(null);
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
          <Calendar className="w-4 h-4" /> Marcar Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="speedmed-card">
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
              const hasAppt = myAppointments.some(a => isSameDay(parseISO(a.date), day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`relative p-1.5 rounded-lg text-sm transition-all aspect-square flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground font-bold' :
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

        {/* My appointments */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Minhas Consultas</h2>
          {myAppointments.length === 0 ? (
            <div className="speedmed-card text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            </div>
          ) : (
            myAppointments.sort((a, b) => a.date.localeCompare(b.date)).map(appt => (
              <div key={appt.id} className="speedmed-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{format(parseISO(appt.date), 'dd/MM/yyyy')}</span>
                      <Clock className="w-4 h-4 text-primary ml-2" />
                      <span>{appt.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{appt.type} • {appt.location}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Motivo: {appt.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                    {appt.status === 'pendente' && (
                      <button onClick={() => updateAppointmentStatus(appt.id, 'cancelado')} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" title="Cancelar">
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking modal */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Marcar Consulta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Médico</label>
              <Input disabled value={mockDoctor.name} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Data</label>
              <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} onChange={e => setBookingDate(e.target.value ? parseISO(e.target.value) : null)} />
            </div>
            {bookingDate && (
              <div>
                <label className="text-sm font-medium text-foreground">Horários disponíveis</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {availableSlots.map(slot => {
                    const isBooked = bookedTimes(bookingDate).includes(slot);
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot ? 'bg-primary text-primary-foreground' :
                          isBooked ? 'bg-muted text-muted-foreground cursor-not-allowed line-through' :
                          'bg-secondary text-secondary-foreground hover:bg-accent'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Exame">Exame</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Motivo</label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Descreva o motivo" />
            </div>
            <Button onClick={handleBook} className="w-full" disabled={!bookingDate || !selectedTime}>
              Confirmar Agendamento
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Você receberá uma confirmação 2 dias antes da consulta
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientAppointments;
