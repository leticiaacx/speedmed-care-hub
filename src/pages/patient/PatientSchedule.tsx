import { Clock, Pill, Check } from 'lucide-react';
import { mockPatientUser } from '@/data/mockData';

const scheduleItems = [
  { time: '08:00', medication: 'Dipirona 1G', taken: true },
  { time: '12:00', medication: 'Azitromicina 100Mg', taken: true },
  { time: '16:00', medication: 'Dipirona 1G', taken: false },
  { time: '20:00', medication: 'Azitromicina 100Mg', taken: false },
  { time: '22:00', medication: 'Dipirona 1G', taken: false },
];

const PatientSchedule = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Horário de Tratamentos</h1>
      <p className="text-muted-foreground">Seus medicamentos de hoje</p>

      <div className="space-y-3">
        {scheduleItems.map((item, i) => (
          <div key={i} className={`speedmed-card flex items-center justify-between ${item.taken ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.taken ? 'bg-green-100 dark:bg-green-900/30' : 'bg-accent'}`}>
                {item.taken ? <Check className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{item.time}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Pill className="w-3 h-3 text-destructive" />
                  {item.medication}
                </div>
              </div>
            </div>
            {!item.taken && (
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Tomei
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientSchedule;
