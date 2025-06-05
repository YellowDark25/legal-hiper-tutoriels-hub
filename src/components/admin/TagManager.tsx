
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TagIcon, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';

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

  const deleteTag = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTags(tags.filter(tag => tag.id !== id));
      toast({
        title: "Sucesso",
        description: "Tag excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tag",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setTagName('');
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && tags.length === 0) {
    return <div className="flex justify-center p-8">Carregando tags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Tags</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nova Tag
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Tag' : 'Nova Tag'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Tag *</Label>
                <Input
                  id="nome"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: básico, avançado, passo-a-passo"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !tagName.trim()}>
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tags Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                <Badge variant="secondary" className="flex-1">
                  {tag.nome}
                </Badge>
                <div className="flex gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => editTag(tag)}
                    className="h-6 w-6 p-0"
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteTag(tag.id)}
                    className="h-6 w-6 p-0"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {tags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma tag encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TagManager;
