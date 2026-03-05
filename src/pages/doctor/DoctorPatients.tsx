import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockPatients } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatientRecord from '@/components/PatientRecord';

const DoctorPatients = () => {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = selectedPatientId
    ? mockPatients.find(p => p.id === selectedPatientId)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Pacientes
      </h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map(patient => (
          <div key={patient.id} className="speedmed-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{patient.name}</p>
                <p className="text-sm text-muted-foreground">{patient.age} anos • {patient.bloodType}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatientId(patient.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Eye className="w-4 h-4" />
              Ver Ficha
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatientId(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>Ficha do Paciente</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {selectedPatient && <PatientRecord patient={selectedPatient} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;
