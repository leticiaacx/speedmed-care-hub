import { useUser } from '@/contexts/UserContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { Users, Stethoscope, Calendar, Clock, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const { doctors, patients } = useUser();
    const { appointments, pendingAppointmentsCount } = useAppointments();

    const todayDate = new Date().toISOString().split('T')[0];
    const totalAppointmentsToday = appointments.filter(a => a.date === todayDate).length;
    
    const todaysAppointments = appointments
        .filter(a => a.date === todayDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const nextAppointment = todaysAppointments.find(a => a.status === 'confirmado');
    const nextPatient = nextAppointment ? patients.find(p => p.id === nextAppointment.patientId) : null;

    const stats = [
        { title: 'Médicos Ativos', value: doctors.length, icon: Stethoscope, desc: 'Equipe clínica' },
        { title: 'Pacientes', value: patients.length, icon: Users, desc: 'Cadastrados no sistema' },
        { title: 'Agendamentos Hoje', value: totalAppointmentsToday, icon: Calendar, desc: 'Consultas marcadas' },
        { title: 'Pendentes de Aprovação', value: pendingAppointmentsCount, icon: Clock, desc: 'Requerem atenção' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Painel Geral</h1>
                    <p className="text-muted-foreground mt-1">Visão geral da clínica SpeedMed</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="speedmed-card hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 text-primary">{stat.desc}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

                <div className="lg:col-span-2 speedmed-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-foreground">Agenda de Hoje</h2>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    {todaysAppointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>
                    ) : (
                        <div className="space-y-4">
                            {todaysAppointments.map(appt => (
                                <div key={appt.id} className="flex justify-between items-center p-3 border rounded-xl bg-background">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-lg text-primary">{appt.time}</div>
                                        <div>
                                            <p className="font-semibold">{appt.patientName}</p>
                                            <p className="text-xs text-muted-foreground">Para: {appt.doctorName || 'Médico não definido'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            appt.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                                            appt.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                            appt.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {appt.status.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{appt.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="speedmed-card">
                        <h2 className="text-lg font-bold text-foreground mb-4 border-b pb-2">Próximo Paciente</h2>
                        {nextPatient ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {nextPatient.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{nextPatient.name}</p>
                                        <p className="text-xs text-muted-foreground">{nextPatient.age} anos • Sangue: {nextPatient.bloodType}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg border border-border mt-2">
                                    <span className="font-semibold block mb-1">Motivo:</span> 
                                    {nextAppointment?.reason || 'Não especificado'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <p><b>Alergias:</b> {nextPatient.allergies?.length ? nextPatient.allergies.join(', ') : 'Nenhuma'}</p>
                                    <p><b>Médico:</b> {nextAppointment?.doctorName}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhum paciente aguardando atendimento no momento.</p>
                        )}
                    </div>

                <div className="speedmed-card">
                    <h2 className="text-lg font-bold text-foreground mb-4">Avisos</h2>
                    <div className="space-y-4">
                        {pendingAppointmentsCount > 0 ? (
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                                Existem <b>{pendingAppointmentsCount}</b> agendamentos aguardando aprovação na aba de Agendamentos.
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-green-50 text-green-700 dark:bg-green-900/20 text-sm">
                                Nenhum agendamento pendente.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
