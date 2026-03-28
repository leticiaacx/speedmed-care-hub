import { Calendar as CalendarIcon, Clock, Users, ChevronRight, User, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser, MEDICO } from '@/contexts/UserContext';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DoctorHome = () => {
  const navigate = useNavigate();
  const { appointments, notifications } = useAppointments();
  const { currentUser } = useUser();
  const doctor = currentUser as MEDICO | null;

  const todayAppointments = appointments.filter(a => isToday(parseISO(a.data_hora.split('T')[0])));
  
  // Use mock data if not enough upcoming appointments
  const defaultUpcoming = [
    { id: 1, patientName: 'Rogerio Silva', data_hora: '2025-01-30T10:00:00' },
    { id: 2, patientName: 'Maria Alves', data_hora: '2025-01-30T13:00:00' },
    { id: 3, patientName: 'Lorena Almeida', data_hora: '2025-01-30T14:00:00' },
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fila de Atendimento */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Fila de Atendimento</h2>
              <p className="text-sm text-muted-foreground mt-1">Proximos atendimentos:</p>
            </div>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-muted-foreground hover:text-foreground transition-colors absolute top-6 right-6"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {displayAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-400 rounded-full flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden">
                  <User className="w-8 h-8 opacity-80" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-lg leading-tight">{appt.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0, 5) : '10:00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas do Dia */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-foreground mb-6">Estatísticas do Dia</h2>

          {/* Progress Bar */}
          <div className="flex h-3 w-full rounded-full overflow-hidden mb-8">
            <div style={{ width: '12%', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ width: '6%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '0%', backgroundColor: '#facc15' }}></div>
            <div style={{ width: '47%', backgroundColor: '#0ea5e9' }}></div>
            <div style={{ width: '35%', backgroundColor: '#22c55e' }}></div>
          </div>

          {/* Stats List */}
          <div className="space-y-4 flex-1">
            {stats.map((stat, i) => (
              <div key={i} className="flex justify-between items-center text-sm md:text-base">
                <div className="flex items-center gap-4">
                  <span className={`w-4 h-4 rounded-sm ${stat.color}`}></span>
                  <span className="text-foreground">{stat.label}</span>
                </div>
                <span className="font-medium text-foreground">{stat.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="flex border border-sky-400 rounded-md overflow-hidden max-w-[240px] w-full">
              <div className="flex-1 px-4 py-2 bg-white dark:bg-card text-foreground font-medium flex items-center">Total</div>
              <div className="bg-sky-500 text-white px-8 py-2 font-medium flex items-center justify-center">
                {totalStats}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximo Paciente */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 relative min-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Próximo Paciente</h2>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Outer wrapper for mobile vs desktop */}
        <div className="flex flex-col xl:flex-row gap-8 min-w-[900px]">
          
          {/* Patient Profile */}
          <div className="flex-shrink-0 flex flex-col items-center xl:items-start w-48">
            <div className="w-40 h-48 bg-slate-200 rounded-sm mb-4 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                alt="Patient"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-medium text-foreground leading-tight">Rogerio Silva<br />Junior</h3>
            <p className="text-sm text-muted-foreground mt-1">39 anos</p>
          </div>

          {/* Info and Calendar */}
          <div className="flex-[1.5] flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 max-w-[500px]">
              
              <div className="col-span-1">
                <p className="text-sm font-medium text-foreground mb-1">Data de Nascimento:</p>
                <p className="text-muted-foreground text-sm">13/10/1985</p>
              </div>

              {/* Month/Year selector row */}
              <div className="col-span-1 flex justify-center xl:justify-start items-center gap-2">
                <select className="bg-transparent text-sm font-bold outline-none text-foreground appearance-none cursor-pointer">
                  <option>Janeiro</option>
                </select>
                <ChevronRight className="w-4 h-4 text-foreground/50 rotate-90" />
                <select className="bg-transparent text-sm font-bold outline-none text-foreground appearance-none cursor-pointer">
                  <option>2025</option>
                </select>
                <ChevronRight className="w-4 h-4 text-foreground/50 rotate-90" />
              </div>

              <div className="col-span-1">
                <p className="text-sm font-medium text-foreground mb-1">Alergia: (Opcional)</p>
                <p className="text-muted-foreground text-sm">Ex: Dipirona, poeira</p>
              </div>

              {/* Visual Calendar - take remaining rows in this half */}
              <div className="col-span-1 row-span-3 flex justify-center xl:justify-start">
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs w-full max-w-[240px]">
                  {/* Days header */}
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
                    <div key={d} className="font-semibold text-foreground text-[10px] mb-1">{d}</div>
                  ))}

                  {/* Calendar Days */}
                  <div className="text-muted-foreground/50 flex items-center justify-center h-6">30</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">1</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">2</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">3</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">4</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">5</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">6</div>

                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">7</div>
                  <div className="bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">8</div>
                  <div className="bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">9</div>
                  <div className="bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">10</div>
                  <div className="bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">11</div>
                  <div className="bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">12</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">13</div>

                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">14</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">15</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">16</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">17</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">18</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">19</div>
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">20</div>

                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">21</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">22</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">23</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">24</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">25</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">26</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">27</div>

                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">28</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">29</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">30</div>
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">31</div>
                  <div className="text-muted-foreground/50 flex items-center justify-center h-6">1</div>
                  <div className="text-muted-foreground/50 flex items-center justify-center h-6">2</div>
                  <div className="text-muted-foreground/50 flex items-center justify-center h-6">3</div>
                </div>
              </div>

              <div className="col-span-1 mt-6">
                <p className="text-sm font-medium text-foreground mb-2">Cuidador ou Responsável:</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="w-[18px] h-[18px] rounded-sm text-foreground bg-transparent border-foreground/30 checked:bg-foreground checked:border-foreground focus:ring-foreground accent-foreground" defaultChecked /> Tem
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="w-[18px] h-[18px] rounded-sm text-foreground bg-transparent border-foreground/30 focus:ring-foreground" /> Não Tem
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Tratamentos */}
          <div className="flex-1 min-w-[320px] max-w-sm mt-8 xl:mt-0">
            <p className="text-base text-foreground mb-3">Tratamentos:</p>
            <div className="space-y-4">
              {/* Treatment Card 1 */}
              <div className="border border-[#7dd3fc] dark:border-sky-800 rounded-lg p-3 bg-white dark:bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground text-sm border-b border-[#bae6fd] dark:border-sky-900 pb-2 w-full relative">
                    Tratamento de dores fortes de cabeça
                    <div className="absolute top-0 right-0 -mt-0.5 flex items-center gap-1 text-[10px] font-bold text-foreground">
                      <Clock className="w-3 h-3 text-sky-500 fill-sky-500" /> Falta 10 dias
                    </div>
                  </h4>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <Pill className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                      </div>
                      Dipirona/1G
                    </div>
                    <div className="text-muted-foreground text-[10px] whitespace-nowrap">Inicio dia 1 de Janeiro</div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <Pill className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                      </div>
                      Azitromicina/100Mg
                    </div>
                    <div className="text-muted-foreground text-[10px] whitespace-nowrap">Inicio dia 2 de Janeiro</div>
                  </div>
                </div>
              </div>

              {/* Treatment Card 2 */}
              <div className="border border-[#7dd3fc] dark:border-sky-800 rounded-lg p-3 bg-white dark:bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground text-sm border-b border-[#bae6fd] dark:border-sky-900 pb-2 w-full relative">
                    Tratamento de dores fortes de cabeça
                    <div className="absolute top-0 right-0 -mt-0.5 flex items-center gap-1 text-[10px] font-bold text-foreground">
                      <Clock className="w-3 h-3 text-sky-500 fill-sky-500" /> Falta 10 dias
                    </div>
                  </h4>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <Pill className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                      </div>
                      Dipirona/1G
                    </div>
                    <div className="text-muted-foreground text-[10px] whitespace-nowrap">Inicio dia 1 de Janeiro</div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <Pill className="w-2.5 h-2.5 text-red-600 fill-red-600" />
                      </div>
                      Azitromicina/100Mg
                    </div>
                    <div className="text-muted-foreground text-[10px] whitespace-nowrap">Inicio dia 2 de Janeiro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
