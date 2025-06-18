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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Login do Cliente' : 'Cadastro de Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {!isLogin && (
              <>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={form.cnpj}
                      onChange={(e) => setForm((prev) => ({ ...prev, cnpj: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="button" onClick={handleCnpjAutocomplete} disabled={loading}>
                    Autocompletar
                  </Button>
                </div>
                <div>
                  <Label htmlFor="nome_fantasia">Nome da Empresa *</Label>
                  <Input
                    id="nome_fantasia"
                    value={form.nome_fantasia}
                    onChange={(e) => setForm((prev) => ({ ...prev, nome_fantasia: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sistema">Sistema *</Label>
                  <Select
                    value={form.sistema}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, sistema: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdvlegal">PDV Legal</SelectItem>
                      <SelectItem value="hiper">Hiper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={form.cidade}
                      onChange={(e) => setForm((prev) => ({ ...prev, cidade: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={form.estado}
                      onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={form.senha}
                onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="link" type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>
              {isLogin ? 'Não tem cadastro? Cadastre-se' : 'Já tem cadastro? Faça login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
