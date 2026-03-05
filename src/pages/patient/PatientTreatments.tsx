import { useState } from 'react';
import { Stethoscope, Pill, FileText, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { mockPatientUser } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Treatment {
  name: string;
  status: string;
  period: string;
  medications: string[];
  report: string;
}

const PatientTreatments = () => {
  const user = mockPatientUser;
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const treatmentHistory: Treatment[] = [
    {
      name: 'Tratamento de enxaqueca crônica',
      status: 'Concluído',
      period: 'Jan 2026 - Fev 2026',
      medications: ['Sumatriptana 50mg', 'Amitriptilina 25mg'],
      report: 'Paciente apresentou melhora significativa das crises de enxaqueca após introdução da Amitriptilina. As crises que ocorriam 4x na semana reduziram para 1x ao mês. Recomendado manter medicação profilática por mais 6 meses e retornar.',
    },
    {
      name: 'Tratamento de sinusite',
      status: 'Concluído',
      period: 'Nov 2025 - Dez 2025',
      medications: ['Amoxicilina 500mg', 'Descongestionante nasal'],
      report: 'Quadro infeccioso curado após 10 dias de antibioticoterapia. Paciente não relata mais dores faciais ou secreção. Alta médica para este quadro.',
    },
    ...user.treatments.map(t => ({
      name: t.name,
      status: 'Em andamento',
      period: `Falta ${t.daysLeft} dias`,
      medications: t.medications,
      report: 'Tratamento em curso. Paciente deve seguir rigorosamente os horários da medicação para melhor eficácia. Próximo retorno será fundamental para avaliar a progressão sistêmica sistêmica e possível reajuste de dose.'
    })),
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Histórico de Tratamentos</h1>

      <div className="space-y-4">
        {treatmentHistory.map((t, i) => (
          <div
            key={i}
            className="speedmed-card cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={() => setSelectedTreatment(t)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Stethoscope className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 'Em andamento'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                  {t.status}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.medications.map((med, j) => (
                <span key={j} className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-sm text-foreground">
                  <Pill className="w-3 h-3 text-destructive" />
                  {med}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Tratamento</DialogTitle>
          </DialogHeader>

          {selectedTreatment && (
            <div className="space-y-6 mt-2">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedTreatment.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Período: {selectedTreatment.period}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTreatment.status === 'Em andamento' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {selectedTreatment.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Pill className="w-5 h-5 text-primary" /> Verificação Detalhada da Medicação
                </h4>
                <div className="space-y-2">
                  {selectedTreatment.medications.map((med, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-sm text-foreground">{med}</span>
                      </div>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                        Prescrito
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary" /> Relatório Detalhado
                </h4>
                <div className="p-4 rounded-lg bg-card border border-border text-sm leading-relaxed text-foreground">
                  {selectedTreatment.report}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedTreatment(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientTreatments;
