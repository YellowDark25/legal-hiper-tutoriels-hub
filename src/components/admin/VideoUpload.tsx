
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadIcon, VideoIcon, ImageIcon } from 'lucide-react';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    duracao: '',
    sistema: '',
    status: 'rascunho'
  });

  useEffect(() => {
    // Verificar se é admin antes de fazer qualquer operação
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado como administrador",
        variant: "destructive",
      });
      return;
    }

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

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se é admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado como administrador para fazer upload de vídeos",
        variant: "destructive",
      });
      return;
    }

    if (!videoFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de vídeo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um título para o vídeo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sistema) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um sistema",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // ID fixo do admin para o sistema
      const adminUserId = '00000000-0000-0000-0000-000000000001';
      
      // Upload do vídeo
      const videoFileName = `admin/${Date.now()}_${videoFile.name}`;
      const videoData = await uploadFile(videoFile, 'videos', videoFileName);
      
      setUploadProgress(50);

      // Upload da miniatura (se fornecida)
      let thumbnailPath = null;
      if (thumbnailFile) {
        const thumbnailFileName = `admin/${Date.now()}_${thumbnailFile.name}`;
        await uploadFile(thumbnailFile, 'thumbnails', thumbnailFileName);
        thumbnailPath = thumbnailFileName;
      }

      setUploadProgress(75);

      // Obter URL pública do vídeo
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoData.path);

      // Inserir vídeo no banco sem referência de usuário (sistema admin)
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .insert([{
          ...formData,
          url: publicUrl,
          video_path: videoData.path,
          thumbnail_path: thumbnailPath,
          created_by: adminUserId // ID fixo do admin
        }])
        .select()
        .single();

      if (videoError) {
        console.error('Erro ao inserir vídeo:', videoError);
        throw videoError;
      }

      // Inserir tags do vídeo
      if (selectedTags.length > 0) {
        const videoTagsData = selectedTags.map(tagId => ({
          video_id: videoRecord.id,
          tag_id: tagId
        }));

        const { error: tagsError } = await supabase
          .from('video_tags')
          .insert(videoTagsData);

        if (tagsError) {
          console.error('Erro ao inserir tags:', tagsError);
          throw tagsError;
        }
      }

      setUploadProgress(100);

      toast({
        title: "Sucesso",
        description: "Vídeo criado com sucesso",
      });

      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        categoria_id: '',
        duracao: '',
        sistema: '',
        status: 'rascunho'
      });
      setSelectedTags([]);
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      toast({
        title: "Erro",
        description: `Não foi possível criar o vídeo: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se é admin antes de renderizar
  const isAdmin = localStorage.getItem('isAdmin');
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Acesso negado. Faça login como administrador.</p>
        </CardContent>
      </Card>
    );
  }

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
                <Label htmlFor="video-file">Arquivo de Vídeo *</Label>
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-gray-400" />
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                {videoFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Arquivo selecionado: {videoFile.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail-file">Miniatura (Opcional)</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                </div>
                {thumbnailFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Arquivo selecionado: {thumbnailFile.name}
                  </p>
                )}
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

          {loading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
              <p className="text-sm text-center mt-2">Upload: {uploadProgress}%</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Fazendo Upload...' : 'Criar Vídeo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
