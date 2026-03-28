import { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Eye, Plus, Check, X, AlertTriangle, ChevronDown, User, BarChart2 } from 'lucide-react';
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
  const { appointments } = useAppointments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const appointmentsForDate = (date: Date) =>
    appointments.filter(a => isSameDay(parseISO(a.data_hora.split('T')[0]), date));

  const filteredAppointments = selectedDate
    ? appointmentsForDate(selectedDate)
    : appointments.filter(a => isSameMonth(parseISO(a.data_hora.split('T')[0]), currentMonth));

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    realizado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const selectedPatient = selectedPatientId ? mockPatients.find(p => p.id === selectedPatientId) : null;



  const selectedAppt = selectedApptId ? appointments.find(a => a.id === selectedApptId) : null;

  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatus = (id: number, orig: string) => localStatuses[id] || orig;
  
  const handleSetStatus = (id: number, status: string) => {
    setLocalStatuses(prev => ({...prev, [id]: status}));
    setExpandedId(null);
  };

  const pendentes = filteredAppointments.filter(a => ['pendente', 'confirmado'].includes(getStatus(a.id, a.status)));
  const realizados = filteredAppointments.filter(a => getStatus(a.id, a.status) === 'realizado');
  const faltas = filteredAppointments.filter(a => ['falta', 'cancelado'].includes(getStatus(a.id, a.status)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar (Left Side) */}
        <div className="speedmed-card bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft className="w-5 h-5 text-slate-800" /></button>
            <h2 className="text-base font-semibold text-slate-800 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight className="w-5 h-5 text-slate-800" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">{day}</div>
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
                  className={`relative p-1.5 rounded-lg text-sm transition-all aspect-square flex items-center justify-center ${isSelected ? 'bg-sky-500 text-white font-bold shadow-md' :
                    isToday ? 'bg-sky-50 text-sky-600 font-semibold' :
                      'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                >
                  {format(day, 'd')}
                  {dayAppts.length > 0 && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#0ea5e9]'}`} />
                  )}
                </button>
              );
            })}
          </div>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="mt-4 text-xs text-[#0ea5e9] font-medium hover:underline block text-center w-full">Ver Padrão / Todo o mês</button>
          )}
        </div>

        {/* Fila de Atendimento List (Right Side) */}
        <div className="lg:col-span-2">
          {/* Fila Header */}
          <div className="bg-[#12aef4] rounded-t-lg px-6 py-4 shadow-sm shadow-[#12aef4]/20 border border-[#12aef4]">
            <h1 className="text-[22px] font-semibold text-white tracking-wide">Fila de Atendimento</h1>
          </div>
          
          <div className="bg-[#f2f2f2] p-4 sm:p-6 rounded-b-lg border border-t-0 border-slate-200">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-800">Data</label>
                  <div className="relative">
                    <Input 
                        value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(currentMonth, 'dd/MM/yyyy')} 
                        readOnly 
                        className="h-9 w-[130px] sm:w-[150px] bg-white text-xs border border-slate-300 pr-8 text-slate-600 focus-visible:ring-0 shadow-sm"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-800">Ordem</label>
                  <Select defaultValue="crescente">
                    <SelectTrigger className="h-9 w-[130px] sm:w-[150px] bg-white text-xs border-slate-300 text-slate-600 focus:ring-0 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crescente">Crescente</SelectItem>
                      <SelectItem value="decrescente">Decrescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button className="h-9 px-6 bg-[#12aef4] hover:bg-sky-500 text-white rounded gap-3 text-[13px] font-medium shadow-none mt-2 sm:mt-0 active:scale-95 transition-transform w-full sm:w-auto">
                Estatísticas <BarChart2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Fila Acordeão List */}
            <div className="bg-white border-x border-t border-slate-300 rounded divide-y divide-slate-300 shadow-sm mb-8 w-[98%] max-w-full">
              {pendentes.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 font-medium">Nenhum paciente na fila.</div>
              ) : (
                pendentes.map(appt => {
                  const isExpanded = expandedId === appt.id;
                  return (
                    <div key={appt.id} className="flex flex-col bg-white overflow-hidden first:rounded-t last:rounded-b">
                      <div 
                        className={`flex items-center justify-between p-4 px-5 select-none cursor-pointer hover:bg-[#fafafa] transition-colors`}
                        onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-[46px] h-[46px] rounded-full bg-[#998b88] flex items-center justify-center text-white font-medium shadow-none shrink-0 border-[3px] border-white ring-1 ring-slate-200">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{appt.patientName}</h3>
                            <p className="text-[13px] text-slate-500 block leading-tight">{appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0,5) : ''}</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {/* Expansion content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 ml-[4.5rem]">
                          <div className="flex gap-4 text-[13px] font-bold text-slate-900 mb-4 tracking-tight">
                            <span>Idade: 24</span>
                            <span>Tipo Sanguíneo: A+</span>
                          </div>
                          <div className="text-[13px] text-slate-900 mb-6">
                            <span className="font-bold block mb-1">Motivo da Consulta:</span>
                            <p className="leading-snug">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                          </div>
                          <div className="flex flex-wrap gap-3 justify-end mt-2">
                            <Button onClick={(e) => { e.stopPropagation(); handleSetStatus(appt.id, 'realizado'); }} className="h-[34px] bg-[#12aef4] hover:bg-sky-500 text-white text-[13px] px-6 font-medium shadow-sm transition-all rounded-md">Finalizar</Button>
                            <Button onClick={(e) => { e.stopPropagation(); handleSetStatus(appt.id, 'cancelado'); }} variant="outline" className="h-[34px] border-[#12aef4] text-[#12aef4] hover:bg-sky-50 text-[13px] px-6 font-medium shadow-sm transition-all rounded-md bg-white">Cancelar</Button>
                            <Button onClick={(e) => { e.stopPropagation(); handleSetStatus(appt.id, 'falta'); }} className="h-[34px] bg-[#d32115] hover:bg-red-700 text-white text-[13px] px-6 font-medium shadow-sm transition-all rounded-md">Falta</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Bottom Sections: Atendidos / Faltas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[98%]">
              {/* Atendidos */}
              <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden flex flex-col h-[320px]">
                  <div className="px-6 py-5">
                    <h2 className="text-[22px] font-bold text-black border-none tracking-tight">Atendidos no dia</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-0 divide-y divide-slate-300/60">
                      {realizados.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">Nenhum atendimento finalizado</p> : realizados.map(appt => (
                        <div key={appt.id} className="flex items-center gap-4 py-4 first:pt-0 border-b border-slate-300">
                            <div className="w-[44px] h-[44px] rounded-full bg-[#998b88] flex items-center justify-center text-white shrink-0 shadow-sm">
                              <User className="w-[1.4rem] h-[1.4rem] text-white" />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h3 className="text-[13px] font-bold text-slate-800 tracking-tight leading-none mb-1.5">{appt.patientName}</h3>
                              <p className="text-[13px] text-slate-500 leading-none block">{appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0,5) : ''}</p>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>

              {/* Faltas */}
              <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden flex flex-col h-[320px]">
                  <div className="px-6 py-5">
                    <h2 className="text-[22px] font-bold text-black border-none tracking-tight">Faltas no dia</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-0 divide-y divide-slate-300/60">
                      {faltas.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">Nenhuma falta registrada</p> : faltas.map(appt => (
                        <div key={appt.id} className="flex items-center gap-4 py-4 first:pt-0 border-b border-slate-300">
                            <div className="w-[44px] h-[44px] rounded-full bg-[#998b88] flex items-center justify-center text-white shrink-0 shadow-sm opacity-90">
                              <User className="w-[1.4rem] h-[1.4rem] text-white" />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h3 className="text-[13px] font-bold text-slate-500 tracking-tight leading-none mb-1.5">{appt.patientName}</h3>
                              <p className="text-[13px] text-slate-400 leading-none block">{appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0,5) : ''}</p>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Legacy Patient Record Modal (if viewing from elsewhere) */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatientId(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {selectedPatient && <PatientRecord patient={selectedPatient} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
