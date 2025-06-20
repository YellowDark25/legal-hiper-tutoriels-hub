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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Tags</h2>
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Tag
        </Button>
      </div>

      {showForm && (
        <Card className="bg-black/30 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Editar Tag' : 'Nova Tag'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome da Tag *</Label>
                <Input
                  id="nome"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: básico, avançado, passo-a-passo"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={loading || !tagName.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit}
                  className="border-gray-600 text-white hover:bg-white/10 hover:border-orange-400"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/30 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Tags Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-orange-400 transition-all duration-300">
                <Badge variant="secondary" className="flex-1 bg-orange-500 text-white hover:bg-orange-600">
                  {tag.nome}
                </Badge>
                <div className="flex gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => editTag(tag)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-orange-400"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(tag.id)}
                        className="h-8 w-8 p-0 text-white hover:bg-red-500/20 hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-600">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Tem certeza que deseja excluir esta tag?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente a tag e seus dados relacionados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={confirmDeleteTag}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {tags.length === 0 && (
            <div className="text-center py-8 text-gray-300">
              Nenhuma tag encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TagManager;
