import { useState, useMemo } from 'react';
import { useUser, USUARIO } from '@/contexts/UserContext';
import {
    Users, Search, Plus, Eye, Edit2, Trash2, Save, X,
    Mail, Phone, MapPin, Stethoscope, Droplets, AlertTriangle,
    Pill, Dna, History, ChevronDown, User, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MARITAL_STATUS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];

const BLOOD_COLORS: Record<string, string> = {
    'A+': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'A-': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'B+': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'B-': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'AB+': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'AB-': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'O+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'O-': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const AVATAR_COLORS = [
    'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
];

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

// ─── Form State ───────────────────────────────────────────────────────────────

type FormState = {
    // Dados básicos
    nome: string;
    email: string;
    cpf: string;
    age: string;
    phone: string;
    address: string;
    socialName: string;
    // Dados demográficos
    maritalStatus: string;
    sexuality: string;
    religion: string;
    organDonor: boolean;
    requiresCompanion: boolean;
    // Dados clínicos
    bloodType: string;
    medico_id: string;
    // Listas (editadas separadamente)
    allergies: string;      // CSV que será parseado
    medications: string;    // CSV
    heredity: string;       // CSV
};

const EMPTY_FORM: FormState = {
    nome: '', email: '', cpf: '', age: '', phone: '', address: '',
    socialName: '', maritalStatus: '', sexuality: '', religion: '',
    organDonor: false, requiresCompanion: false,
    bloodType: '', medico_id: '',
    allergies: '', medications: '', heredity: '',
};

const patientToForm = (p: USUARIO): FormState => ({
    nome: p.nome,
    email: p.email,
    cpf: p.cpf,
    age: p.age?.toString() || '',
    phone: p.phone || '',
    address: p.address || '',
    socialName: p.socialName || '',
    maritalStatus: p.maritalStatus || '',
    sexuality: p.sexuality || '',
    religion: p.religion || '',
    organDonor: p.organDonor || false,
    requiresCompanion: p.requiresCompanion || false,
    bloodType: p.bloodType || '',
    medico_id: p.medico_id?.toString() || '',
    allergies: (p.allergies || []).join(', '),
    medications: (p.medications || []).join(', '),
    heredity: (p.heredity || []).join(', '),
});

const csvToList = (csv: string): string[] =>
    csv.split(',').map(s => s.trim()).filter(Boolean);

