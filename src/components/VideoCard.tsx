import React from 'react';

interface Tag {
  id: string;
  nome: string;
}

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  categoria: string | { nome: string };
  duracao: string;
  tags?: Tag[];
}

interface VideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
  // Suporte para categoria como string ou objeto
  const categoria: string = typeof video.categoria === 'object' && video.categoria !== null && 'nome' in video.categoria
    ? video.categoria.nome
    : String(video.categoria);
  return (
    <div 
      className="relative bg-white/70 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 group"
      onClick={() => onVideoClick(video)}
    >
      <div className="relative group">
        <img
          src={video.miniatura}
          alt={video.titulo}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-primary-800/90 text-neutral-50 px-3 py-1 rounded text-xs font-bold shadow-lg">
          {categoria}
        </div>
        <div className="absolute bottom-2 right-2 bg-neutral-900/80 text-neutral-50 px-2 py-1 rounded text-xs font-semibold">
          {video.duracao}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-extrabold text-lg mb-2 text-primary-900 line-clamp-2 group-hover:text-accent-600 transition-colors">
          {video.titulo}
        </h3>
        <p className="text-primary-600 text-sm line-clamp-3 mb-2">
          {video.descricao}
        </p>
        {/* Tags inline (mobile) */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.map((tag: Tag) => (
              <span key={tag.id} className="bg-accent-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{tag.nome}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
