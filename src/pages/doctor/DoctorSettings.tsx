import { useState } from 'react';
import { User, Bell, Shield, Globe, Palette, Save, Calendar, Clock, MapPin, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { mockDoctor } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'availability', label: 'Disponibilidade e Local', icon: Calendar },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'appearance', label: 'Aparência', icon: Palette },
];

const daysOfWeek = [
  { id: 'mon', label: 'Segunda-feira' },
  { id: 'tue', label: 'Terça-feira' },
  { id: 'wed', label: 'Quarta-feira' },
  { id: 'thu', label: 'Quinta-feira' },
  { id: 'fri', label: 'Sexta-feira' },
  { id: 'sat', label: 'Sábado' },
  { id: 'sun', label: 'Domingo' },
];

const DoctorSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: mockDoctor.name,
    specialty: mockDoctor.specialty,
    crm: mockDoctor.crm,
    email: 'dr.felipe@speedmed.com',
    phone: '(11) 99999-9999',
  });

  const [availability, setAvailability] = useState({
    activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    startTime: '08:00',
    endTime: '18:00',
    interval: '30', // minutes
    location: 'Clínica SpeedMed - Unidade Centro',
    onlineConsultation: true
  });

  const toggleDay = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(dayId)
        ? prev.activeDays.filter(d => d !== dayId)
        : [...prev.activeDays, dayId]
    }));
  };

  const handleSave = () => {
    toast({ title: 'Configurações salvas', description: 'Suas alterações foram salvas com sucesso.' });
  };

  const activeContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Editar Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Nome Completo</label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Especialidade</label><Input value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">CRM</label><Input value={profile.crm} onChange={e => setProfile(p => ({ ...p, crm: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">E-mail Profissional</label><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="text-sm font-semibold text-foreground mb-1.5 block">Telefone de Contato</label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="pt-4 border-t border-border">
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Salvar Alterações</Button>
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

              {/* Dias e Horários */}
              <div className="p-5 rounded-xl border border-border bg-secondary/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" /> Grade de Horários
                </h3>

                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground block mb-2">Dias de Atendimento na Semana</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => {
                      const isActive = availability.activeDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isActive
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background text-foreground border-border hover:bg-secondary'
                            }`}
                        >
                          {day.label.split('-')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Horário de Início</label>
                    <Input
                      type="time"
                      value={availability.startTime}
                      onChange={e => setAvailability(a => ({ ...a, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Horário de Término</label>
                    <Input
                      type="time"
                      value={availability.endTime}
                      onChange={e => setAvailability(a => ({ ...a, endTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Duração da Consulta</label>
                    <Select value={availability.interval} onValueChange={v => setAvailability(a => ({ ...a, interval: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Minutos</SelectItem>
                        <SelectItem value="30">30 Minutos</SelectItem>
                        <SelectItem value="45">45 Minutos</SelectItem>
                        <SelectItem value="60">1 Hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            </div>
            <div className="pt-4 border-t border-border">
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Salvar Disponibilidade</Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Notificações</h2>
            <div className="space-y-1">
              {[
                { label: 'Novos agendamentos', desc: 'Receber notificação quando um paciente agendar consulta' },
                { label: 'Confirmações', desc: 'Receber notificação quando um agendamento for confirmado' },
                { label: 'Cancelamentos', desc: 'Receber notificação quando um agendamento for cancelado' },
                { label: 'Lembretes', desc: 'Receber lembretes 2 dias antes das consultas' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-border gap-3">
                  <div><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
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
              <Button onClick={handleSave} className="gap-2"><Shield className="w-4 h-4" />Alterar Senha</Button>
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
