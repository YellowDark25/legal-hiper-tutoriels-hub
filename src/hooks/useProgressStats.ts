import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleStats {
  moduleName: string;
  totalVideos: number;
  completedVideos: number;
  percentage: number;
  lastWatched?: {
    videoTitle: string;
    watchedAt: string;
  };
}

interface ProgressStats {
  totalVideos: number;
  completedVideos: number;
  overallPercentage: number;
  moduleStats: ModuleStats[];
  recentActivity: {
    videoTitle: string;
    watchedAt: string;
  }[];
}

export const useProgressStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProgressStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProgressStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Buscar todos os vídeos do sistema do usuário com tags e categorias
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          titulo,
          sistema,
          categoria:categorias(nome),
          video_tags!inner(
            tag:tags(nome)
          )
        `)
        .eq('sistema', user.user_metadata?.sistema || 'hiper')
        .eq('status', 'ativo');

      if (videosError) throw videosError;

      // Buscar histórico de vídeos assistidos pelo usuário
      const { data: historyData, error: historyError } = await supabase
        .from('video_history')
        .select(`
          video_id,
          completed,
          updated_at,
          videos(titulo)
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('updated_at', { ascending: false });

      if (historyError) throw historyError;

      const watchedVideoIds = historyData?.map(h => h.video_id) || [];

      // Organizar estatísticas por módulos (apenas para Hiper)
      let moduleStats: ModuleStats[] = [];
      
      if (user.user_metadata?.sistema === 'hiper') {
        const modules = [
          { name: 'Hiper Gestão', tagName: 'Hiper Gestão' },
          { name: 'Hiper Loja', tagName: 'Hiper Loja' },
          { name: 'Hiper Caixa', tagName: 'Hiper Caixa' }
        ];

        moduleStats = modules.map(module => {
          const moduleVideos = videosData?.filter(video => 
            video.video_tags.some((vt: any) => vt.tag.nome === module.tagName)
          ) || [];

          const completedVideos = moduleVideos.filter(video => 
            watchedVideoIds.includes(video.id)
          );

          // Último vídeo assistido do módulo
          const lastWatchedHistory = historyData?.find(h => 
            moduleVideos.some(v => v.id === h.video_id)
          );

          return {
            moduleName: module.name,
            totalVideos: moduleVideos.length,
            completedVideos: completedVideos.length,
            percentage: moduleVideos.length > 0 ? (completedVideos.length / moduleVideos.length) * 100 : 0,
            lastWatched: lastWatchedHistory ? {
              videoTitle: (lastWatchedHistory as any).videos?.titulo || 'Vídeo não encontrado',
              watchedAt: lastWatchedHistory.updated_at
            } : undefined
          };
        });
      }

      // Atividade recente (últimos 5 vídeos)
      const recentActivity = historyData?.slice(0, 5).map(h => ({
        videoTitle: (h as any).videos?.titulo || 'Vídeo não encontrado',
        watchedAt: h.updated_at
      })) || [];

      const totalVideos = videosData?.length || 0;
      const completedVideos = watchedVideoIds.length;

      setStats({
        totalVideos,
        completedVideos,
        overallPercentage: totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0,
        moduleStats,
        recentActivity
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de progresso:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchProgressStats
  };
}; 