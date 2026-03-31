import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Stethoscope, FileText, Clock, CalendarDays, Settings, LogOut, User } from 'lucide-react';
import speedmedLogo from '@/assets/logo_reduzida.svg'; // Use a logo reduzida para consistência no hover
import { mockPatientUser } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser } from '@/contexts/UserContext';

const menuItems = [
  { icon: Home, label: 'Início', path: '/patient' },
  { icon: Calendar, label: 'Agendamento', path: '/patient/appointments' },
  { icon: Stethoscope, label: 'Tratamentos', path: '/patient/treatments' },
  { icon: FileText, label: 'Arquivos', path: '/patient/files' },
  { icon: CalendarDays, label: 'Histórico', path: '/patient/history' },
  { icon: Clock, label: 'Horários', path: '/patient/schedule' },
  { icon: Settings, label: 'Configurações', path: '/patient/settings' },
];

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { patientUnreadCount, patientFilesUnreadCount } = useAppointments();
  const { logout } = useUser();

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Desktop Sidebar (Efeito Médico/Admin) */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col overflow-hidden 
        transition-all duration-300 ease-in-out hidden lg:flex
        ${isExpanded ? "w-64 shadow-2xl" : "w-20"}`}
      >
        {/* Header com a Logo */}
        <button
          onClick={() => navigate('/patient')}
          className="flex items-center h-24 mt-4 focus:outline-none group"
        >
          <div className="flex items-center justify-center w-20 shrink-0">
            <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img src={speedmedLogo} alt="SpeedMED" className="w-full h-full object-contain rounded" />
            </div>
          </div>
        </button>

        {/* Menu de Navegação */}
        <nav className="flex flex-col gap-2 mt-8 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Verificação de badges
            const hasBadge = (item.path === '/patient/appointments' && patientUnreadCount > 0) || 
                             (item.path === '/patient/files' && patientFilesUnreadCount > 0);
            const badgeCount = item.path === '/patient/appointments' ? patientUnreadCount : patientFilesUnreadCount;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center h-12 transition-all duration-300 relative
                ${isActive 
                  ? "text-primary bg-primary/10 border-l-4 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center justify-center w-20 shrink-0">
                  <Icon size={22} />
                </div>
                
                <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  ${isActive ? "font-bold" : "font-light"}`}
                >
                  {item.label}
                </span>

                {/* Badges */}
                {hasBadge && (
                  <span className={`absolute bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300
                    ${isExpanded ? "right-4 opacity-100" : "right-2 scale-75"}`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Info Paciente e Sair */}
        <div className="mt-auto border-t border-border bg-card/50">
          <div className="flex items-center h-16">
            <div className="flex items-center justify-center w-20 shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{mockPatientUser.nome}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paciente</p>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center h-14 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 border-t border-border/30"
          >
            <div className="flex items-center justify-center w-20 shrink-0">
              <LogOut size={22} />
            </div>
            <span className={`text-sm font-bold transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              Sair da Conta
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content - Ajustado para compensar a sidebar fixa */}
      <div className="flex-1 lg:ml-20 flex flex-col min-w-0 transition-all duration-300">
        <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Nav (Mantive para funcionalidade, mas limpei o estilo) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-1 shadow-lg">
        {menuItems.slice(0, 4).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-0.5 p-1 relative">
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
            </button>
          );
        })}
        <button onClick={() => { logout(); navigate('/'); }} className="flex flex-col items-center gap-0.5 p-1">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-[10px] text-red-500 font-bold">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default PatientLayout;