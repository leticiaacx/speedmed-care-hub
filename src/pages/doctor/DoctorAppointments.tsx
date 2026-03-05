import { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Eye, Plus, Check, X } from 'lucide-react';
import { mockPatients } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PatientRecord from '@/components/PatientRecord';

const DoctorAppointments = () => {
  const { appointments, updateAppointmentStatus, addAppointment } = useAppointments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [denyingApptId, setDenyingApptId] = useState<string | null>(null);
  const [denyMessage, setDenyMessage] = useState('');
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '', type: 'Consulta', reason: '' });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const appointmentsForDate = (date: Date) =>
    appointments.filter(a => isSameDay(parseISO(a.date), date));

  const filteredAppointments = selectedDate
    ? appointmentsForDate(selectedDate)
    : appointments.filter(a => isSameMonth(parseISO(a.date), currentMonth));

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    realizado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const selectedPatient = selectedPatientId ? mockPatients.find(p => p.id === selectedPatientId) : null;

  const handleCreateAppt = () => {
    const patient = mockPatients.find(p => p.id === newAppt.patientId);
    if (!patient || !newAppt.date || !newAppt.time) return;
    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      date: newAppt.date,
      time: newAppt.time,
      type: newAppt.type,
      status: 'confirmado',
      location: 'Clínica SpeedMed - Unidade Centro',
      reason: newAppt.reason || 'Consulta médica',
    });
    setShowNewAppt(false);
    setNewAppt({ patientId: '', date: '', time: '', type: 'Consulta', reason: '' });
  };

  const handleDenySubmit = () => {
    if (denyingApptId) {
      updateAppointmentStatus(denyingApptId, 'cancelado');
      // Here we would typically send the push notification or email with denyMessage
      console.log(`Mensagem de cancelamento enviada ao paciente: ${denyMessage}`);
      setDenyingApptId(null);
      setDenyMessage('');
      setSelectedApptId(null);
    }
  };

  const selectedAppt = selectedApptId ? appointments.find(a => a.id === selectedApptId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <Button onClick={() => setShowNewAppt(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Agendamento
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
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {daysInMonth.map(day => {
              const dayAppts = appointmentsForDate(day);
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
                  {dayAppts.length > 0 && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="mt-3 text-xs text-primary font-medium hover:underline">Ver todo o mês</button>
          )}
        </div>

        {/* Appointments list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedDate ? `Agendamentos - ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}` : `Agendamentos de ${format(currentMonth, 'MMMM', { locale: ptBR })}`}
          </h2>
          {filteredAppointments.length === 0 ? (
            <div className="speedmed-card text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            filteredAppointments.map(appt => (
              <div key={appt.id} className="speedmed-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground font-semibold text-sm">{appt.patientName.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appt.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{format(parseISO(appt.date), 'dd/MM/yyyy')}</span>
                        <span>•</span>
                        <span>{appt.time}</span>
                        <span>•</span>
                        <span>{appt.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{appt.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                    <button onClick={() => setSelectedApptId(appt.id)} className="p-1.5 rounded-lg hover:bg-secondary border border-border" title="Ver Detalhes">
                      <Eye className="w-4 h-4 text-primary" />
                    </button>
                    {appt.status === 'pendente' && (
                      <span className="text-xs text-muted-foreground ml-2">Revisão necessária</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Patient Record Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatientId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ficha do Paciente</DialogTitle></DialogHeader>
          {selectedPatient && <PatientRecord patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

      {/* Appointment Details / Review Modal */}
      <Dialog open={!!selectedApptId} onOpenChange={(open) => !open && setSelectedApptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Paciente</p>
                    <p className="font-semibold text-foreground">{selectedAppt.patientName}</p>
                  </div>
                  <button onClick={() => setSelectedPatientId(selectedAppt.patientId)} className="text-xs text-primary font-medium hover:underline">
                    Ver Ficha Completa
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(selectedAppt.date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedAppt.time}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium text-foreground">{selectedAppt.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Motivo</p>
                  <p className="font-medium text-foreground p-2 rounded bg-background border border-border mt-1">
                    {selectedAppt.reason}
                  </p>
                </div>
              </div>

              {selectedAppt.status === 'pendente' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      updateAppointmentStatus(selectedAppt.id, 'confirmado');
                      setSelectedApptId(null);
                    }}
                  >
                    <Check className="w-4 h-4" /> Aceitar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setDenyingApptId(selectedAppt.id)}
                  >
                    <X className="w-4 h-4" /> Negar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deny Reason Modal */}
      <Dialog open={!!denyingApptId} onOpenChange={(open) => {
        if (!open) {
          setDenyingApptId(null);
          setDenyMessage('');
        }
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Motivo da Recusa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, informe ao paciente o motivo de não poder aceitar o agendamento neste horário.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Tive um imprevisto médico neste horário e não poderei atender. Por favor, remarque."
              value={denyMessage}
              onChange={(e) => setDenyMessage(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => {
                setDenyingApptId(null);
                setDenyMessage('');
              }}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDenySubmit} disabled={!denyMessage.trim()}>
                Enviar e Recusar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New appointment modal */}
      <Dialog open={showNewAppt} onOpenChange={setShowNewAppt}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Paciente</label>
              <Select value={newAppt.patientId} onValueChange={v => setNewAppt(p => ({ ...p, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Data</label>
                <Input type="date" value={newAppt.date} onChange={e => setNewAppt(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hora</label>
                <Input type="time" value={newAppt.time} onChange={e => setNewAppt(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <Select value={newAppt.type} onValueChange={v => setNewAppt(p => ({ ...p, type: v }))}>
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
              <Input value={newAppt.reason} onChange={e => setNewAppt(p => ({ ...p, reason: e.target.value }))} placeholder="Motivo da consulta" />
            </div>
            <Button onClick={handleCreateAppt} className="w-full">Agendar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
