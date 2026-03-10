import { useState } from 'react';
import { Search, Eye, UserPlus, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, Doctor } from '@/contexts/UserContext';
import PatientRecord from '@/components/PatientRecord';
import { toast } from 'sonner';

const DoctorPatients = () => {
  const { patients, currentUser, registerPatient } = useUser();
  const doctor = currentUser as Doctor;

  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Registration Form State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    age: '',
    bloodType: 'A+'
  });

  const filtered = patients
    .filter(p => !doctor || p.doctorId === doctor.id) // Filter by doctor
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const selectedPatient = selectedPatientId
    ? patients.find(p => p.id === selectedPatientId)
    : null;

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.cpf || !doctor) {
      toast.error('Preencha os campos obrigatórios (Nome, CPF)');
      return;
    }

    try {
      registerPatient({
        name: regForm.name,
        email: regForm.email,
        cpf: regForm.cpf,
        phone: regForm.phone,
        age: parseInt(regForm.age) || 0,
        bloodType: regForm.bloodType,
        doctorId: doctor.id
      });
      setIsRegisterModalOpen(false);
      setRegForm({ name: '', email: '', cpf: '', phone: '', age: '', bloodType: 'A+' });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar paciente');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Pacientes
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl w-full border-border bg-card"
          />
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="gap-2 shrink-0 rounded-xl w-full sm:w-auto">
          <UserPlus className="w-4 h-4" />
          Cadastrar Paciente
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          filtered.map(patient => (
            <div key={patient.id} className="speedmed-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-lg">
                    {patient.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{patient.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>Idade: {patient.age}</span> •
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">Sangue: {patient.bloodType}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientId(patient.id)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                <Eye className="w-4 h-4" />
                Ver Ficha Completa
              </button>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle className="text-2xl font-bold">Ficha do Paciente</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {selectedPatient && <PatientRecord patient={selectedPatient} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Cadastrar Novo Paciente
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRegisterPatient} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome Completo *</label>
                <Input required value={regForm.name} onChange={e => setRegForm(r => ({ ...r, name: e.target.value }))} className="bg-background rounded-xl" placeholder="Ex: João da Silva" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">CPF *</label>
                <Input required value={regForm.cpf} onChange={e => setRegForm(r => ({ ...r, cpf: e.target.value }))} className="bg-background rounded-xl" placeholder="000.000.000-00" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <Input type="email" value={regForm.email} onChange={e => setRegForm(r => ({ ...r, email: e.target.value }))} className="bg-background rounded-xl" placeholder="joao@email.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <Input value={regForm.phone} onChange={e => setRegForm(r => ({ ...r, phone: e.target.value }))} className="bg-background rounded-xl" placeholder="(00) 00000-0000" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Idade</label>
                <Input type="number" value={regForm.age} onChange={e => setRegForm(r => ({ ...r, age: e.target.value }))} className="bg-background rounded-xl" placeholder="Ex: 35" min="0" max="150" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo Sanguíneo</label>
                <select
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                  value={regForm.bloodType}
                  onChange={e => setRegForm(r => ({ ...r, bloodType: e.target.value }))}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 rounded-xl">
                <Save className="w-4 h-4" />
                Cadastrar Paciente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;
