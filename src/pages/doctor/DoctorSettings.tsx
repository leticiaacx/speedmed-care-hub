import { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Palette, Save, Calendar, Clock, MapPin, Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser, MEDICO } from '@/contexts/UserContext';
import { toast } from 'sonner';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'availability', label: 'Disponibilidade e Local', icon: Calendar },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'appearance', label: 'Aparência', icon: Palette },
];

// ✅ FUNÇÕES DE LOCALSTORAGE PARA MÉDICO
const DOCTOR_STORAGE_KEY = (doctorId: number) => `doctor_${doctorId}`;

const loadDoctorFromStorage = (doctor: MEDICO | null) => {
  if (!doctor) return null;
  try {
    const stored = localStorage.getItem(DOCTOR_STORAGE_KEY(doctor.id));
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Dados do médico carregados do localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar médico do localStorage:', error);
  }
  return null;
};

const saveDoctorToStorage = (doctor: any) => {
  try {
    localStorage.setItem(DOCTOR_STORAGE_KEY(doctor.id), JSON.stringify(doctor));
    console.log('✅ Dados do médico salvos no localStorage');
  } catch (error) {
    console.error('❌ Erro ao salvar médico no localStorage:', error);
  }
};

// ✅ DISPARA EVENTO CUSTOMIZADO QUANDO DADOS DO MÉDICO MUDAM
const notifyDoctorUpdate = (doctor: any) => {
  window.dispatchEvent(new CustomEvent('doctorUpdated', { detail: doctor }));
};

const DoctorSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();
  const { currentUser, updateDoctorSchedule } = useUser();
  const doctor = currentUser as MEDICO | null;

  // ✅ CARREGAR DADOS DO STORAGE OU USAR PADRÃO
  const [profile, setProfile] = useState(() => {
    const stored = loadDoctorFromStorage(doctor);
    if (stored) {
      return {
        nome: stored.nome || doctor?.nome || '',
        especialidade: stored.especialidade || doctor?.especialidade || '',
        crm: stored.crm || doctor?.crm || '',
        email: stored.email || doctor?.email || '',
        phone: stored.phone || doctor?.phone || '',
      };
    }
    return {
      nome: doctor?.nome || '',
      especialidade: doctor?.especialidade || '',
      crm: doctor?.crm || '',
      email: doctor?.email || '',
      phone: doctor?.phone || '',
    };
  });

  const [availability, setAvailability] = useState<{ location: string; onlineConsultation: boolean }>(() => {
    const stored = loadDoctorFromStorage(doctor);
    if (stored) {
      return {
        location: stored.location || doctor?.location || 'Clínica SpeedMed - Unidade Centro',
        onlineConsultation: stored.onlineConsultation !== undefined ? stored.onlineConsultation : (doctor?.onlineConsultation ?? true)
      };
    }
    return {
      location: doctor?.location || 'Clínica SpeedMed - Unidade Centro',
      onlineConsultation: doctor?.onlineConsultation ?? true
    };
  });

  // Clone schedule for editing
  const [editingSchedule, setEditingSchedule] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>(() => {
    const stored = loadDoctorFromStorage(doctor);
    if (stored?.schedule) {
      return [...stored.schedule];
    }
    return doctor?.schedule || [];
  });

  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  useEffect(() => {
    if (doctor) {
      const stored = loadDoctorFromStorage(doctor);
      if (stored) {
        setProfile({
          nome: stored.nome || doctor.nome,
          especialidade: stored.especialidade || doctor.especialidade,
          crm: stored.crm || doctor.crm,
          email: stored.email || doctor.email,
          phone: stored.phone || doctor.phone,
        });
        setAvailability({
          location: stored.location || doctor.location || 'Clínica SpeedMed - Unidade Centro',
          onlineConsultation: stored.onlineConsultation !== undefined ? stored.onlineConsultation : (doctor.onlineConsultation || true)
        });
        if (stored.schedule) {
          setEditingSchedule([...stored.schedule]);
        }
      } else {
        setProfile({
          nome: doctor.nome,
          especialidade: doctor.especialidade,
          crm: doctor.crm,
          email: doctor.email,
          phone: doctor.phone,
        });
        setAvailability({
          location: doctor.location || 'Clínica SpeedMed - Unidade Centro',
          onlineConsultation: doctor.onlineConsultation || true
        });
        setEditingSchedule([...doctor.schedule]);
      }
    }
  }, [doctor]);

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

  // ✅ SALVAR PERFIL COM NOTIFICAÇÃO
  const handleSaveProfile = () => {
    if (doctor) {
      const updatedDoctor = {
        ...doctor,
        ...profile,
      };
      saveDoctorToStorage(updatedDoctor);
      notifyDoctorUpdate(updatedDoctor);
      toast.success('Perfil atualizado com sucesso!');
    }
  };

  // ✅ SALVAR DISPONIBILIDADE COM NOTIFICAÇÃO
  const handleSaveAvailability = () => {
    if (doctor) {
      const updatedDoctor = {
        ...doctor,
        ...availability,
      };
      saveDoctorToStorage(updatedDoctor);
      notifyDoctorUpdate(updatedDoctor);
      toast.success('Configurações de disponibilidade salvas!');
    }
  };

  const handleSaveSecurity = () => {
    toast.success('Senha atualizada com sucesso!');
  };

  // ✅ SALVAR AGENDA COM NOTIFICAÇÃO
  const handleSaveSchedule = () => {
    if (doctor) {
      const updatedDoctor = {
        ...doctor,
        schedule: editingSchedule,
      };
      saveDoctorToStorage(updatedDoctor);
      notifyDoctorUpdate(updatedDoctor);
      updateDoctorSchedule(doctor.id, editingSchedule);
      toast.success('Agenda atualizada com sucesso!');
    } else {
      toast.error('Erro ao salvar agenda: Doutor não encontrado.');
    }
  };

  const activeContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Editar Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Nome Completo</label><Input value={profile.nome} onChange={e => setProfile(p => ({ ...p, nome: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Especialidade</label><Input value={profile.especialidade} onChange={e => setProfile(p => ({ ...p, especialidade: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">CRM</label><Input value={profile.crm} onChange={e => setProfile(p => ({ ...p, crm: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">E-mail Profissional</label><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Telefone de Contato</label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="pt-4 border-t border-border">
              <Button onClick={handleSaveProfile} className="gap-2"><Save className="w-4 h-4" />Salvar Alterações</Button>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Disponibilidade e Local de Atendimento</h2>

            <div className="space-y-6">
              {/* Local */}
              <div className="p-5 rounded-xl border border-border bg-secondary/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" /> Localidade Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground block mb-1.5">Nome da Clínica / Consultório</label>
                    <Input
                      value={availability.location}
                      onChange={e => setAvailability(a => ({ ...a, location: e.target.value }))}
                      placeholder="Ex: Consultório Particular - Centro"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg border border-border bg-background mt-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Atendimento Online (Telemedicina)</p>
                      <p className="text-xs text-muted-foreground">Disponibilizar link de vídeo para os pacientes selecionarem</p>
                    </div>
                    <Switch
                      checked={availability.onlineConsultation}
                      onCheckedChange={(c) => setAvailability(a => ({ ...a, onlineConsultation: c }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border bg-secondary/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" /> Grade de Horários
                </h3>

                <div className="space-y-4">
                  {editingSchedule.length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground text-sm">Nenhum horário definido.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editingSchedule.map((sch, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-background border border-border rounded-xl">
                          <select
                            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                            value={sch.dayOfWeek}
                            onChange={(e) => updateScheduleRow(i, 'dayOfWeek', parseInt(e.target.value))}
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={idx}>{day}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              className="w-32"
                              value={sch.startTime}
                              onChange={(e) => updateScheduleRow(i, 'startTime', e.target.value)}
                            />
                            <span className="text-muted-foreground text-sm">até</span>
                            <Input
                              type="time"
                              className="w-32"
                              value={sch.endTime}
                              onChange={(e) => updateScheduleRow(i, 'endTime', e.target.value)}
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeScheduleRow(i)} className="text-destructive hover:bg-destructive/10 ml-auto w-full md:w-auto mt-2 md:mt-0">
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button variant="outline" onClick={addScheduleRow} className="gap-2 w-full md:w-auto">
                      <Plus className="w-4 h-4" /> Adicionar Período
                    </Button>
                  </div>
                </div>
              </div>

            </div>
            <div className="pt-4 border-t border-border flex flex-wrap gap-3">
              <Button onClick={handleSaveAvailability} variant="secondary" className="gap-2">
                <Save className="w-4 h-4" /> Salvar Local
              </Button>
              <Button onClick={handleSaveSchedule} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Save className="w-4 h-4" /> Salvar Agenda de Horários
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 max-w-md">
            <h2 className="text-xl font-bold text-foreground">Segurança</h2>
            <div className="space-y-4">
              <div><label className="text-sm font-semibold text-foreground block mb-1.5">Senha atual</label><Input type="password" placeholder="••••••••" /></div>
              <div><label className="text-sm font-semibold text-foreground block mb-1.5">Nova senha</label><Input type="password" placeholder="••••••••" /></div>
              <div><label className="text-sm font-semibold text-foreground block mb-1.5">Confirmar nova senha</label><Input type="password" placeholder="••••••••" /></div>
            </div>
            <div className="pt-4 mt-2 border-t border-border">
              <Button onClick={handleSaveSecurity} className="gap-2"><Shield className="w-4 h-4" />Alterar Senha</Button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6 max-w-md">
            <h2 className="text-xl font-bold text-foreground">Aparência do Sistema</h2>
            <div className="p-5 rounded-xl border border-border flex items-center justify-between bg-card hover:border-primary/50 transition-colors">
              <div>
                <p className="text-base font-semibold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Modo Escuro</p>
                <p className="text-sm text-muted-foreground mt-1">Alternar interface para cores escuras</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Configurações Gerais</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto pb-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 speedmed-card min-h-[500px]">
          {activeContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;