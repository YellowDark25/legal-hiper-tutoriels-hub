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
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-white flex items-end gap-1 text-lg sm:text-xl" style={{lineHeight:1.1}}>
              Categorias
              <span className="font-normal text-base sm:text-lg">({categories.length})</span>
            </CardTitle>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base flex items-center gap-1 sm:gap-2 rounded-lg"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-white font-medium">Nome da Categoria</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Digite o nome da categoria"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao" className="text-white font-medium">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição da categoria (opcional)"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cor" className="text-white font-medium">Cor</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="cor"
                        type="color"
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        className="w-16 h-10 bg-white/10 border-white/20"
                      />
                      <Input
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        placeholder="#1a2332"
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      {editingId ? 'Atualizar' : 'Criar'} Categoria
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

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              Nenhuma categoria cadastrada
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="block sm:hidden space-y-3">
                {categories.map(category => (
                  <div key={category.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white text-base truncate" style={{fontFamily: 'Poppins, sans-serif'}}>{category.nome}</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20" 
                          style={{ backgroundColor: category.cor }}
                        ></div>
                        <span className="text-gray-300 font-mono text-xs truncate max-w-[56px]">{category.cor}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 mb-1 truncate">{category.descricao || '—'}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{new Date(category.created_at).toLocaleDateString('pt-BR')}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-300 hover:bg-white/10 hover:text-orange-400"
                          title="Editar categoria"
                          onClick={() => editCategory(category)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10"
                          title="Excluir categoria"
                          onClick={() => handleDeleteClick(category.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Tabela */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 border-b border-white/20">
                      <th className="p-2 text-left text-white font-semibold">Nome</th>
                      <th className="p-2 text-left text-white font-semibold">Descrição</th>
                      <th className="p-2 text-left text-white font-semibold">Cor</th>
                      <th className="p-2 text-left text-white font-semibold">Data Criação</th>
                      <th className="p-2 text-left text-white font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id} className="border-b border-white/10 hover:border-l-4 hover:border-l-orange-400 hover:bg-white/5 transition-all duration-200">
                        <td className="p-2 text-white font-medium">{category.nome}</td>
                        <td className="p-2 text-gray-300">{category.descricao || '—'}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-white/20" 
                              style={{ backgroundColor: category.cor }}
                            ></div>
                            <span className="text-gray-300 font-mono text-xs">{category.cor}</span>
                          </div>
                        </td>
                        <td className="p-2 text-gray-300">
                          {new Date(category.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-300 hover:bg-white/10 hover:text-orange-400"
                              title="Editar categoria"
                              onClick={() => editCategory(category)}
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-500/10"
                              title="Excluir categoria"
                              onClick={() => handleDeleteClick(category.id)}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
