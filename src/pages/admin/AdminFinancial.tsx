import { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  ChartConfiguration,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "day" | "week" | "month" | "year";

interface PeriodData {
  fat: number;
  rec: number;
  pend: number;
  desp: number;
  atend: number;
  faltas: number;
  remanej: number;
  history: number[];
  hlabels: string[];
  prevFat: number;
}

interface Doctor {
  nome: string;
  esp: string;
  atend: number;
  faltas: number;
  fat: number;
  perc: number;
  prevFat: number;
}

interface Plano {
  name: string;
  perc: number;
  atend: number;
  valor: number;
}

interface EntryForm {
  desc: string;
  tipo: "entrada" | "saida" | "repasse" | "plano";
  valor: number;
  atend: number;
  faltas: number;
  remanej: number;
  status: "recebido" | "pendente" | "cancelado";
}

type DataStore = Record<Period, PeriodData>;

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const INITIAL_DATA: DataStore = {
  day: {
    fat: 4820, rec: 3640, pend: 1180, desp: 980, atend: 18, faltas: 2, remanej: 3,
    history: [320,480,290,640,520,380,450,610,290,480,550,400],
    hlabels: ["8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h"],
    prevFat: 4200,
  },
  week: {
    fat: 28600, rec: 22100, pend: 6500, desp: 5800, atend: 112, faltas: 14, remanej: 18,
    history: [4200,5800,3900,6100,4700,2800,1100],
    hlabels: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
    prevFat: 26000,
  },
  month: {
    fat: 118400, rec: 94700, pend: 23700, desp: 31200, atend: 448, faltas: 52, remanej: 38,
    history: [3200,4100,3800,5200,4600,3900,5800,6200,4800,5100,7200,6800,5400,4900,6100,5700,4300,5800,6400,5100,4700,5900,6300,5500,4800,5200,6700,6100,5400,4900],
    hlabels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    prevFat: 104000,
  },
  year: {
    fat: 1284000, rec: 1042000, pend: 242000, desp: 318000, atend: 5124, faltas: 581, remanej: 420,
    history: [82000,91000,78000,104000,98000,112000,108000,95000,118000,124000,109000,115000],
    hlabels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    prevFat: 1180000,
  },
};

const INITIAL_DOCTORS: Doctor[] = [
  { nome: "Dr. Carlos Silva",  esp: "Clínico Geral", atend: 62, faltas: 8, fat: 12400, perc: 45, prevFat: 11200 },
  { nome: "Dra. Ana Souza",    esp: "Pediatria",     atend: 49, faltas: 5, fat:  9800, perc: 50, prevFat: 10500 },
  { nome: "Dr. Paulo Lima",    esp: "Cardiologia",   atend: 41, faltas: 4, fat: 18600, perc: 55, prevFat: 16900 },
  { nome: "Dra. Marta Dias",   esp: "Neurologia",    atend: 35, faltas: 6, fat: 14200, perc: 52, prevFat: 13800 },
];

const INITIAL_PLANOS: Plano[] = [
  { name: "Unimed",          perc: 65, atend: 38, valor: 5700 },
  { name: "Bradesco Saúde",  perc: 70, atend: 24, valor: 4200 },
  { name: "SulAmérica",      perc: 68, atend: 19, valor: 3100 },
  { name: "Amil",            perc: 60, atend: 15, valor: 2400 },
  { name: "Hapvida",         perc: 55, atend: 12, valor: 1800 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number): string =>
  "R$ " + Math.round(v).toLocaleString("pt-BR");

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

function Modal({ visible, onClose, title, children, actions }: ModalProps) {
  if (!visible) return null;
  return (
    <div
      className="modal-overlay"
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:12,padding:"1.5rem",width:"min(520px, 95vw)",maxHeight:"90vh",overflowY:"auto" }}>
        <h2 style={{ fontSize:16,fontWeight:500,marginBottom:"1rem",color:"var(--color-text-primary)" }}>{title}</h2>
        {children}
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:"1rem" }}>{actions}</div>
      </div>
    </div>
  );
}

interface KPICardProps {
  lbl: string;
  val: string;
  delta: string;
  deltaClass: string;
  icon: string;
}

