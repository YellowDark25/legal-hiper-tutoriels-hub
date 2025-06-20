import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { useAuth } from '@/contexts/AuthContext';
import { videoService, categoriaService, tagService } from '@/services/supabaseService';
import { Video, Tag, Categoria } from '@/types/global';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { isAdmin, userSystem, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Buscar vídeos baseado no sistema do usuário
  useEffect(() => {
    const fetchVideos = async () => {
      // Se ainda está carregando auth, aguarde
      if (authLoading) return;
      
      // Se for admin, não carrega vídeos na página inicial (pode acessar tudo)
      if (isAdmin) {
        setLoading(false);
        return;
      }

      // Se não tem sistema definido, não carrega vídeos
      if (!userSystem) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Carregando vídeos para o sistema:', userSystem);
        
        const videosFromDB = await videoService.getVideosBySystem(userSystem);
        console.log('Vídeos carregados:', videosFromDB);
        
        setVideos(videosFromDB);
      } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os vídeos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userSystem, isAdmin, authLoading, toast]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Função para obter o nome do sistema
  const getSystemName = (sistema: string) => {
    return sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper';
  };

  // Função para obter a cor do sistema
  const getSystemColor = (sistema: string) => {
    return sistema === 'pdvlegal' ? '#2563EB' : '#7C3AED';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section - Personalizado baseado no sistema do usuário */}
        <section 
          className="relative py-20 text-white overflow-hidden"
          style={{
            background: userSystem 
              ? (userSystem === 'pdvlegal' 
                  ? 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)'
                  : 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)')
              : 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-amber-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-16 h-16 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-amber-400/10 rounded-full blur-xl animate-pulse delay-1500"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {!authLoading && userSystem ? (
                // Usuário logado com sistema específico
                <div className="animate-fade-in-up">
                  {/* Logo do Sistema */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                      <img 
                        src={userSystem === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                        alt={`${getSystemName(userSystem)} Logo`}
                        className="w-16 h-16 object-contain animate-bounce-slow"
                      />
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left">
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Tutoriais {getSystemName(userSystem)}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-right opacity-90">
                    Aprenda a usar o sistema {getSystemName(userSystem)} com nossos tutoriais práticos e atualizados
                  </p>

                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/20 animate-fade-in">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-lg font-semibold">
                          {videos.length} tutorial{videos.length !== 1 ? 's' : ''} disponível{videos.length !== 1 ? 'eis' : ''}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : !authLoading && isAdmin ? (
                // Admin logado
                <div className="animate-fade-in-up">
                  <div className="flex justify-center mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                      <svg className="w-16 h-16 text-white animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left">
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Centro de Tutoriais
                    </span>
                  </h1>
                  
                  <div className="text-xl md:text-2xl mb-4 animate-slide-in-right">
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent font-semibold">
                      Admin
                    </span>
                  </div>
                  
                  <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
                    Acesse qualquer sistema ou gerencie o conteúdo através do painel administrativo
                  </p>
                </div>
              ) : (
                // Usuário não logado ou sem sistema
                <div className="animate-fade-in-up">
                  <div className="flex justify-center mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                      <svg className="w-16 h-16 text-white animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-left">
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Centro de Tutoriais
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-right opacity-90">
                    Aprenda a usar os sistemas PDVLegal e Hiper com nossos tutoriais práticos e atualizados
                  </p>

                  {/* Estatísticas Animadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 animate-fade-in">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2">2</div>
                      <div className="text-white/80 text-sm">Sistemas Disponíveis</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2">100%</div>
                      <div className="text-white/80 text-sm">Conteúdo Prático</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="text-3xl font-bold text-white mb-2">24/7</div>
                      <div className="text-white/80 text-sm">Acesso Disponível</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botões de acesso direto aos sistemas - condicionais */}
              {(isAdmin || !userSystem) && (
                <div className={`grid gap-8 max-w-4xl mx-auto animate-fade-in-up ${isAdmin || !userSystem ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                                    {(isAdmin || !userSystem || userSystem === 'pdvlegal') && (
                <Link
                  to="/pdvlegal"
                      className="group relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-2 border border-blue-500/20 overflow-hidden"
                    >
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4 group-hover:bg-white/20 transition-all duration-300">
                              <img 
                                src="/pdv-legal-BLWLrCAG.png" 
                                alt="PDVLegal Logo" 
                                className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-2xl font-bold group-hover:text-blue-100 transition-colors">PDVLegal</h3>
                          </div>
                          <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 group-hover:rotate-45 transition-all duration-300">
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        </div>
                        
                        <p className="text-blue-100 text-left leading-relaxed group-hover:text-white transition-colors">
                          Sistema de Ponto de Venda completo para seu estabelecimento
                        </p>
                        
                        <div className="flex items-center mt-4 text-blue-200 group-hover:text-blue-100 transition-colors">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium">Acesso Disponível</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {(isAdmin || !userSystem || userSystem === 'hiper') && (
                    <Link
                      to="/hiper"
                      className="group relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:-translate-y-2 border border-purple-500/20 overflow-hidden"
                    >
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4 group-hover:bg-white/20 transition-all duration-300">
                              <img 
                                src="/hiper-logo-D4juEd9-.png" 
                                alt="Hiper Logo" 
                                className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-2xl font-bold group-hover:text-purple-100 transition-colors">Hiper</h3>
                          </div>
                          <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 group-hover:rotate-45 transition-all duration-300">
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        </div>
                        
                        <p className="text-purple-100 text-left leading-relaxed group-hover:text-white transition-colors">
                          Sistema integrado de gestão empresarial
                        </p>
                        
                        <div className="flex items-center mt-4 text-purple-200 group-hover:text-purple-100 transition-colors">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium">Acesso Disponível</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Seção de vídeos do sistema do usuário */}
        {!authLoading && userSystem && videos.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: `${getSystemColor(userSystem)}20` }}>
                    <svg className="w-8 h-8" style={{ color: getSystemColor(userSystem) }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      Seus Tutoriais - {getSystemName(userSystem)}
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Vídeos específicos para o seu sistema. Aprenda no seu ritmo e domine todas as funcionalidades.
                  </p>
                  <div className="w-24 h-1 rounded-full mx-auto mt-6" style={{ backgroundColor: getSystemColor(userSystem) }}></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {videos.slice(0, 8).map((video, index) => (
                    <div 
                      key={video.id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-[1.05] hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <VideoCard
                        video={video}
                        onVideoClick={handleVideoClick}
                      />
                    </div>
                  ))}
                </div>
                
                {videos.length > 8 && (
                  <div className="text-center mt-8">
                    <Link
                      to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                      className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      style={{ 
                        backgroundColor: getSystemColor(userSystem),
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Ver todos os {videos.length} tutoriais
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Seção de recursos - Mais informativa */}
        <section className="py-20 relative overflow-hidden transition-colors duration-200" style={{ background: 'linear-gradient(135deg, #14213d 0%, #1a1a1a 50%, #0a0a0a 100%)' }}>
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/3 to-orange-400/5"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Como funciona
                  </span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Acesse tutoriais organizados por categoria e aprenda no seu ritmo
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mt-6"></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                    Organize por Categoria
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Tutoriais organizados por módulos e funcionalidades para facilitar seu aprendizado
                  </p>
                </div>
                
                <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
                    Vídeos Práticos
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Demonstrações passo a passo das funcionalidades com exemplos reais
                  </p>
                </div>
                
                <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                    Sempre Atualizado
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Conteúdo atualizado com as últimas versões e funcionalidades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de sistemas - Filtrada baseado no sistema do usuário */}
        {(isAdmin || !userSystem) && (
          <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {isAdmin ? 'Nossos Sistemas' : 'Escolha seu Sistema'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {isAdmin 
                      ? 'Soluções desenvolvidas para otimizar a gestão do seu negócio'
                      : 'Selecione o sistema que você utiliza para acessar os tutoriais específicos'
                    }
                  </p>
                </div>
                
                <div className={`grid gap-12 ${isAdmin || !userSystem ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl mx-auto'}`}>
                {/* PDVLegal Card - Mostrar se admin ou não tem sistema */}
                {(isAdmin || !userSystem) && (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-8 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mr-4 p-2">
                      <img 
                        src="/pdv-legal-BLWLrCAG.png" 
                        alt="PDVLegal Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">PDVLegal</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Sistema completo de Ponto de Venda desenvolvido para estabelecimentos 
                    comerciais que precisam de agilidade e confiabilidade.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                      <span>Controle de vendas e estoque</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                      <span>Emissão de cupons fiscais</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                      <span>Relatórios gerenciais</span>
                    </div>
                  </div>
                  
                    <Link
                      to="/pdvlegal"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                    >
                      Acessar tutoriais
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}

                {/* Hiper Card - Mostrar se admin ou não tem sistema */}
                {(isAdmin || !userSystem) && (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-8 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center mr-4 p-2" style={{ backgroundColor: '#7C3AED' }}>
                      <img 
                        src="/hiper-logo-D4juEd9-.png" 
                        alt="Hiper Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hiper</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Sistema integrado de gestão empresarial que oferece controle total 
                    sobre todos os aspectos do seu negócio.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                      <span>Gestão completa de estoque</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                      <span>Módulo financeiro avançado</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                      <span>Integração com e-commerce</span>
                    </div>
                  </div>
                  
                    <Link
                      to="/hiper"
                      className="inline-flex items-center font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: '#7C3AED' }}
                    >
                      Acessar tutoriais
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seção personalizada para usuários com sistema específico */}
        {!authLoading && userSystem && (
          <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Seu Sistema - {getSystemName(userSystem)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Você tem acesso completo aos tutoriais do {getSystemName(userSystem)}
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-8 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center mr-4 p-2"
                        style={{ backgroundColor: getSystemColor(userSystem) }}
                      >
                        <img 
                          src={userSystem === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                          alt={`${getSystemName(userSystem)} Logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{getSystemName(userSystem)}</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {userSystem === 'pdvlegal' 
                        ? 'Sistema completo de Ponto de Venda desenvolvido para estabelecimentos comerciais que precisam de agilidade e confiabilidade.'
                        : 'Sistema integrado de gestão empresarial que oferece controle total sobre todos os aspectos do seu negócio.'
                      }
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {userSystem === 'pdvlegal' ? (
                        <>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                            <span>Controle de vendas e estoque</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                            <span>Emissão de cupons fiscais</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                            <span>Relatórios gerenciais</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                            <span>Gestão completa de estoque</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                            <span>Módulo financeiro avançado</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#7C3AED' }}></div>
                            <span>Integração com e-commerce</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        to={userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper'}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white"
                        style={{ backgroundColor: getSystemColor(userSystem) }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Ver Todos os Tutoriais
                      </Link>
                      
                      {videos.length > 0 && (
                        <div className="flex items-center justify-center px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                          {videos.length} Tutorial{videos.length !== 1 ? 's' : ''} Disponível{videos.length !== 1 ? 'eis' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seção de ajuda/suporte */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-200">
          {/* Background decorativo */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
                  </svg>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Precisa de ajuda?
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Não encontrou o que procurava? Nossa equipe está pronta para ajudar você
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Resposta em até 24h</p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.2c.27-.27.35-.67.24-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Telefone</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Suporte direto</p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">FAQ</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Respostas rápidas</p>
                  </div>
                </div>
                
                <Link
                  to="/contato"
                  className="group inline-flex items-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6 mr-3 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Entrar em contato
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Modal de vídeo */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Index;
