import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Stethoscope, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import speedmedLogo from '@/assets/speedmed-logo.png';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { logout, currentUser, userRole } = useUser();

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
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
                <div className="p-6">
                    <img src={speedmedLogo} alt="SpeedMed" className="h-10 mb-8" />
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground font-medium shadow-md'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-4">
                    <div className="p-4 rounded-xl bg-secondary border border-border">
                        <p className="text-sm font-semibold text-foreground">{currentUser?.name || 'Administrador'}</p>
                        <p className="text-xs text-muted-foreground">Admin • SpeedMed</p>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:dark:bg-red-950/30 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-secondary text-foreground"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold hidden sm:block text-foreground">Portal Administrativo</h2>
                    </div>
                </header>

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
