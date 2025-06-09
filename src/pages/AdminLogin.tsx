
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADMIN_CREDENTIALS = {
    email: 'nexsyn@unidadelrv.com',
    password: 'Nexsyn@2025'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      if (loginData.email === ADMIN_CREDENTIALS.email && 
          loginData.password === ADMIN_CREDENTIALS.password) {
        
        // Salvar status de admin no localStorage
        localStorage.setItem('isAdmin', 'true');
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo à área administrativa.",
        });
        
        navigate('/admin');
      } else {
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas. Verifique o email e senha.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 relative">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="absolute top-6 left-6 text-primary-700 hover:text-secondary hover:bg-primary-100"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center bg-primary-900 text-neutral-50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Área Administrativa</CardTitle>
          <p className="text-primary-200 text-sm mt-2">
            Acesso restrito para administradores
          </p>
        </CardHeader>
        <CardContent className="p-8 bg-neutral-50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-primary-800 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="mt-2 border-primary-200 focus:border-secondary focus:ring-secondary"
                placeholder="Digite seu email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-primary-800 font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="mt-2 border-primary-200 focus:border-secondary focus:ring-secondary"
                placeholder="Digite sua senha"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary-600 text-neutral-50 py-3 font-medium" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
