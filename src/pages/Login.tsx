import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import speedmedLogo from '@/assets/SpeedMED - Principal(1).svg';
import loginBg from '@/assets/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState('admin@speedmed.com');
  const [password, setPassword] = useState('123456');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'hsl(199 89% 48% / 0.15)' }} />
      </div>

      {/* Right - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img src={speedmedLogo} alt="SpeedMed" className="h-24 w-auto object-contain mx-auto mb-6 rounded-xl" />
          </div>

          {/* Removed Type selector, handled by email */}

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
