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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  thumbnail_path?: string;
  duracao: string;
  sistema: string;
  status: string;
  visualizacoes: number;
  categoria: { nome: string; cor: string } | null;
  categoria_id?: string;
  created_at: string;
}

interface Category {
  id: string;
  nome: string;
  cor: string;
}

interface Tag {
  id: string;
  nome: string;
}

interface EditForm {
  titulo: string;
  descricao: string;
  categoria_id: string;
  duracao: string;
  sistema: string;
  status: string;
}

interface VideoTag {
  tag_id: string;
}

// Função utilitária para obter a URL pública da miniatura
function getThumbnailUrl(video: Video): string {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [videoToDeleteId, setVideoToDeleteId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [editTags, setEditTags] = useState<Tag[]>([]);
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

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSistema, filterStatus]);

  // Função para abrir modal de edição
  const openEditDialog = async (video: Video) => {
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
    setEditSelectedTags((videoTags || []).map((vt: VideoTag) => vt.tag_id));
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev: EditForm | null) => prev ? { ...prev, [field]: value } : null);
  };
  const handleEditTagToggle = (tagId: string) => {
    setEditSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Função para limpar tags órfãs de um vídeo
  const cleanOrphanVideoTags = async (videoId: string) => {
    try {
      // Verificar se há tags duplicadas ou órfãs para este vídeo
      const { data: existingTags, error: checkError } = await supabase
        .from('video_tags')
        .select('id, video_id, tag_id')
        .eq('video_id', videoId);
      
      if (checkError) {
        console.error('Erro ao verificar tags existentes:', checkError);
        return;
      }

      if (existingTags && existingTags.length > 0) {
        console.log(`Removendo ${existingTags.length} tags existentes para vídeo ${videoId}`);
        
        // Remover todas as tags existentes para evitar duplicatas
        const { error: cleanError } = await supabase
          .from('video_tags')
          .delete()
          .eq('video_id', videoId);
        
        if (cleanError) {
          console.error('Erro ao limpar tags órfãs:', cleanError);
        }
      }
    } catch (error) {
      console.error('Erro durante limpeza de tags órfãs:', error);
    }
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
      // Atualizar tags de forma mais robusta
      try {
        // Usar a função de limpeza para garantir que não há tags órfãs
        await cleanOrphanVideoTags(videoToEdit.id);
        
        // Aguardar um momento para garantir que a exclusão foi processada
        await new Promise(resolve => setTimeout(resolve, 200));

        // Inserir as novas tags (apenas se houver tags selecionadas)
        if (editSelectedTags.length > 0) {
          // Remover duplicatas, caso existam
          const uniqueTags = [...new Set(editSelectedTags)];
          
          const videoTagsData = uniqueTags.map((tagId) => ({
            video_id: videoToEdit.id,
            tag_id: tagId,
          }));
          
          const { error: tagsError } = await supabase
            .from('video_tags')
            .insert(videoTagsData);
          
                     if (tagsError) {
             console.error('Erro ao inserir novas tags:', tagsError);
             // Verificar se é erro de chave duplicada
             if (tagsError.message && tagsError.message.includes('duplicate key value violates unique constraint')) {
               // Tentar limpar tags órfãs novamente e inserir
               console.log('Detectado erro de chave duplicada, tentando limpeza adicional...');
               await cleanOrphanVideoTags(videoToEdit.id);
               await new Promise(resolve => setTimeout(resolve, 300));
               
               // Tentar inserir novamente
               const { error: retryError } = await supabase
                 .from('video_tags')
                 .insert(videoTagsData);
               
               if (retryError) {
                 throw new Error(`Erro persistente ao adicionar tags: ${retryError.message}`);
               }
             } else {
               throw new Error(`Erro ao adicionar tags: ${tagsError.message}`);
             }
           }
        }
      } catch (tagError) {
        console.error('Erro durante atualização de tags:', tagError);
        throw tagError;
      }
      // Atualizar lista local
      fetchVideos();
      toast({ title: 'Sucesso', description: 'Vídeo atualizado com sucesso' });
      setIsEditDialogOpen(false);
      setVideoToEdit(null);
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o vídeo',
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
      {/* Filtros */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-white font-medium">Buscar vídeos</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Digite o título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sistema" className="text-white font-medium">Sistema</Label>
              <Select value={filterSistema} onValueChange={setFilterSistema}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">Todos os sistemas</SelectItem>
                  <SelectItem value="pdvlegal" className="text-white hover:bg-gray-700">PDV Legal</SelectItem>
                  <SelectItem value="hiper" className="text-white hover:bg-gray-700">Hiper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-white font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">Todos os status</SelectItem>
                  <SelectItem value="ativo" className="text-white hover:bg-gray-700">Ativo</SelectItem>
                  <SelectItem value="inativo" className="text-white hover:bg-gray-700">Inativo</SelectItem>
                  <SelectItem value="rascunho" className="text-white hover:bg-gray-700">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da paginação */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span>
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVideos.length)} de {filteredVideos.length} vídeo{filteredVideos.length !== 1 ? 's' : ''}
            </span>
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de vídeos */}
      <div className="space-y-4">
        {paginatedVideos.map((video) => (
          <Card key={video.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-l-4 hover:border-l-orange-400 hover:bg-white/10 transition-all duration-200">
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
                    <h3 className="font-semibold text-lg text-white">{video.titulo}</h3>
                    <div className="flex gap-2">
                      <Badge variant={video.status === 'ativo' ? 'default' : 'secondary'} className="border-orange-400 text-orange-400">
                        {video.status}
                      </Badge>
                      <Badge variant="outline" className="border-orange-400 text-orange-400">
                        {video.sistema === 'pdvlegal' ? 'PDV Legal' : 'Hiper'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {video.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
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
                        className="border-gray-600 text-white hover:bg-white/10 hover:border-orange-400"
                      >
                        {video.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(video)}
                        className="border-gray-600 text-white hover:bg-white/10 hover:border-orange-400"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(video.id)}
                            className="border-gray-600 text-white hover:bg-red-500/20 hover:border-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-600">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Tem certeza que deseja excluir este vídeo?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Essa ação não pode ser desfeita. Isso excluirá permanentemente o vídeo e seus dados relacionados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDeleteVideo}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
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
        <div className="text-center py-8 text-gray-300">
          Nenhum vídeo encontrado
        </div>
      )}

      {/* Componente de Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={`${currentPage === 1 
                    ? 'pointer-events-none opacity-50 bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-orange-400'
                  }`}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Mostrar apenas páginas próximas à atual
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className={currentPage === page 
                          ? 'bg-orange-500 border-orange-500 text-white' 
                          : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-orange-400'
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 3 || 
                  page === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis className="text-gray-400" />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={`${currentPage === totalPages 
                    ? 'pointer-events-none opacity-50 bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-orange-400'
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Vídeo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-titulo" className="text-white">Título *</Label>
                  <Input
                    id="edit-titulo"
                    value={editForm?.titulo || ''}
                    onChange={(e) => handleEditInputChange('titulo', e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-thumbnail-file" className="text-white">Miniatura (Opcional)</Label>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <Input
                      id="edit-thumbnail-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setEditThumbnailFile(e.target.files?.[0] || null)}
                      className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-gray-500"
                    />
                  </div>
                  {editThumbnailFile && (
                    <p className="text-sm text-gray-400 mt-1">Arquivo selecionado: {editThumbnailFile.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-duracao" className="text-white">Duração</Label>
                  <Input
                    id="edit-duracao"
                    value={editForm?.duracao || ''}
                    onChange={(e) => handleEditInputChange('duracao', e.target.value)}
                    placeholder="Ex: 5:30"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-sistema" className="text-white">Sistema *</Label>
                  <Select
                    value={editForm?.sistema || ''}
                    onValueChange={(value) => handleEditInputChange('sistema', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400">
                      <SelectValue placeholder="Selecione o sistema" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="pdvlegal" className="text-white hover:bg-gray-700">PDV Legal</SelectItem>
                      <SelectItem value="hiper" className="text-white hover:bg-gray-700">Hiper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-categoria" className="text-white">Categoria</Label>
                  <Select
                    value={editForm?.categoria_id || ''}
                    onValueChange={(value) => handleEditInputChange('categoria_id', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {editCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status" className="text-white">Status</Label>
                  <Select
                    value={editForm?.status || 'rascunho'}
                    onValueChange={(value) => handleEditInputChange('status', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400">
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
                  <Label className="text-white">Tags</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto bg-gray-700 p-3 rounded border border-gray-600">
                    {editTags.map((tag) => (
                      <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSelectedTags.includes(tag.id)}
                          onChange={() => handleEditTagToggle(tag.id)}
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
              <Label htmlFor="edit-descricao" className="text-white">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={editForm?.descricao || ''}
                onChange={(e) => handleEditInputChange('descricao', e.target.value)}
                rows={4}
                placeholder="Descrição do vídeo..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={editLoading} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
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
