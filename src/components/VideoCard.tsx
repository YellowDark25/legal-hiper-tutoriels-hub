
import React from 'react';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  categoria: string;
  duracao: string;
}

interface VideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer animate-scale-in"
      onClick={() => onVideoClick(video)}
    >
      <div className="relative group">
        <img
          src={video.miniatura}
          alt={video.titulo}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-sm font-medium">
          {video.categoria}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {video.duracao}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-neutral-900 line-clamp-2">
          {video.titulo}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {video.descricao}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
