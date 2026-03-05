export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  cpf: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  lastConsultation: {
    date: string;
    time: string;
    location: string;
    reason: string;
  };
  heredity: string[];
  consultationHistory: {
    date: string;
    time: string;
    type: string;
    specialty: string;
    doctorName: string;
    diagnosis: string;
  }[];
  nextAppointment?: {
    date: string;
    time: string;
    type: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'realizado';
  location: string;
  reason: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
}

export const mockDoctor: Doctor = {
  id: '1',
  name: 'Dr. José da Silva Pereira',
  specialty: 'Clínico Geral',
  crm: 'CRM/SP 123456',
};

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Maria Santos',
    age: 45,
    phone: '(11) 98765-4321',
    email: 'maria@email.com',
    cpf: '123.456.789-00',
    bloodType: 'O+',
    allergies: ['Dipirona', 'Penicilina'],
    medications: ['Losartana 50mg', 'Metformina 850mg'],
    lastConsultation: {
      date: '2026-02-20',
      time: '14:00',
      location: 'Clínica SpeedMed - Unidade Centro',
      reason: 'Dores de cabeça frequentes',
    },
    heredity: ['Hipertensão (Mãe)', 'Diabetes (Pai)'],
    consultationHistory: [
      { date: '2026-02-20', time: '14:00', type: 'Consulta', specialty: 'Neurologia', doctorName: 'Dr. Roberto', diagnosis: 'Enxaqueca tensional' },
      { date: '2025-10-15', time: '09:30', type: 'Retorno', specialty: 'Clínico Geral', doctorName: 'Dra. Ana', diagnosis: 'Rotina normal' },
    ],
    nextAppointment: { date: '2026-03-10', time: '09:00', type: 'Retorno' },
  },
  {
    id: '2',
    name: 'João Oliveira',
    age: 32,
    phone: '(11) 91234-5678',
    email: 'joao@email.com',
    cpf: '987.654.321-00',
    bloodType: 'A+',
    allergies: [],
    medications: ['Omeprazol 20mg'],
    lastConsultation: {
      date: '2026-02-15',
      time: '10:30',
      location: 'Clínica SpeedMed - Unidade Sul',
      reason: 'Dor abdominal',
    },
    heredity: ['Doença Celíaca (Irmão)'],
    consultationHistory: [
      { date: '2026-02-15', time: '10:30', type: 'Consulta', specialty: 'Gastroenterologia', doctorName: 'Dr. Silva', diagnosis: 'Gastrite aguda' },
    ],
    nextAppointment: { date: '2026-03-12', time: '11:00', type: 'Consulta' },
  },
  {
    id: '3',
    name: 'Ana Costa',
    age: 58,
    phone: '(11) 99876-5432',
    email: 'ana@email.com',
    cpf: '456.789.123-00',
    bloodType: 'B-',
    allergies: ['Ibuprofeno'],
    medications: ['Atenolol 25mg', 'AAS 100mg', 'Sinvastatina 20mg'],
    lastConsultation: {
      date: '2026-02-28',
      time: '16:00',
      location: 'Clínica SpeedMed - Unidade Centro',
      reason: 'Controle de hipertensão',
    },
    heredity: ['Hipertensão (Pai e Mãe)'],
    consultationHistory: [
      { date: '2026-02-28', time: '16:00', type: 'Retorno', specialty: 'Cardiologia', doctorName: 'Dra. Lima', diagnosis: 'Hipertensão controlada' },
      { date: '2026-01-10', time: '14:00', type: 'Consulta', specialty: 'Cardiologia', doctorName: 'Dra. Lima', diagnosis: 'Ajuste de dosagem' },
    ],
    nextAppointment: { date: '2026-03-15', time: '15:00', type: 'Retorno' },
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    age: 67,
    phone: '(11) 92345-6789',
    email: 'carlos@email.com',
    cpf: '321.654.987-00',
    bloodType: 'AB+',
    allergies: ['Sulfa'],
    medications: ['Insulina', 'Metformina 500mg'],
    lastConsultation: {
      date: '2026-03-01',
      time: '08:00',
      location: 'Clínica SpeedMed - Unidade Norte',
      reason: 'Acompanhamento diabetes',
    },
    heredity: ['Diabetes Tipo 2 (Mãe)'],
    consultationHistory: [
      { date: '2026-03-01', time: '08:00', type: 'Consulta', specialty: 'Endocrinologia', doctorName: 'Dr. Costa', diagnosis: 'Diabetes Tipo 2' },
    ],
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    age: 28,
    phone: '(11) 93456-7890',
    email: 'fernanda@email.com',
    cpf: '654.321.987-00',
    bloodType: 'O-',
    allergies: [],
    medications: [],
    lastConsultation: {
      date: '2026-02-10',
      time: '13:00',
      location: 'Clínica SpeedMed - Unidade Centro',
      reason: 'Check-up anual',
    },
    heredity: [],
    consultationHistory: [
      { date: '2026-02-10', time: '13:00', type: 'Consulta', specialty: 'Clínico Geral', doctorName: 'Dra. Souza', diagnosis: 'Exames normais' },
    ],
    nextAppointment: { date: '2026-03-20', time: '14:00', type: 'Exame' },
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Maria Santos',
    date: '2026-03-10',
    time: '09:00',
    type: 'Retorno',
    status: 'confirmado',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Acompanhamento dores de cabeça',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'João Oliveira',
    date: '2026-03-12',
    time: '11:00',
    type: 'Consulta',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Sul',
    reason: 'Retorno dor abdominal',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Ana Costa',
    date: '2026-03-15',
    time: '15:00',
    type: 'Retorno',
    status: 'confirmado',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Controle pressão arterial',
  },
  {
    id: '4',
    patientId: '5',
    patientName: 'Fernanda Lima',
    date: '2026-03-20',
    time: '14:00',
    type: 'Exame',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Exames de rotina',
  },
  {
    id: '5',
    patientId: '1',
    patientName: 'Maria Santos',
    date: '2026-04-05',
    time: '10:00',
    type: 'Retorno',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Avaliação tratamento',
  },
  {
    id: '6',
    patientId: '4',
    patientName: 'Carlos Mendes',
    date: '2026-03-05',
    time: '08:30',
    type: 'Consulta',
    status: 'realizado',
    location: 'Clínica SpeedMed - Unidade Norte',
    reason: 'Acompanhamento diabetes',
  },
];

export const mockPatientUser = {
  id: '1',
  name: 'José Silva',
  age: 35,
  phone: '(11) 97654-3210',
  email: 'jose@email.com',
  doctor: mockDoctor,
  lastConsultation: {
    date: '2026-02-25',
    time: '10:00',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Tratamento de dores fortes de cabeça',
  },
  nextAppointment: {
    date: '2026-03-18',
    time: '09:30',
    type: 'Retorno',
    doctorName: 'Dr. José da Silva Pereira',
    location: 'Clínica SpeedMed - Unidade Centro',
  },
  treatments: [
    {
      name: 'Tratamento de dores fortes de cabeça',
      daysLeft: 10,
      medications: ['Dipirona/1G', 'Azitromicina/100Mg'],
    },
    {
      name: 'Tratamento de dores fortes de cabeça',
      daysLeft: 10,
      medications: ['Dipirona/1G', 'Azitromicina/100Mg'],
    },
  ],
  nextMedication: {
    name: 'Dipirona',
    dose: 'Um comprimido',
    hoursUntil: 8,
  },
};
