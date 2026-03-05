import { Download, FileText, User, Calendar } from 'lucide-react';
import { mockPatients, mockAppointments, mockDoctor } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

const DoctorReports = () => {
  const generatePatientReport = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233);
    doc.text('SpeedMed', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Relatório do Paciente', margin, y);
    y += 15;

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(patient.name, margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(80);
    const info = [
      `Idade: ${patient.age} anos`,
      `CPF: ${patient.cpf}`,
      `Tipo Sanguíneo: ${patient.bloodType}`,
      `Telefone: ${patient.phone}`,
      `E-mail: ${patient.email}`,
    ];
    info.forEach(line => { doc.text(line, margin, y); y += 6; });
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Alergias:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Nenhuma', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Medicamentos em Uso:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(patient.medications.length > 0 ? patient.medications.join(', ') : 'Nenhum', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Última Consulta:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Data: ${format(parseISO(patient.lastConsultation.date), 'dd/MM/yyyy')} às ${patient.lastConsultation.time}`, margin, y);
    y += 6;
    doc.text(`Local: ${patient.lastConsultation.location}`, margin, y);
    y += 6;
    doc.text(`Motivo: ${patient.lastConsultation.reason}`, margin, y);
    y += 15;

    const patientAppointments = mockAppointments.filter(a => a.patientId === patientId);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Histórico de Agendamentos:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    patientAppointments.forEach(a => {
      doc.text(
        `${format(parseISO(a.date), 'dd/MM/yyyy')} - ${a.time} - ${a.type} - ${a.status} - ${a.reason}`,
        margin, y
      );
      y += 6;
    });

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${mockDoctor.name}`, margin, y);

    doc.save(`relatorio-${patient.name.replace(/\s/g, '-').toLowerCase()}.pdf`);
  };

  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233);
    doc.text('SpeedMed', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Relatório Mensal Resumido', margin, y);
    y += 5;
    doc.text(format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }), margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumo Geral', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80);
    const totalAppointments = mockAppointments.length;
    const confirmed = mockAppointments.filter(a => a.status === 'confirmado').length;
    const pending = mockAppointments.filter(a => a.status === 'pendente').length;
    const done = mockAppointments.filter(a => a.status === 'realizado').length;
    const cancelled = mockAppointments.filter(a => a.status === 'cancelado').length;

    const summary = [
      `Total de Agendamentos: ${totalAppointments}`,
      `Confirmados: ${confirmed}`,
      `Pendentes: ${pending}`,
      `Realizados: ${done}`,
      `Cancelados: ${cancelled}`,
      `Total de Pacientes: ${mockPatients.length}`,
    ];
    summary.forEach(line => { doc.text(line, margin, y); y += 6; });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Lista de Agendamentos', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(80);
    mockAppointments.forEach(a => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(
        `${format(parseISO(a.date), 'dd/MM')} ${a.time} | ${a.patientName} | ${a.type} | ${a.status} | ${a.location}`,
        margin, y
      );
      y += 5;
      doc.text(`  Motivo: ${a.reason}`, margin, y);
      y += 7;
    });

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${mockDoctor.name}`, margin, y);

    doc.save(`relatorio-mensal-${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Relatórios
      </h1>

      {/* Monthly report */}
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
          <button
            onClick={generateMonthlyReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* Per patient */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Relatório por Paciente
        </h2>
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
              <button
                onClick={() => generatePatientReport(patient.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <FileText className="w-4 h-4" />
                Gerar Relatório
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;
