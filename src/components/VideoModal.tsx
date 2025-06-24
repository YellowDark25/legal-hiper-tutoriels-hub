// VideoModal - Agora usando react-player para melhor suporte a diferentes formatos de mídia
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import VideoComments from './VideoComments';
import { X, Clock, Eye, Tag, Calendar, User, Share2, Bookmark, ThumbsUp, Maximize, Minimize, Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
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
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [pip, setPip] = useState(false);
  const { toast } = useToast();

  const playerRef = React.useRef<ReactPlayer>(null);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>();

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
        if (isPlayerFullscreen) {
          setIsPlayerFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isPlayerFullscreen, onClose]);

  if (!isOpen || !video) return null;

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

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMuted = () => {
    setMuted(!muted);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0] / 100);
  };

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(value[0] / 100);
    }
  };

  const handleProgress = (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    toast({
      title: "Vídeo finalizado!",
      description: "Esperamos que tenha gostado do tutorial.",
    });
  };

  const handleError = (error: string | MediaError) => {
    console.error('Erro no player:', error);
    toast({
      title: "Erro no vídeo",
      description: "Não foi possível carregar o vídeo. Verifique a URL.",
      variant: "destructive"
    });
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    toast({
      title: `Velocidade alterada`,
      description: `Reproduzindo a ${rate}x`,
    });
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleFullscreen = () => {
    setIsPlayerFullscreen(!isPlayerFullscreen);
    if (!isPlayerFullscreen) {
      toast({
        title: "Modo tela cheia ativado",
        description: "Pressione ESC para sair do modo tela cheia",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
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
      <div className={`bg-white dark:bg-gray-900 w-full transition-all duration-300 overflow-hidden ${
        isPlayerFullscreen 
          ? 'fixed inset-0 bg-black z-50 rounded-none' 
          : isFullscreen 
            ? 'max-w-[95vw] max-h-[95vh] rounded-2xl' 
            : 'max-w-7xl max-h-[90vh] rounded-2xl'
      }`}>
        {/* Header */}
        {!isPlayerFullscreen && (
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
                onClick={onClose}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
        
        <div className={`flex ${isPlayerFullscreen ? 'flex-col' : isFullscreen ? 'flex-col' : 'flex-col lg:flex-row'} ${isPlayerFullscreen ? 'h-screen' : 'max-h-[calc(90vh-100px)]'}`}>
          {/* Video Player Section */}
          <div className={`${isPlayerFullscreen ? 'w-full h-full' : isFullscreen ? 'w-full' : 'lg:w-2/3'} relative`}>
            <div 
              className={`relative bg-black overflow-hidden group ${
                isPlayerFullscreen 
                  ? 'w-full h-full rounded-none' 
                  : 'rounded-lg aspect-video'
              }`}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => playing && setShowControls(false)}
            >
              {video.url ? (
                <ReactPlayer
                  ref={playerRef}
                  url={video.url}
                  width="100%"
                  height="100%"
                  playing={playing}
                  volume={volume}
                  muted={muted}
                  playbackRate={playbackRate}
                  pip={pip}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onEnded={handleEnded}
                  onError={handleError}
                  onReady={() => {
                    console.log('Player pronto para reproduzir');
                    toast({
                      title: "Vídeo carregado!",
                      description: "O vídeo está pronto para reprodução.",
                    });
                  }}
                  config={{
                    youtube: {
                      playerVars: {
                        showinfo: 1,
                        controls: 0,
                        rel: 0,
                        modestbranding: 1,
                      }
                    },
                    vimeo: {
                      playerOptions: {
                        byline: false,
                        portrait: false,
                        title: false,
                      }
                    },
                    file: {
                      attributes: {
                        poster: video.miniatura,
                        preload: 'metadata',
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>URL do vídeo não disponível</p>
                    <p className="text-sm text-gray-400 mt-2">Verifique se o vídeo foi carregado corretamente</p>
                  </div>
                </div>
              )}

              {/* Custom Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Top Controls */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      {playbackRate}x
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPip(!pip)}
                      className="text-white hover:bg-white/20"
                      title="Picture in Picture"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Center Play Button */}
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white rounded-full p-6 transition-all duration-200 hover:scale-110"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <Slider
                        value={[played * 100]}
                        max={100}
                        step={0.01}
                        onValueChange={handleSeekChange}
                        onPointerDown={handleSeekMouseDown}
                        onValueCommit={handleSeekMouseUp}
                        className="w-full transition-all duration-200 group-hover:scale-y-125 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/90 font-mono">
                      <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        {formatTime(duration * played)}
                      </span>
                      <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
                      >
                        {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>

                      {/* Volume Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleMuted}
                          className="text-white hover:bg-white/20"
                        >
                          {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <div className="w-20">
                          <Slider
                            value={[muted ? 0 : volume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Playback Speed */}
                      <select
                        value={playbackRate}
                        onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                        className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-black/70"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
                        title="Tela cheia"
                      >
                        {isPlayerFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Info Section */}
            {showInfo && !isPlayerFullscreen && (
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
          {!isFullscreen && !isPlayerFullscreen && (
            <div className="lg:w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  💬 Comentários
                  <Badge variant="secondary" className="ml-auto">
                    Interativo
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Compartilhe suas dúvidas e experiências
                </p>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-2">
                <VideoComments videoId={video.id} />
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Controls */}
        {!isPlayerFullscreen && (
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
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  ReactPlayer Enhanced
                </Badge>
                <span>Pressione ESC para fechar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
