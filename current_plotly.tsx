import { useState, useEffect } from 'react';
import { DollarSign, Percent, TrendingUp, Building2 } from 'lucide-react';
import Plot from 'react-plotly.js';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FinData { 
  faturamento: number; 
  recebido: number; 
  pendente: number; 
  atendimentos: number; 
  remarcados: number; 
  desistencias: number;
}

// ── Period data ───────────────────────────────────────────────────────────────
const PERIOD_DEFAULTS: Record<string, FinData> = {
  day:   { faturamento: 4820,   recebido: 3640,   pendente: 1180,   atendimentos: 18,  remarcados: 3,  desistencias: 2  },
  week:  { faturamento: 28600,  recebido: 22100,  pendente: 6500,   atendimentos: 112, remarcados: 14, desistencias: 8  },
  month: { faturamento: 118400, recebido: 94700,  pendente: 23700,  atendimentos: 448, remarcados: 52, desistencias: 31 },
  year:  { faturamento: 1284000,recebido: 1042000,pendente: 242000, atendimentos: 5124,remarcados: 582,desistencias: 341},
};

const fmt = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).replace('$', '$ ');

const AdminFinancial = () => {
  const [mounted, setMounted] = useState(false);
  const fin = PERIOD_DEFAULTS.year;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-foreground">Financial Management</h1>
        </div>
      </div>

      {/* ── Top KPIs (4 boxes) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Accounts Receivable */}
        <div className="bg-card rounded-sm border border-border p-5 text-center relative overflow-hidden flex flex-col justify-center min-h-[120px] shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-1">Total Accounts Receivable</p>
          <p className="text-3xl font-light text-[#88AED0] z-10">{fmt(6621280)}</p>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20 bg-gradient-to-t from-[#88AED0] to-transparent pointer-events-none" style={{ clipPath: 'polygon(0 100%, 10% 50%, 30% 70%, 50% 30%, 70% 60%, 90% 20%, 100% 100%)' }} />
        </div>
        {/* Box 2: Accounts Payable */}
        <div className="bg-card rounded-sm border border-border p-5 text-center relative overflow-hidden flex flex-col justify-center min-h-[120px] shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-1">Total Accounts Payable</p>
          <p className="text-3xl font-light text-[#FF6B6B] z-10">{fmt(1630270)}</p>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20 bg-gradient-to-t from-[#FF6B6B] to-transparent pointer-events-none" style={{ clipPath: 'polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 50%, 100% 100%)' }} />
        </div>
        {/* Box 3: Equity Ratio */}
        <div className="bg-card rounded-sm border border-border p-5 text-center flex flex-col justify-center min-h-[120px] shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-1">Equity Ratio</p>
          <p className="text-3xl font-light text-[#2A5C82]">75.38 %</p>
        </div>
        {/* Box 4: Debt Equity */}
        <div className="bg-card rounded-sm border border-border p-5 text-center flex flex-col justify-center min-h-[120px] shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-1">Debt Equity</p>
          <p className="text-3xl font-light text-[#2A5C82]">1.10 %</p>
        </div>
      </div>

      {/* ── Gauges and Bar Chart Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauges (Col 1 & 2) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col items-center">
            <div className="w-full text-left mb-2">
              <p className="text-xs font-semibold text-foreground">Current Ratio</p>
            </div>
            <Plot
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: 1.86,
                  number: { suffix: "%", font: { size: 20 } },
                  gauge: {
                    axis: { range: [0, 3], visible: true, tickvals: [0, 3] },
                    bar: { color: "#2A5C82" },
                    bgcolor: "#e2e8f0",
                    borderwidth: 0,
                  }
                } as React.ComponentProps<typeof Plot>['data'][0]
              ]}
              layout={{ width: 220, height: 180, margin: { t: 20, b: 20, l: 20, r: 20 } }}
              config={{ displayModeBar: false }}
            />
          </div>
          <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col items-center">
            <div className="w-full text-left mb-2">
              <p className="text-xs font-semibold text-foreground">DSI</p>
              <p className="text-[10px] text-muted-foreground">[Days Sales Inventory]</p>
            </div>
            <Plot
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: 10,
                  number: { suffix: " Days", font: { size: 20 } },
                  gauge: {
                    axis: { range: [0, 31], visible: true, tickvals: [0, 31] },
                    bar: { color: "#F59E0B" },
                    bgcolor: "#e2e8f0",
                    borderwidth: 0,
                  }
                } as React.ComponentProps<typeof Plot>['data'][0]
              ]}
              layout={{ width: 220, height: 180, margin: { t: 20, b: 20, l: 20, r: 20 } }}
              config={{ displayModeBar: false }}
            />
          </div>
          <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col items-center">
            <div className="w-full text-left mb-2">
              <p className="text-xs font-semibold text-foreground">DSO</p>
              <p className="text-[10px] text-muted-foreground">[Days Sales Outstanding]</p>
            </div>
            <Plot
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: 7,
                  number: { suffix: " Days", font: { size: 20 } },
                  gauge: {
                    axis: { range: [0, 31], visible: true, tickvals: [0, 31] },
                    bar: { color: "#FF6B6B" },
                    bgcolor: "#e2e8f0",
                    borderwidth: 0,
                  }
                } as React.ComponentProps<typeof Plot>['data'][0]
              ]}
              layout={{ width: 220, height: 180, margin: { t: 20, b: 20, l: 20, r: 20 } }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>

        {/* Bar Chart (Col 3) */}
        <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-4">Total Accounts Receivable and Payable Aging</p>
          <div className="flex-1 min-h-[200px]">
            <Plot
              data={[
                {
                  x: ['Current', '1-30', '31-60', '61-90', '91+'],
                  y: [2490000, 2030000, 950000, 800000, 250000],
                  type: 'bar',
                  name: 'Accounts Receivable',
                  marker: { color: '#2A5C82' },
                  text: ['2.49M', '2.03M', '81.16K', '86.64K', '79.45K'],
                  textposition: 'outside'
                },
                {
                  x: ['Current', '1-30', '31-60', '61-90', '91+'],
                  y: [1340000, 150000, 100000, 80000, 46920],
                  type: 'bar',
                  name: 'Accounts Payable',
                  marker: { color: '#FF6B6B' },
                }
              ]}
              layout={{
                barmode: 'group',
                autosize: true,
                margin: { l: 40, r: 10, t: 10, b: 40 },
                legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
                xaxis: { title: 'Due Date', titlefont: { size: 10 }, tickfont: { size: 10 } },
                yaxis: { tickfont: { size: 10 } }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>
      </div>

      {/* ── Line Chart and Stacked Bar Chart Row ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart */}
        <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-4">Net Working Capital vs Gross Working Capital</p>
          <div className="flex-1 min-h-[300px]">
            <Plot
              data={[
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [7790, 18000, 136360, 222120, -107210, -18290, -31150, 560980, -18720, 323380, 218580, -48660],
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Net Working Capital',
                  marker: { color: '#F59E0B' },
                  line: { shape: 'spline' }
                },
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [10000, 25000, 248700, 263710, 203360, 199560, 305700, 510550, 91070, 335000, 237240, 10000],
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Gross Working Capital',
                  marker: { color: '#2A5C82' },
                  line: { shape: 'spline' }
                }
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 10, t: 10, b: 40 },
                legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
                xaxis: { tickfont: { size: 10 } },
                yaxis: { title: 'Values', titlefont: { size: 10 }, tickfont: { size: 10 } }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="bg-card rounded-sm border border-border p-4 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-4">Profit and Loss summary</p>
          <div className="flex-1 min-h-[300px]">
            <Plot
              data={[
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [500000, 600000, 450000, 700000, 800000, 800000, 900000, 950000, 1000000, 1200000, 1250000, 1350000],
                  type: 'bar',
                  name: 'Sales',
                  marker: { color: '#2A5C82' },
                  yaxis: 'y1'
                },
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [500000, 650000, 600000, 750000, 850000, 850000, 950000, 950000, 1100000, 1100000, 1250000, 1250000],
                  type: 'bar',
                  name: 'COGS',
                  marker: { color: '#F59E0B' },
                  yaxis: 'y1'
                },
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [150000, 300000, 280000, 250000, 250000, 250000, 250000, 200000, 200000, 200000, 200000, 250000],
                  type: 'bar',
                  name: 'OE',
                  marker: { color: '#10B981' },
                  yaxis: 'y1'
                },
                {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [0, 400000, 450000, 250000, 300000, -100000, 300000, 350000, 350000, 400000, 450000, 500000],
                  type: 'bar',
                  name: 'Profit Loss',
                  marker: { color: '#2A5C82' },
                  yaxis: 'y2',
                  offsetgroup: '2'
                },
                 {
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  y: [0, -350000, -380000, -30000, -50000, -150000, -25000, -20000, -20000, -10000, -10000, -10000],
                  type: 'bar',
                  showlegend: false,
                  marker: { color: '#FF6B6B' },
                  yaxis: 'y2',
                  offsetgroup: '2'
                }
              ]}
              layout={{
                barmode: 'stack',
                autosize: true,
                margin: { l: 50, r: 50, t: 10, b: 40 },
                legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
                xaxis: { tickfont: { size: 10 } },
                yaxis: { title: 'Sales, COGS, OE', titlefont: { size: 10 }, tickfont: { size: 10 } },
                yaxis2: { 
                  title: 'Profit Loss', 
                  titlefont: { size: 10 }, 
                  tickfont: { size: 10 }, 
                  overlaying: 'y', 
                  side: 'right',
                  showgrid: false
                }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminFinancial;
