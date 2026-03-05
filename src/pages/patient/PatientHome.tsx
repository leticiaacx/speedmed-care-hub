import { Calendar, Clock, MapPin, User, Pill, Stethoscope, FileText, CalendarDays, AlertCircle } from 'lucide-react';
import { mockPatientUser } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import speedmedLogo from '@/assets/speedmed-logo.png';

const PatientHome = () => {
  const navigate = useNavigate();
  const user = mockPatientUser;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="speedmed-header">
        <div className="flex items-center justify-between mb-6">
          <img src={speedmedLogo} alt="SpeedMed" className="w-8 h-8 rounded-lg" />
          <button
            onClick={() => navigate('/')}
            className="text-sm opacity-80 hover:opacity-100"
            style={{ color: 'hsl(0 0% 100%)' }}
          >
            Sair
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg opacity-90" style={{ color: 'hsl(0 0% 100%)' }}>Olá,</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(0 0% 100%)' }}>
              {user.name}
            </h1>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'hsl(0 0% 100% / 0.2)' }}>
            <User className="w-8 h-8" style={{ color: 'hsl(0 0% 100%)' }} />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 max-w-lg mx-auto">
        {/* Medication reminder */}
        <div className="speedmed-card text-center">
          <p className="text-foreground font-semibold">Seu próximo remédio será tomado em:</p>
          <p className="text-4xl font-bold text-foreground mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {user.nextMedication.hoursUntil} Horas
          </p>
          <p className="text-destructive font-medium mt-1">
            {user.nextMedication.dose} de {user.nextMedication.name}
          </p>
        </div>

        {/* Next appointment + treatments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="speedmed-card">
            <h3 className="font-semibold text-foreground text-sm mb-3">Sua próxima consulta:</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Médico:</p>
                <p className="text-sm font-medium text-foreground">{user.nextAppointment.doctorName}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Clínica:</p>
              <p className="text-foreground text-xs">{user.nextAppointment.location}</p>
              <p className="text-muted-foreground mt-2">Exame:</p>
              <p className="text-foreground text-xs">{user.nextAppointment.type}</p>
            </div>
            <div className="mt-3 text-center">
              <p className="text-primary text-sm font-medium">Sua consulta será em:</p>
              <p className="text-primary text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {format(parseISO(user.nextAppointment.date), "dd/MM")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {user.treatments.map((treatment, i) => (
              <div key={i} className="speedmed-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground text-xs leading-tight">{treatment.name}</h4>
                  <span className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(142 71% 45%)' }} />
                    <span className="text-muted-foreground">Falta {treatment.daysLeft} dias</span>
                  </span>
                </div>
                {treatment.medications.map((med, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-foreground">
                    <Pill className="w-3 h-3 text-destructive" />
                    {med}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Last consultation info */}
        <div className="speedmed-card border-l-4" style={{ borderLeftColor: 'hsl(199 89% 48%)' }}>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-primary" />
            Última Consulta
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">
                {format(parseISO(user.lastConsultation.date), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">{user.lastConsultation.time}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">{user.lastConsultation.location}</span>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Motivo:</p>
              <p className="text-foreground font-medium">{user.lastConsultation.reason}</p>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 border-b border-primary pb-2">Funcionalidades</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Stethoscope, label: 'Histórico de tratamentos' },
              { icon: FileText, label: 'Arquivos Anexados' },
              { icon: CalendarDays, label: 'Histórico de Consultas' },
              { icon: Clock, label: 'Horário de Tratamentos' },
              { icon: Calendar, label: 'Tela de Agendamentos' },
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs text-center text-foreground font-medium leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
