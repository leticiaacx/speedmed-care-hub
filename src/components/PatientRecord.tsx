import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Droplets, AlertTriangle, Pill, Edit, Save, X, FileText, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Upload, User as UserIconLucide, Calendar as CalendarIcon2 } from 'lucide-react';
import { USUARIO } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface PatientRecordProps {
  patient: USUARIO;
  onConcludeAppointment?: () => void;
}

const PatientRecord = ({ patient, onConcludeAppointment }: PatientRecordProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(null);
  const [isMedicationCalendarOpen, setIsMedicationCalendarOpen] = useState(false);
  const [medicationMonth, setMedicationMonth] = useState(new Date().getMonth());
  
  // Extend editedPatient to hold the new fields from the Figma for the UI state
  const [editedPatient, setEditedPatient] = useState<any>({
    ...patient,
    prontuario: '000000',
    dataAbertura: format(new Date(), 'dd/MM/yyyy'),
    escolaridade: 'Ensino Superior Completo',
    ocupacao: 'Estudante',
    sexo: 'Masculino',
    cep: '00000-000',
    numero: '000',
    bairro: 'Centro',
    rua: 'Rua do seu endereço',
    cidade: 'Sua Cidade',
    complemento: 'Complemento',
    responsavelContato: 'E-mail, Telefone, nome',
    limitacoes: ['Cognitiva'], // Just mocks representing the checkboxes
    temCuidador: true,
  });

  // Local state for adding new items
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newHeredity, setNewHeredity] = useState('');
  const [newNote, setNewNote] = useState('');
  const [mockFiles, setMockFiles] = useState<{name: string, date: string}[]>([
    { name: 'Exame de Sangue.pdf', date: '10/02/2026' },
  ]);

  const { saveDoctorReport } = useAppointments();
  const { userRole } = useUser();
  const navigate = useNavigate();

  const isReadOnly = userRole === 'admin';

  const handleGenerateReport = () => {
    let reportContent = `RELATÓRIO MÉDICO - ${patient.nome}\n`;
    reportContent += `Data: ${format(new Date(), 'dd/MM/yyyy')}\n\n`;
    reportContent += `TRATAMENTO:\n`;
    reportContent += `[Descreva o tratamento aqui]\n\n`;
    reportContent += `DOENÇAS DO PACIENTE:\n`;
    reportContent += `[Descreva as doenças preexistentes ou atuais]\n\n`;
    reportContent += `DETALHES IMPORTANTES:\n`;
    reportContent += `[Adicione observações adicionais]`;

    saveDoctorReport({
      usuario_id: patient.id,
      patientName: patient.nome,
      data_hora: new Date().toISOString(),
      content: reportContent,
      status: 'draft'
    });

    toast.success('Relatório gerado como rascunho!');
    navigate('/doctor/reports');
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Ficha do paciente atualizada com sucesso!');
  };

  const handleCancel = () => {
    setEditedPatient({
      ...patient,
      prontuario: '000000',
      dataAbertura: format(new Date(), 'dd/MM/yyyy'),
      escolaridade: 'Ensino Superior Completo',
      ocupacao: 'Estudante',
      sexo: 'Masculino',
      cep: '00000-000',
      numero: '000',
      bairro: 'Centro',
      rua: 'Rua do seu endereço',
      cidade: 'Sua Cidade',
      complemento: 'Complemento',
      responsavelContato: 'E-mail, Telefone, nome',
      limitacoes: ['Cognitiva'],
      temCuidador: true,
    });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMockFiles([...mockFiles, { name: file.name, date: format(new Date(), 'dd/MM/yyyy') }]);
      toast.success(`Arquivo ${file.name} enviado com sucesso!`);
    }
  };

  // Checkbox toggle logic
  const toggleLimitacao = (limitacao: string) => {
    setEditedPatient((prev: any) => {
      const exists = prev.limitacoes.includes(limitacao);
      if (exists) {
        return { ...prev, limitacoes: prev.limitacoes.filter((l: string) => l !== limitacao) };
      } else {
        return { ...prev, limitacoes: [...prev.limitacoes, limitacao] };
      }
    });
  };

  const medicationGrid = useMemo(() => {
    const days = [];
    // seeded random-like loop for deterministic mock data
    for (let i = 0; i < 364; i++) {
        const rand = (Math.sin(i + patient.id) * 10000) - Math.floor(Math.sin(i + patient.id) * 10000);
        let status = 'green';
        if (rand > 0.95) status = 'red';
        else if (rand > 0.85) status = 'yellow';
        days.push(status);
    }
    return days;
  }, [patient.id]);

  return (
    <div className="bg-[#f1f5f9] min-h-full font-sans w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      {/* Blue Header like Figma */}
      <div className="bg-[#0ea5e9] px-6 py-4 pr-12 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative">
        <h1 className="text-xl md:text-2xl font-semibold">Relatório Médico</h1>
        
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 md:gap-3 md:pr-4">
            {onConcludeAppointment && (
              <Button onClick={() => {
                onConcludeAppointment();
                toast.success('Consulta marcada como realizada!');
              }} className="gap-2 bg-white/20 hover:bg-white/30 text-white rounded-full">
                <CheckCircle className="w-4 h-4" />
                Concluir Consulta
              </Button>
            )}

            <Button variant="secondary" onClick={handleGenerateReport} className="gap-2 bg-white text-[#0ea5e9] hover:bg-white/90 rounded-full">
              <FileText className="w-4 h-4" />
              Gerar Relatório
            </Button>

            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} className="gap-2 border-white text-white hover:bg-white/10 rounded-full bg-transparent">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2 bg-white text-[#0ea5e9] hover:bg-white/90 rounded-full">
                  <Save className="w-4 h-4" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-white/20 hover:bg-white/30 text-white rounded-full border-transparent border">
                <Edit className="w-4 h-4" />
                Editar Ficha
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        
        {/* Top Section: Timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consultations Timeline (Renamed to Médicos based on Figma) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#0ea5e9]" /> Médicos e Consultas:
            </h3>
            
            <div className="relative flex-1 p-2">
               {/* Timeline track */}
               <div className="absolute left-[54px] top-6 bottom-2 w-0.5 bg-slate-200"></div>

               <div className="space-y-6">
                 {editedPatient.consultationHistory && editedPatient.consultationHistory.length > 0 ? (
                   editedPatient.consultationHistory.map((consultation: any, index: number) => (
                     <div key={index} className="flex items-start gap-4 relative z-10 w-full group">
                        <div className="w-10 text-right text-slate-800 text-sm font-medium pt-0.5">
                          {consultation.date.substring(0, 4)}
                        </div>
                        <div className="w-4 h-4 rounded-full bg-[#0ea5e9] shrink-0 mt-1.5 ring-4 ring-white shadow-sm"></div>
                        <div className="flex-1 pb-2">
                           <div className="flex justify-between items-start">
                             <p className="text-slate-800 text-sm font-semibold">Dr(a). {consultation.doctorName}</p>
                             <span className="text-[10px] text-muted-foreground">{format(parseISO(consultation.date), 'dd/MM/yyyy')} {consultation.time}</span>
                           </div>
                           <p className="text-xs text-slate-500 leading-tight mt-1 whitespace-pre-wrap">{consultation.diagnosis}</p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="flex items-start gap-4 relative z-10 w-full">
                      <div className="w-10 text-right text-slate-800 text-sm pt-0.5">{format(new Date(), 'yyyy')}</div>
                      <div className="w-4 h-4 rounded-full bg-slate-300 shrink-0 mt-1.5 ring-4 ring-white"></div>
                      <div className="flex-1 pb-2">
                         <p className="text-slate-500 text-xs italic">Nenhum histórico de médicos disponível.</p>
                      </div>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Problemas Hereditários e Médicos */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#0ea5e9]" /> Histórico Clínico
            </h3>
            
            <h4 className="text-slate-800 text-sm font-medium mb-3">Problemas Hereditários:</h4>
            <div className="relative mb-6 pb-2 min-h-24">
              <div className="absolute left-[9px] top-4 bottom-2 w-0.5 bg-slate-200"></div>
              <div className="space-y-4">
                {editedPatient.heredity?.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 relative z-10 w-full group">
                     <div className="w-3 h-3 rounded-full bg-[#0ea5e9] ml-1 shrink-0 shadow-sm ring-2 ring-white"></div>
                     <p className="text-xs text-slate-700 font-medium flex-1">{item}</p>
                     {isEditing && <button onClick={() => removeItem('heredity', i)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>}
                  </div>
                ))}
                
                {(!editedPatient.heredity || editedPatient.heredity.length === 0) && !isEditing && (
                  <div className="flex items-center gap-4 relative z-10 w-full">
                     <div className="w-3 h-3 rounded-full bg-slate-300 ml-1 shrink-0 ring-2 ring-white"></div>
                     <p className="text-xs text-slate-500 italic">Não registrado</p>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="flex gap-2 mt-4 pl-8">
                  <Input value={newHeredity} onChange={e => setNewHeredity(e.target.value)} placeholder="Nova hereditariedade..." className="h-8 text-xs flex-1 rounded-md border-slate-300 bg-white" />
                  <Button size="sm" onClick={() => addItem('heredity', newHeredity, setNewHeredity)} className="h-8 px-3 rounded-md text-xs bg-[#0ea5e9] text-white">Adicionar</Button>
                </div>
              )}
            </div>

            <h4 className="text-slate-800 text-sm font-medium mb-3">Problemas Médicos / Doenças:</h4>
            <div className="relative mb-6 pb-2 min-h-24">
              <div className="absolute left-[9px] top-4 bottom-2 w-0.5 bg-slate-200"></div>
              <div className="space-y-4">
                {editedPatient.allergies?.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 relative z-10 w-full group">
                     <div className="w-3 h-3 rounded-full bg-[#0ea5e9] ml-1 shrink-0 shadow-sm ring-2 ring-white"></div>
                     <p className="text-xs text-slate-700 font-medium flex-1">{item}</p>
                     {isEditing && <button onClick={() => removeItem('allergies', i)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>}
                  </div>
                ))}
                
                {(!editedPatient.allergies || editedPatient.allergies.length === 0) && !isEditing && (
                  <div className="flex items-center gap-4 relative z-10 w-full">
                     <div className="w-3 h-3 rounded-full bg-slate-300 ml-1 shrink-0 ring-2 ring-white"></div>
                     <p className="text-xs text-slate-500 italic">Não registrado</p>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="flex gap-2 mt-4 pl-8">
                  <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Novo problema médico..." className="h-8 text-xs flex-1 rounded-md border-slate-300 bg-white" />
                  <Button size="sm" onClick={() => addItem('allergies', newAllergy, setNewAllergy)} className="h-8 px-3 rounded-md text-xs bg-[#0ea5e9] text-white">Adicionar</Button>
                </div>
              )}
            </div>
            
            <h4 className="text-slate-800 text-sm font-medium mb-3 mt-auto">Medicamentos em Uso:</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedPatient.medications?.map((item: string, i: number) => (
                <span key={i} className="bg-sky-100 text-[#0ea5e9] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                  {item}
                  {isEditing && <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => removeItem('medications', i)} />}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input value={newMedication} onChange={e => setNewMedication(e.target.value)} placeholder="Novo medicamento..." className="h-8 text-xs flex-1 rounded-md border-slate-300 bg-white" />
                <Button size="sm" onClick={() => addItem('medications', newMedication, setNewMedication)} className="h-8 px-3 rounded-md text-xs bg-[#0ea5e9] text-white">Adicionar</Button>
              </div>
            )}
            
          </div>
        </div>

        {/* Middle Section Form & Photo */}
        <div className="flex flex-col-reverse md:flex-row gap-6">
           {/* Identificação e Dados */}
           <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
             <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2">
                <UserIconLucide className="w-5 h-5 text-[#0ea5e9]" /> Identificação do Paciente
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
               <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">Número do Prontuário:</label>
                  {isEditing ? (
                    <Input value={editedPatient.prontuario} onChange={e => setEditedPatient({...editedPatient, prontuario: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" />
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-[#0ea5e9] bg-white flex items-center text-xs text-sky-600 font-medium tracking-widest">{editedPatient.prontuario}</div>
                  )}
               </div>
               <div className="flex items-end gap-3 flex-wrap sm:flex-nowrap">
                 <div className="flex-1 min-w-[140px]">
                   <label className="text-[13px] font-medium text-slate-700 block mb-1">Data de Abertura:</label>
                   {isEditing ? (
                     <Input value={editedPatient.dataAbertura} onChange={e => setEditedPatient({...editedPatient, dataAbertura: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" />
                   ) : (
                     <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-700 bg-white">{editedPatient.dataAbertura}</div>
                   )}
                 </div>
                 <button onClick={() => setIsMedicationCalendarOpen(true)} className="h-9 px-4 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-md flex items-center justify-center gap-2 text-[12px] whitespace-nowrap transition-colors shadow-sm shrink-0 font-medium">
                   Calendário de Medicação <CalendarIcon2 className="w-4 h-4 ml-1" />
                 </button>
               </div>

               <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">Nome Completo:</label>
                  {isEditing ? (
                    <Input value={editedPatient.nome} onChange={e => setEditedPatient({...editedPatient, nome: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9] font-medium" />
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 font-medium bg-white">{editedPatient.nome}</div>
                  )}
               </div>

               <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Data de Nascimento:</label>
                 {isEditing ? (
                    <Input value={editedPatient.dataNascimento || '13/10/1985'} onChange={e => setEditedPatient({...editedPatient, dataNascimento: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" />
                 ) : (
                    <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 bg-white">{editedPatient.dataNascimento || '13/10/1985'}</div>
                 )}
               </div>
               
               <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Sexo:</label>
                 <div className="flex items-center gap-4 h-9">
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="sexo" checked={editedPatient.sexo === 'Masculino'} onChange={() => isEditing && setEditedPatient({...editedPatient, sexo: 'Masculino'})} disabled={!isEditing} className="w-[14px] h-[14px] accent-[#0ea5e9] rounded-sm" /> Masculino
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                      <input type="radio" name="sexo" checked={editedPatient.sexo === 'Feminino'} onChange={() => isEditing && setEditedPatient({...editedPatient, sexo: 'Feminino'})} disabled={!isEditing} className="w-[14px] h-[14px] accent-[#0ea5e9] rounded-sm" /> Feminino
                    </label>
                 </div>
               </div>

               <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">Escolaridade:</label>
                  {isEditing ? (
                    <select value={editedPatient.escolaridade} onChange={e => setEditedPatient({...editedPatient, escolaridade: e.target.value})} className="w-full h-9 px-3 border border-slate-300 rounded-md text-xs text-slate-800 font-medium bg-white outline-none focus:ring-1 focus:ring-[#0ea5e9]">
                       <option>Ensino Superior Completo</option>
                       <option>Ensino Médio Completo</option>
                       <option>Ensino Fundamental</option>
                    </select>
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 font-medium bg-white">{editedPatient.escolaridade}</div>
                  )}
               </div>
               <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">Ocupação:</label>
                  {isEditing ? (
                    <Input value={editedPatient.ocupacao} onChange={e => setEditedPatient({...editedPatient, ocupacao: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" />
                  ) : (
                    <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 bg-white">{editedPatient.ocupacao}</div>
                  )}
               </div>

             </div>

           </div>

           {/* Photo Section */}
           <div className="w-full md:w-[300px] shrink-0 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-start">
              <div className="w-full bg-slate-100 rounded overflow-hidden flex items-center justify-center relative aspect-[3/4] mb-4 border border-slate-200 shadow-sm">
               {editedPatient.photo ? (
                 <img src={editedPatient.photo} alt={editedPatient.nome} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 bg-slate-50">
                    <UserIconLucide className="w-24 h-24 mb-3 opacity-30" />
                    <span className="text-xs font-medium opacity-50">Sem foto de perfil</span>
                 </div>
               )}
               {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="rounded-full shadow-md text-xs h-8 font-medium cursor-pointer">Adicionar Foto</Button>
                  </div>
               )}
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-800 leading-tight">{editedPatient.nome}</h3>
                <p className="text-sm text-slate-600 mt-1">{editedPatient.age} anos</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#0ea5e9] rounded-full text-[10px] font-bold uppercase tracking-wider border border-sky-100">
                  Sangue <span className="text-red-500">{editedPatient.bloodType}</span>
                </div>
              </div>
           </div>
        </div>

        {/* Bottom Section Address & Contact */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mb-6 pb-6 border-b border-slate-100">
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">CEP do endereço:</label>
                 {isEditing ? <Input value={editedPatient.cep} onChange={e => setEditedPatient({...editedPatient, cep: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white font-mono">{editedPatient.cep}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Número da residência:</label>
                 {isEditing ? <Input value={editedPatient.numero} onChange={e => setEditedPatient({...editedPatient, numero: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.numero}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Bairro:</label>
                 {isEditing ? <Input value={editedPatient.bairro} onChange={e => setEditedPatient({...editedPatient, bairro: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.bairro}</div>}
              </div>

              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Rua:</label>
                 {isEditing ? <Input value={editedPatient.rua} onChange={e => setEditedPatient({...editedPatient, rua: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.rua}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Cidade:</label>
                 {isEditing ? <Input value={editedPatient.cidade} onChange={e => setEditedPatient({...editedPatient, cidade: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.cidade}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Complemento:</label>
                 {isEditing ? <Input value={editedPatient.complemento} onChange={e => setEditedPatient({...editedPatient, complemento: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.complemento}</div>}
              </div>

              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Número (Telefone):</label>
                 {isEditing ? <Input value={editedPatient.phone} onChange={e => setEditedPatient({...editedPatient, phone: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white font-mono">{editedPatient.phone}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">E-mail:</label>
                 {isEditing ? <Input value={editedPatient.email} onChange={e => setEditedPatient({...editedPatient, email: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.email}</div>}
              </div>
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-1">Formas de contato do responsável:</label>
                 {isEditing ? <Input value={editedPatient.responsavelContato} onChange={e => setEditedPatient({...editedPatient, responsavelContato: e.target.value})} className="h-9 text-xs border-slate-300 rounded-md bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white">{editedPatient.responsavelContato}</div>}
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="text-[13px] font-medium text-slate-700 block mb-3">Limitação: (Opcional)</label>
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pl-1">
                    {['Cognitiva', 'Locomoção', 'Visão', 'Audição'].map(limit => (
                       <label key={limit} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium">
                         <input type="checkbox" checked={editedPatient.limitacoes.includes(limit)} onChange={() => isEditing && toggleLimitacao(limit)} disabled={!isEditing} className="w-[16px] h-[16px] rounded-sm bg-white border-2 border-slate-400 accent-slate-800 disabled:opacity-80" /> {limit}
                       </label>
                    ))}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-800 font-medium ml-2">Outras:</label>
                      {isEditing ? <Input className="h-9 min-w-[200px] border-[#0ea5e9] rounded-md text-xs bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs min-w-[200px] bg-white text-slate-500">-</div>}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between pt-2">
                 {/* Re-using allergies logic below if needed, or simple string input as per UI element */}
                 <div className="flex-1 max-w-xl">
                   <label className="text-[13px] font-medium text-slate-700 block mb-2">Alergia: (Opcional)</label>
                   {isEditing ? <Input defaultValue="Ex: Dipirona, poeira" className="h-9 text-xs border-slate-300 rounded-md w-full bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs font-medium bg-white text-slate-600">Dipirona, Poeira</div>}
                 </div>
                 
                 <div className="shrink-0 flex items-center gap-4 border border-white px-2 rounded-lg">
                   <span className="text-[13px] font-medium text-slate-800 leading-tight mr-2">Cuidador ou<br/>Responsável:</span>
                   <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium">
                        <input type="radio" checked={editedPatient.temCuidador} onChange={() => isEditing && setEditedPatient({...editedPatient, temCuidador: true})} disabled={!isEditing} className="w-[16px] h-[16px] accent-slate-800" /> Tem
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium">
                        <input type="radio" checked={!editedPatient.temCuidador} onChange={() => isEditing && setEditedPatient({...editedPatient, temCuidador: false})} disabled={!isEditing} className="w-[16px] h-[16px] accent-slate-800" /> Não Tem
                      </label>
                   </div>
                 </div>
              </div>
           </div>

        </div>

        {/* Existing Functional Blocks: File Uploading and Consultation Evolution Note */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#0ea5e9]" /> Arquivos, Receitas e Exames
            </h4>
            {!isReadOnly && (
              <div>
                <Input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline" className="gap-2 cursor-pointer h-9 px-4 text-xs font-medium border-[#0ea5e9] text-[#0ea5e9] hover:bg-sky-50 shadow-sm">
                    <span><Upload className="w-3.5 h-3.5" /> Enviar Arquivo</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {mockFiles.map((file, i) => (
              <div key={i} className="flex justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-slate-800">{file.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{file.date}</span>
              </div>
            ))}
            {mockFiles.length === 0 && <p className="text-slate-500 text-sm py-2">Nenhum arquivo anexado.</p>}
          </div>
        </div>

        {isEditing && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 text-[#0ea5e9]">
              <Edit className="w-5 h-5" /> Adicionar Evolução/Nota Médica
            </h4>
            <textarea
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-300 focus:border-[#0ea5e9] text-sm resize-y focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] mb-4 bg-slate-50/50"
              placeholder="Digite suas anotações para a consulta de hoje..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={() => {
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
                toast.success('Nota de evolução adicionada à linha do tempo.');
              }} className="bg-[#0ea5e9] hover:bg-sky-600 text-white font-medium shadow-sm">
                Salvar Nota na Ficha
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Medication Calendar Modal */}
      <Dialog open={isMedicationCalendarOpen} onOpenChange={setIsMedicationCalendarOpen}>
        <DialogContent className="max-w-md bg-white p-6 md:p-8 rounded-xl border-none shadow-2xl relative [&>button]:hidden sm:[&>button]:block">
          <button onClick={() => setIsMedicationCalendarOpen(false)} className="absolute top-4 right-4 z-50">
            <X className="w-6 h-6 text-slate-400 hover:text-red-500 transition-colors" />
          </button>
          
          <div className="pt-2 w-full pb-2 select-none">
            <h3 className="text-xl font-bold text-center mb-6 text-slate-800">Aderência à Medicação</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setMedicationMonth(prev => prev > 0 ? prev - 1 : 11)} className="p-2 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h4 className="text-[17px] font-bold text-slate-800 capitalize">
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][medicationMonth]} 2025
                    </h4>
                    <button onClick={() => setMedicationMonth(prev => prev < 11 ? prev + 1 : 0)} className="p-2 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-y-3 sm:gap-y-4 gap-x-2 justify-items-center">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-[11px] font-bold text-slate-400 mb-2">{d}</div>
                    ))}

                    {/* Fake offset based on month purely for mockup visuals */}
                    {Array.from({length: (medicationMonth * 2 + 3) % 7}).map((_, i) => <div key={'off'+i} className="w-8 h-8 sm:w-10 sm:h-10"/>)}

                    {medicationGrid.slice(medicationMonth * 30, (medicationMonth + 1) * 30).map((day, i) => (
                        <div 
                          key={i} 
                          title={`Dia ${i+1}`}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-sm flex items-center justify-center text-[10px] sm:text-xs font-bold text-black/30 border border-black/5 ${
                              day === 'green' ? 'bg-[#22c55e]' : day === 'yellow' ? 'bg-[#facc15]' : 'bg-[#ef4444]'
                          }`}
                        >
                           {i+1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-8 mt-10 font-medium text-slate-800 text-sm">
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00ff22] rounded-sm shadow-sm" /> 
                  Tomou todos os remédios.
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#ffbc2c] rounded-sm shadow-sm" /> 
                  Deixou de tomar algum remédio
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#ff0000] rounded-sm shadow-sm" /> 
                  Não tomou nenhum remédio
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRecord;
