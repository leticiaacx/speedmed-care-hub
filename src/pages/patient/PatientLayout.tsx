import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Stethoscope, FileText, Clock, CalendarDays, Settings, LogOut, Moon, Sun, User } from 'lucide-react';
import speedmedLogo from '@/assets/SpeedMED - Principal(1).svg';
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
  const { theme, toggleTheme } = useTheme();
  const { patientUnreadCount, patientFilesUnreadCount } = useAppointments();
  const { logout } = useUser();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen flex-col hidden lg:flex bg-card border-r border-border">
        <div className="p-5 flex items-center gap-3">
          <img src={speedmedLogo} alt="SpeedMed" className="h-8 w-auto rounded" />
          <span className="text-lg font-bold font-heading text-foreground">SpeedMed</span>
        </div>

        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm transition-all ${isActive ? 'font-semibold text-primary bg-primary/10 border-l-4 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.path === '/patient/appointments' && patientUnreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {patientUnreadCount}
                  </span>
                )}
                {item.path === '/patient/files' && patientFilesUnreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {patientFilesUnreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{mockPatientUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">Paciente</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /><span>Sair</span>
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
              {item.path === '/patient/appointments' && patientUnreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] rounded-full w-3 h-3 flex items-center justify-center translate-x-1 -translate-y-1">
                  {patientUnreadCount}
                </span>
              )}
              {item.path === '/patient/files' && patientFilesUnreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] rounded-full w-3 h-3 flex items-center justify-center translate-x-1 -translate-y-1">
                  {patientFilesUnreadCount}
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

      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
