
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadIcon } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
  cor: string;
}

interface Tag {
  id: string;
  nome: string;
}

const VideoUpload = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    url: '',
    miniatura: '',
    categoria_id: '',
    duracao: '',
    sistema: '',
    status: 'rascunho'
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
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
    }
  };

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
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Inserir vídeo
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert([formData])
        .select()
        .single();

      if (videoError) throw videoError;

      // Inserir tags do vídeo
      if (selectedTags.length > 0) {
        const videoTagsData = selectedTags.map(tagId => ({
          video_id: videoData.id,
          tag_id: tagId
        }));

        const { error: tagsError } = await supabase
          .from('video_tags')
          .insert(videoTagsData);

        if (tagsError) throw tagsError;
      }

      toast({
        title: "Sucesso",
        description: "Vídeo criado com sucesso",
      });

      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        url: '',
        miniatura: '',
        categoria_id: '',
        duracao: '',
        sistema: '',
        status: 'rascunho'
      });
      setSelectedTags([]);

    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o vídeo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="w-5 h-5" />
          Adicionar Novo Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL do Vídeo *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://youtube.com/embed/..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="miniatura">URL da Miniatura</Label>
                <Input
                  id="miniatura"
                  type="url"
                  value={formData.miniatura}
                  onChange={(e) => handleInputChange('miniatura', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="duracao">Duração</Label>
                <Input
                  id="duracao"
                  value={formData.duracao}
                  onChange={(e) => handleInputChange('duracao', e.target.value)}
                  placeholder="Ex: 5:30"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sistema">Sistema *</Label>
                <Select 
                  value={formData.sistema} 
                  onValueChange={(value) => handleInputChange('sistema', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdvlegal">PDV Legal</SelectItem>
                    <SelectItem value="hiper">Hiper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria_id} 
                  onValueChange={(value) => handleInputChange('categoria_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{tag.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={4}
              placeholder="Descrição do vídeo..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Criando...' : 'Criar Vídeo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
