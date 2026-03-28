import { ChevronRight, User, Clock, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser, MEDICO } from '@/contexts/UserContext';
import { parseISO, isToday, isFuture } from 'date-fns';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import PatientRecord from '@/components/PatientRecord';

const DoctorHome = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { currentUser, patients } = useUser();
  const doctor = currentUser as MEDICO | null;
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const nextAppt = appointments
    .filter(a => isFuture(parseISO(a.data_hora.split('T')[0])))
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))[0];
  const nextPatientId = nextAppt?.usuario_id || 1;
  const nextPatientData = patients?.find(p => p.id === nextPatientId) || patients?.[0];

  const defaultUpcoming: any[] = [
    { id: 1, usuario_id: 1, patientName: 'Rogerio Silva', data_hora: '2025-01-30T10:00:00' },
    { id: 2, usuario_id: 2, patientName: 'Maria Alves', data_hora: '2025-01-30T13:00:00' },
    { id: 3, usuario_id: 3, patientName: 'Lorena Almeida', data_hora: '2025-01-30T14:00:00' },
  ];

  const upcomingAppointments = appointments
    .filter(a => isFuture(parseISO(a.data_hora.split('T')[0])))
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .slice(0, 3);

  const displayAppointments = upcomingAppointments.length >= 3 ? upcomingAppointments : defaultUpcoming;

  const stats = [
    { label: 'Indefinidos', count: 2, color: 'bg-slate-200' },
    { label: 'Faltas', count: 1, color: 'bg-red-500' },
    { label: 'Desmarcados', count: 0, color: 'bg-yellow-400' },
    { label: 'Confirmados', count: 8, color: 'bg-sky-500' },
    { label: 'Presenças', count: 6, color: 'bg-green-500' },
  ];

  const totalStats = stats.reduce((acc, curr) => acc + curr.count, 0) || 17;

  // birthDate: só ano disponível via age
  const birthYear = nextPatientData?.age
    ? new Date().getFullYear() - nextPatientData.age
    : null;
  const birthDate = birthYear ? `01/01/${birthYear}` : 'Não informada';

  // Tratamentos: usa medications[] como fallback até treatments ser adicionado ao tipo
  const medications: string[] = nextPatientData?.medications || [];

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
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-muted-foreground hover:text-foreground transition-colors absolute top-5 right-5"
            >
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

        {/* Estatísticas do Dia */}
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
              <div className="bg-sky-500 text-white px-8 py-1.5 text-sm font-light flex items-center justify-center">
                {totalStats}
              </div>
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
              <User className="w-14 h-14 text-slate-300" />
            </div>
            <p className="text-sm font-light text-foreground leading-tight text-center xl:text-left">
              {nextPatientData?.nome || 'Paciente'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nextPatientData?.age ? `${nextPatientData.age} anos` : 'Idade não informada'}
            </p>
          </div>

          {/* Infos + Calendário */}
          <div className="flex-[1.5]">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-[500px]">

              {/* Data de Nascimento */}
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Data de Nascimento:</p>
                <p className="text-sm font-light text-foreground">{birthDate}</p>
              </div>

              {/* Seletor mês/ano do calendário */}
              <div className="col-span-1 flex items-center gap-1">
                <select className="bg-transparent text-sm font-light outline-none text-foreground cursor-pointer">
                  <option>Janeiro</option>
                  <option>Fevereiro</option>
                  <option>Março</option>
                  <option>Abril</option>
                  <option>Maio</option>
                  <option>Junho</option>
                  <option>Julho</option>
                  <option>Agosto</option>
                  <option>Setembro</option>
                  <option>Outubro</option>
                  <option>Novembro</option>
                  <option>Dezembro</option>
                </select>
                <ChevronRight className="w-3 h-3 text-foreground/40 rotate-90 flex-shrink-0" />
                <select className="bg-transparent text-sm font-light outline-none text-foreground cursor-pointer ml-2">
                  <option>2025</option>
                  <option>2026</option>
                </select>
                <ChevronRight className="w-3 h-3 text-foreground/40 rotate-90 flex-shrink-0" />
              </div>

              {/* Alergia */}
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Alergia: (Opcional)</p>
                <p className="text-sm font-light text-foreground">
                  {nextPatientData?.allergies?.length
                    ? nextPatientData.allergies.join(', ')
                    : 'Ex: Dipirona, poeira'}
                </p>
              </div>

              {/* Calendário */}
              <div className="col-span-1 row-span-3">
                <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center w-full max-w-[210px]">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
                    <div key={d} className="text-[9px] font-light text-muted-foreground mb-0.5">{d}</div>
                  ))}
                  <div className="text-[10px] text-muted-foreground/40 flex items-center justify-center h-5">30</div>
                  {[1, 2, 3, 4, 5, 6].map(d => <div key={d} className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[7].map(d => <div key={d} className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[8, 9, 10, 11, 12].map(d => <div key={d} className="bg-orange-400 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[13, 14, 15, 16, 17, 18, 19].map(d => <div key={d} className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[20, 21].map(d => <div key={d} className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(d => <div key={d} className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]">{d}</div>)}
                  {[1, 2, 3].map(d => <div key={`next-${d}`} className="text-[10px] text-muted-foreground/40 flex items-center justify-center h-5">{d}</div>)}
                </div>
              </div>

              {/* Cuidador — checkbox estilo referência */}
              <div className="col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Cuidador ou Responsável:</p>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-light text-foreground">
                    <input
                      type="checkbox"
                      readOnly
                      checked={!!nextPatientData?.requiresCompanion}
                      className="w-3.5 h-3.5 accent-sky-500"
                    />
                    Tem
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-light text-foreground">
                    <input
                      type="checkbox"
                      readOnly
                      checked={!nextPatientData?.requiresCompanion}
                      className="w-3.5 h-3.5 accent-sky-500"
                    />
                    Não Tem
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
                // Agrupa medications em um card único enquanto treatments não existe no tipo
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

      {/* Modal Ficha do Paciente */}
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