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
import { useLoading } from '@/contexts/LoadingContext';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Loading } from '@/components/ui/loading';
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
  const { setPageLoading } = useLoading();
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
        setPageLoading(true);
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
        setPageLoading(false);
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
          <Loading size="lg" variant="spinner" text="Carregando tutoriais PDVLegal..." />
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
          className="relative py-12 md:py-20 text-white overflow-hidden"
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
              <div className="flex flex-col sm:flex-row items-center justify-center mb-6 md:mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-4 sm:mb-0 sm:mr-6 flex items-center justify-center min-w-[60px] min-h-[60px] md:min-w-[80px] md:min-h-[80px]">
                  <img 
                    src="/pdv-legal-BLWLrCAG.png" 
                    alt="PDVLegal Logo" 
                    className="w-8 h-8 md:w-12 md:h-12 object-contain animate-bounce-slow"
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
                  {/* Fallback Icon */}
                  <svg 
                    className="fallback-icon w-8 h-8 md:w-12 md:h-12 text-blue-200 hidden" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <path d="M6 8h12v2H6zm0 4h8v2H6z"/>
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2">
                    Tutoriais PDVLegal
                  </h1>
                  <div className="w-16 h-1 bg-white/50 mx-auto sm:mx-0 rounded-full"></div>
                </div>
              </div>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
                Aprenda a usar todas as funcionalidades do sistema PDVLegal
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-6 md:mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">{videos.length}</div>
                  <div className="text-xs md:text-sm text-blue-100">Tutoriais</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">{categories.length}</div>
                  <div className="text-xs md:text-sm text-blue-100">Categorias</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">
                    {videos.reduce((acc, video) => acc + (video.visualizacoes || 0), 0)}
                  </div>
                  <div className="text-xs md:text-sm text-blue-100">Visualizações</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 md:py-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              
              {/* Search Bar */}
              <div className="w-full md:flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar tutoriais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filtros
              </button>

              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-4">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer touch-target"
                >
                  {filterCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(selectedCategory !== 'Todas' || selectedTags.length > 0 || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors touch-target"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {isFilterOpen && (
              <div className="md:hidden mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg animate-fade-in">
                <div className="space-y-4">
                  {/* Category Filter Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      {filterCategories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags Filter Mobile */}
                  {tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {tags.slice(0, 6).map((tag) => (
                          <label key={tag.id} className="flex items-center space-x-2 cursor-pointer touch-target-sm">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags([...selectedTags, tag.id]);
                                } else {
                                  setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {tag.nome}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters Mobile */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors touch-target"
                    >
                      Limpar filtros
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors touch-target"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            {error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Erro ao carregar tutoriais
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl md:text-6xl mb-4">🔍</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum tutorial encontrado
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Tente ajustar seus filtros de busca
                </p>
                {(selectedCategory !== 'Todas' || selectedTags.length > 0 || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base touch-target"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      Tutoriais PDVLegal
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      {filteredVideos.length} tutorial{filteredVideos.length !== 1 ? 's' : ''} encontrado{filteredVideos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {paginatedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onVideoClick={handleVideoClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 md:mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'touch-target'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(pageNumber);
                                }}
                                isActive={currentPage === pageNumber}
                                className="touch-target"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {totalPages > 5 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'touch-target'}
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
