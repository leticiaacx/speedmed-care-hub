import { useState } from 'react';
import {
  DollarSign, Users, CheckCircle2, Clock, RefreshCw, XCircle,
  Building2, Percent, Download, Edit2, Save, X, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DoctorRow { nome: string; especialidade: string; percentual: number; faturamento: number; atendimentos: number }
interface PlanRow { name: string; repasse: number; atendimentos: number; valor: number }
interface FinData { faturamento: number; recebido: number; pendente: number; atendimentos: number; remarcados: number; desistencias: number }

// ── Period data ───────────────────────────────────────────────────────────────
const PERIOD_DEFAULTS: Record<string, FinData> = {
  day:   { faturamento: 4820,   recebido: 3640,   pendente: 1180,   atendimentos: 18,  remarcados: 3,  desistencias: 2  },
  week:  { faturamento: 28600,  recebido: 22100,  pendente: 6500,   atendimentos: 112, remarcados: 14, desistencias: 8  },
  month: { faturamento: 118400, recebido: 94700,  pendente: 23700,  atendimentos: 448, remarcados: 52, desistencias: 31 },
  year:  { faturamento: 1284000,recebido: 1042000,pendente: 242000, atendimentos: 5124,remarcados: 582,desistencias: 341},
};
const CHART: Record<string, { data: number[]; labels: string[] }> = {
  day:   { data: [320,480,290,640,520,380,450,610,290,480,550,400], labels: ['8h','9h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h'] },
  week:  { data: [4200,5800,3900,6100,4700,2800,1100], labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] },
  month: { data: [3200,4100,3800,5200,4600,3900,5800,6200,4800,5100,7200,6800,5400,4900,6100,5700,4300,5800,6400,5100,4700,5900,6300,5500,4800,5200,6700,6100,5400,4900], labels: Array.from({length:30},(_,i)=>`${i+1}`) },
  year:  { data: [82000,91000,78000,104000,98000,112000,108000,95000,118000,124000,109000,115000], labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'] },
};

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const YEARS  = ['2023','2024','2025','2026'];
const fmt    = (v: number) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:0 });
type Period  = 'day'|'week'|'month'|'year';

