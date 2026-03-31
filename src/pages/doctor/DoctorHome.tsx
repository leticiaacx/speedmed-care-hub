import { ChevronLeft, ChevronRight, User, Clock, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser, MEDICO } from '@/contexts/UserContext';
import { parseISO, isToday, isFuture } from 'date-fns';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import PatientRecord from '@/components/PatientRecord';
import { useMedication, DayStatus } from '@/contexts/MedicationContext';

const loadPatientFromStorage = (patientId: number) => {
  try {
    const stored = localStorage.getItem(`patient_${patientId}`);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
  }
  return null;
};

const DoctorHome = () => {
  const navigate = useNavigate();
  const { currentUser, patients } = useUser();
  const { getMonthEntries } = useMedication();
  const doctor = currentUser as MEDICO | null;
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientStorageData, setPatientStorageData] = useState<any>({});

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const calYear = today.getFullYear();

  const { appointments } = useAppointments();

  const todayQueue = appointments
    .filter(a => {
      const apptDate = parseISO(a.data_hora);
      return isToday(apptDate) && ['pendente', 'confirmado'].includes(a.status);
    })
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora));

  const nextAppt = todayQueue[0];
  const nextPatientId = nextAppt?.usuario_id || (patients && patients[0]?.id) || 1;
  const nextPatientData = patients?.find(p => p.id === nextPatientId) || (patients && patients[0]);

  // ✅ Declarado apenas uma vez
  const displayAppointments = todayQueue.slice(0, 3);

  // ✅ Declarado apenas uma vez, usando isToday corretamente
  const todayAppts = appointments.filter(a => isToday(parseISO(a.data_hora)));

  // ✅ Declarado apenas uma vez
  const stats = [
    { label: 'Indefinidos', count: todayAppts.filter(a => a.status === 'pendente').length, color: 'bg-slate-200' },
    { label: 'Faltas', count: todayAppts.filter(a => a.status === 'falta').length, color: 'bg-red-500' },
    { label: 'Desmarcados', count: todayAppts.filter(a => a.status === 'cancelado').length, color: 'bg-yellow-400' },
    { label: 'Confirmados', count: todayAppts.filter(a => a.status === 'confirmado').length, color: 'bg-sky-500' },
    { label: 'Presenças', count: todayAppts.filter(a => a.status === 'realizado').length, color: 'bg-green-500' },
  ];

  const totalStats = todayAppts.length;

  const mergedPatientData = nextPatientData
    ? { ...nextPatientData, ...patientStorageData[nextPatientId] }
    : null;

  const birthYear = mergedPatientData?.age ? calYear - mergedPatientData.age : null;
  const birthDate = birthYear ? `01/01/${birthYear}` : 'Não informada';
  const medications: string[] = mergedPatientData?.medications || [];
  const allergies: string[] = mergedPatientData?.allergies || [];
  const photoUrl: string | null = mergedPatientData?.photo || null;

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const miniStatusColor: Record<DayStatus, string> = {
    all: 'bg-green-500 text-white',
    partial: 'bg-orange-400 text-white',
    none: 'bg-red-600 text-white',
    'no-medication': 'bg-slate-100 text-muted-foreground/40',
  };

  const monthEntries = mergedPatientData
    ? getMonthEntries(mergedPatientData.id, calYear, calMonth)
    : [];
  const statusMap: Record<number, DayStatus> = {};
  monthEntries.forEach(e => {
    statusMap[parseInt(e.date.split('-')[2])] = e.status;
  });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;

  useEffect(() => {
    if (nextPatientId) {
      const storedData = loadPatientFromStorage(nextPatientId);
      if (storedData) {
        setPatientStorageData(prev => ({ ...prev, [nextPatientId]: storedData }));
      }
    }
  }, [nextPatientId]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (nextPatientId) {
        const storedData = loadPatientFromStorage(nextPatientId);
        if (storedData) {
          setPatientStorageData(prev => ({ ...prev, [nextPatientId]: storedData }));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      if (nextPatientId) {
        const storedData = loadPatientFromStorage(nextPatientId);
        if (storedData) {
          setPatientStorageData(prev => ({ ...prev, [nextPatientId]: storedData }));
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [nextPatientId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Agendamentos */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-4 sm:p-5 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-light text-foreground">Agendamentos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Próximos atendimentos</p>
            </div>
            <button onClick={() => navigate('/doctor/appointments')} className="text-muted-foreground hover:text-foreground transition-colors absolute top-5 right-5">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-5">
            {displayAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-light text-foreground leading-tight">{appt.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0, 5) : '10:00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-4 sm:p-5 flex flex-col">
          <h2 className="text-lg font-light text-foreground mb-6">Estatísticas do Dia</h2>
          <div className="flex h-2 w-full rounded-full overflow-hidden mb-6">
            <div style={{ width: '12%', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ width: '6%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '0%', backgroundColor: '#facc15' }}></div>
            <div style={{ width: '47%', backgroundColor: '#0ea5e9' }}></div>
            <div style={{ width: '35%', backgroundColor: '#22c55e' }}></div>
          </div>
          <div className="space-y-4 flex-1">
            {stats.map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-sm ${stat.color}`}></span>
                  <span className="text-sm font-light text-foreground">{stat.label}</span>
                </div>
                <span className="text-sm font-light text-foreground">{stat.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <div className="flex border border-sky-400 rounded-md overflow-hidden max-w-[220px] w-full">
              <div className="flex-1 px-4 py-1.5 bg-white dark:bg-card text-sm font-light text-foreground flex items-center">Total</div>
              <div className="bg-sky-500 text-white px-8 py-1.5 text-sm font-light flex items-center justify-center">{totalStats}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximo Paciente */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-4 sm:p-5 relative overflow-x-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-light text-foreground">Próximo Paciente</h2>
          <button
            className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 p-1.5 rounded-md hover:bg-slate-100"
            onClick={() => setSelectedPatientId(displayAppointments[0]?.usuario_id || displayAppointments[0]?.id || 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 w-full">

          {/* Foto + nome */}
          <div className="flex-shrink-0 flex flex-col items-center xl:items-start w-36">
            <div className="w-32 h-40 bg-slate-100 rounded-xl mb-3 flex items-center justify-center border border-slate-200 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={mergedPatientData?.nome} className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-slate-300" />
              )}
            </div>
            <p className="text-sm font-light text-foreground leading-tight text-center xl:text-left">{mergedPatientData?.nome || 'Paciente'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{mergedPatientData?.age ? `${mergedPatientData.age} anos` : 'Idade não informada'}</p>
          </div>

          {/* Infos + Calendário */}
          <div className="flex-[1.5]">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-[500px]">

              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Data de Nascimento:</p>
                <p className="text-sm font-light text-foreground">{birthDate}</p>
              </div>

              <div className="col-span-1 flex items-center gap-1">
                <button onClick={() => setCalMonth(m => m > 0 ? m - 1 : 11)} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
                  <ChevronLeft className="w-3 h-3 text-foreground/50" />
                </button>
                <span className="text-sm font-light text-foreground mx-1">{monthNames[calMonth]}</span>
                <button onClick={() => setCalMonth(m => m < 11 ? m + 1 : 0)} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
                  <ChevronRight className="w-3 h-3 text-foreground/50" />
                </button>
                <span className="text-sm font-light text-foreground ml-2">{calYear}</span>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Alergia: (Opcional)</p>
                <p className="text-sm font-light text-foreground">
                  {allergies.length ? allergies.join(', ') : 'Ex: Dipirona, poeira'}
                </p>
              </div>

              <div className="col-span-1 row-span-3">
                <div className="grid grid-cols-7 text-center w-full max-w-[210px]">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(d => (
                    <div key={d} className="text-[9px] font-light text-muted-foreground pb-1">{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`off-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const isFutureDay = new Date(calYear, calMonth, day) > today;
                    const status = isFutureDay ? 'no-medication' : (statusMap[day] || 'no-medication');
                    return (
                      <div key={day} className="flex items-center justify-center my-0.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-light ${miniStatusColor[status]}`}>
                          {day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Cuidador ou Responsável:</p>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-light text-foreground">
                    <input type="checkbox" readOnly checked={!!mergedPatientData?.requiresCompanion} className="w-3.5 h-3.5 accent-sky-500" /> Tem
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-light text-foreground">
                    <input type="checkbox" readOnly checked={!mergedPatientData?.requiresCompanion} className="w-3.5 h-3.5 accent-sky-500" /> Não Tem
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Tratamentos */}
          <div className="flex-1 min-w-[260px] max-w-sm mt-4 xl:mt-0">
            <p className="text-xs text-muted-foreground mb-2">Tratamentos:</p>
            <div className="space-y-3">
              {medications.length > 0 ? (
                <div className="border border-[#7dd3fc] dark:border-sky-800 rounded-lg p-3 bg-white dark:bg-card">
                  <h4 className="text-xs font-light text-foreground border-b border-[#bae6fd] dark:border-sky-900 pb-2 mb-2 relative pr-24">
                    Medicamentos em uso
                    <span className="absolute top-0 right-0 flex items-center gap-1 text-[10px] font-light text-sky-600">
                      <Clock className="w-3 h-3 fill-sky-500 text-sky-500" /> Em andamento
                    </span>
                  </h4>
                  <div className="space-y-1.5">
                    {medications.map((med: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                        </div>
                        <span className="text-xs font-light text-foreground">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs font-light text-muted-foreground">Nenhum tratamento registrado.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Ficha */}
      <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto p-0">
            {selectedPatientId && (
              <PatientRecord patient={patients.find(p => p.id === selectedPatientId) || patients[0]} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorHome;