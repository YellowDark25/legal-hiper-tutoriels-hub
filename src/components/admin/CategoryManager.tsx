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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

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

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDeleteId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDeleteId) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoryToDeleteId);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          toast({
            title: "Erro",
            description: "Não foi possível excluir a categoria pois ela está associada a vídeos existentes.",
            variant: "destructive",
          });
        } else {
          console.error('Erro ao excluir categoria:', error);
          toast({
            title: "Erro",
            description: "Não foi possível excluir a categoria",
            variant: "destructive",
          });
        }
        return; // Prevent further execution on error
      }

      setCategories(categories.filter(cat => cat.id !== categoryToDeleteId));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir categoria (catch):', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDeleteId(null);
    }
  };

  const cancelEdit = () => {
    setFormData({ nome: '', descricao: '', cor: '#1a2332' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && categories.length === 0) {
    return <div className="flex justify-center p-8 text-gray-300">Carregando categorias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Categorias</h2>
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <Card className="bg-black/30 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-white">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div>
                <Label htmlFor="cor" className="text-white">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20 bg-gray-700 border-gray-600"
                  />
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="#1a2332"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={loading}
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

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="bg-black/30 backdrop-blur-sm border border-white/20 hover:border-orange-400 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: category.cor }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-white">{category.nome}</h3>
                    {category.descricao && (
                      <p className="text-gray-300 text-sm mt-1">{category.descricao}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => editCategory(category)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-orange-400"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(category.id)}
                        className="h-8 w-8 p-0 text-white hover:bg-red-500/20 hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-600">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Tem certeza que deseja excluir esta categoria?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente a categoria e seus dados relacionados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={confirmDeleteCategory}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          Nenhuma categoria encontrada
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
