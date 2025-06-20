import React from 'react';
import { Video, Tag } from '@/types/global';
import { supabase } from '@/integrations/supabase/client';

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
  const getThumbnailUrl = (video: any): string => {
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

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg dark:hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 group"
      onClick={() => onVideoClick(video)}
    >
      <div className="relative group">
        <img
          src={miniaturaUrl}
          alt={video.titulo}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/placeholder.svg') {
              target.src = '/placeholder.svg';
            }
          }}
        />
        <div 
          className="absolute top-2 left-2 text-white px-3 py-1 rounded text-xs font-bold shadow-lg"
          style={{ backgroundColor: `${categoriaCor}E6` }} // E6 = 90% opacity
        >
          {categoria}
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-gray-900 dark:text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.titulo}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-2">
          {video.descricao || 'Sem descrição disponível'}
        </p>
        
        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.map((tag: Tag) => (
              <span 
                key={tag.id} 
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium"
              >
                {tag.nome}
              </span>
            ))}
          </div>
        )}
        
        {/* Informações extras */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{video.visualizacoes || 0} visualizações</span>
          {video.duracao && <span>{video.duracao}</span>}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
