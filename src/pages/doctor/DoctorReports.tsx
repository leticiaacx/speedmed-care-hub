import { useState } from 'react';
import { Download, FileText, User, Calendar, Edit, Save, Send } from 'lucide-react';
import { mockDoctor, USUARIO } from '@/data/mockData';
import { useAppointments, DoctorReport } from '@/contexts/AppointmentContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DoctorReports = () => {
  const { appointments, doctorReports, saveDoctorReport, updateDoctorReport, sendFileToPatient } = useAppointments();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'patient'>('monthly');
  const [selectedReport, setSelectedReport] = useState<DoctorReport | null>(null);
  const [reportText, setReportText] = useState('');

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

  const openReportModal = (type: 'monthly' | 'patient', report?: DoctorReport) => {
    setReportType(type);
    if (type === 'patient' && report) {
      setSelectedReport(report);
      setReportText(report.content);
    } else {
      setSelectedReport(null);
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
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${mockDoctor.nome}`, 20, pageHeight - 10);
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

    const fileName = reportType === 'patient' && selectedReport
      ? `relatorio-${selectedReport.patientName.replace(/\s/g, '-').toLowerCase()}.pdf`
      : `relatorio-mensal-${format(new Date(), 'yyyy-MM')}.pdf`;

    doc.save(fileName);
    setReportModalOpen(false);
    toast.success('PDF baixado com sucesso!');
  };

  const saveToSystem = () => {
    if (reportType === 'patient' && selectedReport) {
      updateDoctorReport(selectedReport.id, reportText);
    }
    setReportModalOpen(false);
    toast.success('Relatório salvo no sistema com sucesso!');
  };

  const handleSendToPatient = () => {
    if (reportType !== 'patient' || !selectedReport) return;

    // First ensure the latest text is saved
    updateDoctorReport(selectedReport.id, reportText);

    sendFileToPatient({
      name: `Relatório Médico - ${selectedReport.data_hora}`,
      type: 'PDF',
      date: selectedReport.data_hora,
      size: 'Aprox. 150 KB',
      content: reportText
    }, selectedReport.id);

    setReportModalOpen(false);
    toast.success('Relatório salvo e enviado com sucesso para o paciente!');
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
        <h2 className="text-lg font-semibold text-foreground mb-4">Relatórios / Rascunhos de Pacientes</h2>
        {doctorReports.length === 0 ? (
          <p className="text-muted-foreground bg-card p-6 rounded-xl border border-border text-center">Nenhum relatório gerado no momento. Vá para a tela de Pacientes para gerar um relatório.</p>
        ) : (
          <div className="space-y-3">
            {doctorReports.map(report => (
              <div key={report.id} className="speedmed-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Relatório: {report.patientName}</p>
                    <p className="text-sm text-muted-foreground">Gerado em: {report.data_hora}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {report.status === 'sent' ? 'Enviado' : 'Rascunho'}
                  </span>
                  <Button variant="outline" onClick={() => openReportModal('patient', report)} className="gap-2 bg-secondary text-secondary-foreground">
                    <Edit className="w-4 h-4" /> Visualizar / Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Editor Modal (Fullscreen) */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none p-0 flex flex-col bg-background border-none gap-0">
          <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full">
            <DialogHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {reportType === 'patient' ? `Edição de Relatório - ${selectedReport?.patientName}` : 'Relatório Mensal Geral'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Verifique e preencha os campos vitais do relatório.
                </p>
              </div>
            </DialogHeader>

            <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="flex-1 flex flex-col relative rounded-xl border border-input focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                <textarea
                  className="flex-1 w-full p-6 bg-background text-base resize-none focus:outline-none font-mono leading-relaxed"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Digite os detalhes do relatório..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between items-center bg-card">
              <DialogClose asChild>
                <Button variant="outline">Fechar Tela</Button>
              </DialogClose>

              <div className="flex gap-3">
                <Button variant="outline" onClick={saveToSystem} className="gap-2">
                  <Save className="w-4 h-4" /> Salvar Rascunho
                </Button>
                <Button variant="outline" onClick={downloadPDF} className="gap-2 border-primary text-primary hover:bg-primary/10">
                  <Download className="w-4 h-4" /> Baixar PDF Pessoal
                </Button>

                {reportType === 'patient' && selectedReport?.status !== 'sent' && (
                  <Button onClick={handleSendToPatient} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Send className="w-4 h-4" /> Salvar e Enviar para Paciente
                  </Button>
                )}
                {reportType === 'patient' && selectedReport?.status === 'sent' && (
                  <Button disabled className="gap-2 bg-green-800 text-white">
                    <Send className="w-4 h-4" /> Já Enviado
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorReports;
