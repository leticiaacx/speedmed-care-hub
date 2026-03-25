import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Users, Eye, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PatientRecord from '@/components/PatientRecord';

const AdminPatients = () => {
    const { patients, doctors, registerPatient } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newCpf, setNewCpf] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAge, setNewAge] = useState('');
    const [newDoctorId, setNewDoctorId] = useState('');
    const [newSocialName, setNewSocialName] = useState('');
    const [newBloodType, setNewBloodType] = useState('');
    const [newMaritalStatus, setNewMaritalStatus] = useState('');
    const [newSexuality, setNewSexuality] = useState('');
    const [newReligion, setNewReligion] = useState('');
    const [newOrganDonor, setNewOrganDonor] = useState('Não');
    const [newAddress, setNewAddress] = useState('');
    const [newRequiresCompanion, setNewRequiresCompanion] = useState('Não');

    const handleRegister = () => {
        if (!newName || !newEmail || !newCpf || !newDoctorId || !newAge) return;
        registerPatient({
            name: newName,
            email: newEmail,
            cpf: newCpf,
            phone: newPhone,
            age: Number(newAge),
            bloodType: newBloodType || 'Não informado',
            doctorId: newDoctorId,
            socialName: newSocialName,
            maritalStatus: newMaritalStatus,
            sexuality: newSexuality,
            religion: newReligion,
            organDonor: newOrganDonor === 'Sim',
            address: newAddress,
            requiresCompanion: newRequiresCompanion === 'Sim'
        });
        setNewName(''); setNewEmail(''); setNewCpf(''); setNewPhone(''); setNewAge(''); setNewDoctorId('');
        setNewSocialName(''); setNewBloodType(''); setNewMaritalStatus(''); setNewSexuality(''); setNewReligion(''); setNewOrganDonor('Não'); setNewAddress(''); setNewRequiresCompanion('Não');
        setShowAddModal(false);
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf.includes(searchTerm)
    );

    const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Pacientes Gerais</h1>
                    <p className="text-muted-foreground mt-1">Acesso de leitura a todos os prontuários da clínica</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            className="pl-9 h-10 rounded-xl bg-background"
                            placeholder="Buscar por nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Novo Paciente
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map(patient => (
                    <div key={patient.id} className="speedmed-card">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{patient.name}</h3>
                                <p className="text-sm text-muted-foreground">Idade: {patient.age} anos</p>
                                <p className="text-xs text-muted-foreground mt-0.5">CPF: {patient.cpf}</p>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5" onClick={() => setSelectedPatientId(patient.id)}>
                            <Eye className="w-4 h-4" /> Ver Prontuário Completo
                        </Button>
                    </div>
                ))}
                {filteredPatients.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Nenhum paciente encontrado com essa busca.
                    </div>
                )}
            </div>

            <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Ficha do Paciente (Modo Leitura)</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        {selectedPatient && <PatientRecord patient={selectedPatient} />}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Cadastrar Novo Paciente</DialogTitle></DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nome Completo</label>
                                <Input placeholder="Nome do paciente..." value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nome Social</label>
                                <Input placeholder="Opcional" value={newSocialName} onChange={e => setNewSocialName(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">E-mail</label>
                                <Input type="email" placeholder="paciente@exemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Telefone</label>
                                <Input placeholder="(00) 00000-0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">CPF</label>
                                <Input placeholder="000.000.000-00" value={newCpf} onChange={e => setNewCpf(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Idade</label>
                                <Input type="number" placeholder="Ex: 35" value={newAge} onChange={e => setNewAge(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Médico Responsável</label>
                            <Select value={newDoctorId} onValueChange={setNewDoctorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um médico..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Extra info section */}
                        <div className="border-t pt-4 mt-2">
                            <h3 className="font-semibold text-sm mb-3">Informações Adicionais</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Endereço</label>
                                    <Input placeholder="Rua, número..." value={newAddress} onChange={e => setNewAddress(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Tipo Sanguíneo</label>
                                    <Select value={newBloodType} onValueChange={setNewBloodType}>
                                        <SelectTrigger><SelectValue placeholder="Ex: O+" /></SelectTrigger>
                                        <SelectContent>
                                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Estado Civil</label>
                                    <Select value={newMaritalStatus} onValueChange={setNewMaritalStatus}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                                            <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                                            <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                                            <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Sexualidade</label>
                                    <Input placeholder="Ex: Heterossexual" value={newSexuality} onChange={e => setNewSexuality(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Religião</label>
                                    <Input placeholder="Ex: Católica, Evangélica..." value={newReligion} onChange={e => setNewReligion(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Doador de Órgãos?</label>
                                    <Select value={newOrganDonor} onValueChange={setNewOrganDonor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                            <SelectItem value="Não">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Necessita de acompanhante?</label>
                                <Select value={newRequiresCompanion} onValueChange={setNewRequiresCompanion}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sim">Sim</SelectItem>
                                        <SelectItem value="Não">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleRegister} className="w-full mt-2">Cadastrar Paciente</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPatients;
