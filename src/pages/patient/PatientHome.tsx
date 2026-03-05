import { Calendar, Clock, MapPin, User, Pill, Stethoscope, AlertCircle, Activity } from 'lucide-react';
import { mockPatientUser } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const PatientHome = () => {
  const navigate = useNavigate();
  const user = mockPatientUser;
  const { appointments } = useAppointments();

  const patientAppointments = appointments.filter(a => a.patientName === user.name || a.patientId === '1');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="speedmed-card speedmed-gradient text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg opacity-90">Olá,</p>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="opacity-80 mt-1">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'hsl(0 0% 100% / 0.2)' }}>
            <User className="w-8 h-8" style={{ color: 'hsl(0 0% 100%)' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="speedmed-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo remédio</p>
              <p className="text-2xl font-bold text-foreground">{user.nextMedication.hoursUntil}h</p>
              <p className="text-xs text-destructive font-medium">{user.nextMedication.dose} de {user.nextMedication.name}</p>
            </div>
          </div>
        </div>
        <div className="speedmed-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tratamentos ativos</p>
              <p className="text-2xl font-bold text-foreground">{user.treatments.length}</p>
            </div>
          </div>
        </div>
        <div className="speedmed-card cursor-pointer hover:shadow-lg" onClick={() => navigate('/patient/appointments')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima consulta</p>
              <p className="text-lg font-bold text-foreground">{format(parseISO(user.nextAppointment.date), 'dd/MM')}</p>
              <p className="text-xs text-muted-foreground">{user.nextAppointment.time} - {user.nextAppointment.doctorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next appointment detail */}
        <div className="speedmed-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Próxima Consulta
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Médico</span>
              <span className="text-foreground font-medium">{user.nextAppointment.doctorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipo</span>
              <span className="text-foreground font-medium">{user.nextAppointment.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data</span>
              <span className="text-foreground font-medium">{format(parseISO(user.nextAppointment.date), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora</span>
              <span className="text-foreground font-medium">{user.nextAppointment.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Local</span>
              <span className="text-foreground font-medium text-right">{user.nextAppointment.location}</span>
            </div>
          </div>
        </div>

        {/* Treatments */}
        <div className="speedmed-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Tratamentos Ativos
          </h3>
          <div className="space-y-4">
            {user.treatments.map((treatment, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">{treatment.name}</h4>
                  <span className="text-xs text-success font-medium">Falta {treatment.daysLeft} dias</span>
                </div>
                {treatment.medications.map((med, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-foreground">
                    <Pill className="w-3 h-3 text-destructive" />
                    {med}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last consultation */}
      <div className="speedmed-card border-l-4" style={{ borderLeftColor: 'hsl(199 89% 48%)' }}>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Última Consulta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium text-foreground">{format(parseISO(user.lastConsultation.date), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-muted-foreground">Hora</p>
              <p className="font-medium text-foreground">{user.lastConsultation.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-muted-foreground">Local</p>
              <p className="font-medium text-foreground">{user.lastConsultation.location}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Motivo</p>
            <p className="font-medium text-foreground">{user.lastConsultation.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
