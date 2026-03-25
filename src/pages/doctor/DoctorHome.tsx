import { Calendar, Clock, MapPin, Users, FileText, AlertCircle, TrendingUp, Activity, DollarSign } from 'lucide-react';
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
  const upcomingAppointments = appointments
    .filter(a => isFuture(parseISO(a.data_hora.split('T')[0])))
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .slice(0, 4);

  const activeTreatments = 315;
  const revenue = 'R$ 12.450';

  const stats = [
    { label: 'Total de Pacientes', value: '1.234', icon: Users, color: 'hsl(199 89% 48%)', change: '+12%' },
    { label: 'Agendamentos Hoje', value: todayAppointments.length.toString() || '42', icon: Calendar, color: 'hsl(142 71% 45%)', change: '+5%' },
    { label: 'Tratamentos Ativos', value: activeTreatments.toString(), icon: Activity, color: 'hsl(38 92% 50%)', change: '+8%' },
    { label: 'Receita', value: revenue, icon: TrendingUp, color: 'hsl(142 71% 45%)', change: '+23%' },
  ];

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    realizado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const recentActivity = [
    { message: 'Novo paciente registrado: Maria Silva', time: '2 horas atrás' },
    { message: 'Novo paciente registrado: Maria Silva', time: '2 horas atrás' },
    { message: 'Novo paciente registrado: Maria Silva', time: '2 horas atrás' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta, {doctor ? doctor.nome.split(' ')[0] : 'Dr.'}. Aqui está o resumo de hoje.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="speedmed-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs mt-1">
              <span className="text-success font-medium">{stat.change}</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2 speedmed-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Próximos Agendamentos</h2>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-primary text-sm font-medium hover:underline"
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum agendamento próximo</p>
            ) : (
              upcomingAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground font-semibold text-sm">
                        {appt.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{appt.data_hora.includes('T') ? appt.data_hora.split('T')[1].substring(0,5) : ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {isToday(parseISO(appt.data_hora.split('T')[0])) ? 'Today' : format(parseISO(appt.data_hora.split('T')[0]), 'dd/MM')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="speedmed-card">
          <h2 className="text-lg font-bold text-foreground mb-5">Atividade Recente</h2>
          <div className="space-y-4">
            {(notifications.length > 0 ? notifications.slice(0, 3) : recentActivity).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{'message' in item ? item.message : item.message}</p>
                  <p className="text-xs text-primary mt-0.5">{'time' in item ? (item.time instanceof Date ? format(item.time, 'HH:mm') : item.time) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
