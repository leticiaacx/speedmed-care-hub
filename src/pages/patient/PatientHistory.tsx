import { useState } from 'react';
import { Calendar, Clock, MapPin, Stethoscope, FileText, Activity } from 'lucide-react';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const consultationNotesMocks: Record<string, string> = {
  'realizado': 'Paciente apresentou melhora nos sintomas. Exame físico sem alterações significativas. Recomendado manter medicação atual e retornar caso os sintomas persistam ou se agravem nas próximas 48h. Pressão arterial: 120/80 mmHg. Saturação: 98%. Temperatura: 36.5°C.',
  'confirmado': 'Consulta agendada. Aguardando realização.',
  'pendente': 'Consulta pendente de confirmação pela clínica.',
  'cancelado': 'Consulta cancelada.'
};

const PatientHistory = () => {
  const { appointments } = useAppointments();
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);

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
            <div
              key={appt.id}
              className="speedmed-card cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedAppt(appt)}
            >
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
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                  {appt.status === 'realizado' && (
                    <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                      <FileText className="w-3 h-3" /> Ver anotações
                    </span>
                  )}
                </div>
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

      {/* Appointment Detail Modal (Notes) */}
      <Dialog open={!!selectedAppt} onOpenChange={(open) => !open && setSelectedAppt(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
          </DialogHeader>

          {selectedAppt && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                  <h3 className="font-semibold text-lg text-foreground">{selectedAppt.type}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedAppt.status]}`}>
                    {selectedAppt.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-muted-foreground">Data/Hora:</span> <span className="font-medium">{format(parseISO(selectedAppt.date), 'dd/MM/yyyy')} às {selectedAppt.time}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Local:</span> <span className="font-medium">{selectedAppt.location}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Motivo:</span> <span className="font-medium">{selectedAppt.reason}</span></p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-primary" /> Anotações do Médico
                </h4>
                <div className="p-4 rounded-lg bg-card border border-border text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {consultationNotesMocks[selectedAppt.status as keyof typeof consultationNotesMocks] || 'Sem anotações.'}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedAppt(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientHistory;
