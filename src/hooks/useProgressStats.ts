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
    categorias: Array<{
      nome: string;
      total: number;
      assistidos: number;
      percentual: number;
    }>;
  }>;
  atividadeRecente: number;
  ultimosAssistidos: Array<{
    titulo: string;
    watchedAt: string;
  }>;
}

export function useProgressStats(targetUserId?: string) {
  const { user, userSystem, isAdmin } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    // Determinar qual userId usar
    const userId = targetUserId || user?.id;
    
    if (!userId) {
      console.warn('🚫 [useProgressStats] Nenhum usuário identificado para carregar estatísticas');
      setStats(null);
      setLoading(false);
      return;
    }

    // Se não é admin e está tentando ver stats de outro usuário, bloquear
    if (!isAdmin && targetUserId && targetUserId !== user?.id) {
      console.warn('🚫 [useProgressStats] Usuário não autorizado para ver stats de outros usuários');
      setError('Não autorizado');
      setLoading(false);
      return;
    }

    // Abortar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useProgressStats] Iniciando carregamento de estatísticas...');
      console.log('🔍 [useProgressStats] - userId:', userId);
      console.log('🔍 [useProgressStats] - targetUserId:', targetUserId);
      console.log('🔍 [useProgressStats] - user?.id:', user?.id);
      console.log('🔍 [useProgressStats] - isAdmin:', isAdmin);
      console.log('🔍 [useProgressStats] - userSystem:', userSystem);

      // Buscar sistema do usuário se estamos filtrando por outro usuário
      let sistema = userSystem;

      // Para admins, se não há targetUserId, exibir todos os sistemas
      if (isAdmin && !targetUserId) {
        sistema = null; // Permitir todos os sistemas
      } else if (targetUserId && targetUserId !== user?.id) {
        // Se o targetUserId é um UUID, buscar o sistema na tabela cadastro_empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from('cadastro_empresa')
          .select('sistema')
          .eq('id', targetUserId)
          .single();
          
        if (!empresaError && empresaData) {
          sistema = empresaData.sistema;
          console.log('🔍 [useProgressStats] Sistema encontrado para cliente:', sistema);
        } else {
          console.log('❌ [useProgressStats] Erro ao buscar empresa ou empresa não encontrada:', empresaError?.message);
        }
      }

      // 1. Buscar total de vídeos disponíveis
      let videosQuery = supabase
        .from('videos')
        .select(`
          id, 
          titulo, 
          categoria_id,
          categorias!categoria_id(nome, cor),
          sistema,
          video_tags:video_tags(tag:tags(nome))
        `)
        .eq('status', 'ativo');

      // Se há um sistema específico, filtrar por ele
      if (sistema) {
        videosQuery = videosQuery.eq('sistema', sistema);
      }

      const { data: videosData, error: videosError } = await videosQuery;

      if (videosError) {
        throw new Error(`Erro ao buscar vídeos: ${videosError.message}`);
      }

      // 2. Buscar vídeos assistidos pelo usuário
      const historyQuery = supabase
        .from('video_history')
        .select('video_id, video_titulo, watched_at, completed')
        .eq('completed', true)
        .eq('user_id', userId);

      const { data: historyData, error: historyError } = await historyQuery;

      if (historyError) {
        throw new Error(`Erro ao buscar histórico: ${historyError.message}`);
      }

      // Definir tags de módulo baseado no sistema
      let moduloTags: string[] = [];
      if (sistema === 'hiper') {
        moduloTags = ['Hiper Caixa', 'Hiper Loja', 'Hiper Gestão'];
      } else if (sistema === 'pdvlegal') {
        moduloTags = ['PDV', 'Retaguarda', 'Totem', 'Invoicy'];
      } else {
        // Se não há sistema específico ou é admin vendo todos
        moduloTags = ['Hiper Caixa', 'Hiper Loja', 'Hiper Gestão', 'PDV', 'Retaguarda', 'Totem', 'Invoicy'];
      }

      // Usar todos os vídeos se não há tags de módulo ou se queremos incluir vídeos sem tags específicas
      const videosFiltrados = (videosData || []).filter(video => {
        // Se há tags de vídeo, verificar se pelo menos uma é de módulo válido
        if (Array.isArray(video.video_tags) && video.video_tags.length > 0) {
          return video.video_tags.some((vt: { tag: { nome: string } }) => moduloTags.includes(vt.tag.nome));
        }
        // Se não há tags, incluir todos os vídeos (para compatibilidade)
        return true;
      });

      // Novo: Agrupar por módulo/tag (agora historyData já está inicializado)
      const modulos = moduloTags.map((moduloTag) => {
        // Vídeos desse módulo
        const videosModulo = videosFiltrados.filter(video =>
          Array.isArray(video.video_tags) && video.video_tags.some((vt: { tag: { nome: string } }) => vt.tag.nome === moduloTag)
        );
        const total = videosModulo.length;
        const assistidos = historyData?.filter(h => videosModulo.some(v => v.id === h.video_id)).length || 0;
        const percentual = total > 0 ? Math.round((assistidos / total) * 100) : 0;
        // Agrupar categorias desse módulo
        const categoriaStatsModulo = new Map<string, { total: number; assistidos: number }>();
        videosModulo.forEach(video => {
          const categoria = video.categorias?.nome || 'Geral';
          if (!categoriaStatsModulo.has(categoria)) {
            categoriaStatsModulo.set(categoria, { total: 0, assistidos: 0 });
        }
          categoriaStatsModulo.get(categoria)!.total++;
        });
        historyData?.forEach(history => {
          const video = videosModulo.find(v => v.id === history.video_id);
          if (video) {
            const categoria = video.categorias?.nome || 'Geral';
            if (categoriaStatsModulo.has(categoria)) {
              categoriaStatsModulo.get(categoria)!.assistidos++;
        }
          }
        });
        const categorias = Array.from(categoriaStatsModulo.entries()).map(([nome, stats]) => ({
          nome,
          total: stats.total,
          assistidos: stats.assistidos,
          percentual: stats.total > 0 ? Math.round((stats.assistidos / stats.total) * 100) : 0
        }));
        return {
          nome: moduloTag,
          total,
          assistidos,
          percentual,
          categorias
        };
      });

      const totalVideos = videosFiltrados.length;

      const videosAssistidos = historyData?.length || 0;
      const videosRestantes = Math.max(0, totalVideos - videosAssistidos);
      const percentualCompleto = totalVideos > 0 ? Math.round((videosAssistidos / totalVideos) * 100) : 0;

      console.log('📊 [useProgressStats] Resultados:', {
        totalVideos,
        videosAssistidos,
        percentualCompleto,
        historyDataLength: historyData?.length,
        videosFiltradosLength: videosFiltrados.length,
        sistema
      });

      // 3. Agrupar por categorias
      const categoriaStats = new Map<string, { total: number; assistidos: number }>();
      
      // Inicializar todas as categorias
      videosFiltrados.forEach(video => {
        const categoria = video.categorias?.nome || 'Geral';
        if (!categoriaStats.has(categoria)) {
          categoriaStats.set(categoria, { total: 0, assistidos: 0 });
          }
        categoriaStats.get(categoria)!.total++;
      });

      // Contar assistidos por categoria
      historyData?.forEach(history => {
        // Encontrar o vídeo original para pegar a categoria
        const video = videosFiltrados.find(v => v.id === history.video_id);
        if (video) {
          const categoria = video.categorias?.nome || 'Geral';
          if (categoriaStats.has(categoria)) {
            categoriaStats.get(categoria)!.assistidos++;
          }
          }
        });

      const categorias = Array.from(categoriaStats.entries()).map(([nome, stats]) => ({
        nome,
        total: stats.total,
        assistidos: stats.assistidos,
        percentual: stats.total > 0 ? Math.round((stats.assistidos / stats.total) * 100) : 0
      }));

      // 4. Atividade recente (últimos 7 dias)
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const recentQuery = supabase
        .from('video_history')
        .select('watched_at')
        .eq('completed', true)
        .eq('user_id', userId)
        .gte('watched_at', seteDiasAtras.toISOString());

      const { data: recentData } = await recentQuery;
      const atividadeRecente = recentData?.length || 0;

      // 5. Últimos 5 vídeos assistidos
      const ultimosQuery = supabase
        .from('video_history')
        .select('video_titulo, watched_at')
        .eq('completed', true)
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(5);

      const { data: ultimosData } = await ultimosQuery;

      const ultimosAssistidos = ultimosData?.map(item => ({
        titulo: item.video_titulo,
        watchedAt: item.watched_at
      })) || [];

      const progressStats: ProgressStats = {
        geral: {
        totalVideos,
          videosAssistidos,
          videosRestantes,
          percentualCompleto
        },
        categorias,
        modulos,
        atividadeRecente,
        ultimosAssistidos
      };

      setStats(progressStats);
      console.log('✅ [useProgressStats] Estatísticas carregadas com sucesso:', {
        totalVideos: progressStats.geral.totalVideos,
        videosAssistidos: progressStats.geral.videosAssistidos,
        percentual: progressStats.geral.percentualCompleto,
        modulos: progressStats.modulos.length,
        categorias: progressStats.categorias.length
      });

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Requisição de estatísticas cancelada');
        return;
      }
      
      console.error('❌ [useProgressStats] Erro ao carregar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStats(null);
    } finally {
      if (!abortController.signal.aborted) {
      setLoading(false);
    }
    }
  }, [user?.id, userSystem, isAdmin, targetUserId]);

  useEffect(() => {
    fetchStats();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  const refetch = useCallback(() => {
    console.log('🔄 [useProgressStats] Refetch chamado - recarregando estatísticas...');
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch };
} 