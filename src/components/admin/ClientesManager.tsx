import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlusIcon, SearchIcon } from 'lucide-react';

interface Cliente {
  id: string;
  cnpj: string;
  nome_fantasia: string;
  sistema: string;
  email: string;
  cidade: string;
  estado: string;
  created_at: string;
}

const ClientesManager = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const { toast } = useToast();
  
  const [novoCliente, setNovoCliente] = useState({
    cnpj: '',
    nome_fantasia: '',
    sistema: '',
    email: '',
    senha: '',
    cidade: '',
    estado: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cadastro_empresa')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
    } else if (data) {
      setClientes(data);
    }
    setLoading(false);
  };

  // Autocompletar CNPJ usando BrasilAPI
  const handleCnpjAutocomplete = async () => {
    if (!novoCliente.cnpj) return;
    try {
      setCadastroLoading(true);
      const cnpj = novoCliente.cnpj.replace(/\D/g, '');
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      setNovoCliente((prev) => ({
        ...prev,
        nome_fantasia: data.fantasia || data.razao_social || '',
        cidade: data.municipio || '',
        estado: data.uf || '',
      }));
      toast({
        title: "Sucesso",
        description: "Dados do CNPJ preenchidos automaticamente!",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar dados do CNPJ.",
        variant: "destructive",
      });
    } finally {
      setCadastroLoading(false);
    }
  };

  // Cadastro de novo cliente
  const handleCadastroCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroLoading(true);
    try {
      // 1. Cria usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: novoCliente.email,
        password: novoCliente.senha,
      });
      if (signUpError) throw signUpError;
      
      // 2. Salva dados na tabela cadastro_empresa
      const { error: insertError } = await supabase.from('cadastro_empresa').insert({
        cnpj: novoCliente.cnpj,
        nome_fantasia: novoCliente.nome_fantasia,
        sistema: novoCliente.sistema,
        cidade: novoCliente.cidade,
        estado: novoCliente.estado,
        email: novoCliente.email,
      });
      if (insertError) throw insertError;
      
      toast({
        title: "Cliente cadastrado!",
        description: "Novo cliente foi cadastrado com sucesso.",
      });
      
      // Reset form e fechar dialog
      setNovoCliente({
        cnpj: '',
        nome_fantasia: '',
        sistema: '',
        email: '',
        senha: '',
        cidade: '',
        estado: '',
      });
      setIsDialogOpen(false);
      
      // Atualizar lista
      fetchClientes();
    } catch (err: any) {
      toast({
        title: "Erro ao cadastrar",
        description: err.message || 'Erro ao cadastrar cliente.',
        variant: "destructive",
      });
    } finally {
      setCadastroLoading(false);
    }
  };

  const filtered = search.trim() === ''
    ? clientes
    : clientes.filter(c =>
        (c.nome_fantasia || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.cnpj || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Clientes Cadastrados ({clientes.length})</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Cadastrar Novo Cliente
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCadastroCliente} className="space-y-4">
                  {/* CNPJ com Autocompletar */}
                  <div>
                    <Label htmlFor="cnpj" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      CNPJ *
                    </Label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          id="cnpj"
                          value={novoCliente.cnpj}
                          onChange={(e) => setNovoCliente((prev) => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0000-00"
                          className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          required
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleCnpjAutocomplete} 
                        disabled={cadastroLoading}
                        variant="outline"
                        className="h-10 px-3 border-gray-300 hover:bg-orange-50 hover:border-orange-400"
                      >
                        <SearchIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Nome da Empresa */}
                  <div>
                    <Label htmlFor="nome_fantasia" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Nome da Empresa *
                    </Label>
                    <Input
                      id="nome_fantasia"
                      value={novoCliente.nome_fantasia}
                      onChange={(e) => setNovoCliente((prev) => ({ ...prev, nome_fantasia: e.target.value }))}
                      placeholder="Nome fantasia da empresa"
                      className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      required
                    />
                  </div>

                  {/* Sistema */}
                  <div>
                    <Label htmlFor="sistema" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Sistema *
                    </Label>
                    <Select
                      value={novoCliente.sistema}
                      onValueChange={(value) => setNovoCliente((prev) => ({ ...prev, sistema: value }))}
                    >
                      <SelectTrigger className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                        <SelectValue placeholder="Selecione o sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdvlegal">PDV Legal</SelectItem>
                        <SelectItem value="hiper">Sistema Hiper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email e Senha */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={novoCliente.email}
                        onChange={(e) => setNovoCliente((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@empresa.com"
                        className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Senha *
                      </Label>
                      <Input
                        id="senha"
                        type="password"
                        value={novoCliente.senha}
                        onChange={(e) => setNovoCliente((prev) => ({ ...prev, senha: e.target.value }))}
                        placeholder="Digite uma senha"
                        className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cidade" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Cidade
                      </Label>
                      <Input
                        id="cidade"
                        value={novoCliente.cidade}
                        onChange={(e) => setNovoCliente((prev) => ({ ...prev, cidade: e.target.value }))}
                        placeholder="Cidade"
                        className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Estado
                      </Label>
                      <Input
                        id="estado"
                        value={novoCliente.estado}
                        onChange={(e) => setNovoCliente((prev) => ({ ...prev, estado: e.target.value }))}
                        placeholder="UF"
                        className="h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={cadastroLoading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {cadastroLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          {loading ? (
            <div className="text-center py-8 text-white">Carregando clientes...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              {search ? 'Nenhum cliente encontrado para a busca' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    <th className="p-2 text-left text-white font-semibold">CNPJ</th>
                    <th className="p-2 text-left text-white font-semibold">Nome Fantasia</th>
                    <th className="p-2 text-left text-white font-semibold">Sistema</th>
                    <th className="p-2 text-left text-white font-semibold">E-mail</th>
                    <th className="p-2 text-left text-white font-semibold">Cidade</th>
                    <th className="p-2 text-left text-white font-semibold">Estado</th>
                    <th className="p-2 text-left text-white font-semibold">Data Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cliente => (
                    <tr key={cliente.id} className="border-b border-white/10 hover:border-l-4 hover:border-l-orange-400 hover:bg-white/5 transition-all duration-200">
                      <td className="p-2 font-mono text-gray-300">{cliente.cnpj || '—'}</td>
                      <td className="p-2 text-white">{cliente.nome_fantasia || '—'}</td>
                      <td className="p-2">
                        {cliente.sistema ? (
                          <Badge variant="outline" className="border-orange-400 text-orange-400">
                            {cliente.sistema === 'pdvlegal' ? 'PDV Legal' : 
                             cliente.sistema === 'hiper' ? 'Hiper' : 
                             cliente.sistema}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-gray-300">{cliente.email || '—'}</td>
                      <td className="p-2 text-gray-300">{cliente.cidade || '—'}</td>
                      <td className="p-2 text-gray-300">{cliente.estado || '—'}</td>
                      <td className="p-2 text-gray-300">
                        {cliente.created_at ? 
                          new Date(cliente.created_at).toLocaleDateString('pt-BR') : 
                          '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesManager; 