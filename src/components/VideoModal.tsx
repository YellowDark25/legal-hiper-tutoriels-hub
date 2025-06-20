import React, { useState, useEffect } from 'react';
import VideoComments from './VideoComments';
import VideoPlayer from './VideoPlayer';
import { X, Clock, Eye, Tag, Calendar, User, Share2, Bookmark, ThumbsUp, Maximize, Minimize } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  categoria: string | { id: string; nome: string; cor: string };
  duracao: string;
  visualizacoes?: number;
  created_at?: string;
  tags?: Array<{ id: string; nome: string }>;
}

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  // Debug: Verificar dados do vídeo
  console.log('VideoModal - Dados do vídeo:', {
    id: video.id,
    titulo: video.titulo,
    url: video.url,
    miniatura: video.miniatura
  });

  // Verificar se é um vídeo do YouTube
  const isYouTubeVideo = video.url && (
    video.url.includes('youtube.com') || 
    video.url.includes('youtu.be') ||
    video.url.includes('youtube.com/embed')
  );

  // Verificar se é um vídeo direto (mp4, webm, etc.)
  const isDirectVideo = video.url && (
    video.url.includes('.mp4') ||
    video.url.includes('.webm') ||
    video.url.includes('.ogg') ||
    video.url.includes('.mov') ||
    video.url.includes('.avi') ||
    !isYouTubeVideo
  );

  // Garante que categoria seja sempre string
  const categoria: string = typeof video.categoria === 'object' && video.categoria !== null && 'nome' in video.categoria
    ? video.categoria.nome
    : String(video.categoria);

  // Obter cor da categoria se disponível
  const categoriaCor: string = typeof video.categoria === 'object' && video.categoria !== null && 'cor' in video.categoria
    ? video.categoria.cor
    : '#3B82F6'; // Cor padrão (blue-500)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.titulo,
        text: video.descricao,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do vídeo foi copiado para a área de transferência.",
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Like removido" : "Vídeo curtido!",
      description: isLiked ? "Você removeu o like deste vídeo." : "Obrigado pelo feedback!",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removido dos salvos" : "Vídeo salvo!",
      description: isSaved ? "Vídeo removido da sua lista." : "Vídeo adicionado à sua lista de salvos.",
    });
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    // Função para lidar com atualizações de tempo do vídeo
    // Pode ser usado para salvar progresso, analytics, etc.
  };

  const handleVideoEnd = () => {
    // Função para lidar com o fim do vídeo
    // Pode ser usado para analytics, sugerir próximos vídeos, etc.
    toast({
      title: "Vídeo finalizado!",
      description: "Esperamos que tenha gostado do tutorial.",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl w-full transition-all duration-300 overflow-hidden ${
        isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-7xl max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">TUTORIAL</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {video.titulo}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className={`flex ${isFullscreen ? 'flex-col' : 'flex-col lg:flex-row'} max-h-[calc(90vh-100px)]`}>
          {/* Video Player Section */}
          <div className={`${isFullscreen ? 'w-full' : 'lg:w-2/3'} relative`}>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {video.url ? (
                isYouTubeVideo ? (
                  // Player para vídeos do YouTube
                  <iframe
                    src={video.url}
                    title={video.titulo}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      console.log('YouTube iframe carregado:', video.url);
                    }}
                  />
                ) : (
                  // Player para vídeos diretos
                  <video
                    controls
                    className="w-full h-full object-contain"
                    poster={video.miniatura}
                    onTimeUpdate={(e) => {
                      const target = e.target as HTMLVideoElement;
                      handleTimeUpdate(target.currentTime, target.duration);
                    }}
                    onEnded={handleVideoEnd}
                    onError={(e) => {
                      console.error('Erro no vídeo:', e);
                      toast({
                        title: "Erro no vídeo",
                        description: "Não foi possível carregar o vídeo. Verifique a URL.",
                        variant: "destructive"
                      });
                    }}
                    onLoadStart={() => {
                      console.log('Iniciando carregamento do vídeo:', video.url);
                    }}
                    onCanPlay={() => {
                      console.log('Vídeo pronto para reproduzir');
                    }}
                  >
                    <source src={video.url} type="video/mp4" />
                    <source src={video.url} type="video/webm" />
                    <source src={video.url} type="video/ogg" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>URL do vídeo não disponível</p>
                    <p className="text-sm text-gray-400 mt-2">Verifique se o vídeo foi carregado corretamente</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Info Section */}
            {showInfo && (
              <div className="p-6 space-y-6 overflow-y-auto max-h-96">
                {/* Title and Actions */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {video.titulo}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {video.visualizacoes && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.visualizacoes.toLocaleString()} visualizações</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Duração: {video.duracao}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {isLiked ? "Curtido" : "Curtir"}
                    </Button>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      onClick={handleSave}
                      className={isSaved ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      {isSaved ? "Salvo" : "Salvar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge 
                    style={{ backgroundColor: categoriaCor }}
                    className="text-white px-3 py-1 text-sm font-medium"
                  >
                    {categoria}
                  </Badge>
                  
                  {video.tags && video.tags.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sobre este tutorial
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {video.descricao || "Nenhuma descrição disponível para este tutorial."}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {video.visualizacoes?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Visualizações</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {video.duracao}
                    </div>
                    <div className="text-sm text-green-600/80 dark:text-green-400/80">Duração</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {categoria}
                    </div>
                    <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Categoria</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Comments Section */}
          {!isFullscreen && (
            <div className="lg:w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  💬 Comentários
                  <Badge variant="secondary" className="ml-auto">
                    Interativo
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Compartilhe suas dúvidas e experiências
                </p>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-300px)]">
                <VideoComments videoId={video.id} />
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Controls */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-gray-600 dark:text-gray-300"
              >
                {showInfo ? "Ocultar detalhes" : "Mostrar detalhes"}
              </Button>
              {isFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Sair do modo tela cheia
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Pressione ESC para fechar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
