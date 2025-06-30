import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TagIcon, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Tag {
  id: string;
  nome: string;
  created_at: string;
}

const TagManager = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tagName, setTagName] = useState('');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDeleteId, setTagToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setLoading(true);

    try {
      if (editingId) {
        // Atualizar tag
        const { error } = await supabase
          .from('tags')
          .update({ nome: tagName.trim() })
          .eq('id', editingId);

        if (error) throw error;

        setTags(tags.map(tag => 
          tag.id === editingId ? { ...tag, nome: tagName.trim() } : tag
        ));

        toast({
          title: "Sucesso",
          description: "Tag atualizada com sucesso",
        });
      } else {
        // Criar nova tag
        const { data, error } = await supabase
          .from('tags')
          .insert([{ nome: tagName.trim() }])
          .select()
          .single();

        if (error) throw error;

        setTags([...tags, data]);

        toast({
          title: "Sucesso",
          description: "Tag criada com sucesso",
        });
      }

      // Limpar formulário
      setTagName('');
      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const editTag = (tag: Tag) => {
    setTagName(tag.nome);
    setEditingId(tag.id);
    setShowForm(true);
  };

  const handleDeleteClick = (tagId: string) => {
    setTagToDeleteId(tagId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTag = async () => {
    if (!tagToDeleteId) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagToDeleteId);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          toast({
            title: "Erro",
            description: "Não foi possível excluir a tag pois ela está associada a vídeos existentes.",
            variant: "destructive",
          });
        } else {
          console.error('Erro ao excluir tag:', error);
          toast({
            title: "Erro",
            description: "Não foi possível excluir a tag",
            variant: "destructive",
          });
        }
        return; // Prevent further execution on error
      }

      setTags(tags.filter(tag => tag.id !== tagToDeleteId));
      toast({
        title: "Sucesso",
        description: "Tag excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir tag (catch):', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tag",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTagToDeleteId(null);
    }
  };

  const cancelEdit = () => {
    setTagName('');
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && tags.length === 0) {
    return <div className="flex justify-center p-8 text-gray-300">Carregando tags...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Tags ({tags.length})</CardTitle>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nova Tag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingId ? 'Editar Tag' : 'Nova Tag'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-white font-medium">Nome da Tag</Label>
                    <Input
                      id="nome"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      placeholder="Digite o nome da tag"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      {editingId ? 'Atualizar' : 'Criar'} Tag
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              Nenhuma tag cadastrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    <th className="p-2 text-left text-white font-semibold">Nome</th>
                    <th className="p-2 text-left text-white font-semibold">Data Criação</th>
                    <th className="p-2 text-left text-white font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map(tag => (
                    <tr key={tag.id} className="border-b border-white/10 hover:border-l-4 hover:border-l-orange-400 hover:bg-white/5 transition-all duration-200">
                      <td className="p-2">
                        <Badge variant="outline" className="border-orange-400 text-orange-400">
                          {tag.nome}
                        </Badge>
                      </td>
                      <td className="p-2 text-gray-300">
                        {new Date(tag.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-300 hover:bg-white/10 hover:text-orange-400"
                            title="Editar tag"
                            onClick={() => editTag(tag)}
                          >
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-500/10"
                            title="Excluir tag"
                            onClick={() => handleDeleteClick(tag.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
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

export default TagManager;
