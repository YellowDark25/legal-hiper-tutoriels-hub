import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditIcon, TrashIcon, EyeIcon, SearchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, VideoIcon } from 'lucide-react';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  duracao: string;
  sistema: string;
  status: string;
  visualizacoes: number;
  categoria: { nome: string; cor: string } | null;
  created_at: string;
}

// Função utilitária para obter a URL pública da miniatura
function getThumbnailUrl(video: any): string {
  if (video.thumbnail_path) {
    // Gera a URL pública do Supabase Storage para thumbnails
    const { data } = supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_path);
    return data?.publicUrl || '/placeholder.svg';
  }
  if (video.miniatura) {
    return video.miniatura;
  }
  return '/placeholder.svg';
}

const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSistema, setFilterSistema] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [videoToDeleteId, setVideoToDeleteId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editCategories, setEditCategories] = useState<any[]>([]);
  const [editTags, setEditTags] = useState<any[]>([]);
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([]);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os vídeos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (videoId: string) => {
    setVideoToDeleteId(videoId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDeleteId) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoToDeleteId);

      if (error) {
        console.error('Erro ao excluir vídeo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o vídeo",
          variant: "destructive",
        });
        return; // Prevent further execution on error
      }

      setVideos(videos.filter(video => video.id !== videoToDeleteId));
      toast({
        title: "Sucesso",
        description: "Vídeo excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir vídeo (catch):', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o vídeo",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setVideoToDeleteId(null);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';

    try {
      const { error } = await supabase
        .from('videos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.map(video => 
        video.id === id ? { ...video, status: newStatus } : video
      ));

      toast({
        title: "Sucesso",
        description: `Vídeo ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do vídeo",
        variant: "destructive",
      });
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSistema = filterSistema === 'all' || video.sistema === filterSistema;
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    
    return matchesSearch && matchesSistema && matchesStatus;
  });

  // Função para abrir modal de edição
  const openEditDialog = async (video: any) => {
    setVideoToEdit(video);
    setEditForm({
      titulo: video.titulo || '',
      descricao: video.descricao || '',
      categoria_id: video.categoria_id || '',
      duracao: video.duracao || '',
      sistema: video.sistema || '',
      status: video.status || 'rascunho',
    });
    setEditSelectedTags([]);
    setEditThumbnailFile(null);
    setEditLoading(false);
    // Buscar categorias e tags
    const [{ data: cats }, { data: tgs }] = await Promise.all([
      supabase.from('categorias').select('*').order('nome'),
      supabase.from('tags').select('*').order('nome'),
    ]);
    setEditCategories(cats || []);
    setEditTags(tgs || []);
    // Buscar tags do vídeo
    const { data: videoTags } = await supabase
      .from('video_tags')
      .select('tag_id')
      .eq('video_id', video.id);
    setEditSelectedTags((videoTags || []).map((vt: any) => vt.tag_id));
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditTagToggle = (tagId: string) => {
    setEditSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoToEdit) return;
    setEditLoading(true);
    try {
      let thumbnailPath = videoToEdit.thumbnail_path || null;
      // Upload da miniatura se fornecida
      if (editThumbnailFile) {
        const thumbnailFileName = `admin/${Date.now()}_${editThumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName, editThumbnailFile, { upsert: true });
        if (thumbError) throw thumbError;
        thumbnailPath = thumbnailFileName;
      }
      // Atualizar vídeo
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          ...editForm,
          thumbnail_path: thumbnailPath,
        })
        .eq('id', videoToEdit.id);
      if (updateError) throw updateError;
      // Atualizar tags (remover todas e inserir as novas)
      await supabase.from('video_tags').delete().eq('video_id', videoToEdit.id);
      if (editSelectedTags.length > 0) {
        const videoTagsData = editSelectedTags.map((tagId) => ({
          video_id: videoToEdit.id,
          tag_id: tagId,
        }));
        const { error: tagsError } = await supabase.from('video_tags').insert(videoTagsData);
        if (tagsError) throw tagsError;
      }
      // Atualizar lista local
      fetchVideos();
      toast({ title: 'Sucesso', description: 'Vídeo atualizado com sucesso' });
      setIsEditDialogOpen(false);
      setVideoToEdit(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o vídeo',
        variant: 'destructive',
      });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando vídeos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar vídeos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterSistema} onValueChange={setFilterSistema}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por sistema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os sistemas</SelectItem>
            <SelectItem value="pdvlegal">PDV Legal</SelectItem>
            <SelectItem value="hiper">Hiper</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredVideos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={getThumbnailUrl(video)}
                    alt={video.titulo}
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{video.titulo}</h3>
                    <div className="flex gap-2">
                      <Badge variant={video.status === 'ativo' ? 'default' : 'secondary'}>
                        {video.status}
                      </Badge>
                      <Badge variant="outline">
                        {video.sistema === 'pdvlegal' ? 'PDV Legal' : 'Hiper'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        {video.visualizacoes} visualizações
                      </span>
                      <span>Duração: {video.duracao}</span>
                      {video.categoria && (
                        <Badge 
                          style={{ backgroundColor: video.categoria.cor }}
                          className="text-white"
                        >
                          {video.categoria.nome}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(video.id, video.status)}
                      >
                        {video.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(video)}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(video.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja excluir este vídeo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso excluirá permanentemente o vídeo e seus dados relacionados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteVideo}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum vídeo encontrado
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vídeo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-titulo">Título *</Label>
                  <Input
                    id="edit-titulo"
                    value={editForm?.titulo || ''}
                    onChange={(e) => handleEditInputChange('titulo', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-thumbnail-file">Miniatura (Opcional)</Label>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <Input
                      id="edit-thumbnail-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setEditThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {editThumbnailFile && (
                    <p className="text-sm text-gray-600 mt-1">Arquivo selecionado: {editThumbnailFile.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-duracao">Duração</Label>
                  <Input
                    id="edit-duracao"
                    value={editForm?.duracao || ''}
                    onChange={(e) => handleEditInputChange('duracao', e.target.value)}
                    placeholder="Ex: 5:30"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-sistema">Sistema *</Label>
                  <Select
                    value={editForm?.sistema || ''}
                    onValueChange={(value) => handleEditInputChange('sistema', value)}
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
                  <Label htmlFor="edit-categoria">Categoria</Label>
                  <Select
                    value={editForm?.categoria_id || ''}
                    onValueChange={(value) => handleEditInputChange('categoria_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {editCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm?.status || 'rascunho'}
                    onValueChange={(value) => handleEditInputChange('status', value)}
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
                    {editTags.map((tag) => (
                      <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSelectedTags.includes(tag.id)}
                          onChange={() => handleEditTagToggle(tag.id)}
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
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={editForm?.descricao || ''}
                onChange={(e) => handleEditInputChange('descricao', e.target.value)}
                rows={4}
                placeholder="Descrição do vídeo..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editLoading} className="w-full">
                {editLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManager;
