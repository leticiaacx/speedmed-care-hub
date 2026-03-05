import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Stethoscope, FileText, Clock, CalendarDays, Settings, LogOut, Moon, Sun, User } from 'lucide-react';
import speedmedLogo from '@/assets/speedmed-logo.png';
import { mockPatientUser } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppointments } from '@/contexts/AppointmentContext';

const menuItems = [
  { icon: Home, label: 'Início', path: '/patient' },
  { icon: Stethoscope, label: 'Tratamentos', path: '/patient/treatments' },
  { icon: FileText, label: 'Arquivos', path: '/patient/files' },
  { icon: CalendarDays, label: 'Histórico', path: '/patient/history' },
  { icon: Clock, label: 'Horários', path: '/patient/schedule' },
  { icon: Calendar, label: 'Agendamento', path: '/patient/appointments' },
  { icon: Settings, label: 'Configurações', path: '/patient/settings' },
];

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { patientUnreadCount } = useAppointments();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen flex-col hidden lg:flex" style={{ background: 'hsl(220 20% 13%)' }}>
        <div className="p-5 flex items-center gap-3">
          <img src={speedmedLogo} alt="SpeedMed" className="h-8 w-auto rounded" />
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(0 0% 100%)' }}>SpeedMed</span>
        </div>

        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm transition-all ${isActive ? 'font-semibold' : 'opacity-70 hover:opacity-100'
                  }`}
                style={{
                  color: isActive ? 'hsl(199 89% 60%)' : 'hsl(210 20% 80%)',
                  background: isActive ? 'hsl(199 89% 48% / 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid hsl(199 89% 60%)' : '3px solid transparent',
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.path === '/patient/appointments' && patientUnreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {patientUnreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-5 py-3 text-sm opacity-70 hover:opacity-100"
          style={{ color: 'hsl(210 20% 80%)' }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>

        <div className="p-4 border-t" style={{ borderColor: 'hsl(220 20% 20%)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'hsl(199 89% 48%)' }}>
              <User className="w-4 h-4" style={{ color: 'hsl(0 0% 100%)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(0 0% 100%)' }}>{mockPatientUser.name}</p>
              <p className="text-xs" style={{ color: 'hsl(210 20% 60%)' }}>Paciente</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100" style={{ color: 'hsl(210 20% 80%)' }}>
            <LogOut className="w-4 h-4" /><span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-1">
        {menuItems.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-0.5 p-1">
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
