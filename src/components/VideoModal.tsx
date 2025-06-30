// VideoModal - Versão moderna e dinâmica com React Player customizado
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import VideoComments from './VideoComments';
import { X, Clock, Eye, Tag, Calendar, User, Share2, Bookmark, ThumbsUp, Maximize, Minimize, Play, Pause, Volume2, VolumeX, Settings, MoreVertical, CheckCircle, Circle, SkipBack, SkipForward, Layers, Zap } from 'lucide-react';
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
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
    setJaMarcado(false);
    setIsToggling(false);
  }, [video?.id, user?.id]);

  useEffect(() => {
    setToastShown(false);
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
            .maybeSingle();
          
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
    : '#3B82F6';

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
        title: "Link copiado! ✨",
        description: "O link do vídeo foi copiado para a área de transferência.",
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Like removido 💔" : "Vídeo curtido! ❤️",
      description: isLiked ? "Você removeu o like deste vídeo." : "Obrigado pelo feedback!",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removido dos salvos 📤" : "Vídeo salvo! 💾",
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

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime / duration);
    }
  };

  const handleProgress = (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      
      if (video && user && state.playedSeconds > 0 && Math.floor(state.playedSeconds) % 10 === 0) {
        const categoria = typeof video.categoria === 'object' ? video.categoria.nome : video.categoria;
        updateWatchDuration?.(video.id, Math.floor(state.playedSeconds), video.titulo);
      }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    
    toast({
      title: "Vídeo finalizado! 🎉",
      description: "Parabéns! Você concluiu este tutorial.",
    });
  };

  const handleError = (error: string | MediaError) => {
    console.error('Erro no player:', error);
    toast({
      title: "Erro no vídeo ⚠️",
      description: "Não foi possível carregar o vídeo. Verifique a URL.",
      variant: "destructive"
    });
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    toast({
      title: `Velocidade alterada ⚡`,
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
        toast({ title: 'Vídeo desmarcado ❌', description: 'O vídeo foi removido dos assistidos.' });
      } else {
        const categoriaNome = typeof video.categoria === 'object' ? video.categoria.nome : video.categoria;
        
        const { data: existingRecord } = await supabase
          .from('video_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', video.id)
          .maybeSingle();
        
        let result;
        if (existingRecord) {
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
        toast({ title: 'Vídeo marcado como assistido ✅', description: 'Seu progresso foi salvo.' });
      }
    } catch (error) {
      console.error('Erro ao alterar status do vídeo:', error);
      
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
        title: 'Erro ⚠️', 
        description: 'Não foi possível alterar o status do vídeo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsToggling(false);
    }
  };

      return (
      <div className={`fixed inset-0 bg-gradient-to-br from-slate-950/98 via-gray-900/98 to-slate-900/98 backdrop-blur-lg animate-fade-in overflow-hidden ${
        isPlayerFullscreen ? 'z-50' : 'z-40'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-600/8 to-gray-800/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-gray-800/8 to-slate-700/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-slate-800/5 to-gray-900/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Content Container */}
        <div className={`absolute inset-0 flex items-center justify-center overflow-y-auto ${
          isPlayerFullscreen ? 'p-0' : 'p-0.5 sm:p-2 md:p-4 pt-16'
        }`}>
          <div className={`relative shadow-2xl w-full transition-all duration-500 ease-out my-auto
            ${isPlayerFullscreen 
              ? 'fixed inset-0 bg-black/95 z-50 rounded-none h-[100vh] w-[100vw] max-w-none max-h-none overflow-hidden' 
              : 'bg-gray-900/40 backdrop-blur-xl border border-gray-700/30'
            } ${!isPlayerFullscreen && (isMobile
                ? 'max-w-[100vw] max-h-[92vh] rounded-lg overflow-y-auto'
                : isFullscreen 
                  ? 'max-w-[95vw] max-h-[85vh] rounded-3xl overflow-y-auto' 
                  : 'max-w-7xl max-h-[82vh] rounded-3xl overflow-y-auto')
            }`}>
        
        {/* Header modernizado */}
        {!isPlayerFullscreen && (
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700/40 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-xs md:text-sm font-semibold text-green-400 tracking-wider">TUTORIAL</span>
              </div>
              {!isMobile && <Separator orientation="vertical" className="h-6 bg-white/20" />}
              <h2 className="text-sm md:text-xl font-bold text-white line-clamp-1 min-w-0 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {video.titulo}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 rounded-xl touch-target-sm"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        )}
        
        <div className={`flex flex-col lg:flex-row gap-4 md:gap-8 py-4 md:py-8 items-center justify-center ${isPlayerFullscreen ? 'h-screen' : ''}`}>
          {/* Video Player Section - Modernizado */}
          <div className={`${isPlayerFullscreen ? 'w-full h-full' : isMobile ? 'w-full' : isFullscreen ? 'w-full' : 'lg:w-2/3'} flex justify-center items-center`}>
            <div 
              className={`relative bg-gradient-to-br from-gray-900 to-black overflow-hidden group shadow-2xl border-2 border-white/20 rounded-3xl w-full max-w-4xl aspect-video mx-auto transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl`}
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
                  onBuffer={() => setIsBuffering(true)}
                  onBufferEnd={() => setIsBuffering(false)}
                  onReady={() => {
                    if (!toastShown) {
                      toast({
                        title: "Vídeo carregado! 🎬",
                        description: "O vídeo está pronto para reprodução em alta qualidade."
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
                        hd: 1,
                        quality: 'hd720'
                      }
                    },
                    vimeo: {
                      playerOptions: {
                        byline: false,
                        portrait: false,
                        title: false,
                        quality: 'auto'
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
                <div className="flex items-center justify-center h-full text-white bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-4 animate-bounce">⚠️</div>
                    <p className="text-lg font-semibold mb-2">URL do vídeo não disponível</p>
                    <p className="text-sm text-gray-400">Verifique se o vídeo foi carregado corretamente</p>
                  </div>
                </div>
              )}

              {/* Loading Buffer Indicator */}
              {isBuffering && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-sm font-medium">Carregando...</span>
                </div>
              )}

              {/* Top Controls Always Visible - Botão Fullscreen */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold border-0 shadow-lg">
                    {playbackRate}x
                  </Badge>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold border-0 shadow-lg">
                    HD
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl touch-target-sm transition-all duration-200 hover:scale-110"
                    title="Tela cheia"
                  >
                    {isPlayerFullscreen ? 
                      <Minimize className="w-4 h-4" /> : 
                      <Maximize className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>

              {/* Custom Controls Overlay - Modernizado */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-all duration-300 ${
                (isMobile ? showMobileControls : showControls) ? 'opacity-100' : 'opacity-0'
              }`}>

                {/* Center Play Button - Modernizado */}
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size={isMobile ? "sm" : "default"}
                      onClick={handlePlayPause}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 backdrop-blur-sm border-2 border-white/30 text-white rounded-full p-2 sm:p-4 md:p-8 transition-all duration-300 hover:scale-110 shadow-2xl touch-target group"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10 ml-1 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                  </div>
                )}

                {/* Bottom Controls - Modernizado */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 space-y-3 md:space-y-4">
                  {/* Progress Bar - Modernizado */}
                  <div className="space-y-2">
                    <div className="relative group">
                      <Slider
                        value={[played * 100]}
                        max={100}
                        step={0.01}
                        onValueChange={handleSeekChange}
                        onPointerDown={handleSeekMouseDown}
                        onValueCommit={handleSeekMouseUp}
                        className="w-full transition-all duration-200 group-hover:scale-y-150 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/90 font-mono">
                      <span className="bg-gradient-to-r from-black/60 to-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                        {formatTime(duration * played)}
                      </span>
                      <span className="bg-gradient-to-r from-black/60 to-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Control Buttons - Modernizado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSkip(-10)}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 touch-target-sm rounded-xl"
                        title="Voltar 10s"
                      >
                        <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 touch-target-sm rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm"
                      >
                        {playing ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSkip(10)}
                        className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 touch-target-sm rounded-xl"
                        title="Avançar 10s"
                      >
                        <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>

                      {/* Volume Controls - Modernizado */}
                      {!isMobile && (
                        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMuted}
                            className="text-white hover:bg-white/20 touch-target-sm rounded-lg"
                          >
                            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

                    <div className="flex items-center space-x-2">
                      {/* Playback Rate - Modernizado */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 touch-target-sm"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          {playbackRate}x
                        </Button>
                        
                        {showSpeedMenu && (
                          <div className="absolute bottom-full mb-2 right-0 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handlePlaybackRateChange(rate)}
                                className={`block w-full px-4 py-2 text-white text-sm hover:bg-white/20 transition-colors ${
                                  rate === playbackRate ? 'bg-orange-500/30' : ''
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info and Comments Section - Modernizado */}
          {!isPlayerFullscreen && (
            <div className={`${isMobile ? 'w-full' : 'lg:w-1/3'} ${isMobile ? '' : 'border-l'} border-gray-700/40 bg-gradient-to-b from-gray-800/30 to-gray-900/40 backdrop-blur-sm flex flex-col max-h-[70vh] rounded-xl sm:rounded-2xl`}>
              <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto">
                {/* Video Info - Modernizado */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 sm:gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {video.titulo}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-sm rounded-xl px-3 py-1 border border-gray-600/30">
                          <Eye className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                          <span>{video.visualizacoes || 0} views</span>
                        </div>
                        {video.duracao && (
                          <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-sm rounded-xl px-3 py-1 border border-gray-600/30">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                            <span>{video.duracao}</span>
                          </div>
                        )}
                        {video.created_at && (
                                                     <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-sm rounded-xl px-3 py-1 border border-gray-600/30">
                             <Calendar className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                             <span>{formatDate(video.created_at)}</span>
                           </div>
                        )}
                      </div>

                      {/* Category - Modernizado */}
                      <div className="mb-4">
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-semibold border-0 shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${categoriaCor}40, ${categoriaCor}60)`,
                            color: 'white',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          {categoria}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons - Modernizado */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user && (
                                              <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleAssistido}
                        disabled={isToggling}
                        className={`touch-target-sm rounded-xl transition-all duration-200 hover:scale-110 ${
                          assistidoManual 
                            ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' 
                            : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10'
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        className={`touch-target-sm rounded-xl transition-all duration-200 hover:scale-110 ${
                          isLiked 
                            ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' 
                            : 'text-gray-500 hover:text-orange-400 hover:bg-gray-700/30'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        className={`touch-target-sm rounded-xl transition-all duration-200 hover:scale-110 ${
                          isSaved 
                            ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' 
                            : 'text-gray-500 hover:text-orange-400 hover:bg-gray-700/30'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      
                                             <Button
                         variant="ghost"
                         size="sm"
                         onClick={handleShare}
                         className="text-gray-500 hover:text-orange-400 hover:bg-gray-700/30 touch-target-sm rounded-xl transition-all duration-200 hover:scale-110"
                       >
                         <Share2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  {/* Description - Modernizado */}
                  <div className="mt-4">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        {video.descricao || 'Sem descrição disponível'}
                      </p>
                    </div>
                  </div>

                  {/* Tags - Modernizado */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs bg-gray-800/40 backdrop-blur-sm border-gray-600/40 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6 bg-gray-700/40" />

                {/* Comments Section - Modernizado */}
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-semibold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    💬 Comentários
                  </h4>
                  <VideoComments videoId={video.id} />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
