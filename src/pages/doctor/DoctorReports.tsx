import { Download, FileText, User, Calendar } from 'lucide-react';
import { mockPatients, mockDoctor } from '@/data/mockData';
import { useAppointments } from '@/contexts/AppointmentContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

const DoctorReports = () => {
  const { appointments } = useAppointments();

  const addHeader = (doc: jsPDF, y: number) => {
    // Logo area
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('SpeedMED', 20, 18);
    doc.setFontSize(9);
    doc.text('Sistema de Gestão Médica', 20, 26);

    // Clinic info
    doc.setFontSize(8);
    doc.text('Clínica SpeedMed - Unidade Centro', 130, 14);
    doc.text('Av. Paulista, 1000 - São Paulo/SP', 130, 20);
    doc.text('Tel: (11) 3000-0000 | CNPJ: 00.000.000/0001-00', 130, 26);

    return 45;
  };

  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${mockDoctor.name} (${mockDoctor.crm})`, 20, pageHeight - 10);
    doc.text('SpeedMed - Sistema de Gestão Médica | www.speedmed.com.br', 20, pageHeight - 5);
  };

  const generatePatientReport = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) return;

    const doc = new jsPDF();
    let y = addHeader(doc, 0);

    doc.setFontSize(14);
    doc.setTextColor(14, 165, 233);
    doc.text('Relatório do Paciente', 20, y);
    y += 10;

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(patient.name, 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(80);
    const info = [
      `Idade: ${patient.age} anos | CPF: ${patient.cpf} | Tipo Sanguíneo: ${patient.bloodType}`,
      `Telefone: ${patient.phone} | E-mail: ${patient.email}`,
    ];
    info.forEach(line => { doc.text(line, 20, y); y += 6; });
    y += 5;

    // Separator
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Alergias', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma registrada', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Medicamentos em Uso', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(patient.medications.length > 0 ? patient.medications.join(', ') : 'Nenhum', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Última Consulta', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Data: ${format(parseISO(patient.lastConsultation.date), 'dd/MM/yyyy')} às ${patient.lastConsultation.time}`, 20, y);
    y += 6;
    doc.text(`Local: ${patient.lastConsultation.location}`, 20, y);
    y += 6;
    doc.text(`Motivo: ${patient.lastConsultation.reason}`, 20, y);
    y += 12;

    const patientAppointments = appointments.filter(a => a.patientId === patientId);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Histórico de Agendamentos', 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(80);
    patientAppointments.forEach(a => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.text(`${format(parseISO(a.date), 'dd/MM/yyyy')} - ${a.time} | ${a.type} | ${a.status} | ${a.reason}`, 20, y);
      y += 6;
    });

    addFooter(doc);
    doc.save(`relatorio-${patient.name.replace(/\s/g, '-').toLowerCase()}.pdf`);
  };

  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    let y = addHeader(doc, 0);

    doc.setFontSize(14);
    doc.setTextColor(14, 165, 233);
    doc.text('Relatório Mensal Resumido', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }), 20, y);
    y += 12;

    doc.setDrawColor(14, 165, 233);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumo Geral', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(80);
    const totalAppointments = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmado').length;
    const pending = appointments.filter(a => a.status === 'pendente').length;
    const done = appointments.filter(a => a.status === 'realizado').length;
    const cancelled = appointments.filter(a => a.status === 'cancelado').length;

    [
      `Total de Agendamentos: ${totalAppointments}`,
      `Confirmados: ${confirmed}`,
      `Pendentes: ${pending}`,
      `Realizados: ${done}`,
      `Cancelados: ${cancelled}`,
      `Total de Pacientes: ${mockPatients.length}`,
    ].forEach(line => { doc.text(line, 20, y); y += 6; });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Lista de Agendamentos', 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(80);
    appointments.forEach(a => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.text(`${format(parseISO(a.date), 'dd/MM')} ${a.time} | ${a.patientName} | ${a.type} | ${a.status}`, 20, y);
      y += 5;
      doc.text(`  Local: ${a.location} | Motivo: ${a.reason}`, 20, y);
      y += 7;
    });

    addFooter(doc);
    doc.save(`relatorio-mensal-${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>

      <div className="speedmed-card border-l-4" style={{ borderLeftColor: 'hsl(199 89% 48%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Relatório Mensal Geral</h3>
              <p className="text-sm text-muted-foreground">Resumo de todos os atendimentos do mês</p>
            </div>
          </div>
          <button onClick={generateMonthlyReport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />Baixar PDF
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Relatório por Paciente</h2>
        <div className="space-y-3">
          {mockPatients.map(patient => (
            <div key={patient.id} className="speedmed-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.age} anos</p>
                </div>
              </div>
              <button onClick={() => generatePatientReport(patient.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">
                <FileText className="w-4 h-4" />Gerar Relatório
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;
