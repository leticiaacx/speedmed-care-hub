import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, UserRole } from '@/contexts/UserContext';
import speedmedLogo from '@/assets/SpeedMED - Principal(1).svg';
import loginBg from '@/assets/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('patient');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(userType); // login using mock data for now
    if (userType === 'admin') navigate('/admin');
    else if (userType === 'doctor') navigate('/doctor');
    else navigate('/patient');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'hsl(199 89% 48% / 0.15)' }} />
      </div>

      {/* Right - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img src={speedmedLogo} alt="SpeedMed" className="h-24 w-auto object-contain mx-auto mb-6 rounded-xl" />
          </div>

          {/* Type selector */}
          <div className="flex bg-secondary p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${userType === 'patient'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Paciente
            </button>
            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${userType === 'doctor'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Médico
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${userType === 'admin'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Hospital
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Seu e-mail:</label>
              <Input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl border-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Sua senha:</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl border-primary/30 focus:border-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Cadastre-se agora!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
