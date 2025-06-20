import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
          <CardTitle className="text-white">Clientes Cadastrados ({clientes.length})</CardTitle>
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