import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Calendar, Stethoscope, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import speedmedLogo from '@/assets/logo_reduzida.svg';

const AdminLayout = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { logout, currentUser, userRole } = useUser();

    const [adminName, setAdminName] = useState(() => {
    const stored = localStorage.getItem('admin_clinic_data');
    // Se não houver nada no storage, o padrão agora é "SpeedMed Matriz"
    return stored ? JSON.parse(stored).name : 'SpeedMed Matriz';
});

    useEffect(() => {
        const handleUpdate = (event: any) => {
            setAdminName(event.detail.name);
        };

        window.addEventListener('adminUpdated', handleUpdate);
        return () => window.removeEventListener('adminUpdated', handleUpdate);
    }, []);

    useEffect(() => {
        if (userRole !== 'admin') {
            navigate('/');
        }
    }, [userRole, navigate]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Painel', path: '/admin' },
        { icon: Stethoscope, label: 'Médicos', path: '/admin/doctors' },
        { icon: Calendar, label: 'Agendamentos', path: '/admin/appointments' },
        { icon: Users, label: 'Pacientes', path: '/admin/patients' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Desktop Sidebar */}
            <aside
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={`fixed top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col overflow-hidden 
                transition-all duration-300 ease-in-out hidden lg:flex
                ${isExpanded ? "w-64 shadow-2xl" : "w-20"}`}
            >
                {/* Header com a Logo */}
                <button
                    onClick={() => navigate('/admin')}
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
                                    <Icon size={24} />
                                </div>
                                <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                                    ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                                    ${isActive ? "font-bold" : "font-light"}`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer: Admin Info & Sair (CORRIGIDO) */}
                <div className="mt-auto border-t border-border bg-card/50">
                    {/* Linha do Usuário */}
                    <div className="flex items-center h-16">
                        <div className="flex items-center justify-center w-20 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-primary-foreground">AD</span>
                            </div>
                        </div>
                        <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                            <p className="text-sm font-bold text-foreground truncate max-w-[150px]">
                                {adminName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate text-primary uppercase">Administrador</p>
                        </div>
                    </div>

                    {/* Botão de Sair Individualizado */}
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center h-14 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 border-t border-border/30"
                    >
                        <div className="flex items-center justify-center w-20 shrink-0">
                            <LogOut size={24} />
                        </div>
                        <span className={`text-sm font-bold transition-all duration-300 whitespace-nowrap ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                            Sair do Sistema
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 lg:ml-20`}>
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;