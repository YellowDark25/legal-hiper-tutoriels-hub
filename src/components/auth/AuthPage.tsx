import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, User, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: '',
    username: ''
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      const { error } = await signUp(signupData.email, signupData.password, {
        full_name: signupData.fullName,
        username: signupData.username
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
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
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0">
        {/* Partículas flutuantes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-amber-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-amber-400/10 rounded-full blur-xl animate-pulse delay-1500"></div>
        
        {/* Pattern de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </div>

      {/* Botão Voltar */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/20 transition-all duration-200">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="hidden md:block font-medium">Voltar</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 inline-block mb-6">
            <img 
              src="/logo-nexsyn-CLVIoj6u.png" 
              alt="Nexsyn Logo" 
              className="w-16 h-16 object-contain mx-auto"
              onError={(e) => {
                // Fallback para ícone SVG se a imagem não carregar
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-logo');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'block';
                }
              }}
            />
            {/* Fallback logo */}
            <div className="fallback-logo hidden w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Acesse sua conta
            </span>
          </h1>
          <p className="text-white/70 text-lg">
            Entre com suas credenciais para acessar os tutoriais
          </p>
        </div>

        {/* Card principal */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 font-semibold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white text-white/70 font-semibold"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nexsyn@unidadelrv.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" />
                          Entrar
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <span className="text-white/60 text-sm">ou</span>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Não tem cadastro? Cadastre-se
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-400" />
                      Nome Completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-400" />
                      Nome de Usuário
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Seu nome de usuário"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      E-mail *
                    </Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-white font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      Confirmar Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                        className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-orange-400 focus:ring-orange-400 h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" />
                          Cadastrar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>© 2024 Nexsyn. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="hover:text-white transition-colors">Suporte</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Site oficial</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
