import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    duracao: '',
    sistema: '',
    status: 'rascunho'
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchCategories();
      fetchTags();
    }
  }, [user, isAdmin]);

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

  // Função para sanitizar nomes de arquivo
  const sanitizeFileName = (fileName: string) => {
    return fileName
      .normalize('NFD') // Decompoem caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por underscore
      .replace(/_{2,}/g, '_') // Remove underscores duplos
      .toLowerCase();
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
    
    if (!user || !isAdmin) {
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

    // Validar tamanho do arquivo (máximo 500MB para vídeo)
    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxVideoSize) {
      toast({
        title: "Erro",
        description: "O arquivo de vídeo é muito grande. Tamanho máximo: 500MB",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho da miniatura (máximo 10MB)
    if (thumbnailFile) {
      const maxThumbnailSize = 10 * 1024 * 1024; // 10MB
      if (thumbnailFile.size > maxThumbnailSize) {
        toast({
          title: "Erro",
          description: "O arquivo de miniatura é muito grande. Tamanho máximo: 10MB",
          variant: "destructive",
        });
        return;
      }
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
      // Use o ID do usuário autenticado para o campo created_by
      // O user vem do useAuth() e deve ser o ID do administrador logado.
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "ID do usuário administrador não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const currentUserId = user.id;
      
      // Upload do vídeo
      const sanitizedVideoName = sanitizeFileName(videoFile.name);
      const videoFileName = `admin/${Date.now()}_${sanitizedVideoName}`;
      const videoData = await uploadFile(videoFile, 'videos', videoFileName);
      
      setUploadProgress(50);

      // Upload da miniatura (se fornecida)
      let thumbnailPath = null;
      if (thumbnailFile) {
        const sanitizedThumbnailName = sanitizeFileName(thumbnailFile.name);
        const thumbnailFileName = `admin/${Date.now()}_${sanitizedThumbnailName}`;
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
          created_by: currentUserId // Necessário para a política RLS
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
      
      // Melhor tratamento de erros
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      toast({
        title: "Erro no Upload",
        description: `Não foi possível criar o vídeo: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Verificar se é admin usando o contexto de autenticação
  if (!user || !isAdmin) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-red-400">Acesso negado. Faça login como administrador.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <UploadIcon className="w-5 h-5" />
          Adicionar Novo Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo" className="text-white font-medium">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="video-file" className="text-white font-medium">Arquivo de Vídeo *</Label>
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-gray-400" />
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    required
                    className="bg-white/10 border-white/20 text-white file:bg-gray-600 file:text-white file:border-gray-500"
                  />
                </div>
                {videoFile && (
                  <div className="text-sm text-gray-400 mt-1">
                    <p>Arquivo selecionado: {videoFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Será salvo como: {sanitizeFileName(videoFile.name)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail-file" className="text-white font-medium">Miniatura (Opcional)</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="bg-white/10 border-white/20 text-white file:bg-gray-600 file:text-white file:border-gray-500"
                  />
                </div>
                {thumbnailFile && (
                  <div className="text-sm text-gray-400 mt-1">
                    <p>Arquivo selecionado: {thumbnailFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Será salvo como: {sanitizeFileName(thumbnailFile.name)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="duracao" className="text-white font-medium">Duração</Label>
                <Input
                  id="duracao"
                  value={formData.duracao}
                  onChange={(e) => handleInputChange('duracao', e.target.value)}
                  placeholder="Ex: 5:30"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sistema" className="text-white font-medium">Sistema *</Label>
                <Select 
                  value={formData.sistema} 
                  onValueChange={(value) => handleInputChange('sistema', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="pdvlegal" className="text-white hover:bg-gray-700">PDV Legal</SelectItem>
                    <SelectItem value="hiper" className="text-white hover:bg-gray-700">Hiper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria" className="text-white font-medium">Categoria</Label>
                <Select 
                  value={formData.categoria_id} 
                  onValueChange={(value) => handleInputChange('categoria_id', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-white font-medium">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="rascunho" className="text-white hover:bg-gray-700">Rascunho</SelectItem>
                    <SelectItem value="ativo" className="text-white hover:bg-gray-700">Ativo</SelectItem>
                    <SelectItem value="inativo" className="text-white hover:bg-gray-700">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-medium">Tags</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto bg-white/10 p-3 rounded border border-white/20">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-sm text-white">{tag.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao" className="text-white font-medium">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={4}
              placeholder="Descrição do vídeo..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {loading && uploadProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
              <p className="text-sm text-center mt-2 text-gray-300">Upload: {uploadProgress}%</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {loading ? 'Fazendo Upload...' : 'Criar Vídeo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
