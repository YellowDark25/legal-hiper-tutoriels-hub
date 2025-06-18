import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { supabase } from '../integrations/supabase/client';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogOverlay } from '../components/ui/dialog';

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
  categoria: string;
  duracao: string;
}

interface Category {
  id: string;
  nome: string;
  cor?: string;
  descricao?: string;
}

// Função utilitária para obter a URL pública da miniatura
function getThumbnailUrl(video: any): string {
  if (video.thumbnail_path) {
    const { data } = supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_path);
    return data?.publicUrl || '/placeholder.svg';
  }
  if (video.miniatura) {
    return video.miniatura;
  }
  return '/placeholder.svg';
}

const Hiper = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Buscar todas as tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase.from('tags').select('*').order('nome');
      if (!error && data) setTags(data);
    };
    fetchTags();
  }, []);

  // Buscar vídeos com tags e categoria
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`*, categoria:categorias(nome), video_tags:video_tags(tag:tags(id, nome))`)
        .eq('sistema', 'hiper')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });
      if (!error && data) {
        // Adiciona a URL pública da miniatura
        const videosWithThumb = data.map(video => {
          let miniatura = video.miniatura;
          if (video.thumbnail_path) {
            const { data: thumbData } = supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_path);
            miniatura = thumbData?.publicUrl || '/placeholder.svg';
          }
          // Extrai tags do join
          const tags = (video.video_tags || []).map((vt: any) => vt.tag).filter(Boolean);
          return { ...video, miniatura, tags };
        });
        setVideos(videosWithThumb);
        setFilteredVideos(videosWithThumb);
      }
    };
    fetchVideos();
  }, []);

  // Buscar todas as categorias do banco
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Categorias para filtro (todas do banco)
  const filterCategories = ['Todas', ...categories.map(cat => cat.nome)];

  // Filtro
  useEffect(() => {
    let filtered = videos;
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(video => {
        const cat = typeof video.categoria === 'object' && video.categoria?.nome ? video.categoria.nome : video.categoria;
        return cat === selectedCategory;
      });
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(video => {
        const videoTagIds = (video.tags || []).map((t: any) => t.id);
        // AND: todas as tags selecionadas devem estar presentes
        return selectedTags.every(tagId => videoTagIds.includes(tagId));
      });
    }
    setFilteredVideos(filtered);
  }, [searchTerm, selectedCategory, selectedTags, videos]);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // UI aprimorado
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-50 to-white">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-700 text-white py-16 shadow-lg">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in drop-shadow-xl">
              Tutoriais Hiper
            </h1>
            <p className="text-xl mb-8 text-accent-200 animate-fade-in">
              Domine todas as funcionalidades do sistema Hiper de gestão empresarial
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 inline-block">
              <div className="flex items-center text-accent-300">
                <span className="mr-2">🚀</span>
                <span className="font-medium">{videos.length} tutoriais disponíveis</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar tutoriais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Botão de filtro avançado */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow hover:bg-primary-800 transition-all border border-primary-700/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
                </svg>
                Filtros
              </button>
            </div>
          </div>
          {/* Modal/Drawer de Filtros */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
            <DialogContent className="fixed left-1/2 top-1/2 z-50 max-w-lg w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8">
              <DialogTitle className="text-2xl font-bold mb-6 text-primary-900">Filtros Avançados</DialogTitle>
              {/* Categoria */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-primary-800">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border shadow-sm ${
                        selectedCategory === category
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-primary-800">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTags(selectedTags.includes(tag.id)
                        ? selectedTags.filter(id => id !== tag.id)
                        : [...selectedTags, tag.id])}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border shadow-sm ${
                        selectedTags.includes(tag.id)
                          ? 'bg-accent-500 text-white border-accent-500'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {tag.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-8">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-800 transition-all"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={() => { setSelectedCategory('Todas'); setSelectedTags([]); setIsFilterOpen(false); }}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-primary-900 font-bold hover:bg-gray-300 transition-all"
                >
                  Limpar
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Videos Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum tutorial encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredVideos.map(video => (
                  <div key={video.id} className="rounded-2xl bg-white/80 shadow-xl hover:shadow-2xl border border-gray-100 hover:scale-[1.03] transition-all duration-300 overflow-hidden group relative">
                    <VideoCard
                      video={video}
                      onVideoClick={handleVideoClick}
                    />
                    {/* Tags visíveis no card */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1 z-10">
                        {video.tags.map((tag: any) => (
                          <span key={tag.id} className="bg-accent-500/90 text-white text-xs px-2 py-1 rounded-full shadow font-semibold">{tag.nome}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Hiper;
