import { useUser } from '@/contexts/UserContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { Users, Stethoscope, Calendar, Clock, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const { doctors, patients } = useUser();
    const { appointments, pendingAppointmentsCount } = useAppointments();

    const totalAppointmentsToday = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 speedmed-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-foreground">Atividade Recente</h2>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">O sistema está operando normalmente. Total de {appointments.length} agendamentos registrados no histórico.</p>
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
