
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: ''
  });
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Se já estiver logado, redirecionar
    if (user) {
      navigate('/');
      return;
    }

    // Verificar se há um token de convite na URL
    const invite = searchParams.get('invite');
    if (invite) {
      validateInvite(invite);
    }
  }, [user, navigate, searchParams]);

  const validateInvite = async (token: string) => {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      toast({
        title: "Convite inválido",
        description: "Este convite não é válido ou já foi usado.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      toast({
        title: "Convite expirado",
        description: "Este convite expirou. Solicite um novo convite.",
        variant: "destructive",
      });
      return;
    }

    setInviteToken(token);
    setInviteEmail(data.email);
    setSignupData(prev => ({ ...prev, email: data.email }));
    
    toast({
      title: "Convite válido!",
      description: `Bem-vindo! Complete seu cadastro para ${data.email}`,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(signupData.email, signupData.password, {
        full_name: signupData.fullName
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Se há um token de convite, marcar como usado
        if (inviteToken) {
          await supabase
            .from('invite_tokens')
            .update({ used: true })
            .eq('token', inviteToken);
        }

        toast({
          title: "Cadastro realizado com sucesso!",
          description: inviteToken 
            ? "Sua conta de administrador foi criada com sucesso!"
            : "Verifique seu email para confirmar a conta.",
        });
        
        if (inviteToken) {
          navigate('/admin');
        }
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center bg-primary-900 text-neutral-50 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-secondary p-3 rounded-full">
              {inviteToken ? (
                <UserPlus className="w-8 h-8 text-neutral-50" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-neutral-50" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {inviteToken ? 'Aceitar Convite' : 'NexHub Admin'}
          </CardTitle>
          <p className="text-primary-200 text-sm mt-2">
            {inviteToken 
              ? `Complete seu cadastro para ${inviteEmail}`
              : 'Acesso para administradores'
            }
          </p>
        </CardHeader>
        <CardContent className="p-8 bg-neutral-50">
          {inviteToken ? (
            // Formulário de cadastro para convite
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                  className="border-primary-200 focus:border-secondary focus:ring-secondary"
                />
              </div>
              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={signupData.email}
                  disabled
                  className="bg-gray-100 border-primary-200"
                />
              </div>
              <div>
                <Label htmlFor="signupPassword">Senha</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  className="border-primary-200 focus:border-secondary focus:ring-secondary"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  className="border-primary-200 focus:border-secondary focus:ring-secondary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary-600 text-neutral-50" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aceitar Convite e Cadastrar
              </Button>
            </form>
          ) : (
            // Sistema de login/cadastro normal
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary-600 text-neutral-50" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword">Senha</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                      className="border-primary-200 focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary-600 text-neutral-50" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
