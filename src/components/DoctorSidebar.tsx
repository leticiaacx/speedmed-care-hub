import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Home, LogOut, Settings, User, Moon, Sun, Bell } from 'lucide-react';
import speedmedLogo from '@/assets/speedmed-logo.png';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useUser, Doctor } from '@/contexts/UserContext';

const menuItems = [
  { icon: Home, label: 'Painel', path: '/doctor' },
  { icon: ClipboardList, label: 'Pacientes', path: '/doctor/patients' },
  { icon: Calendar, label: 'Agendamentos', path: '/doctor/appointments' },
  { icon: FileText, label: 'Relatórios', path: '/doctor/reports' },
  { icon: Settings, label: 'Configurações', path: '/doctor/settings' },
];

const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, pendingAppointmentsCount } = useAppointments();
  const { currentUser, logout } = useUser();
  const doctor = currentUser as Doctor | null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 min-h-screen flex-col bg-card border-r border-border hidden lg:flex">
        <div className="p-5 flex items-center gap-3">
          <img src={speedmedLogo} alt="SpeedMed" className="h-8 w-auto rounded" />
          <span className="text-lg font-bold font-heading text-foreground">
            Speed-med
          </span>
        </div>

        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm transition-all relative ${isActive ? 'font-semibold text-primary bg-primary/10 border-l-4 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.path === '/doctor/appointments' && pendingAppointmentsCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingAppointmentsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Doctor info + logout */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">{doctor?.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'MD'}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate" title={doctor?.name || ''}>{doctor?.name || 'Médico'}</p>
              <p className="text-xs text-muted-foreground truncate">{doctor?.specialty || 'Especialidade'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 py-3 rounded-lg transition-colors border border-red-200 dark:border-red-900 mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair do Sistema</span>
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
