import { FileText, Download, Image, File } from 'lucide-react';

const mockFiles = [
  { name: 'Resultado Hemograma Completo', type: 'PDF', date: '20/02/2026', size: '245 KB', icon: FileText },
  { name: 'Raio-X Torax', type: 'Imagem', date: '15/02/2026', size: '1.2 MB', icon: Image },
  { name: 'Receita Médica - Dr. José', type: 'PDF', date: '25/02/2026', size: '98 KB', icon: FileText },
  { name: 'Resultado Exame de Sangue', type: 'PDF', date: '10/01/2026', size: '312 KB', icon: FileText },
  { name: 'Atestado Médico', type: 'PDF', date: '01/03/2026', size: '56 KB', icon: File },
];

const PatientFiles = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Arquivos Anexados</h1>
      <p className="text-muted-foreground">Documentos e exames adicionados pelo seu médico</p>

      <div className="space-y-3">
        {mockFiles.map((file, i) => (
          <div key={i} className="speedmed-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <file.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.type} • {file.size} • {file.date}</p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Baixar">
              <Download className="w-5 h-5 text-primary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientFiles;
