import { useState } from 'react';
import { Download, FileText, User, Calendar, Edit, Save } from 'lucide-react';
import { mockPatients, mockDoctor, Patient } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DoctorReports = () => {
  const { appointments } = useAppointments();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'patient'>('monthly');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reportText, setReportText] = useState('');

  const generateInitialPatientReportText = (patient: Patient) => {
    let text = `RELATÓRIO DO PACIENTE\n\n`;
    text += `Nome: ${patient.name}\n`;
    text += `Idade: ${patient.age} anos | CPF: ${patient.cpf}\n`;
    text += `Telefone: ${patient.phone} | E-mail: ${patient.email}\n`;
    text += `Tipo Sanguíneo: ${patient.bloodType}\n\n`;
    text += `ALERGIAS:\n${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma'}\n\n`;
    text += `MEDICAMENTOS EM USO:\n${patient.medications.length > 0 ? patient.medications.join(', ') : 'Nenhum'}\n\n`;
    text += `ÚLTIMA CONSULTA:\nData: ${format(parseISO(patient.lastConsultation.date), 'dd/MM/yyyy')} às ${patient.lastConsultation.time}\n`;
    text += `Motivo: ${patient.lastConsultation.reason}\n\n`;
    text += `CONCLUSÃO MÉDICA:\nPaciente encontra-se em quadro estável. (Edite este campo com suas observações)`;
    return text;
  };

  const generateInitialMonthlyReportText = () => {
    const totalAppointments = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmado').length;
    const pending = appointments.filter(a => a.status === 'pendente').length;
    const done = appointments.filter(a => a.status === 'realizado').length;

    let text = `RELATÓRIO MENSAL - ${format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase()}\n\n`;
    text += `RESUMO DE AGENDAMENTOS:\n`;
    text += `- Total: ${totalAppointments}\n`;
    text += `- Realizados: ${done}\n`;
    text += `- Confirmados: ${confirmed}\n`;
    text += `- Pendentes: ${pending}\n\n`;
    text += `NOTAS DE GESTÃO:\n(Adicione suas observações mensais aqui)`;
    return text;
  };

  const openReportModal = (type: 'monthly' | 'patient', patientId?: string) => {
    setReportType(type);
    if (type === 'patient' && patientId) {
      const p = mockPatients.find(p => p.id === patientId);
      if (p) {
        setSelectedPatient(p);
        setReportText(generateInitialPatientReportText(p));
      }
    } else {
      setSelectedPatient(null);
      setReportText(generateInitialMonthlyReportText());
    }
    setReportModalOpen(true);
  };

  const addHeader = (doc: jsPDF, y: number) => {
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('SpeedMED', 20, 18);
    doc.setFontSize(9);
    doc.text('Sistema de Gestão Médica', 20, 26);
    doc.setFontSize(8);
    doc.text('Clínica SpeedMed - Unidade Centro', 130, 14);
    doc.text('Av. Paulista, 1000 - São Paulo/SP', 130, 20);
    doc.text('CNPJ: 00.000.000/0001-00', 130, 26);
    return 45;
  };

  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${mockDoctor.name}`, 20, pageHeight - 10);
    doc.text('SpeedMed - Sistema de Gestão Médica | www.speedmed.com.br', 20, pageHeight - 5);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = addHeader(doc, 0);

    doc.setFontSize(11);
    doc.setTextColor(0);

    // Split text to fit page width
    const lines = doc.splitTextToSize(reportText, 170);

    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });

    addFooter(doc);

    const fileName = reportType === 'patient' && selectedPatient
      ? `relatorio-${selectedPatient.name.replace(/\\s/g, '-').toLowerCase()}.pdf`
      : `relatorio-mensal-${format(new Date(), 'yyyy-MM')}.pdf`;

    doc.save(fileName);
    setReportModalOpen(false);
    toast.success('PDF baixado com sucesso!');
  };

  const saveToSystem = () => {
    // Mock save to system
    setReportModalOpen(false);
    toast.success('Relatório salvo no sistema com sucesso!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>

      {/* Monthly Report Card */}
      <div className="speedmed-card border-l-4" style={{ borderLeftColor: 'hsl(199 89% 48%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Relatório Mensal Geral</h3>
              <p className="text-sm text-muted-foreground">Resumo editável de todos os atendimentos do mês</p>
            </div>
          </div>
          <Button onClick={() => openReportModal('monthly')} className="gap-2">
            <Edit className="w-4 h-4" /> Visualizar / Editar
          </Button>
        </div>
      </div>

      {/* Patient Reports List */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Relatórios por Paciente</h2>
        <div className="space-y-3">
          {mockPatients.map(patient => (
            <div key={patient.id} className="speedmed-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.age} anos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openReportModal('patient', patient.id)} className="gap-2 bg-secondary text-secondary-foreground">
                  <Edit className="w-4 h-4" /> Detalhes e Edição
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Editor Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {reportType === 'patient' ? `Relatório: ${selectedPatient?.name}` : 'Relatório Mensal'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verifique ou edite as informações do relatório antes de salvar no sistema ou exportar para PDF.
            </p>

            <textarea
              className="w-full min-h-[300px] p-4 rounded-lg border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={saveToSystem} className="gap-2">
                <Save className="w-4 h-4" /> Salvar no Sistema
              </Button>
              <Button onClick={downloadPDF} className="gap-2">
                <Download className="w-4 h-4" /> Baixar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorReports;
