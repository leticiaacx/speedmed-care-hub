import { useState, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Search, 
  Eye, 
  UserPlus, 
  Save 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, MEDICO } from '@/contexts/UserContext';
import PatientRecord from '@/components/PatientRecord';
import { toast } from 'sonner';

const DoctorPatients = () => {
  const { patients, currentUser, registerPatient } = useUser();
  const doctor = currentUser as MEDICO;

  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '', email: '', cpf: '', phone: '', age: '', bloodType: 'A+'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = patients
    .filter(p => !doctor || p.medico_id === doctor.id)
    .filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.cpf || !doctor) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    registerPatient({
      nome: regForm.name,
      email: regForm.email,
      cpf: regForm.cpf,
      phone: regForm.phone,
      age: parseInt(regForm.age) || 0,
      bloodType: regForm.bloodType,
      medico_id: doctor.id,
      socialName: '', maritalStatus: '', sexuality: '', religion: '', organDonor: false, address: '', requiresCompanion: false,
    });
    setIsRegisterModalOpen(false);
    setRegForm({ name: '', email: '', cpf: '', phone: '', age: '', bloodType: 'A+' });
    setSelectedImage(null);
    toast.success('Paciente cadastrado!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground font-heading">Pacientes</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="gap-2 rounded-xl">
          <UserPlus className="w-4 h-4" /> Cadastrar Paciente
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.map(patient => (
          <div key={patient.id} className="bg-card p-4 rounded-xl border border-border flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {patient.nome.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{patient.nome}</p>
                <p className="text-sm text-muted-foreground">Idade: {patient.age} • Sangue: {patient.bloodType}</p>
              </div>
            </div>
            <Button onClick={() => setSelectedPatientId(patient.id)} variant="outline" className="rounded-xl">
              <Eye className="w-4 h-4 mr-2" /> Ver Prontuário
            </Button>
          </div>
        ))}
      </div>

      {/* Modal Prontuário */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Prontuário do Paciente</DialogTitle>
            <DialogDescription>Detalhes médicos do paciente selecionado</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedPatient && <PatientRecord patient={selectedPatient} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-4xl bg-white p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" /> Identificação do Paciente
            </DialogTitle>
            <DialogDescription>Insira os dados básicos do novo paciente abaixo.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 mt-4">
            <form id="register-form" onSubmit={handleRegisterPatient} className="grid grid-cols-2 gap-4">
               {/* Inputs (Nome, CPF, etc) */}
               <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-semibold">Nome Completo *</label>
                  <Input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="bg-slate-50" />
               </div>
               <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-semibold">CPF *</label>
                  <Input required value={regForm.cpf} onChange={e => setRegForm({...regForm, cpf: e.target.value})} className="bg-slate-50" />
               </div>
               {/* ... outros inputs simplificados ... */}
            </form>

            <div className="flex flex-col items-center">
              <div className="w-full bg-slate-100 rounded-xl aspect-[3/4] mb-4 border border-slate-200 flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} className="w-full h-full object-cover" alt="Foto do paciente" />
                ) : (
                  <Camera className="w-12 h-12 opacity-20" />
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                capture="user" 
                className="hidden" 
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 rounded-xl py-6 font-bold gap-2">
                    <Camera className="w-5 h-5" /> Adicionar Foto
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 z-[110]">
                  <DropdownMenuItem 
                    onClick={() => fileInputRef.current?.click()} 
                    className="cursor-pointer p-3"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Arquivos
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => cameraInputRef.current?.click()} 
                    className="cursor-pointer p-3"
                  >
                    <Camera className="w-4 h-4 mr-2" /> Câmera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="mt-4 font-bold text-lg">{regForm.name || "Paciente"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>Cancelar</Button>
            <Button form="register-form" type="submit" className="bg-primary">Salvar Cadastro</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;