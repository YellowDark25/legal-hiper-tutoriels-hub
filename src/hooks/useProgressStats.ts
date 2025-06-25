import { useState, useEffect, useCallback, useRef } from 'react';
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
  geral: {
  totalVideos: number;
    videosAssistidos: number;
    videosRestantes: number;
    percentualCompleto: number;
  };
  categorias: Array<{
    nome: string;
    total: number;
    assistidos: number;
    percentual: number;
  }>;
  modulos: Array<{
    nome: string;
    total: number;
    assistidos: number;
    percentual: number;
  }>;
  atividadeRecente: number;
  ultimosAssistidos: Array<{
    videoId: string;
    watchedAt: string;
    titulo: string;
  }>;
}

export function useProgressStats() {
  const { user, userSystem } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchProgressStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user || !userSystem) return;

      console.log('Carregando estatísticas de progresso para:', { userId: user.id, sistema: userSystem });

      // Buscar todos os vídeos do sistema do usuário
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, titulo, sistema, categoria:categorias(nome), video_tags!inner(tag:tags(nome))')
        .eq('sistema', userSystem)
        .eq('status', 'ativo');
      if (videosError) throw videosError;

      // Buscar progresso do usuário
      const { data: progressoData, error: progressoError } = await supabase
        .from('video_history')
        .select('video_id, watched_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('watched_at', { ascending: false });
      if (progressoError) throw progressoError;

      const totalVideos = videosData?.length || 0;
      const videosAssistidos = progressoData?.length || 0;
      const percentualGeral = totalVideos > 0 ? Math.round((videosAssistidos / totalVideos) * 100) : 0;

      // Progresso por categoria
      const categorias = videosData?.reduce((acc: any, video: any) => {
        const categoriaNome = video.categoria?.nome || 'Sem categoria';
        if (!acc[categoriaNome]) {
          acc[categoriaNome] = { total: 0, assistidos: 0 };
        }
        acc[categoriaNome].total++;
        
        if (progressoData?.some(p => p.video_id === video.id)) {
          acc[categoriaNome].assistidos++;
        }
        
        return acc;
      }, {}) || {};

      // Progresso por módulo/tag
      const modulos = videosData?.reduce((acc: any, video: any) => {
        video.video_tags?.forEach((vt: any) => {
          const tagNome = vt.tag?.nome || 'Sem tag';
          if (!acc[tagNome]) {
            acc[tagNome] = { total: 0, assistidos: 0 };
          }
          acc[tagNome].total++;
          
          if (progressoData?.some(p => p.video_id === video.id)) {
            acc[tagNome].assistidos++;
          }
        });
        return acc;
      }, {}) || {};

      // Atividade recente (últimos 7 dias)
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const atividadeRecente = progressoData?.filter(p => 
        new Date(p.watched_at) >= seteDiasAtras
      ).length || 0;

      const stats = {
        geral: {
        totalVideos,
          videosAssistidos,
          videosRestantes: totalVideos - videosAssistidos,
          percentualCompleto: percentualGeral,
        },
        categorias: Object.entries(categorias).map(([nome, dados]: [string, any]) => ({
          nome,
          total: dados.total,
          assistidos: dados.assistidos,
          percentual: dados.total > 0 ? Math.round((dados.assistidos / dados.total) * 100) : 0,
        })),
        modulos: Object.entries(modulos).map(([nome, dados]: [string, any]) => ({
          nome,
          total: dados.total,
          assistidos: dados.assistidos,
          percentual: dados.total > 0 ? Math.round((dados.assistidos / dados.total) * 100) : 0,
        })),
        atividadeRecente,
        ultimosAssistidos: progressoData?.slice(0, 5).map(p => ({
          videoId: p.video_id,
          watchedAt: p.watched_at,
          titulo: videosData?.find(v => v.id === p.video_id)?.titulo || 'Vídeo não encontrado'
        })) || []
      };

      console.log('Estatísticas calculadas:', stats);
      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [user, userSystem]);

  // Throttle da função de refetch para evitar calls excessivos
  const refetch = useCallback(() => {
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 2000) {
      // Evita refetch se foi feito há menos de 2 segundos
      return;
    }
    lastFetchRef.current = now;
    fetchProgressStats();
  }, [fetchProgressStats]);

  useEffect(() => {
    if (user && userSystem) {
      fetchProgressStats();
    }
  }, [fetchProgressStats]);

  return { stats, loading, error, refetch };
} 