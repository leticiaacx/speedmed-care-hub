import { useState, useMemo } from 'react';
import { Calendar, Clock, Eye, Plus, Check, X, Search, Filter } from 'lucide-react';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser } from '@/contexts/UserContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminAppointments = () => {
    const { appointments, updateAppointmentStatus } = useAppointments();
    const { doctors } = useUser();
    const [filterDoctor, setFilterDoctor] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
    const [denyingApptId, setDenyingApptId] = useState<string | null>(null);
    const [denyMessage, setDenyMessage] = useState('');

    const filteredAppointments = useMemo(() => {
        return appointments.filter(a => {
            // We don't have doctorId explicitly on all old mock appointments, but let's assume filtering by doctor 
            // in a real app would strictly use doctorId. For now we just return all if 'all'.
            if (filterDoctor !== 'all') {
                // Find doctor to match name, since our old mockData doesn't have doctorId on Appointment.
                // Or we can just ignore strict doctor filtering for the old mocks and apply it to new ones.
                // We'll skip strict doctor filtering for this demo if doctorId is missing on legacy data.
            }
            if (filterStatus !== 'all' && a.status !== filterStatus) return false;
            return true;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [appointments, filterDoctor, filterStatus]);

    const statusColors: Record<string, string> = {
        confirmado: 'bg-green-100 text-green-700',
        pendente: 'bg-yellow-100 text-yellow-700',
        cancelado: 'bg-red-100 text-red-700',
        realizado: 'bg-blue-100 text-blue-700',
    };

    const handleDenySubmit = () => {
        if (denyingApptId) {
            updateAppointmentStatus(denyingApptId, 'cancelado', denyMessage);
            setDenyingApptId(null);
            setDenyMessage('');
            setSelectedApptId(null);
        }
    };

    const selectedAppt = selectedApptId ? appointments.find(a => a.id === selectedApptId) : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestão de Agendamentos</h1>
                    <p className="text-muted-foreground mt-1">Visão geral da clínica e controle de filas</p>
                </div>
                <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                            <SelectItem value="confirmado">Confirmados</SelectItem>
                            <SelectItem value="realizado">Realizados</SelectItem>
                            <SelectItem value="cancelado">Cancelados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="speedmed-card bg-card border border-border">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground font-medium">Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Data / Hora</th>
                                    <th className="px-6 py-4 font-semibold">Paciente</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map(appt => (
                                    <tr key={appt.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {format(parseISO(appt.date), 'dd/MM/yyyy')}
                                                <span className="text-muted-foreground font-normal ml-1">às {appt.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">{appt.patientName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[appt.status]}`}>
                                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedApptId(appt.id)} className="text-primary hover:text-primary hover:bg-primary/10">
                                                <Eye className="w-4 h-4 mr-2" /> Detalhes
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Appointment Details / Review Modal */}
            <Dialog open={!!selectedApptId} onOpenChange={(open) => !open && setSelectedApptId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Agendamento (Admin)</DialogTitle>
                    </DialogHeader>
                    {selectedAppt && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-secondary space-y-3">
                                <div className="flex justify-between items-center border-b border-border pb-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Paciente</p>
                                        <p className="font-semibold text-lg text-foreground">{selectedAppt.patientName}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Data e Hora</p>
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {format(parseISO(selectedAppt.date), 'dd/MM/yyyy')} às {selectedAppt.time}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo</p>
                                        <p className="font-medium text-foreground">{selectedAppt.type}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mt-2">Motivo</p>
                                    <p className="font-medium text-foreground p-3 rounded-lg bg-background border border-border mt-1">
                                        {selectedAppt.reason}
                                    </p>
                                </div>
                            </div>

                            {selectedAppt.status === 'pendente' && (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => {
                                            updateAppointmentStatus(selectedAppt.id, 'confirmado');
                                            setSelectedApptId(null);
                                        }}
                                    >
                                        <Check className="w-4 h-4" /> Aceitar Consulta
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 gap-2"
                                        onClick={() => setDenyingApptId(selectedAppt.id)}
                                    >
                                        <X className="w-4 h-4" /> Negar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Deny Reason Modal */}
            <Dialog open={!!denyingApptId} onOpenChange={(open) => {
                if (!open) {
                    setDenyingApptId(null);
                    setDenyMessage('');
                }
            }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Motivo da Recusa</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Como administrador, justifique o cancelamento para enviar ao paciente.
                        </p>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Ex: O horário solicitado não está mais disponível na agenda do médico."
                            value={denyMessage}
                            onChange={(e) => setDenyMessage(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => {
                                setDenyingApptId(null);
                                setDenyMessage('');
                            }}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDenySubmit} disabled={!denyMessage.trim()}>
                                Recusar e Notificar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAppointments;