function KPICard({ lbl, val, delta, deltaClass, icon }: KPICardProps) {
  return (
    <div style={{ background:"var(--color-background-secondary)",borderRadius:8,padding:"14px 16px",position:"relative" }}>
      <i className={`ti ${icon}`} style={{ position:"absolute",top:14,right:14,fontSize:18,color:"var(--color-text-tertiary)" }} />
      <div style={{ fontSize:12,color:"var(--color-text-secondary)",marginBottom:6 }}>{lbl}</div>
      <div style={{ fontSize:22,fontWeight:500,color:"var(--color-text-primary)" }}>{val}</div>
      <div style={{ fontSize:11,marginTop:4,color: deltaClass === "up" ? "#0f6e56" : deltaClass === "down" ? "#a32d2d" : "var(--color-text-secondary)" }}>
        {delta}
      </div>
    </div>
  );
}

// ─── Chart hooks ──────────────────────────────────────────────────────────────

function useFatChart(d: PeriodData, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const instRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (instRef.current) instRef.current.destroy();
    const cfg: ChartConfiguration = {
      type: "bar",
      data: {
        labels: d.hlabels,
        datasets: [{ label: "Faturamento", data: d.history, backgroundColor: "#185fa5", borderRadius: 4, maxBarThickness: 32 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, autoSkip: true, maxRotation: 0 } },
          y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 }, callback: (v) => (Number(v) >= 1000 ? "R$" + (Number(v) / 1000).toFixed(0) + "k" : "R$" + v) } },
        },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instRef.current = new Chart(canvasRef.current, cfg as any);
    return () => { instRef.current?.destroy(); };
  }, [d, canvasRef]);
}

