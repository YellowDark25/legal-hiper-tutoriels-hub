import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVideoProgress(userId?: string) {
  const lastUpdateRef = useRef<{ [key: string]: number }>({});
  const pendingUpdatesRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Marca vídeo como assistido
  const markAsWatched = useCallback(async (videoId: string, videoTitle?: string, videoCategoria?: string, watchDuration?: number) => {
    if (!userId) {
      console.warn('Usuário não identificado para marcar vídeo como assistido');
      return;
    }
    
    try {
      console.log('Marcando vídeo como assistido:', { videoId, videoTitle, userId });
      
      const { data, error } = await supabase.from('video_history').upsert({
      user_id: userId,
      video_id: videoId,
        video_titulo: videoTitle || 'Título não disponível',
        video_categoria: videoCategoria || null,
      watched_at: new Date().toISOString(),
        watch_duration: watchDuration || null,
        completed: true,
      }, { 
        onConflict: 'user_id,video_id',
        ignoreDuplicates: false 
      });
      
      if (error) {
        console.error('Erro no Supabase ao marcar como assistido:', error);
        throw error;
      }
      
      console.log('Vídeo marcado como assistido com sucesso:', data);
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('videoWatched', { 
        detail: { videoId, videoTitle, videoCategoria, userId } 
      }));
      
      // Também usar localStorage para persistir a informação
      const watchedVideos = JSON.parse(localStorage.getItem(`watchedVideos_${userId}`) || '[]');
      if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
        localStorage.setItem(`watchedVideos_${userId}`, JSON.stringify(watchedVideos));
      }
      
    } catch (error) {
      console.error('Erro ao marcar vídeo como assistido:', error);
      throw error; // Re-throw para o componente poder tratar
    }
  }, [userId]);

  // Consulta IDs dos vídeos assistidos pelo usuário
  const getWatchedVideos = useCallback(async () => {
    if (!userId) return [];
    try {
    const { data, error } = await supabase
        .from('video_history')
      .select('video_id')
      .eq('user_id', userId)
        .eq('completed', true);
      if (error) {
        console.error('Erro ao buscar vídeos assistidos:', error);
        return [];
      }
    return data.map((row: { video_id: string }) => row.video_id);
    } catch (error) {
      console.error('Erro ao buscar vídeos assistidos:', error);
      return [];
    }
  }, [userId]);

  // Consulta progresso de um módulo (array de videoIds)
  const getModuleProgress = useCallback(async (videoIds: string[]) => {
    if (!userId || !videoIds.length) return 0;
    try {
    const { data, error } = await supabase
        .from('video_history')
      .select('video_id')
      .eq('user_id', userId)
        .eq('completed', true)
      .in('video_id', videoIds);
      if (error) {
        console.error('Erro ao buscar progresso do módulo:', error);
        return 0;
      }
    return data.length;
    } catch (error) {
      console.error('Erro ao buscar progresso do módulo:', error);
      return 0;
    }
  }, [userId]);

  // Atualiza duração assistida com throttling para evitar muitas requisições
  const updateWatchDuration = useCallback(async (videoId: string, duration: number, videoTitle?: string) => {
    if (!userId) return;
    
    const key = `${userId}_${videoId}`;
    const now = Date.now();
    
    // Throttling: só atualiza a cada 10 segundos para o mesmo vídeo
    if (lastUpdateRef.current[key] && now - lastUpdateRef.current[key] < 10000) {
      return;
    }
    
    // Cancelar update pendente anterior se existir
    if (pendingUpdatesRef.current[key]) {
      clearTimeout(pendingUpdatesRef.current[key]);
    }
    
    // Debounce: aguardar 2 segundos antes de fazer a requisição
    pendingUpdatesRef.current[key] = setTimeout(async () => {
      try {
        lastUpdateRef.current[key] = now;
        
        await supabase.from('video_history').upsert({
          user_id: userId,
          video_id: videoId,
          video_titulo: videoTitle || 'Título não disponível',
          watched_at: new Date().toISOString(),
          watch_duration: duration,
          completed: false, // Ainda não completou
        }, { 
          onConflict: 'user_id,video_id',
          ignoreDuplicates: false 
        });
        
        delete pendingUpdatesRef.current[key];
      } catch (error) {
        console.error('Erro ao atualizar duração (throttled):', error);
        delete pendingUpdatesRef.current[key];
      }
    }, 2000);
    
  }, [userId]);

  return { markAsWatched, getWatchedVideos, getModuleProgress, updateWatchDuration };
} 