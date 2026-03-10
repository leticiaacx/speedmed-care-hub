import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Users, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatientRecord from '@/components/PatientRecord';

const AdminPatients = () => {
    const { patients } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

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

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-9 h-10 rounded-xl bg-background"
                        placeholder="Buscar por nome ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
        </div>
    );
};

export default AdminPatients;
