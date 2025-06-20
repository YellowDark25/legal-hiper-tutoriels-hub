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
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    cnpj: '',
    nome_fantasia: '',
    sistema: '',
    email: '',
    senha: '',
    cidade: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const { setIsAdmin } = useAuth();
  const navigate = useNavigate();

  // Autocompletar CNPJ usando BrasilAPI
  const handleCnpjAutocomplete = async () => {
    setError('');
    setSuccess('');
    if (!form.cnpj) return;
    try {
      setLoading(true);
      const cnpj = form.cnpj.replace(/\D/g, '');
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        nome_fantasia: data.fantasia || data.razao_social || '',
        cidade: data.municipio || '',
        estado: data.uf || '',
      }));
      setSuccess('Dados do CNPJ preenchidos!');
    } catch (err: any) {
      setError('Não foi possível buscar dados do CNPJ.');
    } finally {
      setLoading(false);
    }
  };

  // Cadastro de cliente
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // 1. Cria usuário no Supabase Auth (sem confirmação de e-mail)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
      });
      if (signUpError) throw signUpError;
      // 1.5. Faz login automático para garantir autenticação
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });
      if (signInError) throw signInError;
      // 2. Salva dados na nova tabela cadastro_empresa
      const { error: insertError } = await supabase.from('cadastro_empresa').insert({
        cnpj: form.cnpj,
        nome_fantasia: form.nome_fantasia,
        sistema: form.sistema,
        cidade: form.cidade,
        estado: form.estado,
        email: form.email,
      });
      if (insertError) throw insertError;
      setSuccess('Cadastro realizado com sucesso! Faça login para acessar.');
      setIsLogin(true); // Redireciona para tela de login
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

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
        navigate('/admin-choice');
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
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(to bottom right, #002147, #011123)'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom right, rgba(0, 33, 71, 0.3), rgba(1, 17, 35, 0.3))'
        }}
      ></div>
      <div className="relative">
        {/* Header com Logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <img
                className="h-16 w-auto"
                src="/logo-nexsyn-CLVIoj6u.png"
                alt="Nexsyn Logo"
              />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2">
            {isLogin ? 'Acesse sua conta' : 'Cadastre sua empresa'}
          </h2>
          <p className="text-center text-sm text-gray-300 mb-8">
            {isLogin 
              ? 'Entre com suas credenciais para acessar os tutoriais' 
              : 'Preencha os dados para criar sua conta'
            }
          </p>
        </div>

        {/* Formulário */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                {!isLogin && (
                  <>
                    {/* CNPJ com Autocompletar */}
                    <div>
                      <Label htmlFor="cnpj" className="block text-sm font-semibold text-gray-700 mb-2">
                        CNPJ *
                      </Label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            id="cnpj"
                            value={form.cnpj}
                            onChange={(e) => setForm((prev) => ({ ...prev, cnpj: e.target.value }))}
                            placeholder="00.000.000/0000-00"
                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleCnpjAutocomplete} 
                          disabled={loading}
                          variant="outline"
                          className="h-12 px-4 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Buscar
                        </Button>
                      </div>
                    </div>

                    {/* Nome da Empresa */}
                    <div>
                      <Label htmlFor="nome_fantasia" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome da Empresa *
                      </Label>
                      <Input
                        id="nome_fantasia"
                        value={form.nome_fantasia}
                        onChange={(e) => setForm((prev) => ({ ...prev, nome_fantasia: e.target.value }))}
                        placeholder="Nome fantasia da sua empresa"
                        className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Sistema */}
                    <div>
                      <Label htmlFor="sistema" className="block text-sm font-semibold text-gray-700 mb-2">
                        Sistema *
                      </Label>
                      <Select
                        value={form.sistema}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, sistema: value }))}
                      >
                        <SelectTrigger className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <SelectValue placeholder="Selecione seu sistema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdvlegal">PDV Legal</SelectItem>
                          <SelectItem value="hiper">Sistema Hiper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cidade" className="block text-sm font-semibold text-gray-700 mb-2">
                          Cidade
                        </Label>
                        <Input
                          id="cidade"
                          value={form.cidade}
                          onChange={(e) => setForm((prev) => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Sua cidade"
                          className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-2">
                          Estado
                        </Label>
                        <Input
                          id="estado"
                          value={form.estado}
                          onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                          placeholder="UF"
                          className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`h-14 px-4 bg-white border rounded-md focus:ring-0 transition-all duration-200 text-gray-900 ${
                      form.email || focusedField === 'email'
                        ? 'border-blue-500 border-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none ${
                      form.email || focusedField === 'email'
                        ? '-top-2 text-xs text-blue-600 font-medium' 
                        : 'top-4 text-base text-gray-500'
                    }`}
                  >
                    E-mail *
                  </label>
                </div>

                {/* Senha */}
                <div className="relative">
                  <Input
                    id="senha"
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
                    onFocus={() => setFocusedField('senha')}
                    onBlur={() => setFocusedField('')}
                    className={`h-14 px-4 bg-white border rounded-md focus:ring-0 transition-all duration-200 text-gray-900 ${
                      form.senha || focusedField === 'senha'
                        ? 'border-blue-500 border-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="senha" 
                    className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none ${
                      form.senha || focusedField === 'senha'
                        ? '-top-2 text-xs text-blue-600 font-medium' 
                        : 'top-4 text-base text-gray-500'
                    }`}
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
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-200" 
                    disabled={loading}
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
                        {isLogin ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                            </svg>
                            Entrar
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Cadastrar
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Toggle entre Login e Cadastro */}
              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => { 
                      setIsLogin(!isLogin); 
                      setError(''); 
                      setSuccess(''); 
                      setForm({
                        cnpj: '',
                        nome_fantasia: '',
                        sistema: '',
                        email: '',
                        senha: '',
                        cidade: '',
                        estado: '',
                      });
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    {isLogin ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Não tem cadastro? Cadastre-se
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        Já tem cadastro? Faça login
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © 2024 Nexsyn. Todos os direitos reservados.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-500">
            <a href="/contato" className="hover:text-white transition-colors">
              Suporte
            </a>
            <span>•</span>
            <a href="https://nexsyn.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Site oficial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