function useFlowChart(d: PeriodData, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const instRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (instRef.current) instRef.current.destroy();
    const cfg: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: ["Recebido", "A Receber", "Despesas"],
        datasets: [{ data: [d.rec, d.pend, d.desp], backgroundColor: ["#1d9e75","#ba7517","#a32d2d"], borderWidth: 0, spacing: 3, borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { display: false } },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instRef.current = new Chart(canvasRef.current, cfg as any);
    return () => { instRef.current?.destroy(); };
  }, [d, canvasRef]);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClinicaDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [month, setMonth] = useState<number>(4);
  const [year, setYear] = useState<string>("2025");
  const [data, setData] = useState<DataStore>(JSON.parse(JSON.stringify(INITIAL_DATA)));
  const [doctors, setDoctors] = useState<Doctor[]>(JSON.parse(JSON.stringify(INITIAL_DOCTORS)));
  const [planos, setPlanos] = useState<Plano[]>(JSON.parse(JSON.stringify(INITIAL_PLANOS)));

  // Modal visibility
  const [showEntry, setShowEntry] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const [showPlanos, setShowPlanos] = useState(false);
  const [showMedicos, setShowMedicos] = useState(false);

  // Form states
  const [entryForm, setEntryForm] = useState<EntryForm>({ desc:"", tipo:"entrada", valor:0, atend:0, faltas:0, remanej:0, status:"recebido" });
  const [agendaForm, setAgendaForm] = useState({ atend:0, faltas:0, remanej:0, fat:0, rec:0, pend:0, desp:0 });
  const [editDoctors, setEditDoctors] = useState<Doctor[]>([]);
  const [editPlanos, setEditPlanos] = useState<Plano[]>([]);

  // Chart refs
  const fatRef = useRef<HTMLCanvasElement>(null);
  const flowRef = useRef<HTMLCanvasElement>(null);
  useFatChart(data[period], fatRef);
  useFlowChart(data[period], flowRef);

  const d = data[period];

  const getPeriodLabel = useCallback((): string => {
    if (period === "day") return "Hoje";
    if (period === "week") return "Esta semana";
    if (period === "month") return `${MONTHS[month]} ${year}`;
    return `Ano ${year}`;
  }, [period, month, year]);

  const txComp = d.atend + d.faltas > 0 ? Math.round(d.atend / (d.atend + d.faltas) * 100) : 0;
  const deltaFat = ((d.fat - d.prevFat) / d.prevFat * 100).toFixed(1);

  const kpis: KPICardProps[] = [
    { lbl:"Faturamento",     val: fmt(d.fat),                        delta: `${Number(deltaFat) >= 0 ? "▲" : "▼"} ${Math.abs(Number(deltaFat))}% vs período anterior`,  deltaClass: Number(deltaFat) >= 0 ? "up" : "down", icon:"ti-currency-dollar" },
    { lbl:"Recebido",        val: fmt(d.rec),                        delta: `${Math.round(d.rec/d.fat*100)}% do faturado`,             deltaClass:"up",                         icon:"ti-check" },
    { lbl:"A Receber",       val: fmt(d.pend),                       delta: `${Math.round(d.pend/d.fat*100)}% pendente`,               deltaClass:"",                           icon:"ti-clock" },
    { lbl:"Despesas",        val: fmt(d.desp),                       delta: `${Math.round(d.desp/d.fat*100)}% do faturado`,            deltaClass: d.desp/d.fat > .35 ? "down" : "", icon:"ti-trending-down" },
    { lbl:"Atendimentos",    val: d.atend.toLocaleString("pt-BR"),   delta: `${d.faltas} faltas · ${d.remanej} remarcados`,            deltaClass:"",                           icon:"ti-users" },
    { lbl:"Comparecimento",  val: txComp + "%",                      delta: txComp >= 85 ? "Acima da meta (85%)" : "Abaixo da meta (85%)", deltaClass: txComp >= 85 ? "up" : "down", icon:"ti-chart-bar" },
  ];

  // ── Entry modal save ────────────────────────────────────────────────────────
  const handleEntrySave = () => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DataStore;
      const pd = next[period];
      if (entryForm.valor > 0) {
        if (entryForm.tipo === "entrada" || entryForm.tipo === "plano") {
          pd.fat += entryForm.valor;
          if (entryForm.status === "recebido") pd.rec += entryForm.valor;
          else pd.pend += entryForm.valor;
        }
        if (entryForm.tipo === "saida") pd.desp += entryForm.valor;
        if (entryForm.tipo === "repasse") { pd.fat += entryForm.valor; pd.rec += entryForm.valor; }
      }
      pd.atend += entryForm.atend;
      pd.faltas += entryForm.faltas;
      pd.remanej += entryForm.remanej;
      return next;
    });
    setShowEntry(false);
    setEntryForm({ desc:"", tipo:"entrada", valor:0, atend:0, faltas:0, remanej:0, status:"recebido" });
  };

  // ── Agenda modal open/save ──────────────────────────────────────────────────
  const openAgenda = () => {
    setAgendaForm({ atend:d.atend, faltas:d.faltas, remanej:d.remanej, fat:d.fat, rec:d.rec, pend:d.pend, desp:d.desp });
    setShowAgenda(true);
  };
  const handleAgendaSave = () => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DataStore;
      Object.assign(next[period], agendaForm);
      return next;
    });
    setShowAgenda(false);
  };

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const totRep = doctors.reduce((s, doc) => s + Math.round(doc.fat * doc.perc / 100), 0);
    const totCli = doctors.reduce((s, doc) => s + doc.fat - Math.round(doc.fat * doc.perc / 100), 0);
    const tx = d.atend + d.faltas > 0 ? Math.round(d.atend / (d.atend + d.faltas) * 100) : 0;
    const label = getPeriodLabel();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório Financeiro - ${label}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#222;margin:32px}
      h1{font-size:20px;margin-bottom:4px}.sub{color:#666;margin-bottom:24px;font-size:12px}
      .section{margin-bottom:24px}h2{font-size:14px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:12px}
      .kpi-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
      .kpi{background:#f5f5f5;border-radius:6px;padding:10px 14px;min-width:120px}
      .kpi-lbl{font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase}.kpi-val{font-size:16px;font-weight:bold}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{background:#f0f0f0;text-align:left;padding:6px 8px;border:1px solid #ddd}
      td{padding:5px 8px;border:1px solid #ddd}tfoot td{background:#f5f5f5;font-weight:bold}
      .up{color:#0f6e56}.dn{color:#a32d2d}
    </style></head><body>
    <h1>Relatório Financeiro</h1>
    <div class="sub">Período: ${label} · Gerado em ${new Date().toLocaleDateString("pt-BR")}</div>
    <div class="section"><h2>Resumo Financeiro</h2>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-lbl">Faturamento</div><div class="kpi-val">${fmt(d.fat)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Recebido</div><div class="kpi-val">${fmt(d.rec)}</div></div>
      <div class="kpi"><div class="kpi-lbl">A Receber</div><div class="kpi-val">${fmt(d.pend)}</div></div>
      <div class="kpi"><div class="kpi-lbl">Despesas</div><div class="kpi-val">${fmt(d.desp)}</div></div>
    </div></div>
    <div class="section"><h2>Agenda e Atendimentos</h2>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-lbl">Realizados</div><div class="kpi-val">${d.atend}</div></div>
      <div class="kpi"><div class="kpi-lbl">Faltas</div><div class="kpi-val">${d.faltas}</div></div>
      <div class="kpi"><div class="kpi-lbl">Remarcados</div><div class="kpi-val">${d.remanej}</div></div>
      <div class="kpi"><div class="kpi-lbl">Taxa Comparecimento</div><div class="kpi-val ${tx >= 85 ? "up" : "dn"}">${tx}%</div></div>
    </div></div>
    <div class="section"><h2>Repasses por Profissional</h2>
    <table><thead><tr><th>Profissional</th><th>Especialidade</th><th>Atend.</th><th>Faltas</th><th>Faturado</th><th>%</th><th>Repasse</th><th>Clínica</th><th>Variação</th></tr></thead>
    <tbody>${doctors.map(doc => {
      const rep = Math.round(doc.fat * doc.perc / 100);
      const cli = doc.fat - rep;
      const delta = ((doc.fat - doc.prevFat) / (doc.prevFat || 1) * 100).toFixed(1);
      return `<tr><td>${doc.nome}</td><td>${doc.esp}</td><td>${doc.atend}</td><td>${doc.faltas}</td><td>${fmt(doc.fat)}</td><td>${doc.perc}%</td><td class="up">${fmt(rep)}</td><td class="dn">${fmt(cli)}</td><td class="${Number(delta) >= 0 ? "up" : "dn"}">${Number(delta) >= 0 ? "▲" : "▼"} ${Math.abs(Number(delta))}%</td></tr>`;
    }).join("")}</tbody>
    <tfoot><tr><td colspan="2"><strong>Total</strong></td><td>${doctors.reduce((s,doc)=>s+doc.atend,0)}</td><td>${doctors.reduce((s,doc)=>s+doc.faltas,0)}</td><td>${fmt(doctors.reduce((s,doc)=>s+doc.fat,0))}</td><td>—</td><td class="up">${fmt(totRep)}</td><td class="dn">${fmt(totCli)}</td><td>—</td></tr></tfoot>
    </table></div>
    <div class="section"><h2>Planos de Saúde</h2>
    <table><thead><tr><th>Plano</th><th>Atendimentos</th><th>Repasse %</th><th>Valor Total</th><th>Valor Repasse</th></tr></thead>
    <tbody>${planos.map(p => `<tr><td>${p.name}</td><td>${p.atend}</td><td>${p.perc}%</td><td>${fmt(p.valor)}</td><td class="up">${fmt(Math.round(p.valor*p.perc/100))}</td></tr>`).join("")}</tbody>
    <tfoot><tr><td><strong>Total</strong></td><td>${planos.reduce((s,p)=>s+p.atend,0)}</td><td>—</td><td>${fmt(planos.reduce((s,p)=>s+p.valor,0))}</td><td>${fmt(planos.reduce((s,p)=>s+Math.round(p.valor*p.perc/100),0))}</td></tr></tfoot>
    </table></div>
    <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };

  // ── Inline styles (mirror original CSS variables) ──────────────────────────
  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --color-background-primary:#ffffff;--color-background-secondary:#f4f4f3;
      --color-background-tertiary:#ebebea;--color-text-primary:#1a1a19;
      --color-text-secondary:#5f5e5a;--color-text-tertiary:#888780;
      --color-border-tertiary:rgba(0,0,0,0.10);--color-border-secondary:rgba(0,0,0,0.18);
    }

    body{font-family:system-ui,-apple-system,sans-serif;background:var(--color-background-tertiary);color:var(--color-text-primary);padding:24px;min-height:100vh}
    .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500}
    .badge-blue{background:#e6f1fb;color:#185fa5}.badge-green{background:#eaf3de;color:#3b6d11}
    .badge-amber{background:#faeeda;color:#854f0b}.badge-red{background:#fcebeb;color:#a32d2d}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;font-size:11px;font-weight:500;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.04em;padding:0 8px 8px;border-bottom:0.5px solid var(--color-border-tertiary)}
    th.r{text-align:right}
    td{padding:9px 8px;border-bottom:0.5px solid var(--color-border-tertiary);color:var(--color-text-primary);vertical-align:middle}
    td.r{text-align:right}
    tbody tr:last-child td{border-bottom:none}
    tfoot td{font-weight:500;padding:10px 8px;border-top:0.5px solid var(--color-border-secondary);border-bottom:none}
    @media(max-width:600px){body{padding:12px}}
  `;

  const S = {
    dash: { maxWidth:1100, margin:"0 auto" } as React.CSSProperties,
    topBar: { display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12,marginBottom:"1.5rem" } as React.CSSProperties,
    topActions: { display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" as const } as React.CSSProperties,
    periodTabs: { display:"flex",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,overflow:"hidden" } as React.CSSProperties,
    twoCol: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 } as React.CSSProperties,
    card: { background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1rem 1.25rem" } as React.CSSProperties,
    cardHead: { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" } as React.CSSProperties,
  };

  const tabBtn = (p: Period): React.CSSProperties => ({
    padding:"6px 14px",fontSize:13,background: period === p ? "var(--color-text-primary)" : "transparent",
    border:"none",cursor:"pointer",color: period === p ? "var(--color-background-primary)" : "var(--color-text-secondary)",transition:"all .15s",
  });
  const btn = (primary = false, danger = false, sm = false): React.CSSProperties => ({
    fontSize: sm ? 12 : 13,
    padding: sm ? "4px 10px" : "6px 14px",
    border: `0.5px solid ${danger ? "#a32d2d" : "var(--color-border-secondary)"}`,
    borderRadius:8,
    background: primary ? "var(--color-text-primary)" : "transparent",
    color: primary ? "var(--color-background-primary)" : danger ? "#a32d2d" : "var(--color-text-primary)",
    cursor:"pointer",
    display:"inline-flex",alignItems:"center",gap:6,
  });
  const input: React.CSSProperties = {
    width:"100%",fontSize:13,padding:"7px 10px",border:"0.5px solid var(--color-border-secondary)",
    borderRadius:8,background:"var(--color-background-primary)",color:"var(--color-text-primary)",
  };
  const select: React.CSSProperties = {
    fontSize:13,padding:"5px 10px",border:"0.5px solid var(--color-border-secondary)",
    borderRadius:8,background:"var(--color-background-primary)",color:"var(--color-text-primary)",cursor:"pointer",
  };
  const formLabel: React.CSSProperties = { fontSize:12,color:"var(--color-text-secondary)",marginBottom:4,display:"block" };

  const maxPlanVal = Math.max(...planos.map((p) => p.valor), 1);

  return (
    <>
      <style>{css}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/dist/tabler-icons.min.css" />

      <div style={S.dash}>
        {/* TOP BAR */}
        <div style={S.topBar}>
          <div>
            <h1 style={{ fontSize:18,fontWeight:500,color:"var(--color-text-primary)" }}>Financeiro da Clínica</h1>
            <p style={{ fontSize:13,color:"var(--color-text-secondary)",marginTop:2 }}>{getPeriodLabel()}</p>
          </div>
          <div style={S.topActions}>
            <div style={S.periodTabs}>
              {(["day","week","month","year"] as Period[]).map((p) => (
                <button key={p} style={tabBtn(p)} onClick={() => setPeriod(p)}>
                  {{ day:"Dia", week:"Semana", month:"Mês", year:"Ano" }[p]}
                </button>
              ))}
            </div>
            {period === "month" && (
              <select style={select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            )}
            <select style={select} value={year} onChange={(e) => setYear(e.target.value)}>
              {["2024","2025","2026"].map((y) => <option key={y}>{y}</option>)}
            </select>
            <button style={btn(true)} onClick={() => setShowEntry(true)}><i className="ti ti-plus" /> Lançar</button>
            <button style={btn()} onClick={exportPDF}><i className="ti ti-download" /> Exportar PDF</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:"1.5rem" }}>
          {kpis.map((k) => <KPICard key={k.lbl} {...k} />)}
        </div>

        {/* CHARTS */}
        <div style={{ ...S.twoCol, marginBottom:"1.5rem" }}>
          <div style={S.card}>
            <div style={S.cardHead}>
              <h3 style={{ fontSize:14,fontWeight:500 }}>Faturamento no período</h3>
              <span style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)" }}>{getPeriodLabel()}</span>
            </div>
            <div style={{ position:"relative",height:200 }}>
              <canvas ref={fatRef} />
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardHead}>
              <h3 style={{ fontSize:14,fontWeight:500 }}>Entradas vs Saídas</h3>
              <span style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)" }}>Período atual</span>
            </div>
            <div style={{ position:"relative",height:200 }}>
              <canvas ref={flowRef} />
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:12,marginTop:10,fontSize:12,color:"var(--color-text-secondary)" }}>
              {([["#1d9e75","Recebido",d.rec],["#ba7517","A Receber",d.pend],["#a32d2d","Despesas",d.desp]] as [string,string,number][]).map(([color,label,val]) => (
                <span key={label} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ width:10,height:10,borderRadius:2,background:color,flexShrink:0 }} />
                  {label} {fmt(val)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AGENDA + PLANOS */}
        <div style={{ ...S.twoCol, marginBottom:"1.5rem" }}>
          <div style={S.card}>
            <div style={S.cardHead}>
              <h3 style={{ fontSize:14,fontWeight:500 }}>Agenda e Atendimentos</h3>
              <button style={btn(false,false,true)} onClick={openAgenda}><i className="ti ti-edit" /> Editar</button>
            </div>
            {([
              { ico:"ti-check", bg:"#eaf3de", ic:"#3b6d11", lbl:"Realizados",  val:d.atend,  sub:"atendimentos" },
              { ico:"ti-x",     bg:"#fcebeb", ic:"#a32d2d", lbl:"Faltas",      val:d.faltas, sub:"ausências" },
              { ico:"ti-refresh",bg:"#faeeda",ic:"#854f0b", lbl:"Remarcados",  val:d.remanej,sub:"reagendamentos" },
            ]).map((r) => (
              <div key={r.lbl} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:r.bg,flexShrink:0 }}>
                  <i className={`ti ${r.ico}`} style={{ color:r.ic }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13 }}>{r.lbl}</div>
                  <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{r.sub}</div>
                </div>
                <div style={{ fontSize:16,fontWeight:500 }}>{r.val}</div>
              </div>
            ))}
            <div style={{ marginTop:12,paddingTop:12,borderTop:"0.5px solid var(--color-border-tertiary)",display:"flex",justifyContent:"space-between",fontSize:13 }}>
              <span style={{ color:"var(--color-text-secondary)" }}>Taxa de comparecimento</span>
              <span style={{ fontWeight:500,color: txComp >= 85 ? "#0f6e56" : "#a32d2d" }}>{txComp}%</span>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardHead}>
              <h3 style={{ fontSize:14,fontWeight:500 }}>Planos de Saúde</h3>
              <button style={btn(false,false,true)} onClick={() => { setEditPlanos(JSON.parse(JSON.stringify(planos))); setShowPlanos(true); }}>
                <i className="ti ti-edit" /> Editar
              </button>
            </div>
            {planos.map((p) => {
              const rep = Math.round(p.valor * p.perc / 100);
              const barW = Math.round(p.valor / maxPlanVal * 100);
              return (
                <div key={p.name} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:500 }}>{p.name}</div>
                    <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{p.atend} atend. · Repasse {p.perc}%</div>
                  </div>
                  <div style={{ flex:1,height:6,background:"var(--color-background-secondary)",borderRadius:4,minWidth:80 }}>
                    <div style={{ height:6,borderRadius:4,background:"#185fa5",width:`${barW}%` }} />
                  </div>
                  <div style={{ textAlign:"right",fontSize:12,minWidth:110 }}>
                    <div style={{ fontSize:13,fontWeight:500 }}>{fmt(p.valor)}</div>
                    <div style={{ color:"var(--color-text-secondary)" }}>rep. {fmt(rep)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REPASSES TABLE */}
        <div style={{ ...S.card, marginBottom:"1.5rem" }}>
          <div style={S.cardHead}>
            <h3 style={{ fontSize:14,fontWeight:500 }}>Repasses por Profissional</h3>
            <button style={btn(false,false,true)} onClick={() => { setEditDoctors(JSON.parse(JSON.stringify(doctors))); setShowMedicos(true); }}>
              <i className="ti ti-edit" /> Editar
            </button>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Profissional</th><th className="r">Atend.</th><th className="r">Faltas</th>
                  <th className="r">Faturado</th><th className="r">%</th><th className="r">Repasse</th>
                  <th className="r">Clínica</th><th className="r">Variação</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => {
                  const rep = Math.round(doc.fat * doc.perc / 100);
                  const cli = doc.fat - rep;
                  const delta = ((doc.fat - doc.prevFat) / (doc.prevFat || 1) * 100).toFixed(1);
                  const isUp = Number(delta) >= 0;
                  return (
                    <tr key={doc.nome}>
                      <td>
                        <div style={{ fontWeight:500 }}>{doc.nome}</div>
                        <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{doc.esp}</div>
                      </td>
                      <td className="r">{doc.atend}</td>
                      <td className="r"><span className="badge badge-red">{doc.faltas}</span></td>
                      <td className="r">{fmt(doc.fat)}</td>
                      <td className="r"><span className="badge badge-blue">{doc.perc}%</span></td>
                      <td className="r" style={{ color:"#0f6e56",fontWeight:500 }}>{fmt(rep)}</td>
                      <td className="r" style={{ color:"#a32d2d",fontWeight:500 }}>{fmt(cli)}</td>
                      <td className="r"><span className={`badge ${isUp ? "badge-green" : "badge-red"}`}>{isUp ? "▲" : "▼"} {Math.abs(Number(delta))}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td className="r"><strong>{doctors.reduce((s,d)=>s+d.atend,0)}</strong></td>
                  <td className="r"><strong>{doctors.reduce((s,d)=>s+d.faltas,0)}</strong></td>
                  <td className="r"><strong>{fmt(doctors.reduce((s,d)=>s+d.fat,0))}</strong></td>
                  <td className="r">—</td>
                  <td className="r" style={{ color:"#0f6e56" }}><strong>{fmt(doctors.reduce((s,d)=>s+Math.round(d.fat*d.perc/100),0))}</strong></td>
                  <td className="r" style={{ color:"#a32d2d" }}><strong>{fmt(doctors.reduce((s,d)=>s+d.fat-Math.round(d.fat*d.perc/100),0))}</strong></td>
                  <td className="r">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: LANÇAMENTO */}
      <Modal visible={showEntry} onClose={() => setShowEntry(false)} title="Novo Lançamento"
        actions={<>
          <button style={btn()} onClick={() => setShowEntry(false)}>Cancelar</button>
          <button style={btn(true)} onClick={handleEntrySave}><i className="ti ti-check" /> Salvar</button>
        </>}
      >
        <div style={{ marginBottom:12 }}>
          <label style={formLabel}>Descrição</label>
          <input style={input} placeholder="Ex: Consulta Dr. Carlos..." value={entryForm.desc}
            onChange={(e) => setEntryForm((f) => ({ ...f, desc:e.target.value }))} />
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Tipo</label>
            <select style={input} value={entryForm.tipo} onChange={(e) => setEntryForm((f) => ({ ...f, tipo:e.target.value as EntryForm["tipo"] }))}>
              <option value="entrada">Entrada (Receita)</option>
              <option value="saida">Saída (Despesa)</option>
              <option value="repasse">Repasse Médico</option>
              <option value="plano">Plano de Saúde</option>
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Valor (R$)</label>
            <input style={input} type="number" placeholder="0,00" min={0} value={entryForm.valor || ""}
              onChange={(e) => setEntryForm((f) => ({ ...f, valor:Number(e.target.value) }))} />
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
          {(["atend","faltas","remanej"] as const).map((field) => (
            <div key={field} style={{ marginBottom:12 }}>
              <label style={formLabel}>{{ atend:"Atendimentos", faltas:"Faltas", remanej:"Remarcados" }[field]}</label>
              <input style={input} type="number" min={0} value={entryForm[field] || ""}
                onChange={(e) => setEntryForm((f) => ({ ...f, [field]:Number(e.target.value) }))} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={formLabel}>Status</label>
          <select style={input} value={entryForm.status} onChange={(e) => setEntryForm((f) => ({ ...f, status:e.target.value as EntryForm["status"] }))}>
            <option value="recebido">Recebido</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </Modal>

      {/* MODAL: AGENDA */}
      <Modal visible={showAgenda} onClose={() => setShowAgenda(false)} title="Editar Agenda"
        actions={<>
          <button style={btn()} onClick={() => setShowAgenda(false)}>Cancelar</button>
          <button style={btn(true)} onClick={handleAgendaSave}><i className="ti ti-check" /> Salvar</button>
        </>}
      >
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
          {(["atend","faltas","remanej"] as const).map((field) => (
            <div key={field} style={{ marginBottom:12 }}>
              <label style={formLabel}>{{ atend:"Realizados", faltas:"Faltas", remanej:"Remarcados" }[field]}</label>
              <input style={input} type="number" value={agendaForm[field]}
                onChange={(e) => setAgendaForm((f) => ({ ...f, [field]:Number(e.target.value) }))} />
            </div>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {(["fat","rec","pend","desp"] as const).map((field) => (
            <div key={field} style={{ marginBottom:12 }}>
              <label style={formLabel}>{{ fat:"Faturamento (R$)", rec:"Recebido (R$)", pend:"A Receber (R$)", desp:"Despesas (R$)" }[field]}</label>
              <input style={input} type="number" value={agendaForm[field]}
                onChange={(e) => setAgendaForm((f) => ({ ...f, [field]:Number(e.target.value) }))} />
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL: PLANOS */}
      <Modal visible={showPlanos} onClose={() => setShowPlanos(false)} title="Editar Planos de Saúde"
        actions={<>
          <button style={btn()} onClick={() => setShowPlanos(false)}>Cancelar</button>
          <button style={btn(true)} onClick={() => { setPlanos(editPlanos); setShowPlanos(false); }}>
            <i className="ti ti-check" /> Salvar
          </button>
        </>}
      >
        {editPlanos.map((p, i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"6px 0",borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
            <input style={{ ...input,width:120,flexShrink:0 }} value={p.name}
              onChange={(e) => setEditPlanos((arr) => arr.map((x,j) => j===i ? {...x,name:e.target.value} : x))} />
            {(["atend","perc","valor"] as const).map((field) => (
              <label key={field} style={{ fontSize:12,color:"var(--color-text-secondary)",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4 }}>
                {{ atend:"Atend", perc:"Rep%", valor:"Valor" }[field]}
                <input style={{ ...input,width:field==="valor"?90:80,textAlign:"right" }} type="number" value={p[field]}
                  onChange={(e) => setEditPlanos((arr) => arr.map((x,j) => j===i ? {...x,[field]:Number(e.target.value)} : x))} />
              </label>
            ))}
            <button style={btn(false,true,true)} onClick={() => setEditPlanos((arr) => arr.filter((_,j)=>j!==i))}>
              <i className="ti ti-trash" />
            </button>
          </div>
        ))}
        <button style={{ ...btn(),marginTop:10 }} onClick={() => setEditPlanos((arr) => [...arr,{name:"Novo Plano",perc:0,atend:0,valor:0}])}>
          <i className="ti ti-plus" /> Adicionar Plano
        </button>
      </Modal>

      {/* MODAL: MÉDICOS */}
      <Modal visible={showMedicos} onClose={() => setShowMedicos(false)} title="Editar Profissionais"
        actions={<>
          <button style={btn()} onClick={() => setShowMedicos(false)}>Cancelar</button>
          <button style={btn(true)} onClick={() => { setDoctors(editDoctors); setShowMedicos(false); }}>
            <i className="ti ti-check" /> Salvar
          </button>
        </>}
      >
        {editDoctors.map((doc, i) => (
          <div key={i} style={{ border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:10,marginBottom:8 }}>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:6 }}>
              <input style={{ ...input,flex:1,minWidth:120 }} value={doc.nome}
                onChange={(e) => setEditDoctors((arr) => arr.map((x,j)=>j===i?{...x,nome:e.target.value}:x))} />
              <input style={{ ...input,flex:1,minWidth:100 }} value={doc.esp}
                onChange={(e) => setEditDoctors((arr) => arr.map((x,j)=>j===i?{...x,esp:e.target.value}:x))} />
              <button style={btn(false,true,true)} onClick={() => setEditDoctors((arr)=>arr.filter((_,j)=>j!==i))}>
                <i className="ti ti-trash" />
              </button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:6 }}>
              {(["atend","faltas","fat","perc","prevFat"] as const).map((field) => (
                <label key={field} style={{ ...formLabel,display:"block" }}>
                  {{ atend:"Atend",faltas:"Faltas",fat:"Faturado R$",perc:"Repasse %",prevFat:"Mês ant. R$" }[field]}
                  <input style={input} type="number" value={doc[field]}
                    onChange={(e) => setEditDoctors((arr)=>arr.map((x,j)=>j===i?{...x,[field]:Number(e.target.value)}:x))} />
                </label>
              ))}
            </div>
          </div>
        ))}
        <button style={{ ...btn(),marginTop:10 }} onClick={() => setEditDoctors((arr)=>[...arr,{nome:"Novo Médico",esp:"Especialidade",atend:0,faltas:0,fat:0,perc:50,prevFat:0}])}>
          <i className="ti ti-plus" /> Adicionar Profissional
        </button>
      </Modal>
    </>
  );
}

