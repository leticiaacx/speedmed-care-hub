import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Pill, Edit, Save, X, FileText, CheckCircle, ChevronLeft, ChevronRight, Upload, User as UserIconLucide, Calendar as CalendarIcon2 } from 'lucide-react';
import { USUARIO } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useMedication, DayStatus } from '@/contexts/MedicationContext';

interface PatientRecordProps {
  patient: USUARIO;
  onConcludeAppointment?: () => void;
}

// ✅ FUNÇÕES DE LOCALSTORAGE
const STORAGE_KEY = (patientId: number) => `patient_${patientId}`;

const loadPatientFromStorage = (patientData: any) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(patientData.id));
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Dados carregados do localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar do localStorage:', error);
  }
  return null;
};

const savePatientToStorage = (patientData: any) => {
  try {
    localStorage.setItem(STORAGE_KEY(patientData.id), JSON.stringify(patientData));
    console.log('✅ Dados salvos no localStorage');
  } catch (error) {
    console.error('❌ Erro ao salvar no localStorage:', error);
  }
};

const PatientRecord = ({ patient, onConcludeAppointment }: PatientRecordProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMedicationCalendarOpen, setIsMedicationCalendarOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // ✅ REF PARA UPLOAD DE FOTO
  const photoInputRef = useRef<HTMLInputElement>(null);

  const defaultPatientData = {
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
    photo: null,
  };

  // ✅ CARREGAR DO STORAGE OU USAR PADRÃO
  const [editedPatient, setEditedPatient] = useState<any>(() => {
    const stored = loadPatientFromStorage(patient);
    return stored || defaultPatientData;
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newHeredity, setNewHeredity] = useState('');
  const [newNote, setNewNote] = useState('');
  const [mockFiles, setMockFiles] = useState<{ name: string, date: string }[]>([
    { name: 'Exame de Sangue.pdf', date: '10/02/2026' },
  ]);

  const { saveDoctorReport } = useAppointments();
  const { userRole } = useUser();
  const { getStatus, setDayStatus } = useMedication();
  const navigate = useNavigate();

  const isReadOnly = userRole === 'admin';
  const today = new Date();

  const statusColor: Record<DayStatus, string> = {
    all: 'bg-green-500',
    partial: 'bg-yellow-400',
    none: 'bg-red-500',
    'no-medication': 'bg-slate-200',
  };

  const statusLabel: Record<DayStatus, string> = {
    all: 'Tomou todos',
    partial: 'Tomou parcial',
    none: 'Não tomou',
    'no-medication': 'Sem medicação',
  };

  const cycleStatus = (current: DayStatus): DayStatus => {
    const cycle: DayStatus[] = ['all', 'partial', 'none', 'no-medication'];
    return cycle[(cycle.indexOf(current) + 1) % cycle.length];
  };

  // ✅ FUNÇÃO PARA LIDAR COM UPLOAD DE FOTO
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedPatient = {
          ...editedPatient,
          photo: reader.result as string
        };
        setEditedPatient(updatedPatient);
        savePatientToStorage(updatedPatient); // ✅ SALVA NO STORAGE
        toast.success('Foto atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const handleGenerateReport = () => {
    let reportContent = `RELATÓRIO MÉDICO - ${patient.nome}\n`;
    reportContent += `Data: ${format(new Date(), 'dd/MM/yyyy')}\n\n`;
    reportContent += `TRATAMENTO:\n[Descreva o tratamento aqui]\n\nDOENÇAS DO PACIENTE:\n[Descreva as doenças preexistentes ou atuais]\n\nDETALHES IMPORTANTES:\n[Adicione observações adicionais]`;
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

  // ✅ SALVAR DADOS NO STORAGE AO CLICAR EM SALVAR
  const handleSave = () => {
    savePatientToStorage(editedPatient);
    setIsEditing(false);
    toast.success('Ficha do paciente atualizada e salva com sucesso!');
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
      photo: null,
    });
    setIsEditing(false);
    setNewAllergy('');
    setNewMedication('');
    setNewHeredity('');
  };

  const addItem = (field: 'allergies' | 'medications' | 'heredity', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const updatedPatient = { ...editedPatient, [field]: [...(editedPatient[field] || []), value.trim()] };
    setEditedPatient(updatedPatient);
    savePatientToStorage(updatedPatient); // ✅ SALVA NO STORAGE
    setter('');
  };

  const removeItem = (field: 'allergies' | 'medications' | 'heredity', index: number) => {
    const newList = [...(editedPatient[field] || [])];
    newList.splice(index, 1);
    const updatedPatient = { ...editedPatient, [field]: newList };
    setEditedPatient(updatedPatient);
    savePatientToStorage(updatedPatient); // ✅ SALVA NO STORAGE
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMockFiles([...mockFiles, { name: file.name, date: format(new Date(), 'dd/MM/yyyy') }]);
      toast.success(`Arquivo ${file.name} enviado com sucesso!`);
    }
  };

  const toggleLimitacao = (limitacao: string) => {
    setEditedPatient((prev: any) => {
      const exists = prev.limitacoes.includes(limitacao);
      const updated = exists
        ? { ...prev, limitacoes: prev.limitacoes.filter((l: string) => l !== limitacao) }
        : { ...prev, limitacoes: [...prev.limitacoes, limitacao] };
      savePatientToStorage(updated); // ✅ SALVA NO STORAGE
      return updated;
    });
  };

  // Calendário anual — gera grade de 12 meses
  const buildYearGrid = () => {
    return Array.from({ length: 12 }, (_, month) => {
      const daysInMonth = new Date(calYear, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(calYear, month, 1).getDay();
      const offset = (firstDayOfWeek + 6) % 7; // Seg=0
      const totalCells = offset + daysInMonth;
      const cols = Math.ceil(totalCells / 7);
      const grid: (number | null)[][] = Array.from({ length: 7 }, () => Array(cols).fill(null));
      for (let day = 1; day <= daysInMonth; day++) {
        const pos = offset + day - 1;
        const col = Math.floor(pos / 7);
        const row = pos % 7;
        grid[row][col] = day;
      }
      return { month, grid };
    });
  };

  return (
    <div className="bg-[#f1f5f9] min-h-full font-sans w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-[#0ea5e9] px-6 py-4 pr-12 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative">
        <h1 className="text-xl md:text-2xl font-semibold">Relatório Médico</h1>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 md:gap-3 md:pr-4">
            {onConcludeAppointment && (
              <Button onClick={() => { onConcludeAppointment(); toast.success('Consulta marcada como realizada!'); }} className="gap-2 bg-white/20 hover:bg-white/30 text-white rounded-full">
                <CheckCircle className="w-4 h-4" /> Concluir Consulta
              </Button>
            )}
            <Button variant="secondary" onClick={handleGenerateReport} className="gap-2 bg-white text-[#0ea5e9] hover:bg-white/90 rounded-full">
              <FileText className="w-4 h-4" /> Gerar Relatório
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} className="gap-2 border-white text-white hover:bg-white/10 rounded-full bg-transparent">
                  <X className="w-4 h-4" /> Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2 bg-white text-[#0ea5e9] hover:bg-white/90 rounded-full">
                  <Save className="w-4 h-4" /> Salvar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-white/20 hover:bg-white/30 text-white rounded-full border-transparent border">
                <Edit className="w-4 h-4" /> Editar Ficha
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">

        {/* Timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#0ea5e9]" /> Médicos e Consultas:
            </h3>
            <div className="relative flex-1 p-2">
              <div className="absolute left-[54px] top-6 bottom-2 w-0.5 bg-slate-200"></div>
              <div className="space-y-6">
                {editedPatient.consultationHistory && editedPatient.consultationHistory.length > 0 ? (
                  editedPatient.consultationHistory.map((consultation: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 relative z-10 w-full group">
                      <div className="w-10 text-right text-slate-800 text-sm font-medium pt-0.5">{consultation.date.substring(0, 4)}</div>
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
                    <div className="flex-1 pb-2"><p className="text-slate-500 text-xs italic">Nenhum histórico disponível.</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>

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

        {/* Identificação + Foto */}
        <div className="flex flex-col-reverse md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2">
              <UserIconLucide className="w-5 h-5 text-[#0ea5e9]" /> Identificação do Paciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Número do Prontuário:</label>
                {isEditing ? <Input value={editedPatient.prontuario} onChange={e => setEditedPatient({ ...editedPatient, prontuario: e.target.value })} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] bg-white flex items-center text-xs text-sky-600 font-medium tracking-widest">{editedPatient.prontuario}</div>}
              </div>
              <div className="flex items-end gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1">Data de Abertura:</label>
                  {isEditing ? <Input value={editedPatient.dataAbertura} onChange={e => setEditedPatient({ ...editedPatient, dataAbertura: e.target.value })} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-700 bg-white">{editedPatient.dataAbertura}</div>}
                </div>
                <button onClick={() => setIsMedicationCalendarOpen(true)} className="h-9 px-4 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-md flex items-center justify-center gap-2 text-[12px] whitespace-nowrap transition-colors shadow-sm shrink-0 font-medium">
                  Calendário de Medicação <CalendarIcon2 className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Nome Completo:</label>
                {isEditing ? <Input value={editedPatient.nome} onChange={e => setEditedPatient({ ...editedPatient, nome: e.target.value })} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9] font-medium" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 font-medium bg-white">{editedPatient.nome}</div>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Data de Nascimento:</label>
                {isEditing ? <Input value={editedPatient.dataNascimento || '13/10/1985'} onChange={e => setEditedPatient({ ...editedPatient, dataNascimento: e.target.value })} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 bg-white">{editedPatient.dataNascimento || '13/10/1985'}</div>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Sexo:</label>
                <div className="flex items-center gap-4 h-9">
                  <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                    <input type="radio" name="sexo" checked={editedPatient.sexo === 'Masculino'} onChange={() => isEditing && setEditedPatient({ ...editedPatient, sexo: 'Masculino' })} disabled={!isEditing} className="w-[14px] h-[14px] accent-[#0ea5e9]" /> Masculino
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                    <input type="radio" name="sexo" checked={editedPatient.sexo === 'Feminino'} onChange={() => isEditing && setEditedPatient({ ...editedPatient, sexo: 'Feminino' })} disabled={!isEditing} className="w-[14px] h-[14px] accent-[#0ea5e9]" /> Feminino
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Escolaridade:</label>
                {isEditing ? (
                  <select value={editedPatient.escolaridade} onChange={e => setEditedPatient({ ...editedPatient, escolaridade: e.target.value })} className="w-full h-9 px-3 border border-slate-300 rounded-md text-xs text-slate-800 font-medium bg-white outline-none focus:ring-1 focus:ring-[#0ea5e9]">
                    <option>Ensino Superior Completo</option>
                    <option>Ensino Médio Completo</option>
                    <option>Ensino Fundamental</option>
                  </select>
                ) : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 font-medium bg-white">{editedPatient.escolaridade}</div>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">Ocupação:</label>
                {isEditing ? <Input value={editedPatient.ocupacao} onChange={e => setEditedPatient({ ...editedPatient, ocupacao: e.target.value })} className="h-9 text-xs border-slate-300 rounded-md bg-white focus-visible:ring-[#0ea5e9]" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-800 bg-white">{editedPatient.ocupacao}</div>}
              </div>
            </div>
          </div>

          {/* CARD DE FOTO COM UPLOAD */}
          <div className="w-full md:w-[300px] shrink-0 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-start">
            {/* INPUT HIDDEN PARA ARQUIVO */}
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />

            {/* CONTAINER DE FOTO */}
            <div 
              className="w-full bg-slate-100 rounded overflow-hidden flex items-center justify-center relative aspect-[3/4] mb-4 border border-slate-200 shadow-sm cursor-pointer group"
              onClick={() => isEditing && photoInputRef.current?.click()}
            >
              {editedPatient.photo ? (
                <img src={editedPatient.photo} alt={editedPatient.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 bg-slate-50">
                  <UserIconLucide className="w-24 h-24 mb-3 opacity-30" />
                  <span className="text-xs font-medium opacity-50">Sem foto de perfil</span>
                </div>
              )}

              {/* OVERLAY AO PASSAR O MOUSE (MODO EDIÇÃO) */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      photoInputRef.current?.click();
                    }}
                    variant="secondary" 
                    size="sm" 
                    className="rounded-full shadow-md text-xs h-8 font-medium cursor-pointer"
                  >
                    Adicionar Foto
                  </Button>
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

        {/* Endereço e Contato */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mb-6 pb-6 border-b border-slate-100">
            {[
              { label: 'CEP do endereço:', key: 'cep', mono: true },
              { label: 'Número da residência:', key: 'numero' },
              { label: 'Bairro:', key: 'bairro' },
              { label: 'Rua:', key: 'rua' },
              { label: 'Cidade:', key: 'cidade' },
              { label: 'Complemento:', key: 'complemento' },
              { label: 'Número (Telefone):', key: 'phone', mono: true },
              { label: 'E-mail:', key: 'email' },
              { label: 'Formas de contato do responsável:', key: 'responsavelContato' },
            ].map(({ label, key, mono }) => (
              <div key={key}>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">{label}</label>
                {isEditing
                  ? <Input value={editedPatient[key]} onChange={e => { const updated = { ...editedPatient, [key]: e.target.value }; setEditedPatient(updated); }} className="h-9 text-xs border-slate-300 rounded-md bg-white" />
                  : <div className={`h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs text-slate-600 bg-white ${mono ? 'font-mono' : ''}`}>{editedPatient[key]}</div>
                }
              </div>
            ))}
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
              <div className="flex-1 max-w-xl">
                <label className="text-[13px] font-medium text-slate-700 block mb-2">Alergia: (Opcional)</label>
                {isEditing ? <Input defaultValue="Ex: Dipirona, poeira" className="h-9 text-xs border-slate-300 rounded-md w-full bg-white" /> : <div className="h-9 px-3 rounded-md border border-[#0ea5e9] flex items-center text-xs font-medium bg-white text-slate-600">Dipirona, Poeira</div>}
              </div>
              <div className="shrink-0 flex items-center gap-4 border border-white px-2 rounded-lg">
                <span className="text-[13px] font-medium text-slate-800 leading-tight mr-2">Cuidador ou<br />Responsável:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium">
                    <input type="radio" checked={editedPatient.temCuidador} onChange={() => isEditing && setEditedPatient({ ...editedPatient, temCuidador: true })} disabled={!isEditing} className="w-[16px] h-[16px] accent-slate-800" /> Tem
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium">
                    <input type="radio" checked={!editedPatient.temCuidador} onChange={() => isEditing && setEditedPatient({ ...editedPatient, temCuidador: false })} disabled={!isEditing} className="w-[16px] h-[16px] accent-slate-800" /> Não Tem
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arquivos */}
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
                  <div className="w-9 h-9 rounded bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9]"><FileText className="w-4 h-4" /></div>
                  <span className="font-medium text-sm text-slate-800">{file.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{file.date}</span>
              </div>
            ))}
            {mockFiles.length === 0 && <p className="text-slate-500 text-sm py-2">Nenhum arquivo anexado.</p>}
          </div>
        </div>

        {/* Nota médica */}
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
                const updated = {
                  ...editedPatient,
                  consultationHistory: [
                    { date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), type: 'Consulta', specialty: 'Clínico Geral', doctorName: 'Você', diagnosis: newNote },
                    ...(editedPatient.consultationHistory || [])
                  ]
                };
                setEditedPatient(updated);
                savePatientToStorage(updated); // ✅ SALVA NO STORAGE
                setNewNote('');
                toast.success('Nota de evolução adicionada à linha do tempo.');
              }} className="bg-[#0ea5e9] hover:bg-sky-600 text-white font-medium shadow-sm">
                Salvar Nota na Ficha
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Calendário de Medicação */}
      <Dialog open={isMedicationCalendarOpen} onOpenChange={setIsMedicationCalendarOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] bg-white rounded-xl border-none shadow-2xl p-0 overflow-hidden flex flex-col [&>button]:hidden">

          {/* Header fixo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Aderência à Medicação</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => setCalYear(y => y - 1)} className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-700 w-10 text-center">{calYear}</span>
              <button onClick={() => setCalYear(y => y + 1)} className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => setIsMedicationCalendarOpen(false)} className="ml-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Corpo com scroll */}
          <div className="flex-1 overflow-auto px-6 py-4 select-none">

            {/* Grade anual com scroll horizontal */}
            <div className="overflow-x-auto">
              <div className="inline-flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>

                {/* Coluna de labels dos dias */}
                <div className="flex flex-col pt-6 gap-0">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                    <div key={i} className="h-5 w-4 flex items-center justify-center text-[9px] text-slate-400 font-medium">{d}</div>
                  ))}
                </div>

                {/* 12 meses */}
                {buildYearGrid().map(({ month, grid }) => (
                  <div key={month} className="flex flex-col">
                    {/* Label mês */}
                    <div className="text-[11px] font-semibold text-slate-500 text-center mb-1 h-5">
                      {monthNames[month].substring(0, 3)}.
                    </div>
                    {/* 7 linhas (dias da semana) */}
                    {grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-0.5">
                        {row.map((day, colIdx) => {
                          if (day === null) return <div key={colIdx} className="w-5 h-5" />;
                          const dateStr = `${calYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isFutureDay = new Date(calYear, month, day) > today;
                          const status = isFutureDay ? 'no-medication' : getStatus(patient.id, dateStr);
                          const colorMap: Record<DayStatus, string> = {
                            all: 'bg-green-500',
                            partial: 'bg-yellow-400',
                            none: 'bg-red-500',
                            'no-medication': 'bg-slate-200',
                          };
                          return (
                            <button
                              key={colIdx}
                              title={`${day}/${month + 1} — ${statusLabel[status]}`}
                              disabled={isFutureDay}
                              onClick={() => !isFutureDay && setDayStatus(patient.id, dateStr, cycleStatus(status))}
                              className={`w-5 h-5 rounded-full transition-transform ${colorMap[status]} ${isFutureDay ? 'opacity-30 cursor-default' : 'hover:scale-110 cursor-pointer'}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Tomou todos os remédios</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400" /> Deixou de tomar algum remédio</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Não tomou nenhum remédio</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200" /> Sem medicação</div>
              <p className="text-slate-400 text-[10px] w-full">Clique em um dia passado para alternar o status.</p>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRecord;