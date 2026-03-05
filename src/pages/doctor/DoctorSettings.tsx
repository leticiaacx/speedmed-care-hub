import { useState } from 'react';
import { User, Bell, Shield, Globe, Palette, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { mockDoctor } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'language', label: 'Idioma e Região', icon: Globe },
  { id: 'appearance', label: 'Aparência', icon: Palette },
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

  const handleSave = () => {
    toast({ title: 'Configurações salvas', description: 'Suas alterações foram salvas com sucesso.' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 speedmed-card">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Editar Perfil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground">Nome</label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Especialidade</label><Input value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">CRM</label><Input value={profile.crm} onChange={e => setProfile(p => ({ ...p, crm: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">E-mail</label><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Telefone</label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Salvar Alterações</Button>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
              {[
                { label: 'Novos agendamentos', desc: 'Receber notificação quando um paciente agendar consulta' },
                { label: 'Confirmações', desc: 'Receber notificação quando um agendamento for confirmado' },
                { label: 'Cancelamentos', desc: 'Receber notificação quando um agendamento for cancelado' },
                { label: 'Lembretes', desc: 'Receber lembretes 2 dias antes das consultas' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          )}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-foreground">Senha atual</label><Input type="password" placeholder="••••••••" /></div>
                <div><label className="text-sm font-medium text-foreground">Nova senha</label><Input type="password" placeholder="••••••••" /></div>
                <div><label className="text-sm font-medium text-foreground">Confirmar nova senha</label><Input type="password" placeholder="••••••••" /></div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Alterar Senha</Button>
            </div>
          )}
          {activeTab === 'language' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Idioma e Região</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Idioma</label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fuso horário</label>
                  <Select defaultValue="america-sp">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-sp">América/São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="america-mns">América/Manaus (GMT-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Salvar</Button>
            </div>
          )}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
              <div className="flex items-center justify-between py-3">
                <div><p className="text-sm font-medium text-foreground">Modo Escuro</p><p className="text-xs text-muted-foreground">Alternar entre tema claro e escuro</p></div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
