
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditIcon, TrashIcon, EyeIcon, SearchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSistema, setFilterSistema] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

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

  const deleteVideo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.filter(video => video.id !== id));
      toast({
        title: "Sucesso",
        description: "Vídeo excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o vídeo",
        variant: "destructive",
      });
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
                    src={video.miniatura || '/placeholder.svg'}
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
                      <Button variant="outline" size="sm">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteVideo(video.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
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
    </div>
  );
};

export default VideoManager;
