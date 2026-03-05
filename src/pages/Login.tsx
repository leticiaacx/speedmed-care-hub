import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, User } from 'lucide-react';
import speedmedLogo from '@/assets/speedmed-logo.png';

const Login = () => {
  const [userType, setUserType] = useState<'doctor' | 'patient'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'doctor') {
      navigate('/doctor');
    } else {
      navigate('/patient');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 speedmed-gradient items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary-foreground" />
          <div className="absolute bottom-32 right-20 w-60 h-60 rounded-full bg-primary-foreground" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-primary-foreground" />
        </div>
        <div className="text-center z-10 px-12">
          <img src={speedmedLogo} alt="SpeedMed Logo" className="w-32 h-32 mx-auto mb-8 rounded-2xl shadow-2xl" />
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(0 0% 100%)' }}>
            SpeedMed
          </h1>
          <p className="text-xl opacity-90" style={{ color: 'hsl(0 0% 100% / 0.9)' }}>
            Sua saúde, nossa prioridade
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <img src={speedmedLogo} alt="SpeedMed Logo" className="w-20 h-20 mx-auto mb-4 rounded-xl" />
            <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>SpeedMed</h1>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground mt-2">Faça login para continuar</p>
          </div>

          {/* Type selector */}
          <div className="flex gap-3">
            <button
              onClick={() => setUserType('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                userType === 'doctor'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              Médico
            </button>
            <button
              onClick={() => setUserType('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                userType === 'patient'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              <User className="w-5 h-5" />
              Paciente
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg">
              Entrar como {userType === 'doctor' ? 'Médico' : 'Paciente'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Esqueceu a senha?{' '}
            <span className="text-primary font-medium cursor-pointer hover:underline">Recuperar</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
