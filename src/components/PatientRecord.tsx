import { Calendar, Clock, MapPin, Phone, Mail, Droplets, AlertTriangle, Pill } from 'lucide-react';
import { Patient } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface PatientRecordProps {
  patient: Patient;
}

const PatientRecord = ({ patient }: PatientRecordProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-xl">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
          <p className="text-muted-foreground">{patient.age} anos • CPF: {patient.cpf}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-foreground">{patient.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-foreground">{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Droplets className="w-4 h-4 text-destructive" />
          <span className="text-foreground">Tipo Sanguíneo: {patient.bloodType}</span>
        </div>
      </div>

      {/* Heredity */}
      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <Droplets className="w-4 h-4 text-primary" />
          Hereditariedade
        </h4>
        {patient.heredity && patient.heredity.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {patient.heredity.map(h => (
              <span key={h} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                {h}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum histórico hereditário registrado</p>
        )}
      </div>

      {/* Allergies */}
      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Alergias
        </h4>
        {patient.allergies.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {patient.allergies.map(a => (
              <span key={a} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma alergia registrada</p>
        )}
      </div>

      {/* Medications */}
      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <Pill className="w-4 h-4 text-primary" />
          Medicamentos em Uso
        </h4>
        {patient.medications.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {patient.medications.map(m => (
              <span key={m} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                {m}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum medicamento registrado</p>
        )}
      </div>

      {/* Last Consultation */}
      <div className="p-4 rounded-xl bg-secondary">
        <h4 className="font-semibold text-foreground mb-3">Última Consulta</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              {format(parseISO(patient.lastConsultation.date), 'dd/MM/yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-foreground">{patient.lastConsultation.time}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-foreground">{patient.lastConsultation.location}</span>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Motivo:</p>
            <p className="text-foreground font-medium">{patient.lastConsultation.reason}</p>
          </div>
        </div>
      </div>

      {/* Consultation History */}
      {patient.consultationHistory && patient.consultationHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Histórico de Consultas</h4>
          <div className="space-y-3">
            {patient.consultationHistory.map((consultation, index) => (
              <div key={index} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(parseISO(consultation.date), 'dd/MM/yyyy')}</span>
                    <span className="text-muted-foreground ml-1">{consultation.time}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                    {consultation.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Especialidade: </span>
                    <span className="font-medium text-foreground">{consultation.specialty}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Médico: </span>
                    <span className="font-medium text-foreground">{consultation.doctorName}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-muted-foreground">Diagnóstico: </span>
                    <span className="font-medium text-foreground">{consultation.diagnosis}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecord;
