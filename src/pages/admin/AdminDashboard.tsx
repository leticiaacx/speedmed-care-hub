import { useUser } from '@/contexts/UserContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { Users, Stethoscope, Calendar, Clock, Activity, ChevronRight, User } from 'lucide-react';

const AdminDashboard = () => {
    const { doctors, patients } = useUser();
    const { appointments, pendingAppointmentsCount } = useAppointments();

    const todayDate = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments
        .filter(a => a.data_hora.startsWith(todayDate))
        .sort((a, b) => a.data_hora.localeCompare(b.data_hora));

    const nextAppointment = todaysAppointments.find(a => a.status === 'confirmado');
    const nextPatient = nextAppointment ? patients.find(p => p.id === nextAppointment.usuario_id) : null;

    const stats = [
        { title: 'Médicos Ativos', value: doctors.length, icon: Stethoscope, color: 'bg-sky-500' },
        { title: 'Pacientes', value: patients.length, icon: Users, color: 'bg-green-500' },
        { title: 'Pendentes', value: pendingAppointmentsCount, icon: Clock, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-foreground">Painel Geral</h1>
                <p className="text-xs text-muted-foreground mt-1">Gestão administrativa SpeedMed</p>
            </div>

            {/* Mini Stats (Estilo Médico) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-light text-muted-foreground">{stat.title}</p>
                            <h3 className="text-2xl font-light text-foreground mt-1">{stat.value}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center text-white shadow-lg shadow-opacity-20`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid Principal: Destaque na Agenda */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Agenda Hoje - O MAIOR (Destaque) */}
                <div className="xl:col-span-2 bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-light text-foreground">Agenda de Hoje</h2>
                        <span className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-1 rounded text-muted-foreground">Tempo Real</span>
                    </div>
                    
                    <div className="space-y-4">
                        {todaysAppointments.length === 0 ? (
                            <p className="text-sm font-light text-muted-foreground py-10 text-center">Nenhum agendamento para hoje.</p>
                        ) : (
                            todaysAppointments.slice(0, 5).map(appt => (
                                <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-light text-primary bg-primary/5 w-12 h-12 rounded-lg flex items-center justify-center border border-primary/10">
                                            {appt.data_hora.split('T')[1]?.substring(0, 5)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-light text-foreground">{appt.patientName}</p>
                                            <p className="text-[11px] text-muted-foreground">Dr(a). {appt.doctorName}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-light ${
                                        appt.status === 'confirmado' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {appt.status.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Coluna Lateral: Paciente e Avisos */}
                <div className="space-y-6">
                    {/* Próximo Paciente */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5">
                        <h2 className="text-sm font-light text-muted-foreground mb-4 italic">A seguir:</h2>
                        {nextPatient ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full mb-3 flex items-center justify-center border border-slate-200 overflow-hidden">
                                    <User className="w-10 h-10 text-slate-300" />
                                </div>
                                <p className="text-base font-light text-foreground leading-tight">{nextPatient.nome}</p>
                                <p className="text-xs text-muted-foreground mt-1">{nextPatient.age} anos • {nextPatient.bloodType}</p>
                                <div className="w-full mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase text-left mb-1">Motivo</p>
                                    <p className="text-xs font-light text-left text-foreground truncate">{nextAppointment?.reason || 'Consulta Geral'}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs font-light text-muted-foreground text-center py-4">Fila vazia</p>
                        )}
                    </div>

                    {/* Avisos */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5">
                        <h2 className="text-sm font-light text-foreground mb-4 flex items-center gap-2">
                             <Activity size={16} className="text-primary" /> Alertas
                        </h2>
                        {pendingAppointmentsCount > 0 ? (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                <p className="text-[11px] text-red-600 dark:text-red-400 font-light">
                                    Há <strong>{pendingAppointmentsCount}</strong> solicitações aguardando sua revisão.
                                </p>
                            </div>
                        ) : (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <p className="text-[11px] text-green-600 dark:text-green-400 font-light text-center">
                                    Tudo em ordem por aqui!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;