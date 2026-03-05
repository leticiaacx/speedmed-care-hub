import { Calendar, Clock, MapPin, Users, FileText, AlertCircle } from 'lucide-react';
import { mockDoctor, mockAppointments, mockPatients } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DoctorHome = () => {
  const navigate = useNavigate();
  const todayAppointments = mockAppointments.filter(a => isToday(parseISO(a.date)));
  const upcomingAppointments = mockAppointments
    .filter(a => isFuture(parseISO(a.date)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const stats = [
    { label: 'Pacientes', value: mockPatients.length, icon: Users, color: 'hsl(199 89% 48%)' },
    { label: 'Consultas Hoje', value: todayAppointments.length, icon: Calendar, color: 'hsl(142 71% 45%)' },
    { label: 'Agendamentos', value: mockAppointments.filter(a => a.status === 'pendente').length, icon: Clock, color: 'hsl(38 92% 50%)' },
    { label: 'Relatórios', value: 3, icon: FileText, color: 'hsl(262 83% 58%)' },
  ];

  const statusColors: Record<string, string> = {
    confirmado: 'bg-green-100 text-green-700',
    pendente: 'bg-yellow-100 text-yellow-700',
    cancelado: 'bg-red-100 text-red-700',
    realizado: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Olá, {mockDoctor.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="speedmed-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Last consultation info */}
      <div className="speedmed-card border-l-4" style={{ borderLeftColor: 'hsl(199 89% 48%)' }}>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Última Consulta Realizada
        </h3>
        {(() => {
          const lastDone = mockAppointments.find(a => a.status === 'realizado');
          if (!lastDone) return <p className="text-muted-foreground">Nenhuma consulta realizada</p>;
          return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Paciente</p>
                <p className="font-medium text-foreground">{lastDone.patientName}</p>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Data e Hora</p>
                  <p className="font-medium text-foreground">
                    {format(parseISO(lastDone.date), "dd/MM/yyyy", { locale: ptBR })} às {lastDone.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Local</p>
                  <p className="font-medium text-foreground">{lastDone.location}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Motivo</p>
                <p className="font-medium text-foreground">{lastDone.reason}</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Próximos Agendamentos
          </h2>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="text-primary font-medium text-sm hover:underline"
          >
            Ver todos →
          </button>
        </div>
        <div className="space-y-3">
          {upcomingAppointments.map((appt) => (
            <div key={appt.id} className="speedmed-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold text-sm">
                    {appt.patientName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{appt.patientName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {appt.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
