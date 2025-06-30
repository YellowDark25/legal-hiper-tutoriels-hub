import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Copy, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InviteToken {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  invited_by: string;
}

const InviteManager = () => {
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar convites",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInvites(data || []);
    }
  };

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim()) return;

    setLoading(true);
    
    try {
      // Gerar token único
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { error } = await supabase
        .from('invite_tokens')
        .insert({
          email: newInviteEmail.trim(),
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Email já convidado",
            description: "Este email já possui um convite pendente.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Convite gerado com sucesso!",
          description: `Convite criado para ${newInviteEmail}`,
        });
        setNewInviteEmail('');
        fetchInvites();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao gerar convite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/auth?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado!",
      description: "Link de convite copiado para a área de transferência.",
    });
  };

  const deleteInvite = async (id: string) => {
    const { error } = await supabase
      .from('invite_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao excluir convite",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Convite excluído",
        description: "Convite removido com sucesso.",
      });
      fetchInvites();
    }
  };

  const getInviteStatus = (invite: InviteToken) => {
    if (invite.used) {
      return { label: 'Usado', icon: CheckCircle, color: 'text-green-600' };
    }
    
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    
    if (now > expiresAt) {
      return { label: 'Expirado', icon: XCircle, color: 'text-red-600' };
    }
    
    return { label: 'Pendente', icon: Clock, color: 'text-yellow-600' };
  };

  return (
    <div className="space-y-6">
      {/* Formulário para novo convite */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Gerar Novo Convite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateInvite} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="text-white">
                Email do novo administrador
              </Label>
              <Input
                id="email"
                type="email"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="w-4 h-4 mr-2" />
                Gerar Convite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de convites */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Convites Enviados ({invites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              Nenhum convite encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    <th className="p-2 text-left text-white font-semibold">E-mail</th>
                    <th className="p-2 text-left text-white font-semibold">Status</th>
                    <th className="p-2 text-left text-white font-semibold">Criado em</th>
                    <th className="p-2 text-left text-white font-semibold">Expira em</th>
                    <th className="p-2 text-left text-white font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => {
                    const status = getInviteStatus(invite);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={invite.id} className="border-b border-white/10 hover:border-l-4 hover:border-l-orange-400 hover:bg-white/5 transition-all duration-200">
                        <td className="p-2 text-white font-medium">{invite.email}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-gray-300">
                          {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2 text-gray-300">
                          {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            {!invite.used && new Date() < new Date(invite.expires_at) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-300 hover:bg-white/10 hover:text-orange-400"
                                title="Copiar link de convite"
                                onClick={() => copyInviteLink(invite.token)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-500/10"
                              title="Excluir convite"
                              onClick={() => deleteInvite(invite.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteManager;
