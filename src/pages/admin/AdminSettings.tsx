import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save, 
  Building2, 
  Stethoscope, 
  Lock, 
  Globe, 
  Moon,
  Sun   
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const tabs = [
    { id: 'clinic', label: 'Dados da Clínica', icon: Building2 },
    { id: 'management', label: 'Especialidades', icon: Stethoscope },
    { id: 'security', label: 'Segurança e APIs', icon: Lock },
    { id: 'appearance', label: 'Aparência', icon: Palette },
];

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('clinic');
    const { theme, toggleTheme } = useTheme();
    const { currentUser } = useUser();
    
    const [clinicInfo, setClinicInfo] = useState(() => {
        const stored = localStorage.getItem('admin_clinic_data');
        return stored ? JSON.parse(stored) : {
            name: 'SpeedMed Matriz',
            cnpj: '00.000.000/0001-00',
            email: 'contato@speedmed.com.br',
            phone: '(88) 99999-9999'
        };
    });

    const handleSaveClinic = () => {
        // Salva no LocalStorage
        localStorage.setItem('admin_clinic_data', JSON.stringify(clinicInfo));
        
        // Dispara o evento para a Sidebar ouvir
        window.dispatchEvent(new CustomEvent('adminUpdated', { detail: clinicInfo }));
        
        toast.success('Dados da clínica atualizados!');
    }; 

    const handleSave = (section: string) => {
        toast.success(`Configurações de ${section} atualizadas!`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'clinic':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h2 className="text-xl font-light text-foreground">Informações Institucionais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-light text-muted-foreground mb-1.5 block uppercase tracking-wider">Nome da Unidade</label>
                                <Input value={clinicInfo.name} onChange={e => setClinicInfo({...clinicInfo, name: e.target.value})} className="font-light" />
                            </div>
                            <div>
                                <label className="text-xs font-light text-muted-foreground mb-1.5 block uppercase tracking-wider">CNPJ</label>
                                <Input value={clinicInfo.cnpj} readOnly className="bg-secondary/30 font-light" />
                            </div>
                            <div>
                                <label className="text-xs font-light text-muted-foreground mb-1.5 block uppercase tracking-wider">E-mail Administrativo</label>
                                <Input value={clinicInfo.email} className="font-light" />
                            </div>
                            <div>
                                <label className="text-xs font-light text-muted-foreground mb-1.5 block uppercase tracking-wider">Telefone</label>
                                <Input value={clinicInfo.phone} className="font-light" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <Button onClick={() => handleSave('Clínica')} className="gap-2 font-light bg-primary hover:opacity-90">
                                <Save className="w-4 h-4" /> Salvar Dados da Clínica
                            </Button>
                        </div>
                    </div>
                );

            case 'management':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h2 className="text-xl font-light text-foreground">Gestão de Serviços</h2>
                        <div className="p-5 rounded-xl border border-border bg-secondary/20">
                            <h3 className="text-sm font-light text-foreground mb-4 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-primary" /> Especialidades Ativas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Cardiologia', 'Clínico Geral', 'Pediatria', 'Neurologia', 'Psicologia'].map(esp => (
                                    <span key={esp} className="px-3 py-1 bg-background border border-border rounded-full text-xs font-light text-muted-foreground hover:border-primary transition-colors cursor-default">
                                        {esp}
                                    </span>
                                ))}
                                <button className="px-3 py-1 border border-dashed border-primary/50 text-primary rounded-full text-xs font-light hover:bg-primary/5">
                                    + Adicionar Nova
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                            <div>
                                <p className="text-sm font-light text-foreground">Permitir Agendamento Online</p>
                                <p className="text-[11px] text-muted-foreground">Habilita o portal do paciente para novas consultas</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
                        <h2 className="text-xl font-light text-foreground">Segurança e Integrações</h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-border space-y-4">
                                <p className="text-xs font-medium text-primary uppercase">Autenticação</p>
                                <div>
                                    <label className="text-xs font-light text-muted-foreground block mb-1.5 uppercase">Sua Senha de Admin</label>
                                    <Input type="password" placeholder="••••••••" className="font-light" />
                                </div>
                                <Button onClick={() => handleSave('Segurança')} variant="outline" className="text-xs font-light">Alterar Senha</Button>
                            </div>

                            {/* Campo de API - Pensando que você trabalha com automações */}
                            <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-3">
                                <p className="text-xs font-medium text-foreground uppercase">Integrações (API)</p>
                                <p className="text-[11px] text-muted-foreground">Chave de acesso para Make.com / n8n</p>
                                <div className="flex gap-2">
                                    <Input value="sk_live_51Mz..." readOnly className="font-mono text-[11px] bg-background" />
                                    <Button variant="ghost" className="text-xs font-light">Copiar</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300 max-w-md">
                        <h2 className="text-xl font-light text-foreground">Personalização</h2>
                        <div className="p-5 rounded-xl border border-border flex items-center justify-between bg-card hover:border-primary/40 transition-all cursor-pointer" onClick={toggleTheme}>
                            <div>
                                <p className="text-sm font-light text-foreground flex items-center gap-2">
                                    {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                                    Modo Escuro
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1">Alternar entre tema claro e escuro</p>
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
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-light text-foreground">Configurações Gerais</h1>
                <p className="text-xs text-muted-foreground mt-1">Gerencie as diretrizes e dados da Clínica SpeedMed</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Abas Laterais (Estilo Médico) */}
                <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto pb-2 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="font-light">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Área de Conteúdo */}
                <div className="flex-1 bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-8 min-h-[500px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;