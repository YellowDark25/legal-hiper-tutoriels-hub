import React from 'react';
import { Video, Tag } from '@/types/global';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { CheckCircle } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
  // Suporte para categoria como string ou objeto
  const categoria: string = typeof video.categoria === 'object' && video.categoria !== null && 'nome' in video.categoria
    ? video.categoria.nome
    : String(video.categoria);

  // Obter cor da categoria se disponível
  const categoriaCor: string = typeof video.categoria === 'object' && video.categoria !== null && 'cor' in video.categoria
    ? video.categoria.cor
    : '#6B7280'; // Cor padrão (gray-500)

  // Função para obter a URL da miniatura
  const getThumbnailUrl = (video: Video): string => {
    // Se existe thumbnail_path, gera URL do Supabase Storage
    if (video.thumbnail_path) {
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_path);
      return data?.publicUrl || '/placeholder.svg';
    }
    
    // Se existe miniatura (URL direta), usa ela
    if (video.miniatura) {
      return video.miniatura;
    }
    
    // Fallback para placeholder
    return '/placeholder.svg';
  };

  // URL da miniatura com fallback
  const miniaturaUrl = getThumbnailUrl(video);

  const { user } = useAuth();
  const { getWatchedVideos } = useVideoProgress(user?.id);
  const [assistido, setAssistido] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchWatched() {
      if (user) {
        const watchedIds = await getWatchedVideos();
        if (mounted) setAssistido(watchedIds.includes(video.id));
      }
    }
    fetchWatched();
    return () => { mounted = false; };
  }, [user, video.id, getWatchedVideos]);

  // Escutar mudanças no localStorage para atualizar quando vídeo for marcado como assistido
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        getWatchedVideos().then(watchedIds => {
          setAssistido(watchedIds.includes(video.id));
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Também escutar evento customizado para atualizações
    window.addEventListener('videoWatched', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('videoWatched', handleStorageChange);
    };
  }, [user, video.id, getWatchedVideos]);

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg dark:hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 group active:scale-[0.98]"
      onClick={() => onVideoClick(video)}
    >
      <div className="relative group">
        {/* Ícone de assistido */}
        {assistido && (
          <div className="absolute top-2 right-2 z-10">
            <CheckCircle className="w-6 h-6 text-green-500 drop-shadow" />
          </div>
        )}
        <img
          src={miniaturaUrl}
          alt={video.titulo}
          className="w-full h-40 sm:h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/placeholder.svg') {
              target.src = '/placeholder.svg';
            }
          }}
        />
        <div 
          className="absolute top-2 left-2 text-white px-2 py-1 md:px-3 md:py-1 rounded text-xs font-bold shadow-lg"
          style={{ backgroundColor: `${categoriaCor}E6` }} // E6 = 90% opacity
        >
          {categoria}
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 touch-target">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-900 dark:text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-3 md:p-4">
        <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {video.titulo}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 md:line-clamp-3 mb-3 leading-relaxed">
          {video.descricao || 'Sem descrição disponível'}
        </p>
        
        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag: Tag) => (
              <span 
                key={tag.id} 
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium"
              >
                {tag.nome}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Informações extras */}
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{video.visualizacoes || 0} views</span>
          </div>
          {video.duracao && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span>{video.duracao}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
