import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Mail, UserPlus } from "lucide-react";

import type { Invite } from '@/integrations/supabase/database.types';

// Definindo o tipo para o cliente Supabase com a tabela de convites
type SupabaseClient = Omit<typeof supabase, 'from' | 'rpc'> & {
  from(table: 'invites'): {
    select: (columns?: string) => {
      order: (column: string, options: { ascending: boolean }) => Promise<{ data: Invite[] | null; error: Error | null }>;
    };
  };
  rpc: (fn: 'invite_user', params: { email: string; user_role: 'user' | 'admin' }) => Promise<{ data: string | null; error: Error | null }>;
};

const typedSupabase = supabase as unknown as SupabaseClient;

export default function UserInvites() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const { toast } = useToast();

  // Carrega os convites existentes
  const loadInvites = useCallback(async () => {
    try {
      setLoadingInvites(true);
      // Buscando convites do banco de dados
      const { data, error } = await typedSupabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os convites.',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvites(false);
    }
  }, [toast]);

  // Carrega os convites quando o componente é montado
  React.useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  // Gera um novo convite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um email.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Chama a função do banco de dados para criar um convite
      const { data: inviteUrl, error } = await typedSupabase.rpc('invite_user', {
        email,
        user_role: role as 'user' | 'admin'
      });
      
      if (error || !inviteUrl) {
        throw error || new Error('Falha ao gerar o convite');
      }
      
      // Atualiza a lista de convites
      await loadInvites();
      
      // Copia a URL para a área de transferência
      if (typeof inviteUrl === 'string') {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        throw new Error('Resposta inválida ao gerar convite');
      }
      
      toast({
        title: 'Convite gerado!',
        description: 'O link do convite foi copiado para a área de transferência.',
      });
      
      // Limpa o formulário
      setEmail('');
    } catch (error: unknown) {
      console.error('Erro ao gerar convite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível gerar o convite.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Formata a data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não utilizado';
    return new Date(dateString).toLocaleString();
  };

  // Copia o link de convite para a área de transferência
  const copyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/signup?invite=${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Link copiado!',
      description: 'O link do convite foi copiado para a área de transferência.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Convidar Novo Usuário</h2>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do convidado</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
        
        {loadingInvites ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>Nenhum convite pendente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data do Convite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invite.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invite.used_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invite.used_at ? 'Utilizado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!invite.used_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar Link
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
