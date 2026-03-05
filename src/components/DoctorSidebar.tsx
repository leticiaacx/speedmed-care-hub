import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Home, LogOut, User } from 'lucide-react';
import speedmedLogo from '@/assets/speedmed-logo.png';
import { mockDoctor } from '@/data/mockData';

const menuItems = [
  { icon: Home, label: 'Início', path: '/doctor' },
  { icon: Calendar, label: 'Agendamentos', path: '/doctor/appointments' },
  { icon: ClipboardList, label: 'Pacientes', path: '/doctor/patients' },
  { icon: FileText, label: 'Relatórios', path: '/doctor/reports' },
];

const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen speedmed-gradient flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <img src={speedmedLogo} alt="SpeedMed" className="w-10 h-10 rounded-lg" />
        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(0 0% 100%)' }}>
          SpeedMed
        </span>
      </div>

      <div className="px-6 py-4 border-t border-b" style={{ borderColor: 'hsl(199 89% 55% / 0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsl(0 0% 100% / 0.2)' }}>
            <User className="w-5 h-5" style={{ color: 'hsl(0 0% 100%)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'hsl(0 0% 100%)' }}>{mockDoctor.name}</p>
            <p className="text-xs" style={{ color: 'hsl(0 0% 100% / 0.7)' }}>{mockDoctor.specialty}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all ${
                isActive ? 'font-semibold' : 'opacity-80 hover:opacity-100'
              }`}
              style={{
                color: 'hsl(0 0% 100%)',
                background: isActive ? 'hsl(0 0% 100% / 0.15)' : 'transparent',
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 px-6 py-4 opacity-80 hover:opacity-100 transition-opacity"
        style={{ color: 'hsl(0 0% 100%)' }}
      >
        <LogOut className="w-5 h-5" />
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default DoctorSidebar;
