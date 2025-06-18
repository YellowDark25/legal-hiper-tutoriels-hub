import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Cliente {
  id: number;
  CNPJ: string;
  nome_fantansia: string;
  sistema: string;
  email: string;
  cidade: string;
  estado: string;
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
      .from('Empresas')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setClientes(data);
    setLoading(false);
  };

  const filtered = search.trim() === ''
    ? clientes
    : clientes.filter(c =>
        (c.nome_fantansia || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.CNPJ || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">CNPJ</th>
                    <th className="p-2 text-left">Empresa</th>
                    <th className="p-2 text-left">Sistema</th>
                    <th className="p-2 text-left">E-mail</th>
                    <th className="p-2 text-left">Cidade</th>
                    <th className="p-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cliente => (
                    <tr key={cliente.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{cliente.CNPJ || '—'}</td>
                      <td className="p-2">{cliente.nome_fantansia || '—'}</td>
                      <td className="p-2">
                        <Badge variant="outline">{cliente.sistema === 'pdvlegal' ? 'PDV Legal' : cliente.sistema === 'hiper' ? 'Hiper' : '—'}</Badge>
                      </td>
                      <td className="p-2">{cliente.email || '—'}</td>
                      <td className="p-2">{cliente.cidade || '—'}</td>
                      <td className="p-2">{cliente.estado || '—'}</td>
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