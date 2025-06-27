// VideoModal - Agora usando react-player para melhor suporte a diferentes formatos de mídia
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import VideoComments from './VideoComments';
import { X, Clock, Eye, Tag, Calendar, User, Share2, Bookmark, ThumbsUp, Maximize, Minimize, Play, Pause, Volume2, VolumeX, Settings, MoreVertical, CheckCircle, Circle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useProgressStats } from '@/hooks/useProgressStats';
import { supabase } from '@/integrations/supabase/client';

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
  const [showMobileControls, setShowMobileControls] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { markAsWatched, updateWatchDuration } = useVideoProgress(user?.id);
  const [jaMarcado, setJaMarcado] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const { refetch: refetchProgress } = useProgressStats();
  const [assistidoManual, setAssistidoManual] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const playerRef = useRef<ReactPlayer>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-hide controls on mobile after 3 seconds
      if (isMobile) {
        const timeout = setTimeout(() => {
          setShowMobileControls(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

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

  useEffect(() => {
    setJaMarcado(false); // Reset ao abrir novo vídeo
    setIsToggling(false); // Reset estado de loading
  }, [video?.id, user?.id]);

  useEffect(() => {
    setToastShown(false); // Reset ao trocar de vídeo
  }, [video?.id]);

  useEffect(() => {
    async function fetchWatched() {
      if (user && video) {
        try {
          const { data, error } = await supabase
            .from('video_history')
            .select('id')
            .eq('user_id', user.id)
            .eq('video_id', video.id)
            .eq('completed', true)
            .maybeSingle(); // Usa maybeSingle() para evitar erro quando não encontra
          
          if (error) {
            console.error('Erro ao verificar vídeo assistido:', error);
            setAssistidoManual(false);
          } else {
            setAssistidoManual(!!data);
          }
        } catch (error) {
          console.error('Erro ao buscar status do vídeo:', error);
          setAssistidoManual(false);
        }
      } else {
        setAssistidoManual(false);
      }
    }
    fetchWatched();
  }, [user, video]);

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
      
      // Atualizar duração assistida periodicamente apenas a cada 10 segundos
      if (video && user && state.playedSeconds > 0 && Math.floor(state.playedSeconds) % 10 === 0) {
        const categoria = typeof video.categoria === 'object' ? video.categoria.nome : video.categoria;
        updateWatchDuration?.(video.id, Math.floor(state.playedSeconds), video.titulo);
      }
      
      // Comentado: Marcação automática removida - agora é manual via botão
      // if (video && user && !jaMarcado && state.played >= 0.85) { ... }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    
    // Apenas toast de finalização - marcação como assistido agora é manual
    toast({
      title: "Vídeo finalizado! 🎉",
      description: "Parabéns! Você concluiu este tutorial.",
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
    if (!isMobile) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  const handleTouchStart = () => {
    if (isMobile) {
      setShowMobileControls(!showMobileControls);
    }
  };

  const handleFullscreen = () => {
    setIsPlayerFullscreen(!isPlayerFullscreen);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleToggleAssistido = async () => {
    if (!user || !video || isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (assistidoManual) {
        // Desmarcar: remover do histórico
        const { error: deleteError } = await supabase
          .from('video_history')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', video.id);
          
        if (deleteError) {
          throw deleteError;
        }
        
        setAssistidoManual(false);
        setJaMarcado(false);
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('videoWatched', { 
          detail: { 
            videoId: video.id, 
            videoTitle: video.titulo, 
            videoCategoria: typeof video.categoria === 'object' ? video.categoria.nome : video.categoria,
            userId: user.id,
            action: 'unmarked'
          } 
        }));
        
        refetchProgress();
        toast({ title: 'Vídeo desmarcado', description: 'O vídeo foi removido dos assistidos.' });
      } else {
        // Marcar: primeiro verificar se já existe, depois inserir/atualizar
        const categoriaNome = typeof video.categoria === 'object' ? video.categoria.nome : video.categoria;
        
        // Verificar se já existe um registro
        const { data: existingRecord } = await supabase
          .from('video_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', video.id)
          .maybeSingle();
        
        let result;
        if (existingRecord) {
          // Atualizar registro existente
          result = await supabase
            .from('video_history')
            .update({
              video_titulo: video.titulo,
              video_categoria: categoriaNome,
              completed: true,
              watched_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('video_id', video.id);
        } else {
          // Inserir novo registro
          result = await supabase
            .from('video_history')
            .insert({
              user_id: user.id,
              video_id: video.id,
              video_titulo: video.titulo,
              video_categoria: categoriaNome,
              completed: true,
              watched_at: new Date().toISOString(),
            });
        }
        
        if (result.error) {
          throw result.error;
        }
        
        setAssistidoManual(true);
        setJaMarcado(true);
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('videoWatched', { 
          detail: { 
            videoId: video.id, 
            videoTitle: video.titulo, 
            videoCategoria: categoriaNome,
            userId: user.id,
            action: 'marked'
          } 
        }));
        
        refetchProgress();
        toast({ title: 'Vídeo marcado como assistido', description: 'Seu progresso foi salvo.' });
      }
    } catch (error) {
      console.error('Erro ao alterar status do vídeo:', error);
      
      // Reverter estado em caso de erro
      const { data: currentState } = await supabase
        .from('video_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', video.id)
        .eq('completed', true)
        .maybeSingle();
      
      setAssistidoManual(!!currentState);
      setJaMarcado(!!currentState);
      
              toast({ 
          title: 'Erro', 
          description: 'Não foi possível alterar o status do vídeo. Tente novamente.',
          variant: 'destructive'
        });
      } finally {
        setIsToggling(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/90 via-slate-900/90 to-black/95 animate-fade-in p-2 md:p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-gray-900 w-full transition-all duration-300 my-auto
        ${isPlayerFullscreen 
          ? 'fixed inset-0 bg-black z-50 rounded-none h-full overflow-hidden' 
          : isMobile
            ? 'max-w-[98vw] max-h-[96vh] rounded-xl overflow-y-auto'
            : isFullscreen 
              ? 'max-w-[95vw] max-h-[94vh] rounded-2xl overflow-y-auto' 
              : 'max-w-7xl max-h-[90vh] rounded-2xl overflow-y-auto'
        }`}>
        {/* Header */}
        {!isPlayerFullscreen && (
          <div className="flex justify-between items-center p-3 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">TUTORIAL</span>
              </div>
              {!isMobile && <Separator orientation="vertical" className="h-6" />}
              <h2 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white line-clamp-1 min-w-0">
                {video.titulo}
              </h2>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white touch-target-sm"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        )}
        
        <div className={`flex flex-col lg:flex-row gap-4 md:gap-8 py-4 md:py-8 items-center justify-center ${isPlayerFullscreen ? 'h-screen' : ''}`}>
          {/* Video Player Section */}
          <div className={`${isPlayerFullscreen ? 'w-full h-full' : isMobile ? 'w-full' : isFullscreen ? 'w-full' : 'lg:w-2/3'} flex justify-center items-center`}>
            <div 
              className={`relative bg-black overflow-hidden group shadow-2xl border border-gray-800 dark:border-gray-700 rounded-2xl w-full max-w-3xl aspect-video mx-auto`}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => !isMobile && playing && setShowControls(false)}
              onTouchStart={handleTouchStart}
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
                    if (!toastShown) {
                      toast({
                        title: "Vídeo carregado!",
                        description: "O vídeo está pronto para reprodução."
                      });
                      setToastShown(true);
                    }
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
                  <div className="text-center p-4">
                    <div className="text-xl md:text-2xl mb-2">⚠️</div>
                    <p className="text-sm md:text-base">URL do vídeo não disponível</p>
                    <p className="text-xs md:text-sm text-gray-400 mt-2">Verifique se o vídeo foi carregado corretamente</p>
                  </div>
                </div>
              )}

              {/* Custom Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
                (isMobile ? showMobileControls : showControls) ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Top Controls */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                      {playbackRate}x
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20 touch-target-sm"
                      title="Tela cheia"
                    >
                      {isPlayerFullscreen ? 
                        <Minimize className="w-3 h-3 md:w-4 md:h-4" /> : 
                        <Maximize className="w-3 h-3 md:w-4 md:h-4" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Center Play Button */}
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size={isMobile ? "default" : "lg"}
                      onClick={handlePlayPause}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white rounded-full p-3 md:p-6 transition-all duration-200 hover:scale-110 touch-target"
                    >
                      <Play className="w-5 h-5 md:w-8 md:h-8 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 space-y-2 md:space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1 md:space-y-2">
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
                      <span className="bg-black/40 px-1 md:px-2 py-1 rounded backdrop-blur-sm">
                        {formatTime(duration * played)}
                      </span>
                      <span className="bg-black/40 px-1 md:px-2 py-1 rounded backdrop-blur-sm">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 touch-target-sm"
                      >
                        {playing ? <Pause className="w-4 h-4 md:w-6 md:h-6" /> : <Play className="w-4 h-4 md:w-6 md:h-6" />}
                      </Button>

                      {/* Volume Controls - Hidden on mobile */}
                      {!isMobile && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMuted}
                            className="text-white hover:bg-white/20 touch-target-sm"
                          >
                            {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                          
                          <div className="w-20">
                            <Slider
                              value={[muted ? 0 : volume * 100]}
                              max={100}
                              step={1}
                              onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 md:space-x-2">
                      {/* Playback Rate */}
                      <select
                        value={playbackRate}
                        onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                        className="bg-black/40 text-white text-xs md:text-sm px-1 md:px-2 py-1 rounded backdrop-blur-sm border-none outline-none cursor-pointer touch-target-sm"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info and Comments Section */}
          {!isPlayerFullscreen && (
            <div className={`${isMobile ? 'w-full' : 'lg:w-1/3'} ${isMobile ? '' : 'border-l'} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col max-h-[70vh]`}>
              <div className="p-3 md:p-6 flex-1 overflow-y-auto">
                {/* Video Info */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {video.titulo}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{video.visualizacoes || 0} visualizações</span>
                        </div>
                        {video.duracao && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{video.duracao}</span>
                          </div>
                        )}
                        {video.created_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{formatDate(video.created_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-medium"
                          style={{ 
                            backgroundColor: `${categoriaCor}20`,
                            color: categoriaCor,
                            borderColor: `${categoriaCor}40`
                          }}
                        >
                          {categoria}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleAssistido}
                          disabled={isToggling}
                          className={`touch-target-sm ${assistidoManual ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'} ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isToggling ? 'Processando...' : assistidoManual ? 'Marcar como não assistido' : 'Marcar como assistido'}
                        >
                          {isToggling ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : assistidoManual ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`touch-target-sm ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        className={`touch-target-sm ${isSaved ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="text-gray-600 dark:text-gray-400 touch-target-sm"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-3 md:mt-4">
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {video.descricao || 'Sem descrição disponível'}
                    </p>
                  </div>

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-3 md:mt-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {video.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4 md:my-6" />

                {/* Comments Section */}
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                    Comentários
                  </h4>
                  <VideoComments videoId={video.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
