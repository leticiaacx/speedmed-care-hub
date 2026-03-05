import { useEffect } from 'react';
import { FileText, Download, Image, File } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments } from '@/contexts/AppointmentContext';

const getFileIcon = (type: string) => {
  if (type.toLowerCase().includes('pdf')) return FileText;
  if (type.toLowerCase().includes('imagem') || type.toLowerCase().includes('jpg') || type.toLowerCase().includes('png')) return Image;
  return File;
};

const PatientFiles = () => {
  const { patientFiles, clearPatientFileNotifications } = useAppointments();

  useEffect(() => {
    clearPatientFileNotifications();
  }, [clearPatientFileNotifications]);

  const handleDownload = (fileName: string) => {
    // In a real application, this would trigger an actual file download
    toast.success(`Download de "${fileName}" iniciado com sucesso!`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Arquivos Anexados</h1>
      <p className="text-muted-foreground">Documentos, exames e receitas adicionados pelo seu médico</p>

      <div className="space-y-3">
        {patientFiles.length === 0 ? (
          <p className="text-muted-foreground bg-card p-6 rounded-xl border border-border text-center">Nenhum arquivo encontrado.</p>
        ) : (
          patientFiles.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div key={file.id} className="speedmed-card flex items-center justify-between hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type} • {file.size} • Data: {file.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file.name)}
                  className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
                  title="Baixar Arquivo"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Baixar</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatientFiles;
