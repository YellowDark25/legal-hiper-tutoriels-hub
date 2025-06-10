
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

  const isDarkTheme = profile?.theme_preference === 'dark';

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
      <Card className={`transition-colors duration-300 ${
        isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`transition-colors duration-300 ${
            isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
          }`}>
            Gerar Novo Convite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateInvite} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className={`transition-colors duration-300 ${
                isDarkTheme ? 'text-gray-300' : 'text-primary-800'
              }`}>
                Email do novo administrador
              </Label>
              <Input
                id="email"
                type="email"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
                className={`mt-1 transition-colors duration-300 ${
                  isDarkTheme 
                    ? 'bg-gray-600 border-gray-500 text-neutral-50 placeholder:text-gray-400'
                    : 'border-primary-200 focus:border-secondary focus:ring-secondary'
                }`}
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-secondary hover:bg-secondary-600 text-neutral-50"
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
      <Card className={`transition-colors duration-300 ${
        isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`transition-colors duration-300 ${
            isDarkTheme ? 'text-neutral-50' : 'text-primary-900'
          }`}>
            Convites Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className={`text-center py-8 transition-colors duration-300 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Nenhum convite encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => {
                const status = getInviteStatus(invite);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={invite.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-300 ${
                      isDarkTheme 
                        ? 'bg-gray-600 border-gray-500' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            isDarkTheme ? 'text-neutral-50' : 'text-gray-900'
                          }`}>
                            {invite.email}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Criado em {new Date(invite.created_at).toLocaleDateString('pt-BR')} • {status.label}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!invite.used && new Date() <= new Date(invite.expires_at) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token)}
                          className={`transition-colors duration-300 ${
                            isDarkTheme
                              ? 'border-gray-500 text-gray-300 hover:bg-gray-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar Link
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInvite(invite.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteManager;
