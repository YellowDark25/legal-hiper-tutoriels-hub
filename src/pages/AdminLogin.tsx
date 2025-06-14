import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading: authLoading, profile } = useAuth();

  useEffect(() => {
    console.log('AdminLogin - Estado atual:', {
      authLoading,
      user: user?.email,
      isAdmin,
      profile: profile?.is_admin
    });

    // Se já estiver logado como admin, redirecionar
    if (!authLoading && user && isAdmin) {
      console.log('Redirecionando para /admin - usuário já é admin');
      navigate('/admin');
    }
  }, [user, isAdmin, navigate, authLoading, profile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Tentando fazer login com:', loginData.email);
      
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Erro no login:', error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Login realizado com sucesso');
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Verificando permissões de administrador...",
        });
        // A navegação será feita pelo useEffect quando isAdmin for atualizado
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log('Navegando para página inicial');
    navigate('/');
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-center mb-4">
            <div className="bg-secondary p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-neutral-50" />
            </div>
          </div>
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
              disabled={loading || authLoading}
            >
              {(loading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
