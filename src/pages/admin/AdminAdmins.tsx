import { useState } from 'react';
import { useUser, CLINICA } from '@/contexts/UserContext';
import { ShieldCheck, Plus, Mail, Phone, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CARGOS: CLINICA['cargo'][] = [
    'Administrador Geral',
    'Gerente de Unidade',
    'Recepcionista',
];

const CARGO_COLORS: Record<string, string> = {
    'Administrador Geral': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Gerente de Unidade': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    'Recepcionista': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const CARGO_INITIALS: Record<string, string> = {
    'Administrador Geral': 'AG',
    'Gerente de Unidade': 'GU',
    'Recepcionista': 'RC',
};

const AVATAR_COLORS: Record<string, string> = {
    'Administrador Geral': 'bg-violet-500',
    'Gerente de Unidade': 'bg-sky-500',
    'Recepcionista': 'bg-emerald-500',
};

const getInitials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('');

type FormState = {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    cargo: CLINICA['cargo'] | '';
    phone: string;
};

const EMPTY_FORM: FormState = {
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    cargo: '',
    phone: '',
};

const AdminAdmins = () => {
    const { admins, registerAdmin } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const isFormValid =
        form.nome.trim() !== '' &&
        form.email.trim() !== '' &&
        form.senha.trim() !== '' &&
        form.cpf.trim() !== '' &&
        form.cargo !== '';

    const handleChange = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = () => {
        if (!isFormValid) return;
        registerAdmin({
            nome: form.nome.trim(),
            email: form.email.trim(),
            senha: form.senha,
            cpf: form.cpf.trim(),
            cargo: form.cargo as CLINICA['cargo'],
            phone: form.phone.trim() || undefined,
            endereco_id: 1,
            horario_funcionamento: '08:00 - 18:00',
        });
        setForm(EMPTY_FORM);
        setShowModal(false);
    };

    const handleOpenChange = (open: boolean) => {
        setShowModal(open);
        if (!open) setForm(EMPTY_FORM);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-light text-foreground">Administradores</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Gerencie os perfis administrativos do sistema SpeedMed
                    </p>
                </div>
                <Button
                    id="btn-novo-admin"
                    onClick={() => setShowModal(true)}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo Admin
                </Button>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-card border border-border shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <span className="text-2xl font-light text-foreground">{admins.length}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                        {admins.length === 1 ? 'administrador ativo' : 'administradores ativos'}
                    </span>
                </div>
            </div>

            {/* Cards Grid */}
            {admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
                    <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-light text-muted-foreground">Nenhum administrador cadastrado.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Novo Admin" para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {admins.map(admin => {
                        const avatarBg = admin.cargo ? AVATAR_COLORS[admin.cargo] : 'bg-primary';
                        const badgeClass = admin.cargo ? CARGO_COLORS[admin.cargo] : 'bg-secondary text-muted-foreground';
                        const initials = admin.cargo ? CARGO_INITIALS[admin.cargo] : getInitials(admin.nome);

                        return (
                            <div
                                key={admin.id}
                                className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                            >
                                {/* Top: avatar + nome + cargo */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center shrink-0 shadow-sm`}>
                                        <span className="text-sm font-bold text-white">
                                            {getInitials(admin.nome) || initials}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{admin.nome}</p>
                                        {admin.cargo && (
                                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                                                {admin.cargo}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{admin.email}</span>
                                    </div>
                                    {admin.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 shrink-0" />
                                            <span>{admin.phone}</span>
                                        </div>
                                    )}
                                    {admin.cpf && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 shrink-0" />
                                            <span>{admin.cpf}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer badge */}
                                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-light">
                                        Acesso ao sistema
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                        Ativo
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Cadastro */}
            <Dialog open={showModal} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Cadastrar Administrador
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo perfil administrativo. As credenciais serão enviadas por e-mail.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* Nome */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-nome" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="admin-nome"
                                placeholder="Ex: Leticia Rodrigues"
                                value={form.nome}
                                onChange={e => handleChange('nome', e.target.value)}
                            />
                        </div>

                        {/* Email + Senha */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="admin-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    E-mail <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    placeholder="admin@speedmed.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="admin-senha" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Senha Provisória <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="admin-senha"
                                    type="password"
                                    placeholder="Senha@123"
                                    value={form.senha}
                                    onChange={e => handleChange('senha', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CPF + Telefone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="admin-cpf" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    CPF <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="admin-cpf"
                                    placeholder="000.000.000-00"
                                    value={form.cpf}
                                    onChange={e => handleChange('cpf', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="admin-phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Telefone
                                </label>
                                <Input
                                    id="admin-phone"
                                    placeholder="(88) 99999-9999"
                                    value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Cargo */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-cargo" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Cargo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <select
                                    id="admin-cargo"
                                    value={form.cargo}
                                    onChange={e => handleChange('cargo', e.target.value)}
                                    className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                                >
                                    <option value="" disabled>Selecione um cargo...</option>
                                    {CARGOS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button
                                id="btn-cancelar-admin"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                id="btn-salvar-admin"
                                onClick={handleRegister}
                                disabled={!isFormValid}
                                className="gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Cadastrar Administrador
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAdmins;
