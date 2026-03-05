import { Stethoscope, Pill } from 'lucide-react';
import { mockPatientUser } from '@/data/mockData';

const PatientTreatments = () => {
  const user = mockPatientUser;

  const treatmentHistory = [
    { name: 'Tratamento de enxaqueca crônica', status: 'Concluído', period: 'Jan 2026 - Fev 2026', medications: ['Sumatriptana 50mg', 'Amitriptilina 25mg'] },
    { name: 'Tratamento de sinusite', status: 'Concluído', period: 'Nov 2025 - Dez 2025', medications: ['Amoxicilina 500mg', 'Descongestionante nasal'] },
    ...user.treatments.map(t => ({ name: t.name, status: 'Em andamento', period: `Falta ${t.daysLeft} dias`, medications: t.medications })),
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Histórico de Tratamentos</h1>

      <div className="space-y-4">
        {treatmentHistory.map((t, i) => (
          <div key={i} className="speedmed-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.period}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                t.status === 'Em andamento'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {t.status}
              </span>
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
    </div>
  );
};

export default PatientTreatments;
