import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { videoService, categoriaService, tagService } from '@/services/supabaseService';
import { Video, Tag, Categoria } from '@/types/global';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogOverlay } from '../components/ui/dialog';
import { MESSAGES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import videosData from '@/data/videos-pdvlegal.json';


const PDVLegal: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const { isAdmin, userSystem, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Verificar acesso à página
  useEffect(() => {
    if (!authLoading && !isAdmin && userSystem && userSystem !== 'pdvlegal') {
      toast({
        title: 'Acesso Negado',
        description: 'Você só pode acessar tutoriais do seu sistema.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, userSystem, authLoading, navigate, toast]);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados do Supabase
        const [videosFromDB, tagsData, categoriesData] = await Promise.all([
          videoService.getVideosBySystem('pdvlegal'),
          tagService.getAllTags(),
          categoriaService.getAllCategorias()
        ]);

        console.log('Dados carregados:', { videosFromDB, tagsData, categoriesData });

        setVideos(videosFromDB);
        setFilteredVideos(videosFromDB);
        setTags(tagsData);
        setCategories(categoriesData);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const errorMsg = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC;
        setError(errorMsg);
        
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Categorias para filtro
  const filterCategories = ['Todas', ...categories.map(cat => cat.nome)];

  // Aplicar filtros
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
        // Suporte para categoria como string ou objeto
        const categoriaNome = typeof video.categoria === 'object' && video.categoria !== null && 'nome' in video.categoria
          ? video.categoria.nome
          : String(video.categoria);
        return categoriaNome === selectedCategory;
      });
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(video => {
        const videoTagIds = (video.tags || []).map(tag => tag.id);
        return selectedTags.every(tagId => videoTagIds.includes(tagId));
      });
    }

    setFilteredVideos(filtered);
  }, [searchTerm, selectedCategory, selectedTags, videos]);

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTags]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const clearFilters = () => {
    setSelectedCategory('Todas');
    setSelectedTags([]);
    setSearchTerm('');
    setIsFilterOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando tutoriais...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section 
          className="relative py-20 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo e Título */}
              <div className="flex flex-col md:flex-row items-center justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-4 md:mb-0 md:mr-6 flex items-center justify-center min-w-[80px] min-h-[80px]">
                  <img 
                    src="/pdv-legal-BLWLrCAG.png" 
                    alt="PDVLegal Logo" 
                    className="w-12 h-12 object-contain animate-bounce-slow"
                    onError={(e) => {
                      console.error('Erro ao carregar logo PDVLegal:', e);
                      // Fallback: mostrar um ícone SVG se a imagem não carregar
                      e.currentTarget.style.display = 'none';
                      const fallbackIcon = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallbackIcon) {
                        (fallbackIcon as HTMLElement).style.display = 'block';
                      }
                    }}
                    onLoad={() => console.log('Logo PDVLegal carregada com sucesso')}
                  />
                  {/* Fallback icon */}
                  <svg 
                    className="fallback-icon w-12 h-12 text-white hidden animate-bounce-slow" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">
                    PDVLegal
                  </h1>
                  <div className="w-24 h-1 bg-white/50 mx-auto md:mx-0 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Domine todas as funcionalidades do sistema de PDV mais completo do mercado
              </p>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-white/20 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{videos.length}</div>
                  <div className="text-blue-100 text-sm">Tutoriais</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-white/20 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-blue-100 text-sm">Prático</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-white/20 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">Sempre</div>
                  <div className="text-blue-100 text-sm">Atualizado</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-200">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Encontre o tutorial perfeito
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Use os filtros abaixo para encontrar exatamente o que você precisa
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Digite o que você está procurando..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
                    </svg>
                    Filtros Avançados
                  </button>
                </div>
                
                {/* Active Filters Display */}
                {(selectedCategory !== 'Todas' || selectedTags.length > 0 || searchTerm) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                        Filtros ativos:
                      </span>
                      
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Busca: "{searchTerm}"
                          <button
                            onClick={() => setSearchTerm('')}
                            className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      
                      {selectedCategory !== 'Todas' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {selectedCategory}
                          <button
                            onClick={() => setSelectedCategory('Todas')}
                            className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      
                      {selectedTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <span key={tagId} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            {tag.nome}
                            <button
                              onClick={() => setSelectedTags(selectedTags.filter(id => id !== tagId))}
                              className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                      
                      <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline ml-2"
                      >
                        Limpar todos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Modal */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <DialogContent className="fixed left-1/2 top-1/2 z-50 max-w-2xl w-full -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-8">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Filtros Avançados</DialogTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Refine sua busca para encontrar o conteúdo ideal</p>
                </div>
              </div>
              
              {/* Categoria */}
              <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                  </svg>
                  Categoria
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filterCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg scale-105'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.5 7A1.5 1.5 0 004 5.5V4a2 2 0 012-2h1.5A1.5 1.5 0 009 3.5V4h6v-.5A1.5 1.5 0 0116.5 2H18a2 2 0 012 2v1.5A1.5 1.5 0 0118.5 7H18v10h.5a1.5 1.5 0 011.5 1.5V20a2 2 0 01-2 2h-1.5a1.5 1.5 0 01-1.5-1.5V20H9v.5A1.5 1.5 0 017.5 22H6a2 2 0 01-2-2v-1.5A1.5 1.5 0 015.5 17H6V7h-.5z"/>
                  </svg>
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTags(selectedTags.includes(tag.id)
                        ? selectedTags.filter(id => id !== tag.id)
                        : [...selectedTags, tag.id])}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                        selectedTags.includes(tag.id)
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 shadow-lg scale-105'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
                      }`}
                    >
                      {tag.nome}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-300 dark:border-gray-600"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Aplicar Filtros
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Videos Grid */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg p-6 mb-8 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            {filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 max-w-md mx-auto">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Nenhum tutorial encontrado</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Tente ajustar seus filtros de busca ou remover alguns critérios</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Tutoriais Encontrados
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {filteredVideos.length} tutorial{filteredVideos.length !== 1 ? 's' : ''} 
                      {searchTerm && ` para "${searchTerm}"`}
                      {selectedCategory !== 'Todas' && ` em ${selectedCategory}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVideos.length)} de {filteredVideos.length} resultado{filteredVideos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full px-4 py-2 inline-block mb-2">
                      <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm">
                        {filteredVideos.length} de {videos.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Página {currentPage} de {totalPages}
                    </div>
                  </div>
                </div>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {paginatedVideos.map((video, index) => (
                    <div 
                      key={video.id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <VideoCard
                        video={video}
                        onVideoClick={handleVideoClick}
                      />
                    </div>
                  ))}
                </div>

                {/* Componente de Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={`${currentPage === 1 
                              ? 'pointer-events-none opacity-50 text-gray-400' 
                              : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                            }`}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Mostrar apenas páginas próximas à atual
                          if (
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  isActive={currentPage === page}
                                  className={currentPage === page 
                                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                                    : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-gray-300 dark:border-gray-600'
                                  }
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 3 || 
                            page === currentPage + 3
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis className="text-gray-400 dark:text-gray-500" />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={`${currentPage === totalPages 
                              ? 'pointer-events-none opacity-50 text-gray-400' 
                              : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                            }`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
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

export default PDVLegal;
