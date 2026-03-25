export interface USUARIO {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  
  // UI Fields mapping
  age?: number;
  phone?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  lastConsultation?: {
    date: string;
    time: string;
    location: string;
    reason: string;
  };
  heredity?: string[];
  consultationHistory?: {
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
  medico_id?: number;
  socialName?: string;
  religion?: string;
  organDonor?: boolean;
  sexuality?: string;
  address?: string;
  requiresCompanion?: boolean;
  maritalStatus?: string;
}

export interface AGENDAMENTO {
  id: number;
  usuario_id: number;
  medico_id: number;
  clinica_id: number;
  data_hora: string;
  status: string;

  // UI mapping
  patientName?: string;
  doctorName?: string;
  type?: string;
  location?: string;
  reason?: string;
}

export interface MEDICO {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  clinica_id: number;
  email: string;

  // UI mapping
  senha?: string;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  phone?: string;
  location?: string;
  onlineConsultation?: boolean;
}

export interface CLINICA {
  id: number;
  nome: string;
  endereco_id: number;
  horario_funcionamento: string;
  
  // UI mapping
  email: string;
}

export interface ENDERECO {
  id: number;
  usuario_id: number | null;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  is_principal: boolean;
}

export const mockDoctor: MEDICO = {
  id: 1,
  nome: 'Dr. José da Silva Pereira',
  especialidade: 'Clínico Geral',
  crm: 'CRM/SP 123456',
  clinica_id: 1,
  schedule: [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' },
  ],
  email: 'medico@speedmed.com',
};

export const mockDoctors: MEDICO[] = [
  mockDoctor,
  {
    id: 2,
    nome: 'Dra. Ana Costa Lima',
    especialidade: 'Cardiologia',
    crm: 'CRM/SP 654321',
    clinica_id: 1,
    schedule: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '16:00' },
    ],
    email: 'medico2@speedmed.com',
  }
];

export const mockAdmins: CLINICA[] = [
  {
    id: 1,
    nome: 'Admin Hospitalar',
    endereco_id: 1,
    horario_funcionamento: '08:00 - 18:00',
    email: 'admin@speedmed.com'
  }
];

export const mockPatients: USUARIO[] = [
  {
    id: 1,
    nome: 'Maria Santos',
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
    medico_id: 1,
  },
  {
    id: 2,
    nome: 'João Oliveira',
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
    medico_id: 1,
  },
  {
    id: 3,
    nome: 'Ana Costa',
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
    medico_id: 1,
  },
  {
    id: 4,
    nome: 'Carlos Mendes',
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
    medico_id: 2,
  },
  {
    id: 5,
    nome: 'Fernanda Lima',
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
    medico_id: 1,
  },
];

export const mockAppointments: AGENDAMENTO[] = [
  {
    id: 1,
    usuario_id: 1,
    patientName: 'Maria Santos',
    data_hora: '2026-03-10T09:00',
    type: 'Retorno',
    status: 'confirmado',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Acompanhamento dores de cabeça',
    clinica_id: 1,
    medico_id: 1,
  },
  {
    id: 2,
    usuario_id: 2,
    patientName: 'João Oliveira',
    medico_id: 1,
    doctorName: 'Dr. José da Silva Pereira',
    data_hora: '2026-03-12T11:00',
    type: 'Consulta',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Sul',
    reason: 'Retorno dor abdominal',
    clinica_id: 1,
  },
  {
    id: 3,
    usuario_id: 3,
    patientName: 'Ana Costa',
    medico_id: 2,
    doctorName: 'Dra. Ana Costa Lima',
    data_hora: '2026-03-15T15:00',
    type: 'Retorno',
    status: 'confirmado',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Controle pressão arterial',
    clinica_id: 1,
  },
  {
    id: 4,
    usuario_id: 5,
    patientName: 'Fernanda Lima',
    medico_id: 1,
    doctorName: 'Dr. José da Silva Pereira',
    data_hora: '2026-03-20T14:00',
    type: 'Exame',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Exames de rotina',
    clinica_id: 1,
  },
  {
    id: 5,
    usuario_id: 1,
    patientName: 'Maria Santos',
    data_hora: '2026-04-05T10:00',
    type: 'Retorno',
    status: 'pendente',
    location: 'Clínica SpeedMed - Unidade Centro',
    reason: 'Avaliação tratamento',
    medico_id: 1,
    clinica_id: 1,
  },
  {
    id: 6,
    usuario_id: 4,
    patientName: 'Carlos Mendes',
    medico_id: 2,
    doctorName: 'Dra. Ana Costa Lima',
    data_hora: '2026-03-05T08:30',
    type: 'Consulta',
    status: 'realizado',
    location: 'Clínica SpeedMed - Unidade Norte',
    reason: 'Acompanhamento diabetes',
    clinica_id: 1,
  },
];

export const mockPatientUser = {
  id: 1,
  nome: 'José Silva',
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
