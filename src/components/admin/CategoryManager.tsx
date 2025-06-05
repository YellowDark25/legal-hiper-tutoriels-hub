
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FolderIcon, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  created_at: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#1a2332'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Atualizar categoria
        const { error } = await supabase
          .from('categorias')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        setCategories(categories.map(cat => 
          cat.id === editingId ? { ...cat, ...formData } : cat
        ));

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      } else {
        // Criar nova categoria
        const { data, error } = await supabase
          .from('categorias')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        setCategories([...categories, data]);

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso",
        });
      }

      // Limpar formulário
      setFormData({ nome: '', descricao: '', cor: '#1a2332' });
      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const editCategory = (category: Category) => {
    setFormData({
      nome: category.nome,
      descricao: category.descricao,
      cor: category.cor
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== id));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setFormData({ nome: '', descricao: '', cor: '#1a2332' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && categories.length === 0) {
    return <div className="flex justify-center p-8">Carregando categorias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="#1a2332"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
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

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: category.cor }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{category.nome}</h3>
                    {category.descricao && (
                      <p className="text-gray-600 text-sm mt-1">{category.descricao}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => editCategory(category)}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma categoria encontrada
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
