import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import speedmedLogo from '@/assets/SpeedMED - Principal(1).svg';
import loginBg from '@/assets/login-bg.jpg';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        senha: '',
        cpf: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await register({
            name: formData.name,
            email: formData.email,
            senha: formData.senha,
            cpf: formData.cpf,
            phone: formData.phone,
        });
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
            {/* Left — background image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'hsl(199 89% 48% / 0.15)' }} />
            </div>

            {/* Right — form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md space-y-6 my-auto pt-8 pb-8">
                    <div className="text-center">
                        <img src={speedmedLogo} alt="SpeedMed" className="h-20 w-auto object-contain mx-auto mb-4 rounded-xl" />
                        <h1 className="text-2xl font-bold text-foreground">Cadastro de Paciente</h1>
                        <p className="text-sm text-muted-foreground mt-1">Preencha seus dados para acessar o portal</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Nome Completo</label>
                            <Input
                                id="register-name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="João da Silva"
                                className="rounded-xl border-primary/30"
                                autoComplete="name"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">CPF</label>
                                <Input
                                    id="register-cpf"
                                    name="cpf"
                                    required
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    className="rounded-xl border-primary/30"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Telefone</label>
                                <Input
                                    id="register-phone"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(11) 99999-9999"
                                    className="rounded-xl border-primary/30"
                                    autoComplete="tel"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">E-mail</label>
                            <Input
                                id="register-email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu.email@exemplo.com"
                                className="rounded-xl border-primary/30"
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Senha</label>
                            <div className="relative">
                                <Input
                                    id="register-password"
                                    name="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.senha}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="rounded-xl border-primary/30 pr-12"
                                    autoComplete="new-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            id="register-submit"
                            type="submit"
                            className="w-full h-12 rounded-xl text-base font-semibold mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                'Finalizar Cadastro'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Já possui uma conta?{' '}
                        <Link to="/" className="text-primary font-medium hover:underline">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
