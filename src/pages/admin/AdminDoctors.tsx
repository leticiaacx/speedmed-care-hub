import { useState } from 'react';
import { useUser, Doctor } from '@/contexts/UserContext';
import { Stethoscope, Plus, Clock, Save, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminDoctors = () => {
    const { doctors, registerDoctor, updateDoctorSchedule } = useUser();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
    const [newDocName, setNewDocName] = useState('');
    const [newDocCRM, setNewDocCRM] = useState('');
    const [newDocSpecialty, setNewDocSpecialty] = useState('');
    const [newDocEmail, setNewDocEmail] = useState('');

    // Temporarily hold schedule changes before saving
    const [editingSchedule, setEditingSchedule] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

    const handleRegister = () => {
        if (!newDocName || !newDocCRM || !newDocSpecialty || !newDocEmail) return;
        registerDoctor({
            name: newDocName,
            crm: newDocCRM,
            specialty: newDocSpecialty,
            email: newDocEmail,
            schedule: []
        });
        setNewDocName('');
        setNewDocCRM('');
        setNewDocSpecialty('');
        setNewDocEmail('');
        setShowAddModal(false);
    };

    const openScheduleModal = (doctor: Doctor) => {
        setSelectedDoc(doctor);
        setEditingSchedule([...doctor.schedule]);
    };

    const addScheduleRow = () => {
        setEditingSchedule([...editingSchedule, { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }]);
    };

    const updateScheduleRow = (index: number, field: string, value: string | number) => {
        const updated = [...editingSchedule];
        updated[index] = { ...updated[index], [field]: value };
        setEditingSchedule(updated);
    };

    const removeScheduleRow = (index: number) => {
        setEditingSchedule(editingSchedule.filter((_, i) => i !== index));
    };

    const saveSchedule = () => {
        if (selectedDoc) {
            updateDoctorSchedule(selectedDoc.id, editingSchedule);
            setSelectedDoc(null);
        }
    };

    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Médicos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie a equipe médica e os horários de atendimento</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Novo Médico
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                    <div key={doctor.id} className="speedmed-card flex flex-col pt-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground leading-tight">{doctor.name}</h3>
                                <p className="text-sm text-primary font-medium mt-0.5">{doctor.specialty}</p>
                                <p className="text-xs text-muted-foreground mt-1">{doctor.crm}</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{doctor.schedule.length} dias na semana</span>
                            <Button variant="outline" size="sm" onClick={() => openScheduleModal(doctor)} className="gap-2 text-xs">
                                <Clock className="w-3 h-3" /> Horários
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Doctor Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Cadastrar Médico</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <Input placeholder="Dra. Leticia..." value={newDocName} onChange={e => setNewDocName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">E-mail Institucional</label>
                            <Input type="email" placeholder="medico@speedmed.com" value={newDocEmail} onChange={e => setNewDocEmail(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">CRM</label>
                                <Input placeholder="CRM/SP..." value={newDocCRM} onChange={e => setNewDocCRM(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Especialidade</label>
                                <Input placeholder="Ex: Cardiologia" value={newDocSpecialty} onChange={e => setNewDocSpecialty(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={handleRegister} className="w-full mt-2">Cadastrar Médico</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Schedule Edit Modal */}
            <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Horários - {selectedDoc?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Defina os dias e os horários que este médico atende na clínica.</p>

                        {editingSchedule.length === 0 ? (
                            <div className="text-center p-6 border border-dashed border-border rounded-xl">
                                <p className="text-muted-foreground text-sm">Nenhum horário definido.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {editingSchedule.map((sch, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <select
                                            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm"
                                            value={sch.dayOfWeek}
                                            onChange={(e) => updateScheduleRow(i, 'dayOfWeek', parseInt(e.target.value))}
                                        >
                                            {daysOfWeek.map((day, idx) => (
                                                <option key={idx} value={idx}>{day}</option>
                                            ))}
                                        </select>
                                        <Input
                                            type="time"
                                            className="w-32"
                                            value={sch.startTime}
                                            onChange={(e) => updateScheduleRow(i, 'startTime', e.target.value)}
                                        />
                                        <span className="text-muted-foreground">até</span>
                                        <Input
                                            type="time"
                                            className="w-32"
                                            value={sch.endTime}
                                            onChange={(e) => updateScheduleRow(i, 'endTime', e.target.value)}
                                        />
                                        <Button variant="destructive" size="sm" onClick={() => removeScheduleRow(i)}>X</Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <Button variant="outline" onClick={addScheduleRow} className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Dia
                            </Button>
                            <Button onClick={saveSchedule} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <Save className="w-4 h-4" /> Salvar Agenda
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDoctors;