// ── Bar chart SVG ─────────────────────────────────────────────────────────────
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  const bw  = Math.max(6, Math.floor(560 / data.length) - 3);
  const h   = 100;
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${data.length*(bw+3)} ${h+20}`} className="w-full min-w-[280px]">
        {data.map((v,i) => {
          const bh = (v/max)*h;
          return (
            <g key={i}>
              <rect x={i*(bw+3)} y={h-bh} width={bw} height={bh} rx={3} fill="#73D5F0" opacity={0.85}/>
              {data.length <= 14 && (
                <text x={i*(bw+3)+bw/2} y={h+14} textAnchor="middle" fontSize={8} fill="#94a3b8">{labels[i]}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminFinancial = () => {
  const [period, setPeriod]   = useState<Period>('month');
  const [month,  setMonth]    = useState('4');
  const [year,   setYear]     = useState('2026');

  // Per-period editable state
  const [finData, setFinData] = useState<Record<string,FinData>>({...PERIOD_DEFAULTS});
  const [editingFin, setEditingFin] = useState(false);
  const [draftFin,   setDraftFin]   = useState<FinData>(PERIOD_DEFAULTS.month);

  const [doctors, setDoctors]     = useState<DoctorRow[]>([
    { nome:'Dr. Carlos Silva',  especialidade:'Clínico Geral', percentual:45, faturamento:12400, atendimentos:62 },
    { nome:'Dra. Ana Souza',    especialidade:'Pediatria',      percentual:50, faturamento:9800,  atendimentos:49 },
    { nome:'Dr. Paulo Lima',    especialidade:'Cardiologia',    percentual:55, faturamento:18600, atendimentos:41 },
    { nome:'Dra. Marta Dias',   especialidade:'Neurologia',     percentual:52, faturamento:14200, atendimentos:35 },
  ]);
  const [editingDoctors, setEditingDoctors] = useState(false);
  const [draftDoctors,   setDraftDoctors]   = useState<DoctorRow[]>([]);

  const [plans, setPlans]       = useState<PlanRow[]>([
    { name:'Unimed',        repasse:65, atendimentos:38, valor:5700 },
    { name:'Bradesco Saúde',repasse:70, atendimentos:24, valor:4200 },
    { name:'SulAmérica',    repasse:68, atendimentos:19, valor:3100 },
    { name:'Amil',          repasse:60, atendimentos:15, valor:2400 },
    { name:'Hapvida',       repasse:55, atendimentos:12, valor:1800 },
  ]);
  const [editingPlans, setEditingPlans] = useState(false);
  const [draftPlans,   setDraftPlans]   = useState<PlanRow[]>([]);

  const fin = finData[period];
  const chart = CHART[period];

  const periodLabel: Record<Period,string> = { day:'Hoje', week:'Esta semana', month:`${MONTHS[+month]} ${year}`, year:`Ano ${year}` };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const startFinEdit = () => { setDraftFin({...fin}); setEditingFin(true); };
  const saveFinEdit  = () => { setFinData(p=>({...p,[period]:draftFin})); setEditingFin(false); };
  const cancelFinEdit= () => setEditingFin(false);

  const startDoctorEdit = () => { setDraftDoctors(doctors.map(d=>({...d}))); setEditingDoctors(true); };
  const saveDoctorEdit  = () => { setDoctors(draftDoctors); setEditingDoctors(false); };
  const cancelDoctorEdit= () => setEditingDoctors(false);
  const updateDraftDoc  = (i:number, k:keyof DoctorRow, v:number) =>
    setDraftDoctors(prev=>prev.map((d,idx)=>idx===i?{...d,[k]:v}:d));

  const startPlanEdit = () => { setDraftPlans(plans.map(p=>({...p}))); setEditingPlans(true); };
  const savePlanEdit  = () => { setPlans(draftPlans); setEditingPlans(false); };
  const cancelPlanEdit= () => setEditingPlans(false);
  const updateDraftPlan = (i:number, k:keyof PlanRow, v:number|string) =>
    setDraftPlans(prev=>prev.map((p,idx)=>idx===i?{...p,[k]:v}:p));
  const addDraftPlan = () => setDraftPlans(prev=>[...prev, { name:'Novo Plano', repasse:0, atendimentos:0, valor:0 }]);
  const removeDraftPlan = (i:number) => setDraftPlans(prev=>prev.filter((_,idx)=>idx!==i));

  const kpiItems: {label:string; key:keyof FinData; color:string; icon:any}[] = [
    { label:'Faturamento', key:'faturamento', color:'#73D5F0', icon:DollarSign  },
    { label:'Recebido',    key:'recebido',    color:'#22c55e', icon:CheckCircle2 },
    { label:'A Receber',   key:'pendente',    color:'#f59e0b', icon:Clock        },
    { label:'Atendimentos',key:'atendimentos',color:'#920203', icon:Users        },
  ];

  const agendaItems: {label:string; key:keyof FinData; icon:any; cls:string}[] = [
    { label:'Realizados',   key:'atendimentos', icon:CheckCircle2, cls:'text-emerald-600 bg-emerald-50' },
    { label:'Remarcados',   key:'remarcados',   icon:RefreshCw,    cls:'text-amber-600 bg-amber-50'   },
    { label:'Desistências', key:'desistencias', icon:XCircle,      cls:'text-red-600 bg-red-50'       },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500 mt-1">Acompanhamento financeiro da clínica</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {(['day','week','month','year'] as Period[]).map(p=>(
              <button key={p} onClick={()=>setPeriod(p)}
                className={`px-4 py-2.5 text-sm font-medium transition-all ${period===p?'bg-[#73D5F0] text-white':'text-slate-600 hover:bg-slate-50'}`}>
                {p==='day'?'Dia':p==='week'?'Semana':p==='month'?'Mês':'Ano'}
              </button>
            ))}
          </div>
          {/* Month/Year selectors (only for month/year views) */}
          {(period==='month'||period==='year') && (
            <>
              {period==='month' && (
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[150px] bg-white border-slate-200 shadow-sm"><SelectValue/></SelectTrigger>
                  <SelectContent>{MONTHS.map((m,i)=><SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] bg-white border-slate-200 shadow-sm"><SelectValue/></SelectTrigger>
                <SelectContent>{YEARS.map(y=><SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </>
          )}
          <Button onClick={()=>window.print()} variant="outline" className="gap-2 border-slate-200 shadow-sm print:hidden">
            <Download className="w-4 h-4"/> Exportar PDF
          </Button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Resumo — {periodLabel[period]}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Valores do período selecionado</p>
          </div>
          {!editingFin ? (
            <Button size="sm" variant="outline" onClick={startFinEdit} className="gap-2 text-slate-600">
              <Edit2 className="w-4 h-4"/> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveFinEdit} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Save className="w-4 h-4"/> Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={cancelFinEdit} className="gap-2 text-slate-600">
                <X className="w-4 h-4"/> Cancelar
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiItems.map(({label,key,color,icon:Icon})=>(
            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:color+'20'}}>
                <Icon className="w-4 h-4" style={{color}}/>
              </div>
              {editingFin ? (
                <Input type="number" className="h-8 text-lg font-bold w-full mb-1"
                  value={draftFin[key]}
                  onChange={e=>setDraftFin(p=>({...p,[key]:Number(e.target.value)}))}/>
              ) : (
                <p className="text-2xl font-bold text-slate-800">
                  {key!=='atendimentos'?fmt(fin[key]):fin[key].toLocaleString('pt-BR')}
                </p>
              )}
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart + Agenda ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Faturamento — {periodLabel[period]}</h2>
            <span className="text-lg font-bold text-[#73D5F0]">{fmt(fin.faturamento)}</span>
          </div>
          <BarChart data={chart.data} labels={chart.labels}/>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Agenda</h2>
            {!editingFin && (
              <Button size="sm" variant="ghost" onClick={startFinEdit} className="h-7 gap-1 text-xs text-slate-500">
                <Edit2 className="w-3.5 h-3.5"/>
              </Button>
            )}
          </div>
          {agendaItems.map(({label,key,icon:Icon,cls})=>(
            <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
                <Icon className="w-4 h-4"/>
              </div>
              <span className="text-sm text-slate-600 flex-1">{label}</span>
              {editingFin ? (
                <Input type="number" className="h-7 w-16 text-right text-sm font-bold"
                  value={draftFin[key]}
                  onChange={e=>setDraftFin(p=>({...p,[key]:Number(e.target.value)}))}/>
              ) : (
                <span className="text-lg font-bold text-slate-800">{fin[key]}</span>
              )}
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3 text-sm flex justify-between">
            <span className="text-slate-500">Comparecimento</span>
            <span className="font-bold text-emerald-600">
              {fin.atendimentos+fin.desistencias>0
                ?((fin.atendimentos/(fin.atendimentos+fin.desistencias))*100).toFixed(0)
                :0}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Planos de Saúde ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Planos de Saúde</h2>
            <p className="text-xs text-slate-400 mt-0.5">Repasses por convênio</p>
          </div>
          {!editingPlans ? (
            <Button size="sm" variant="outline" onClick={startPlanEdit} className="gap-2 text-slate-600">
              <Edit2 className="w-4 h-4"/> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={savePlanEdit} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Save className="w-4 h-4"/> Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={cancelPlanEdit} className="gap-2 text-slate-600">
                <X className="w-4 h-4"/> Cancelar
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {(editingPlans ? draftPlans : plans).map((plan,i)=>(
            <div key={plan.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-[#92020315] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[#920203]"/>
              </div>
              {editingPlans ? (
                <>
                  {draftPlans[i].name === 'Novo Plano' ? (
                    <Input className="h-8 w-32 font-semibold text-sm shrink-0" value={draftPlans[i].name} onChange={e=>updateDraftPlan(i,'name',e.target.value)} />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 w-32 shrink-0">{draftPlans[i].name}</p>
                  )}
                  <div className="flex flex-wrap gap-3 flex-1">
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      Atendimentos
                      <Input type="number" className="h-8 w-16 ml-1" value={draftPlans[i].atendimentos}
                        onChange={e=>updateDraftPlan(i,'atendimentos',Number(e.target.value))}/>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      Repasse %
                      <Input type="number" className="h-8 w-14 ml-1" value={draftPlans[i].repasse}
                        onChange={e=>updateDraftPlan(i,'repasse',Number(e.target.value))}/>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      Valor R$
                      <Input type="number" className="h-8 w-24 ml-1" value={draftPlans[i].valor}
                        onChange={e=>updateDraftPlan(i,'valor',Number(e.target.value))}/>
                    </label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={()=>removeDraftPlan(i)} className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 gap-1 font-medium">
                    <X className="w-4 h-4"/> Remover
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800 w-32 shrink-0">{plan.name}</p>
                  <div className="flex-1 text-xs text-slate-500">
                    {plan.atendimentos} atend. · Repasse {plan.repasse}%
                  </div>
                </>
              )}
              <div className="text-right text-xs shrink-0">
                <p className="font-bold text-slate-800">{fmt(plan.valor)}</p>
                <p className="text-emerald-600 font-medium">{fmt(Math.round(plan.valor*plan.repasse/100))} repasse</p>
              </div>
            </div>
          ))}
          {editingPlans && (
            <Button size="sm" variant="outline" onClick={addDraftPlan} className="w-full mt-3 gap-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 bg-transparent">
              <Plus className="w-4 h-4"/> Adicionar Plano
            </Button>
          )}
        </div>
      </div>

      {/* ── Repasses por Profissional ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Repasses por Profissional</h2>
            <p className="text-xs text-slate-400 mt-0.5">Percentual variado por médico</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
              <Percent className="w-3.5 h-3.5"/> Percentual individual
            </span>
            {!editingDoctors ? (
              <Button size="sm" variant="outline" onClick={startDoctorEdit} className="gap-2 text-slate-600">
                <Edit2 className="w-4 h-4"/> Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveDoctorEdit} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Save className="w-4 h-4"/> Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={cancelDoctorEdit} className="gap-2 text-slate-600">
                  <X className="w-4 h-4"/> Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase">
                <th className="text-left py-3">Profissional</th>
                <th className="text-center py-3">Atend.</th>
                <th className="text-right py-3">Faturado</th>
                <th className="text-center py-3">%</th>
                <th className="text-right py-3">Repasse</th>
                <th className="text-right py-3">Clínica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(editingDoctors ? draftDoctors : doctors).map((doc,i)=>{
                const rep = Math.round(doc.faturamento*doc.percentual/100);
                const cli = doc.faturamento - rep;
                return (
                  <tr key={doc.nome} className="hover:bg-slate-50">
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{doc.nome}</p>
                      <p className="text-xs text-slate-400">{doc.especialidade}</p>
                    </td>
                    <td className="py-3 text-center">
                      {editingDoctors
                        ? <Input type="number" className="h-7 w-16 text-center mx-auto" value={draftDoctors[i].atendimentos} onChange={e=>updateDraftDoc(i,'atendimentos',Number(e.target.value))}/>
                        : <span className="font-medium text-slate-700">{doc.atendimentos}</span>}
                    </td>
                    <td className="py-3 text-right">
                      {editingDoctors
                        ? <Input type="number" className="h-7 w-28 ml-auto" value={draftDoctors[i].faturamento} onChange={e=>updateDraftDoc(i,'faturamento',Number(e.target.value))}/>
                        : <span className="font-medium text-slate-700">{fmt(doc.faturamento)}</span>}
                    </td>
                    <td className="py-3 text-center">
                      {editingDoctors ? (
                        <div className="flex items-center gap-0.5 justify-center">
                          <Input type="number" className="h-7 w-14 text-center" value={draftDoctors[i].percentual} onChange={e=>updateDraftDoc(i,'percentual',Number(e.target.value))}/>
                          <span className="text-slate-400 text-xs">%</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'#73D5F020',color:'#4BBFE0'}}>
                          {doc.percentual}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600">{fmt(rep)}</td>
                    <td className="py-3 text-right font-bold text-[#920203]">{fmt(cli)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                <td className="py-3 pl-1 text-slate-800">Total</td>
                <td className="py-3 text-center text-slate-700">{doctors.reduce((s,d)=>s+d.atendimentos,0)}</td>
                <td className="py-3 text-right text-slate-800">{fmt(doctors.reduce((s,d)=>s+d.faturamento,0))}</td>
                <td/>
                <td className="py-3 text-right text-emerald-600">{fmt(doctors.reduce((s,d)=>s+Math.round(d.faturamento*d.percentual/100),0))}</td>
                <td className="py-3 text-right text-[#920203]">{fmt(doctors.reduce((s,d)=>s+(d.faturamento-Math.round(d.faturamento*d.percentual/100)),0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancial;
