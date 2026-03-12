import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import speedmedLogo from '@/assets/SpeedMED - Principal(1).svg';
import loginBg from '@/assets/login-bg.jpg';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cpf: '',
        phone: '',
        age: '',
        bloodType: '',
        doctorId: ''
    });

    const navigate = useNavigate();
    const { doctors, registerPatient, login } = useUser();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.doctorId) {
            alert('Por favor, selecione um médico.');
            return;
        }

        const patientData = {
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            phone: formData.phone,
            age: parseInt(formData.age) || 0,
            bloodType: formData.bloodType,
            doctorId: formData.doctorId
        };

        registerPatient(patientData);

        // Automatically login as patient for demonstration
        login('patient');
        navigate('/patient');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
            <div className="hidden lg:block lg:w-1/2 relative">
                <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'hsl(199 89% 48% / 0.15)' }} />
            </div>

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
                            <Input name="name" required value={formData.name} onChange={handleChange} placeholder="João da Silva" className="rounded-xl border-primary/30" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">CPF</label>
                                <Input name="cpf" required value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="rounded-xl border-primary/30" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Idade</label>
                                <Input name="age" type="number" required value={formData.age} onChange={handleChange} placeholder="30" className="rounded-xl border-primary/30" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Telefone</label>
                                <Input name="phone" required value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" className="rounded-xl border-primary/30" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Tipo Sanguíneo</label>
                                <Select value={formData.bloodType} onValueChange={(v) => setFormData(p => ({ ...p, bloodType: v }))}>
                                    <SelectTrigger className="rounded-xl border-primary/30"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">E-mail</label>
                            <Input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="seu.email@exemplo.com" className="rounded-xl border-primary/30" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Senha</label>
                            <Input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••••••" className="rounded-xl border-primary/30" />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-medium text-foreground">Escolha seu Médico</label>
                            <Select value={formData.doctorId} onValueChange={(v) => setFormData(p => ({ ...p, doctorId: v }))}>
                                <SelectTrigger className="rounded-xl border-primary/30"><SelectValue placeholder="Selecione o(a) especialista" /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold mt-2">
                            Finalizar Cadastro
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Já possui uma conta?{' '}
                        <Link to="/" className="text-primary font-medium hover:underline">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
