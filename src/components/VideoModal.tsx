
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

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-neutral-900">{video.titulo}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="relative">
          <div className="aspect-video">
            <iframe
              src={video.url}
              title={video.titulo}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
              {video.categoria}
            </span>
            <span className="text-gray-600 text-sm">
              Duração: {video.duracao}
            </span>
          </div>
          <p className="text-gray-700">
            {video.descricao}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
