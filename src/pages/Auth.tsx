import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ADMIN_ID = 'c53793c5-8cc0-4d15-8315-7a3d95ba252d';

const Auth = () => {
  const [form, setForm] = useState({
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setIsAdmin } = useAuth();
  const navigate = useNavigate();



  // Login de cliente ou admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });
      if (loginError) throw loginError;
      // Buscar perfil do usuário logado
      const userId = data.user?.id;
      if (!userId) throw new Error('Usuário não encontrado.');
      // Buscar perfil no banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      if (profile?.is_admin) {
        setIsAdmin(true);
        setSuccess('Login de administrador realizado!');
        navigate('/admin');
        return;
      } else {
        setIsAdmin(false);
        setSuccess('Login realizado!');
        navigate('/');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #002147 0%, #0066CC 25%, #FF6600 85%, #CCDD00 100%)'
      }}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-800/30"
      ></div>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative">
        {/* Header com Logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <img
              className="h-16 w-auto drop-shadow-2xl"
              src="/logo-nexsyn-CLVIoj6u.png"
              alt="Nexsyn Logo"
            />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Acesse sua conta
          </h2>
          <p className="text-center text-sm text-gray-100 mb-8 drop-shadow-md font-medium" style={{ fontFamily: 'Sansation, sans-serif' }}>
            Entre com suas credenciais para acessar os tutoriais profissionais
          </p>
        </div>

        {/* Formulário */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 rounded-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email */}
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`h-14 px-4 bg-white border rounded-md focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none transition-all duration-200 text-gray-900 ${
                      form.email || focusedField === 'email'
                        ? 'border-orange-500 border-2'
                        : 'border-orange-300 hover:border-orange-400'
                    }`}
                    style={{ fontFamily: 'Sansation, sans-serif' }}
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none ${
                      form.email || focusedField === 'email'
                        ? '-top-2 text-xs text-orange-600 font-medium' 
                        : 'top-4 text-base text-gray-500'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    E-mail *
                  </label>
                </div>

                {/* Senha */}
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={form.senha}
                    onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
                    onFocus={() => setFocusedField('senha')}
                    onBlur={() => setFocusedField('')}
                    className={`h-14 px-4 pr-12 bg-white border rounded-md focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none transition-all duration-200 text-gray-900 ${
                      form.senha || focusedField === 'senha'
                        ? 'border-orange-500 border-2'
                        : 'border-orange-300 hover:border-orange-400'
                    }`}
                    style={{ fontFamily: 'Sansation, sans-serif' }}
                    placeholder=" "
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200 focus:outline-none focus:text-orange-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <label 
                    htmlFor="senha" 
                    className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none ${
                      form.senha || focusedField === 'senha'
                        ? '-top-2 text-xs text-orange-600 font-medium' 
                        : 'top-4 text-base text-gray-500'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Senha *
                  </label>
                </div>

                {/* Mensagens de Erro e Sucesso */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                )}

                {/* Botão de Submit */}
                <div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-orange-200" 
                    disabled={loading}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aguarde...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        Entrar
                      </>
                    )}
                  </Button>
                </div>
              </form>


            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-orange-500/20 shadow-lg">
          <p className="text-xs text-gray-100 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
            © 2024 Nexsyn. Todos os direitos reservados.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-200">
            <a href="/contato" className="hover:text-orange-300 transition-colors duration-200 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Suporte
            </a>
            <span className="text-orange-400">•</span>
            <a href="https://nexsyn.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-orange-300 transition-colors duration-200 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Site oficial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