// ─── Tiny label component ────────────────────────────────────────────────────

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminPatients = () => {
    const { patients, doctors, registerPatient, updatePatient, removePatient, userRole } = useUser();
    const isAdmin = userRole === 'admin';

    // ── Filter ────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');

    // ── Modals ────────────────────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<USUARIO | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    // ── Detail Sheet ──────────────────────────────────────────────────────────
    const [detailPatient, setDetailPatient] = useState<USUARIO | null>(null);

    // ── Delete Confirm ────────────────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<USUARIO | null>(null);

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return patients;
        return patients.filter(p =>
            p.nome.toLowerCase().includes(q) ||
            p.cpf.includes(q) ||
            p.email.toLowerCase().includes(q) ||
            (p.phone || '').includes(q)
        );
    }, [patients, search]);

    // ── Form helpers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingPatient(null);
        setForm(EMPTY_FORM);
        setFormOpen(true);
    };

    const openEdit = (p: USUARIO) => {
        setDetailPatient(null);
        setEditingPatient(p);
        setForm(patientToForm(p));
        setFormOpen(true);
    };

    const closeForm = () => { setFormOpen(false); setEditingPatient(null); setForm(EMPTY_FORM); };

    const set = (field: keyof FormState, value: string | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const isFormValid = form.nome.trim() !== '' && form.email.trim() !== '' && form.cpf.trim() !== '' && form.age !== '';

    const handleSubmit = () => {
        if (!isFormValid) return;

        const payload = {
            nome: form.nome.trim(),
            email: form.email.trim(),
            cpf: form.cpf.trim(),
            age: Number(form.age),
            phone: form.phone.trim() || undefined,
            address: form.address.trim() || undefined,
            socialName: form.socialName.trim() || undefined,
            maritalStatus: form.maritalStatus || undefined,
            sexuality: form.sexuality.trim() || undefined,
            religion: form.religion.trim() || undefined,
            organDonor: form.organDonor,
            requiresCompanion: form.requiresCompanion,
            bloodType: form.bloodType || undefined,
            medico_id: form.medico_id ? Number(form.medico_id) : undefined,
            allergies: csvToList(form.allergies),
            medications: csvToList(form.medications),
            heredity: csvToList(form.heredity),
        };

        if (editingPatient) {
            updatePatient(editingPatient.id, payload);
        } else {
            registerPatient(payload);
        }
        closeForm();
    };

    // ── Live patient for sheet ────────────────────────────────────────────────
    const liveDetail = detailPatient
        ? patients.find(p => p.id === detailPatient.id) ?? detailPatient
        : null;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light text-foreground">Pacientes</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {filtered.length} paciente{filtered.length !== 1 ? 's' : ''}
                        {search ? ' encontrado' + (filtered.length !== 1 ? 's' : '') : ' cadastrado' + (filtered.length !== 1 ? 's' : '')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="search-pacientes"
                            placeholder="Nome, CPF, e-mail, telefone..."
                            className="pl-9 w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <Button id="btn-novo-paciente" onClick={openCreate} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Novo Paciente
                    </Button>
                </div>
            </div>

            {/* ── Table-style list ─────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl">
                    <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-light text-muted-foreground">Nenhum paciente encontrado.</p>
                    {search && <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar a busca.</p>}
                </div>
            ) : (
                <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 bg-secondary/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        <div className="w-9" />
                        <div>Paciente</div>
                        <div className="hidden md:block w-28 text-center">Tipo Sang.</div>
                        <div className="hidden lg:block w-28 text-center">Idade / CPF</div>
                        <div className="hidden sm:block w-32 text-center">Telefone</div>
                        <div className="w-24 text-center">Ações</div>
                    </div>

                    {/* Table rows */}
                    {filtered.map((patient, idx) => {
                        const doctor = doctors.find(d => d.id === patient.medico_id);
                        return (
                            <div
                                key={patient.id}
                                className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 ${idx !== filtered.length - 1 ? 'border-b border-border/50' : ''} hover:bg-secondary/20 transition-colors`}
                            >
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-full ${getAvatarColor(patient.id)} flex items-center justify-center shrink-0`}>
                                    <span className="text-[11px] font-bold text-white">{getInitials(patient.nome)}</span>
                                </div>

                                {/* Nome + médico */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{patient.nome}</p>
                                    {patient.socialName && (
                                        <p className="text-[10px] text-muted-foreground truncate">Social: {patient.socialName}</p>
                                    )}
                                    {doctor && (
                                        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                            <Stethoscope className="w-2.5 h-2.5 shrink-0" /> {doctor.nome}
                                        </p>
                                    )}
                                </div>

                                {/* Tipo sanguíneo */}
                                <div className="hidden md:flex w-28 justify-center">
                                    {patient.bloodType ? (
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${BLOOD_COLORS[patient.bloodType] || 'bg-secondary text-muted-foreground'}`}>
                                            {patient.bloodType}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground/50">—</span>
                                    )}
                                </div>

                                {/* Idade / CPF */}
                                <div className="hidden lg:block w-28 text-center">
                                    <p className="text-xs text-foreground font-medium">{patient.age ? `${patient.age} anos` : '—'}</p>
                                    <p className="text-[10px] text-muted-foreground">{patient.cpf}</p>
                                </div>

                                {/* Telefone */}
                                <div className="hidden sm:block w-32 text-center">
                                    <p className="text-xs text-muted-foreground">{patient.phone || '—'}</p>
                                </div>

                                {/* Actions */}
                                <div className="w-24 flex items-center gap-1 justify-end">
                                    <button
                                        id={`btn-ver-paciente-${patient.id}`}
                                        title="Ver ficha"
                                        onClick={() => setDetailPatient(patient)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        id={`btn-editar-paciente-${patient.id}`}
                                        title="Editar"
                                        onClick={() => openEdit(patient)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        id={`btn-excluir-paciente-${patient.id}`}
                                        title="Remover"
                                        onClick={() => setDeleteTarget(patient)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SHEET: Ficha do Paciente
            ═══════════════════════════════════════════════════════════════ */}
            <Sheet open={!!liveDetail} onOpenChange={open => { if (!open) setDetailPatient(null); }}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
                    {liveDetail && (() => {
                        const doctor = doctors.find(d => d.id === liveDetail.medico_id);
                        return (
                            <>
                                {/* Header */}
                                <div className={`${getAvatarColor(liveDetail.id)} px-6 pt-8 pb-6`}>
                                    <SheetHeader>
                                        <div className="flex items-end gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 shadow-lg">
                                                <span className="text-2xl font-bold text-white">{getInitials(liveDetail.nome)}</span>
                                            </div>
                                            <div className="pb-1">
                                                <SheetTitle className="text-white text-xl font-semibold leading-tight">{liveDetail.nome}</SheetTitle>
                                                {liveDetail.socialName && (
                                                    <p className="text-white/70 text-xs mt-0.5">Nome social: {liveDetail.socialName}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {/* Dados clínicos: visíveis apenas para não-admins */}
                                                    {!isAdmin && liveDetail.bloodType && (
                                                        <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                            <Droplets className="w-3 h-3" /> {liveDetail.bloodType}
                                                        </span>
                                                    )}
                                                    {liveDetail.age && (
                                                        <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full">
                                                            {liveDetail.age} anos
                                                        </span>
                                                    )}
                                                    {!isAdmin && liveDetail.organDonor && (
                                                        <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Heart className="w-3 h-3" /> Doador
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </SheetHeader>
                                </div>

                                {/* Tabs */}
                                <div className="px-6 py-4">
                                    <Tabs defaultValue="dados">
                                        <TabsList className={`w-full grid mb-6 ${isAdmin ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                            <TabsTrigger value="dados" className="text-xs gap-1.5"><User className="w-3.5 h-3.5" /> Dados</TabsTrigger>
                                            {/* Dados clínicos e histórico: somente médicos */}
                                            {!isAdmin && <TabsTrigger value="clinico" className="text-xs gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Clínico</TabsTrigger>}
                                            {!isAdmin && <TabsTrigger value="historico" className="text-xs gap-1.5"><History className="w-3.5 h-3.5" /> Histórico</TabsTrigger>}
                                        </TabsList>

                                        {/* ── Tab: Dados ─────────────────────────── */}
                                        <TabsContent value="dados" className="space-y-4">
                                            <div className="space-y-3">
                                                {[
                                                    { icon: Mail, label: 'E-mail', value: liveDetail.email },
                                                    { icon: Phone, label: 'Telefone', value: liveDetail.phone },
                                                    { icon: MapPin, label: 'Endereço', value: liveDetail.address },
                                                    { icon: User, label: 'CPF', value: liveDetail.cpf },
                                                ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                                                    <div key={label} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground">{label}</p>
                                                            <p className="text-sm font-medium text-foreground">{value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Dados demográficos */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                {liveDetail.maritalStatus && (
                                                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                                                        <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Estado Civil</p>
                                                        <p className="text-sm text-foreground">{liveDetail.maritalStatus}</p>
                                                    </div>
                                                )}
                                                {liveDetail.religion && (
                                                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                                                        <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Religião</p>
                                                        <p className="text-sm text-foreground">{liveDetail.religion}</p>
                                                    </div>
                                                )}
                                                {liveDetail.sexuality && (
                                                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                                                        <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Sexualidade</p>
                                                        <p className="text-sm text-foreground">{liveDetail.sexuality}</p>
                                                    </div>
                                                )}
                                                {liveDetail.requiresCompanion !== undefined && (
                                                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                                                        <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Acompanhante</p>
                                                        <p className="text-sm text-foreground">{liveDetail.requiresCompanion ? 'Necessário' : 'Não necessário'}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Médico responsável */}
                                            {doctor && (
                                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Stethoscope className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Médico Responsável</p>
                                                        <p className="text-sm font-medium text-foreground">{doctor.nome}</p>
                                                        <p className="text-[11px] text-primary">{doctor.especialidade}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* ── Tab: Clínico ───────────────────────── */}
                                        <TabsContent value="clinico" className="space-y-4">
                                            {/* Alergias */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Alergias
                                                </p>
                                                {(liveDetail.allergies || []).length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Nenhuma alergia registrada.</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(liveDetail.allergies || []).map(a => (
                                                            <span key={a} className="text-[11px] px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-medium">
                                                                {a}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Medicações */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                                                    <Pill className="w-3.5 h-3.5 text-sky-500" /> Medicações em Uso
                                                </p>
                                                {(liveDetail.medications || []).length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Nenhuma medicação registrada.</p>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {(liveDetail.medications || []).map(m => (
                                                            <div key={m} className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30">
                                                                <Pill className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                                                <span className="text-xs text-sky-800 dark:text-sky-200">{m}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hereditariedade */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                                                    <Dna className="w-3.5 h-3.5 text-violet-500" /> Histórico Familiar / Hereditariedade
                                                </p>
                                                {(liveDetail.heredity || []).length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Nenhum histórico familiar registrado.</p>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {(liveDetail.heredity || []).map(h => (
                                                            <div key={h} className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
                                                                <Dna className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                                                <span className="text-xs text-violet-800 dark:text-violet-200">{h}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        {/* ── Tab: Histórico ─────────────────────── */}
                                        <TabsContent value="historico" className="space-y-3">
                                            {/* Última consulta */}
                                            {liveDetail.lastConsultation?.date && (
                                                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Última Consulta</p>
                                                    <p className="text-sm font-medium text-foreground">{liveDetail.lastConsultation.date} às {liveDetail.lastConsultation.time}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{liveDetail.lastConsultation.location}</p>
                                                    <p className="text-xs text-foreground/80 mt-1 italic">"{liveDetail.lastConsultation.reason}"</p>
                                                </div>
                                            )}

                                            {/* Próxima consulta */}
                                            {liveDetail.nextAppointment?.date && (
                                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                                    <p className="text-[10px] uppercase tracking-wider text-primary mb-2">Próxima Consulta</p>
                                                    <p className="text-sm font-medium text-foreground">{liveDetail.nextAppointment.date} às {liveDetail.nextAppointment.time}</p>
                                                    <p className="text-xs text-primary">{liveDetail.nextAppointment.type}</p>
                                                </div>
                                            )}

                                            {/* Histórico de consultas */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Consultas Anteriores</p>
                                                {(liveDetail.consultationHistory || []).length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Nenhuma consulta registrada.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {liveDetail.consultationHistory!.map((c, i) => (
                                                            <div key={i} className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[10px] font-medium text-primary">{c.specialty}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{c.date} · {c.time}</span>
                                                                </div>
                                                                <p className="text-xs font-medium text-foreground">{c.diagnosis}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">{c.type} · {c.doctorName}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Sheet footer */}
                                <div className="border-t border-border px-6 py-4 flex gap-3 sticky bottom-0 bg-background">
                                    <Button variant="outline" className="flex-1 gap-2" onClick={() => openEdit(liveDetail)}>
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        onClick={() => { setDetailPatient(null); setDeleteTarget(liveDetail); }}
                                    >
                                        <Trash2 className="w-4 h-4" /> Remover
                                    </Button>
                                </div>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>

            {/* ═══════════════════════════════════════════════════════════════
                DIALOG: Cadastro / Edição
            ═══════════════════════════════════════════════════════════════ */}
            <Dialog open={formOpen} onOpenChange={open => { if (!open) closeForm(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {editingPatient ? 'Editar Paciente' : 'Cadastrar Paciente'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPatient
                                ? `Atualize os dados de ${editingPatient.nome}.`
                                : 'Preencha os dados do paciente. Campos com * são obrigatórios.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="demografico" className="pt-2">
                        <TabsList className={`grid mb-4 ${isAdmin ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <TabsTrigger value="demografico">Dados Demográficos</TabsTrigger>
                            {/* Dados clínicos: somente médicos */}
                            {!isAdmin && <TabsTrigger value="clinico">Dados Clínicos</TabsTrigger>}
                        </TabsList>

                        {/* ── Tab Demográfico ──────────────────────────────── */}
                        <TabsContent value="demografico" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Nome Completo</FieldLabel>
                                    <Input id="form-nome" placeholder="Maria Santos" value={form.nome} onChange={e => set('nome', e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>Nome Social</FieldLabel>
                                    <Input id="form-social" placeholder="Opcional" value={form.socialName} onChange={e => set('socialName', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>E-mail</FieldLabel>
                                    <Input id="form-email" type="email" placeholder="paciente@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>Telefone</FieldLabel>
                                    <Input id="form-phone" placeholder="(88) 99999-9999" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>CPF</FieldLabel>
                                    <Input id="form-cpf" placeholder="000.000.000-00" value={form.cpf} onChange={e => set('cpf', e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel required>Idade</FieldLabel>
                                    <Input id="form-age" type="number" min="0" max="150" placeholder="Ex: 35" value={form.age} onChange={e => set('age', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Endereço</FieldLabel>
                                <Input id="form-address" placeholder="Rua, número, bairro..." value={form.address} onChange={e => set('address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Estado Civil</FieldLabel>
                                    <div className="relative">
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            value={form.maritalStatus}
                                            onChange={e => set('maritalStatus', e.target.value)}
                                            className="w-full bg-background border border-input rounded-md pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {MARITAL_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>Sexualidade</FieldLabel>
                                    <Input placeholder="Ex: Heterossexual" value={form.sexuality} onChange={e => set('sexuality', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Religião</FieldLabel>
                                <Input placeholder="Ex: Católica, Evangélica..." value={form.religion} onChange={e => set('religion', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                                    <div>
                                        <p className="text-sm text-foreground">Doador de Órgãos</p>
                                    </div>
                                    <Switch checked={form.organDonor} onCheckedChange={v => set('organDonor', v)} />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                                    <div>
                                        <p className="text-sm text-foreground">Necessita Acompanhante</p>
                                    </div>
                                    <Switch checked={form.requiresCompanion} onCheckedChange={v => set('requiresCompanion', v)} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── Tab Clínico: somente médicos ─────────────────── */}
                        {!isAdmin && <TabsContent value="clinico" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Tipo Sanguíneo</FieldLabel>
                                    <Select value={form.bloodType} onValueChange={v => set('bloodType', v)}>
                                        <SelectTrigger id="form-blood">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BLOOD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>Médico Responsável</FieldLabel>
                                    <Select value={form.medico_id} onValueChange={v => set('medico_id', v)}>
                                        <SelectTrigger id="form-medico">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.filter(d => d.ativo !== false).map(d => (
                                                <SelectItem key={d.id} value={d.id.toString()}>{d.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <FieldLabel>Alergias</FieldLabel>
                                <Input
                                    placeholder="Separe por vírgulas: Dipirona, Penicilina..."
                                    value={form.allergies}
                                    onChange={e => set('allergies', e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Separe múltiplas alergias com vírgula.</p>
                            </div>

                            <div>
                                <FieldLabel>Medicações em Uso</FieldLabel>
                                <Input
                                    placeholder="Ex: Losartana 50mg, Metformina 850mg..."
                                    value={form.medications}
                                    onChange={e => set('medications', e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Separe múltiplas medicações com vírgula.</p>
                            </div>

                            <div>
                                <FieldLabel>Histórico Familiar / Hereditariedade</FieldLabel>
                                <Input
                                    placeholder="Ex: Hipertensão (Mãe), Diabetes (Pai)..."
                                    value={form.heredity}
                                    onChange={e => set('heredity', e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Separe múltiplos itens com vírgula.</p>
                            </div>
                        </TabsContent>}
                    </Tabs>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                        <Button id="btn-cancelar-form-paciente" variant="outline" onClick={closeForm}>Cancelar</Button>
                        <Button id="btn-salvar-paciente" onClick={handleSubmit} disabled={!isFormValid} className="gap-2">
                            <Save className="w-4 h-4" />
                            {editingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════════
                ALERT DIALOG: Confirmar Exclusão
            ═══════════════════════════════════════════════════════════════ */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você está prestes a remover <strong>{deleteTarget?.nome}</strong> (CPF: {deleteTarget?.cpf}) do sistema.
                            Todo o histórico clínico associado também será removido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            id={`btn-confirmar-excluir-paciente-${deleteTarget?.id}`}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => { if (deleteTarget) { removePatient(deleteTarget.id); setDeleteTarget(null); } }}
                        >
                            Sim, remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
};

export default AdminPatients;
