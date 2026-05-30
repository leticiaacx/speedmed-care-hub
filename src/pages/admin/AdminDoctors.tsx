import { useState, useMemo } from 'react';
import { useUser, MEDICO } from '@/contexts/UserContext';
import {
    Stethoscope, Plus, Search, Eye, Edit2, Trash2, Save,
    Clock, Mail, Phone, MapPin, Wifi, WifiOff, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';


// ─── Constants ────────────────────────────────────────────────────────────────

const ESPECIALIDADES = [
    'Cardiologia', 'Clínico Geral', 'Dermatologia', 'Endocrinologia',
    'Gastroenterologia', 'Ginecologia', 'Neurologia', 'Oftalmologia',
    'Ortopedia', 'Otorrinolaringologia', 'Pediatria', 'Psiquiatria',
    'Urologia',
];

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SPECIALTY_COLORS: Record<string, string> = {
    'Cardiologia':        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'Clínico Geral':      'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    'Dermatologia':       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Endocrinologia':     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Gastroenterologia':  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
    'Ginecologia':        'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    'Neurologia':         'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Oftalmologia':       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Ortopedia':          'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'Pediatria':          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Psiquiatria':        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Urologia':           'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const AVATAR_COLORS = [
    'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
];

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

const getSpecialtyColor = (esp: string) =>
    SPECIALTY_COLORS[esp] || 'bg-secondary text-muted-foreground';

// ─── Form State ───────────────────────────────────────────────────────────────

type FormState = {
    nome: string;
    email: string;
    senha: string;
    crm: string;
    especialidade: string;
    phone: string;
    location: string;
    onlineConsultation: boolean;
};

const EMPTY_FORM: FormState = {
    nome: '', email: '', senha: '', crm: '',
    especialidade: '', phone: '', location: '', onlineConsultation: false,
};

const doctorToForm = (d: MEDICO): FormState => ({
    nome: d.nome,
    email: d.email,
    senha: '',
    crm: d.crm,
    especialidade: d.especialidade,
    phone: d.phone || '',
    location: d.location || '',
    onlineConsultation: d.onlineConsultation || false,
});

// ─── Schedule subform types ───────────────────────────────────────────────────

type ScheduleRow = { dayOfWeek: number; startTime: string; endTime: string };

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDoctors = () => {
    const { doctors, registerDoctor, updateDoctor, removeDoctor, updateDoctorSchedule } = useUser();

    // ── Filter state ──────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [filterEsp, setFilterEsp] = useState('');
    const [filterOnline, setFilterOnline] = useState(false);

    // ── Modal state ───────────────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<MEDICO | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleRow[]>([]);

    // ── Detail sheet ──────────────────────────────────────────────────────────
    const [detailDoc, setDetailDoc] = useState<MEDICO | null>(null);

    // ── Delete confirm ────────────────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<MEDICO | null>(null);

    // ── Filtered list (only ativo !== false) ──────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return doctors.filter(d => {
            if (d.ativo === false) return false;
            if (q && !d.nome.toLowerCase().includes(q) && !d.especialidade.toLowerCase().includes(q) && !d.crm.toLowerCase().includes(q)) return false;
            if (filterEsp && d.especialidade !== filterEsp) return false;
            if (filterOnline && !d.onlineConsultation) return false;
            return true;
        });
    }, [doctors, search, filterEsp, filterOnline]);

    // ── Available specialties (from active doctors) ───────────────────────────
    const availableEspecialidades = useMemo(() => {
        const set = new Set(doctors.filter(d => d.ativo !== false).map(d => d.especialidade));
        return ESPECIALIDADES.filter(e => set.has(e) || true); // show all options always
    }, [doctors]);

    // ── Form helpers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingDoc(null);
        setForm(EMPTY_FORM);
        setEditingSchedule([]);
        setFormOpen(true);
    };

    const openEdit = (doc: MEDICO) => {
        setDetailDoc(null);
        setEditingDoc(doc);
        setForm(doctorToForm(doc));
        setEditingSchedule([...(doc.schedule || [])]);
        setFormOpen(true);
    };

    const closeForm = () => { setFormOpen(false); setEditingDoc(null); setForm(EMPTY_FORM); setEditingSchedule([]); };

    const handleFormChange = (field: keyof FormState, value: string | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const isFormValid = form.nome.trim() !== '' && form.email.trim() !== '' && form.crm.trim() !== '' && form.especialidade !== '';

    const handleSubmit = () => {
        if (!isFormValid) return;
        const payload: Omit<MEDICO, 'id'> = {
            nome: form.nome.trim(),
            email: form.email.trim(),
            senha: form.senha || undefined,
            crm: form.crm.trim(),
            especialidade: form.especialidade,
            clinica_id: 1,
            phone: form.phone.trim() || undefined,
            location: form.location.trim() || undefined,
            onlineConsultation: form.onlineConsultation,
            schedule: editingSchedule,
            ativo: true,
        };

        if (editingDoc) {
            updateDoctor(editingDoc.id, payload);
        } else {
            registerDoctor(payload);
        }
        closeForm();
    };

    // ── Schedule helpers ──────────────────────────────────────────────────────
    const addScheduleRow = () =>
        setEditingSchedule(prev => [...prev, { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }]);

    const updateScheduleRow = (i: number, field: keyof ScheduleRow, value: string | number) =>
        setEditingSchedule(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

    const removeScheduleRow = (i: number) =>
        setEditingSchedule(prev => prev.filter((_, idx) => idx !== i));

    // ── Detail helpers ────────────────────────────────────────────────────────
    const openDetail = (doc: MEDICO) => setDetailDoc(doc);
    const closeDetail = () => setDetailDoc(null);

    // Live-updated doctor for the detail sheet (so it reflects edits)
    const liveDetailDoc = detailDoc ? doctors.find(d => d.id === detailDoc.id) ?? detailDoc : null;

    // ── Schedule save from detail sheet ───────────────────────────────────────
    const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false);
    const [scheduleEditTarget, setScheduleEditTarget] = useState<MEDICO | null>(null);
    const [scheduleEditRows, setScheduleEditRows] = useState<ScheduleRow[]>([]);

    const openScheduleEdit = (doc: MEDICO) => {
        setScheduleEditTarget(doc);
        setScheduleEditRows([...(doc.schedule || [])]);
        setScheduleSheetOpen(true);
    };

    const saveScheduleEdit = () => {
        if (scheduleEditTarget) {
            updateDoctorSchedule(scheduleEditTarget.id, scheduleEditRows);
            setScheduleSheetOpen(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-light text-foreground">Médicos</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {filtered.length} médico{filtered.length !== 1 ? 's' : ''} ativo{filtered.length !== 1 ? 's' : ''}
                        {search || filterEsp || filterOnline ? ' (filtrado)' : ''}
                    </p>
                </div>
                <Button id="btn-novo-medico" onClick={openCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Novo Médico
                </Button>
            </div>

            {/* ── Filtros ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        id="search-medicos"
                        placeholder="Buscar por nome, CRM ou especialidade..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                        id="filter-especialidade"
                        value={filterEsp}
                        onChange={e => setFilterEsp(e.target.value)}
                        className="w-full sm:w-52 bg-background border border-input rounded-md pl-3 pr-9 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors appearance-none"
                    >
                        <option value="">Todas as especialidades</option>
                        {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>

                <label htmlFor="filter-online" className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-md cursor-pointer hover:bg-secondary/40 transition-colors">
                    <Switch
                        id="filter-online"
                        checked={filterOnline}
                        onCheckedChange={setFilterOnline}
                        className="scale-90"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Apenas online</span>
                </label>
            </div>

            {/* ── Grid de Cards ────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl">
                    <Stethoscope className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-light text-muted-foreground">Nenhum médico encontrado.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros ou cadastre um novo médico.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(doctor => (
                        <div
                            key={doctor.id}
                            className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                        >
                            {/* Top: avatar + info */}
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-full ${getAvatarColor(doctor.id)} flex items-center justify-center shrink-0 shadow-sm`}>
                                    <span className="text-sm font-bold text-white">{getInitials(doctor.nome)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{doctor.nome}</h3>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{doctor.crm}</p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSpecialtyColor(doctor.especialidade)}`}>
                                            {doctor.especialidade}
                                        </span>
                                        {doctor.onlineConsultation && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-0.5">
                                                <Wifi className="w-2.5 h-2.5" /> Online
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Middle: info pills */}
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                {doctor.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{doctor.email}</span>
                                    </div>
                                )}
                                {doctor.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 shrink-0" />
                                        <span>{doctor.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span>{doctor.schedule?.length || 0} dia{(doctor.schedule?.length || 0) !== 1 ? 's' : ''} na semana</span>
                                </div>
                            </div>

                            {/* Footer: actions */}
                            <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                                <Button
                                    id={`btn-ver-medico-${doctor.id}`}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-1.5 text-xs"
                                    onClick={() => openDetail(doctor)}
                                >
                                    <Eye className="w-3 h-3" /> Ver
                                </Button>
                                <Button
                                    id={`btn-editar-medico-${doctor.id}`}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-1.5 text-xs"
                                    onClick={() => openEdit(doctor)}
                                >
                                    <Edit2 className="w-3 h-3" /> Editar
                                </Button>
                                <Button
                                    id={`btn-excluir-medico-${doctor.id}`}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-900/40"
                                    onClick={() => setDeleteTarget(doctor)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL: Cadastro / Edição
            ═══════════════════════════════════════════════════════════════ */}
            <Dialog open={formOpen} onOpenChange={open => { if (!open) closeForm(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-primary" />
                            {editingDoc ? 'Editar Médico' : 'Cadastrar Médico'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDoc
                                ? `Atualize os dados de ${editingDoc.nome}.`
                                : 'Preencha os dados do novo profissional. Campos com * são obrigatórios.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-2">
                        {/* Nome */}
                        <div className="space-y-1.5">
                            <label htmlFor="form-nome" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <Input id="form-nome" placeholder="Dr. João Silva" value={form.nome} onChange={e => handleFormChange('nome', e.target.value)} />
                        </div>

                        {/* Email + Senha */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="form-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    E-mail <span className="text-red-500">*</span>
                                </label>
                                <Input id="form-email" type="email" placeholder="medico@speedmed.com" value={form.email} onChange={e => handleFormChange('email', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="form-senha" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {editingDoc ? 'Nova Senha (opcional)' : 'Senha Provisória'}
                                </label>
                                <Input id="form-senha" type="password" placeholder="Senha@123" value={form.senha} onChange={e => handleFormChange('senha', e.target.value)} />
                            </div>
                        </div>

                        {/* CRM + Especialidade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="form-crm" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    CRM <span className="text-red-500">*</span>
                                </label>
                                <Input id="form-crm" placeholder="CRM/SP 123456" value={form.crm} onChange={e => handleFormChange('crm', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="form-especialidade" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Especialidade <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    <select
                                        id="form-especialidade"
                                        value={form.especialidade}
                                        onChange={e => handleFormChange('especialidade', e.target.value)}
                                        className="w-full bg-background border border-input rounded-md pl-3 pr-9 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors appearance-none"
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Telefone + Localização */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="form-phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefone</label>
                                <Input id="form-phone" placeholder="(88) 99999-9999" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="form-location" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Localização / Unidade</label>
                                <Input id="form-location" placeholder="SpeedMed - Centro" value={form.location} onChange={e => handleFormChange('location', e.target.value)} />
                            </div>
                        </div>

                        {/* Online */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                            <div>
                                <p className="text-sm text-foreground font-light">Realiza consultas online</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Habilitará o médico para teleatendimento no portal</p>
                            </div>
                            <Switch
                                id="form-online"
                                checked={form.onlineConsultation}
                                onCheckedChange={v => handleFormChange('onlineConsultation', v)}
                            />
                        </div>

                        {/* Agenda (inline no modal) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agenda de Atendimento</p>
                                <Button type="button" variant="outline" size="sm" onClick={addScheduleRow} className="gap-1.5 text-xs h-7">
                                    <Plus className="w-3 h-3" /> Adicionar Dia
                                </Button>
                            </div>

                            {editingSchedule.length === 0 ? (
                                <div className="text-center p-4 border border-dashed border-border rounded-xl">
                                    <p className="text-xs text-muted-foreground">Nenhum horário definido ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {editingSchedule.map((sch, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2.5 bg-secondary/40 rounded-lg">
                                            <div className="relative flex-1">
                                                <select
                                                    value={sch.dayOfWeek}
                                                    onChange={e => updateScheduleRow(i, 'dayOfWeek', parseInt(e.target.value))}
                                                    className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none appearance-none pr-6"
                                                >
                                                    {DAYS_OF_WEEK.map((day, idx) => (
                                                        <option key={idx} value={idx}>{day}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Input type="time" className="w-28 h-8 text-xs" value={sch.startTime} onChange={e => updateScheduleRow(i, 'startTime', e.target.value)} />
                                            <span className="text-xs text-muted-foreground">até</span>
                                            <Input type="time" className="w-28 h-8 text-xs" value={sch.endTime} onChange={e => updateScheduleRow(i, 'endTime', e.target.value)} />
                                            <button onClick={() => removeScheduleRow(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button id="btn-cancelar-form-medico" variant="outline" onClick={closeForm}>Cancelar</Button>
                            <Button id="btn-salvar-medico" onClick={handleSubmit} disabled={!isFormValid} className="gap-2">
                                <Save className="w-4 h-4" />
                                {editingDoc ? 'Salvar Alterações' : 'Cadastrar Médico'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════════
                SHEET: Detalhes do Médico
            ═══════════════════════════════════════════════════════════════ */}
            <Dialog open={!!liveDetailDoc} onOpenChange={open => { if (!open) closeDetail(); }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {liveDetailDoc && (
                        <>
                            <DialogHeader className="pb-6 border-b border-border">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(liveDetailDoc.id)} flex items-center justify-center shadow-md shrink-0`}>
                                        <span className="text-xl font-bold text-white">{getInitials(liveDetailDoc.nome)}</span>
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold leading-tight">{liveDetailDoc.nome}</DialogTitle>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${getSpecialtyColor(liveDetailDoc.especialidade)}`}>
                                                {liveDetailDoc.especialidade}
                                            </span>
                                            {liveDetailDoc.onlineConsultation ? (
                                                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                                                    <Wifi className="w-3 h-3" /> Online
                                                </span>
                                            ) : (
                                                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-secondary text-muted-foreground flex items-center gap-1">
                                                    <WifiOff className="w-3 h-3" /> Presencial
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="py-6 space-y-6">
                                {/* Informações */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Informações</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                <Stethoscope className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">CRM</p>
                                                <p className="font-medium text-foreground">{liveDetailDoc.crm}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">E-mail</p>
                                                <p className="font-medium text-foreground">{liveDetailDoc.email}</p>
                                            </div>
                                        </div>
                                        {liveDetailDoc.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                    <Phone className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">Telefone</p>
                                                    <p className="font-medium text-foreground">{liveDetailDoc.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {liveDetailDoc.location && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">Localização</p>
                                                    <p className="font-medium text-foreground">{liveDetailDoc.location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Agenda */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Agenda Semanal</p>
                                        <button
                                            onClick={() => openScheduleEdit(liveDetailDoc)}
                                            className="text-[11px] text-primary hover:underline"
                                        >
                                            Editar Horários
                                        </button>
                                    </div>
                                    {(liveDetailDoc.schedule || []).length === 0 ? (
                                        <div className="text-center p-4 border border-dashed border-border rounded-xl">
                                            <p className="text-xs text-muted-foreground">Nenhum horário cadastrado.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {[...liveDetailDoc.schedule!].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((sch, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                                                            {DAYS_OF_WEEK[sch.dayOfWeek]}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {sch.startTime} – {sch.endTime}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sheet footer: actions */}
                            <div className="border-t border-border pt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => openEdit(liveDetailDoc)}
                                >
                                    <Edit2 className="w-4 h-4" /> Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => { closeDetail(); setDeleteTarget(liveDetailDoc); }}
                                >
                                    <Trash2 className="w-4 h-4" /> Remover
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════════
                DIALOG: Editar Agenda (a partir do Sheet de detalhes)
            ═══════════════════════════════════════════════════════════════ */}
            <Dialog open={scheduleSheetOpen} onOpenChange={open => { if (!open) setScheduleSheetOpen(false); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Horários — {scheduleEditTarget?.nome}
                        </DialogTitle>
                        <DialogDescription>Defina os dias e horários de atendimento.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {scheduleEditRows.length === 0 ? (
                            <div className="text-center p-6 border border-dashed border-border rounded-xl">
                                <p className="text-sm text-muted-foreground">Nenhum horário definido.</p>
                            </div>
                        ) : (
                            scheduleEditRows.map((sch, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 bg-secondary/40 rounded-lg">
                                    <select
                                        value={sch.dayOfWeek}
                                        onChange={e => setScheduleEditRows(prev => prev.map((r, idx) => idx === i ? { ...r, dayOfWeek: parseInt(e.target.value) } : r))}
                                        className="flex-1 bg-background border border-input rounded-md px-2 py-1.5 text-sm focus:outline-none"
                                    >
                                        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => (
                                            <option key={idx} value={idx}>{day}</option>
                                        ))}
                                    </select>
                                    <Input type="time" className="w-28" value={sch.startTime} onChange={e => setScheduleEditRows(prev => prev.map((r, idx) => idx === i ? { ...r, startTime: e.target.value } : r))} />
                                    <span className="text-muted-foreground text-sm">até</span>
                                    <Input type="time" className="w-28" value={sch.endTime} onChange={e => setScheduleEditRows(prev => prev.map((r, idx) => idx === i ? { ...r, endTime: e.target.value } : r))} />
                                    <button onClick={() => setScheduleEditRows(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                            <Button variant="outline" size="sm" onClick={() => setScheduleEditRows(prev => [...prev, { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }])} className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Dia
                            </Button>
                            <Button onClick={saveScheduleEdit} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <Save className="w-4 h-4" /> Salvar Agenda
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════════
                ALERT DIALOG: Confirmar Exclusão
            ═══════════════════════════════════════════════════════════════ */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover médico?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você está prestes a remover <strong>{deleteTarget?.nome}</strong> ({deleteTarget?.especialidade}) do sistema.
                            Esta ação pode ser revertida pelo administrador do banco de dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            id={`btn-confirmar-excluir-medico-${deleteTarget?.id}`}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => { if (deleteTarget) { removeDoctor(deleteTarget.id); setDeleteTarget(null); } }}
                        >
                            Sim, remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
};

export default AdminDoctors;
