import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Droplets, AlertTriangle, Pill, Edit, Save, X, FileText, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Patient } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useNavigate } from 'react-router-dom';

interface PatientRecordProps {
  patient: Patient;
  onConcludeAppointment?: () => void;
}

const PatientRecord = ({ patient, onConcludeAppointment }: PatientRecordProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(null);
  const [editedPatient, setEditedPatient] = useState<Patient>(patient);

  // Local state for adding new items
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newHeredity, setNewHeredity] = useState('');
  const [newNote, setNewNote] = useState('');

  const { saveDoctorReport } = useAppointments();
  const navigate = useNavigate();

  const handleGenerateReport = () => {
    let reportContent = `RELATÓRIO MÉDICO - ${patient.name}\n`;
    reportContent += `Data: ${format(new Date(), 'dd/MM/yyyy')}\n\n`;
    reportContent += `TRATAMENTO:\n`;
    reportContent += `[Descreva o tratamento aqui]\n\n`;
    reportContent += `DOENÇAS DO PACIENTE:\n`;
    reportContent += `[Descreva as doenças preexistentes ou atuais]\n\n`;
    reportContent += `DETALHES IMPORTANTES:\n`;
    reportContent += `[Adicione observações adicionais]`;

    saveDoctorReport({
      patientId: patient.id,
      patientName: patient.name,
      date: format(new Date(), 'dd/MM/yyyy'),
      content: reportContent,
      status: 'draft'
    });

    toast.success('Relatório gerado como rascunho!');
    navigate('/doctor/reports');
  };

  const handleSave = () => {
    // In a real app, this would be an API call
    setIsEditing(false);
    toast.success('Ficha do paciente atualizada com sucesso!');
  };

  const handleCancel = () => {
    setEditedPatient(patient);
    setIsEditing(false);
    setNewAllergy('');
    setNewMedication('');
    setNewHeredity('');
  };

  const addItem = (field: 'allergies' | 'medications' | 'heredity', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setEditedPatient({
      ...editedPatient,
      [field]: [...(editedPatient[field] || []), value.trim()]
    });
    setter('');
  };

  const removeItem = (field: 'allergies' | 'medications' | 'heredity', index: number) => {
    const newList = [...(editedPatient[field] || [])];
    newList.splice(index, 1);
    setEditedPatient({ ...editedPatient, [field]: newList });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-3xl">
              {editedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">{editedPatient.name}</h3>
            <p className="text-muted-foreground">{editedPatient.age} anos • CPF: {editedPatient.cpf}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {onConcludeAppointment && (
            <Button onClick={() => {
              onConcludeAppointment();
              toast.success('Consulta marcada como realizada!');
            }} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4" />
              Concluir Consulta
            </Button>
          )}

          <Button variant="secondary" onClick={handleGenerateReport} className="gap-2 bg-primary/10 text-primary hover:bg-primary/20">
            <FileText className="w-4 h-4" />
            Gerar Relatório
          </Button>

          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" /> Salvar Ficha
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
              <Edit className="w-4 h-4" /> Editar Informações
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="space-y-4 p-6 rounded-2xl bg-secondary/50 border border-border">
          <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <UserIcon className="w-5 h-5 text-primary" /> Informações Pessoais
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Telefone</label>
              {isEditing ? (
                <Input value={editedPatient.phone} onChange={e => setEditedPatient({ ...editedPatient, phone: e.target.value })} />
              ) : (
                <div className="flex items-center gap-2 font-medium"><Phone className="w-4 h-4 text-primary" /> {editedPatient.phone}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">E-mail</label>
              {isEditing ? (
                <Input value={editedPatient.email} onChange={e => setEditedPatient({ ...editedPatient, email: e.target.value })} type="email" />
              ) : (
                <div className="flex items-center gap-2 font-medium"><Mail className="w-4 h-4 text-primary" /> {editedPatient.email}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Tipo Sanguíneo</label>
              {isEditing ? (
                <Input value={editedPatient.bloodType} onChange={e => setEditedPatient({ ...editedPatient, bloodType: e.target.value })} />
              ) : (
                <div className="flex items-center gap-2 font-medium"><Droplets className="w-4 h-4 text-destructive" /> {editedPatient.bloodType}</div>
              )}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="space-y-4 p-6 rounded-2xl bg-secondary/50 border border-border">
          <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <FileText className="w-5 h-5 text-primary" /> Histórico Clínico
          </h4>

          {/* Heredity */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Hereditariedade</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {editedPatient.heredity?.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-1">
                  {h}
                  {isEditing && <button onClick={() => removeItem('heredity', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>}
                </span>
              ))}
              {(!editedPatient.heredity || editedPatient.heredity.length === 0) && !isEditing && (
                <span className="text-sm text-muted-foreground">Não registrado</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input value={newHeredity} onChange={e => setNewHeredity(e.target.value)} placeholder="Nova hereditariedade..." className="h-8 text-sm" />
                <Button size="sm" onClick={() => addItem('heredity', newHeredity, setNewHeredity)}>Add</Button>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Alergias</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {editedPatient.allergies?.map((a, i) => (
                <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                  {a}
                  {isEditing && <button onClick={() => removeItem('allergies', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>}
                </span>
              ))}
              {(!editedPatient.allergies || editedPatient.allergies.length === 0) && !isEditing && (
                <span className="text-sm text-muted-foreground">Não registrado</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Nova alergia..." className="h-8 text-sm" />
                <Button size="sm" onClick={() => addItem('allergies', newAllergy, setNewAllergy)}>Add</Button>
              </div>
            )}
          </div>

          {/* Medications */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Medicamentos em Uso</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {editedPatient.medications?.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium flex items-center gap-1">
                  {m}
                  {isEditing && <button onClick={() => removeItem('medications', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>}
                </span>
              ))}
              {(!editedPatient.medications || editedPatient.medications.length === 0) && !isEditing && (
                <span className="text-sm text-muted-foreground">Não registrado</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input value={newMedication} onChange={e => setNewMedication(e.target.value)} placeholder="Novo medicamento..." className="h-8 text-sm" />
                <Button size="sm" onClick={() => addItem('medications', newMedication, setNewMedication)}>Add</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation History */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h4 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2">
          <Calendar className="w-5 h-5 text-primary" /> Histórico de Consultas
        </h4>

        {/* Note Editor (if editing) */}
        {isEditing && (
          <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-primary/20">
            <h5 className="font-medium text-sm mb-2 text-primary">Adicionar Nova Evolução/Nota Médica</h5>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              placeholder="Digite suas anotações para a consulta de hoje..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => {
                if (!newNote) return;
                setEditedPatient({
                  ...editedPatient,
                  consultationHistory: [
                    {
                      date: format(new Date(), 'yyyy-MM-dd'),
                      time: format(new Date(), 'HH:mm'),
                      type: 'Consulta',
                      specialty: 'Clínico Geral',
                      doctorName: 'Você',
                      diagnosis: newNote
                    },
                    ...(editedPatient.consultationHistory || [])
                  ]
                });
                setNewNote('');
                toast.success('Nota de evolução adicionada.');
              }}>Salvar Nota na Ficha</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {editedPatient.consultationHistory && editedPatient.consultationHistory.length > 0 ? (
            editedPatient.consultationHistory.map((consultation, index) => {
              const isExpanded = expandedConsultation === index;
              return (
                <div key={index} className="border border-border rounded-xl overflow-hidden bg-background transition-all">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50"
                    onClick={() => setExpandedConsultation(isExpanded ? null : index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <span>{format(parseISO(consultation.date), 'dd/MM/yyyy')}</span>
                          <span className="text-muted-foreground text-sm">às {consultation.time}</span>
                          <span className="ml-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {consultation.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Dr(a). {consultation.doctorName} • {consultation.specialty}</p>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-secondary/30 border-t border-border mt-0">
                      <h6 className="text-sm font-semibold mb-1 text-foreground">Anotações / Notas Médicas:</h6>
                      <div className="p-3 bg-background rounded-lg border border-border text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {consultation.diagnosis}
                      </div>
                      {/* You could add prescribed meds here based on mock data expansion in the future */}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center py-6">Nenhuma consulta no histórico.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted small icon just to prevent lucide clutter
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

export default PatientRecord;
