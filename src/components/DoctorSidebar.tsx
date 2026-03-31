import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Home, LogOut, Settings, User, Moon, Sun, Bell } from 'lucide-react';
import speedmedLogo from '@/assets/logo_reduzida.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser, MEDICO } from '@/contexts/UserContext';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: Home, label: 'Painel', path: '/doctor' },
  { icon: ClipboardList, label: 'Pacientes', path: '/doctor/patients' },
  { icon: Calendar, label: 'Agendamentos', path: '/doctor/appointments' },
  { icon: FileText, label: 'Relatórios', path: '/doctor/reports' },
  { icon: Settings, label: 'Configurações', path: '/doctor/settings' },
];

// FUNÇÃO PARA CARREGAR DADOS DO STORAGE
const loadDoctorFromStorage = (doctorId: number) => {
  try {
    const stored = localStorage.getItem(`doctor_${doctorId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar médico do localStorage:', error);
  }
  return null;
};

const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, pendingAppointmentsCount } = useAppointments();
  const { currentUser, logout } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSidebar = () => setIsExpanded(!isExpanded);

  // STATE PARA MÉDICO COM DADOS DO STORAGE
  const [doctor, setDoctor] = useState<MEDICO | null>(() => {
    if (currentUser && 'especialidade' in currentUser) {
      const stored = loadDoctorFromStorage(currentUser.id);
      return stored || (currentUser as MEDICO);
    }
    return currentUser as MEDICO | null;
  });

  // SINCRONIZAR COM EVENTO CUSTOMIZADO QUANDO SETTINGS MUDAR
  useEffect(() => {
    const handleDoctorUpdate = (event: any) => {
      console.log('✅ Evento doctorUpdated recebido:', event.detail);
      setDoctor(event.detail);
    };

    window.addEventListener('doctorUpdated', handleDoctorUpdate);

    return () => {
      window.removeEventListener('doctorUpdated', handleDoctorUpdate);
    };
  }, []);

  // VERIFICAR MUDANÇAS NO STORAGE A CADA 2 SEGUNDOS (fallback)
  useEffect(() => {
    if (!doctor) return;

    const interval = setInterval(() => {
      const stored = loadDoctorFromStorage(doctor.id);
      if (stored) {
        setDoctor(stored);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [doctor]);

  if (!doctor) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col overflow-hidden
  transition-all duration-300 ease-in-out hidden lg:flex
  ${isExpanded ? "w-64 shadow-2xl" : "w-20"}`}
      >
        {/* Header com a Logo (Link para Dashboard) */}
        <button
          onClick={() => navigate('/doctor')}
          className="flex items-center h-24 mt-4 focus:outline-none group"
        >
          <div className="flex items-center justify-center w-20 shrink-0">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <img
                src={speedmedLogo}
                alt="SpeedMED"
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </button>

        {/* Menu de Navegação */}
        <nav className="flex flex-col gap-2 mt-8 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center h-12 transition-all duration-300 relative
          ${isExpanded ? "px-0" : "px-0"}
          ${isActive
                    ? "text-primary bg-primary/10 border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent"
                  }`}
              >
                {/* Container fixo do ícone - ESSENCIAL PARA A TRANSIÇÃO */}
                <div className="flex items-center justify-center w-20 shrink-0">
                  <Icon size={24} />
                </div>

                {/* Texto que surge suavemente */}
                <span
                  className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300
            ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            ${isActive ? "font-bold" : "font-medium"}`}
                >
                  {item.label}
                </span>

                {/* Badge de notificações (Ajustado para o novo layout) */}
                {item.path === '/doctor/appointments' && pendingAppointmentsCount > 0 && (
                  <span className={`absolute bg-destructive text-destructive-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300
              ${isExpanded ? "right-4 opacity-100" : "right-2 scale-75"}`}>
                    {pendingAppointmentsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Info Médico e Sair */}
        <div className="mt-auto border-t border-border bg-card/50">
          {/* Avatar / Nome */}
          <div className="flex items-center h-16">
            <div className="flex items-center justify-center w-20 shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-primary-foreground">
                  {doctor?.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'MD'}
                </span>
              </div>
            </div>
            <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{doctor?.nome || 'Médico'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{doctor?.especialidade || 'Especialidade'}</p>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center h-14 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300"
          >
            <div className="flex items-center justify-center w-20 shrink-0">
              <LogOut size={24} />
            </div>
            <span className={`text-sm font-bold transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              Sair do Sistema
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-1">
        {menuItems.slice(0, 4).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-0.5 p-1 relative">
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
              {item.path === '/doctor/appointments' && pendingAppointmentsCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3 h-3 flex items-center justify-center translate-x-1 -translate-y-1">
                  {pendingAppointmentsCount}
                </span>
              )}
            </button>
          );
        })}
        <button onClick={() => { logout(); navigate('/'); }} className="flex flex-col items-center gap-0.5 p-1">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-[10px] text-red-500 font-bold">Sair</span>
        </button>
      </div>
    </>
  );
};

export default DoctorSidebar;