import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Home, LogOut, Settings, User, Moon, Sun, Bell } from 'lucide-react';
import speedmedLogo from '@/assets/speedmed-logo.png';
import { mockDoctor } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppointments } from '@/contexts/AppointmentContext';

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
  const { unreadCount } = useAppointments();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'hsl(220 20% 13%)' }}>
      <div className="p-5 flex items-center gap-3">
        <img src={speedmedLogo} alt="SpeedMed" className="h-8 w-auto rounded" />
        <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(0 0% 100%)' }}>
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
              className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm transition-all relative ${isActive ? 'font-semibold' : 'opacity-70 hover:opacity-100'
                }`}
              style={{
                color: isActive ? 'hsl(199 89% 60%)' : 'hsl(210 20% 80%)',
                background: isActive ? 'hsl(199 89% 48% / 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid hsl(199 89% 60%)' : '3px solid transparent',
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.path === '/doctor/appointments' && unreadCount > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-5 py-3 text-sm opacity-70 hover:opacity-100 transition-opacity"
        style={{ color: 'hsl(210 20% 80%)' }}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span>Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
      </button>

      {/* Doctor info + logout */}
      <div className="p-4 border-t" style={{ borderColor: 'hsl(220 20% 20%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'hsl(199 89% 48%)' }}>
            <span className="text-xs font-bold" style={{ color: 'hsl(0 0% 100%)' }}>{mockDoctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
          </div>
          <div>
            <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" style={{ color: 'hsl(0 0% 100%)' }} title={mockDoctor.name}>{mockDoctor.name}</p>
            <p className="text-xs" style={{ color: 'hsl(210 20% 60%)' }}>{mockDoctor.specialty}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'hsl(210 20% 80%)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
