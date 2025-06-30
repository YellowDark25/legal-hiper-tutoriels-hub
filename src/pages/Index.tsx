import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { useAuth } from '@/contexts/AuthContext';
import { videoService, categoriaService, tagService } from '@/services/supabaseService';
import { Video, Tag, Categoria } from '@/types/global';
import { useToast } from '@/hooks/use-toast';
import { useProgressStats } from '@/hooks/useProgressStats';
import { useLoading } from '@/contexts/LoadingContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { DashboardCharts } from '../components/DashboardCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Cliente {
  user_id: string;
  email: string;
  nome_fantasia: string;
  sistema: string;
}

const Index: React.FC = () => {
  const { isAdmin, userSystem, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedSistema, setSelectedSistema] = useState<'hiper' | 'pdvlegal' | undefined>(undefined);
  const selectedCliente = clientes.find(c => c.user_id === (selectedClientId === 'all' ? undefined : selectedClientId));
  const { stats: progressStats, loading: progressLoading, refetch: refetchProgress } = useProgressStats(
    selectedClientId === 'all' ? undefined : selectedClientId,
    selectedCliente?.sistema
  );
  const { setPageLoading } = useLoading();

  // Redirecionar usuários não-admin para suas páginas de vídeos
  useEffect(() => {
    if (!authLoading && !isAdmin && userSystem) {
      console.log('Redirecionando usuário não-admin para página de vídeos:', userSystem);
      navigate(userSystem === 'pdvlegal' ? '/pdvlegal' : '/hiper');
    }
  }, [authLoading, isAdmin, userSystem, navigate]);

  // Carregar lista de clientes para o filtro (apenas para admins)
  useEffect(() => {
    const fetchClientes = async () => {
      if (!isAdmin) return;
      
      try {
        console.log('🔄 [Dashboard] Carregando lista de clientes...');
        
        // Usar função RPC para buscar clientes com user_ids corretos
        const { data: clientesData, error } = await supabase
          .rpc('get_clientes_with_users');
          
        if (error) {
          console.error('❌ [Dashboard] Erro na função RPC:', error);
          // Fallback para método manual
          return await fetchClientesManual();
        }
        
        const clientesList: Cliente[] = clientesData.map((cliente: any) => {
          const user_id = cliente.auth_user_id || cliente.empresa_id;
          console.log(`✅ [Dashboard] Mapeado: ${cliente.nome_fantasia} -> user_id: ${user_id} ${cliente.auth_user_id ? '(real)' : '(fallback)'}`);
          
          return {
            user_id,
            email: cliente.email,
            nome_fantasia: cliente.nome_fantasia,
            sistema: cliente.sistema
          };
        });
        
        console.log('✅ [Dashboard] Clientes carregados via RPC:', clientesList);
        setClientes(clientesList);
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao carregar clientes:', error);
        // Fallback para método manual
        await fetchClientesManual();
      }
    };

    // Método manual como fallback
    const fetchClientesManual = async () => {
      try {
        console.log('🔄 [Dashboard] Usando método manual...');
        
        // Buscar empresas
        const { data: empresas, error: empresasError } = await supabase
          .from('cadastro_empresa')
          .select('id, email, nome_fantasia, sistema')
          .order('nome_fantasia');
          
        if (empresasError) throw empresasError;
        
        // Usar empresa_id como user_id para simplificar
        const clientesList: Cliente[] = empresas.map(empresa => ({
          user_id: empresa.id, // Fallback para empresa_id
          email: empresa.email,
          nome_fantasia: empresa.nome_fantasia,
          sistema: empresa.sistema
        }));
        
        console.log('⚠️ [Dashboard] Clientes carregados via método manual:', clientesList);
        setClientes(clientesList);
      } catch (error) {
        console.error('❌ [Dashboard] Erro no método manual:', error);
      }
    };

    fetchClientes();
  }, [isAdmin]);

  // Buscar vídeos baseado no sistema do usuário (apenas para casos especiais)
  useEffect(() => {
    const fetchVideos = async () => {
      // Se ainda está carregando auth, aguarde
      if (authLoading) return;
      
      // Se não é admin, não carrega vídeos na página inicial (já foi redirecionado)
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageLoading(true);
        
        // Admin pode ver todos os vídeos como referência
        const videosFromDB = await videoService.getVideos();
        console.log('Vídeos carregados para admin:', videosFromDB);
        
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
        setPageLoading(false);
      }
    };

    fetchVideos();
  }, [isAdmin, authLoading, toast]);

  // Atualizar sistema ao selecionar cliente
  useEffect(() => {
    if (selectedClientId === 'all') {
      setSelectedSistema(undefined);
    } else {
      const cliente = clientes.find(c => c.user_id === selectedClientId);
      if (cliente && (cliente.sistema === 'hiper' || cliente.sistema === 'pdvlegal')) {
        setSelectedSistema(cliente.sistema);
      } else {
        setSelectedSistema(undefined);
      }
    }
  }, [selectedClientId, clientes]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Escutar quando vídeos são marcados como assistidos para atualizar stats
  useEffect(() => {
    const handleVideoWatched = (event: CustomEvent) => {
      console.log('🎥 [Dashboard] Evento videoWatched recebido:', event.detail);
      // Aguardar um pouco para o banco ser atualizado, então recarregar stats
      setTimeout(() => {
        console.log('🔄 [Dashboard] Recarregando estatísticas...');
        refetchProgress();
      }, 1000);
    };

    window.addEventListener('videoWatched', handleVideoWatched as EventListener);
    
    return () => {
      window.removeEventListener('videoWatched', handleVideoWatched as EventListener);
    };
  }, [refetchProgress]);

  // Função para obter o nome do sistema
  const getSystemName = (sistema: string) => {
    return sistema === 'pdvlegal' ? 'PDVLegal' : 'Hiper';
  };

  // Função para obter a cor do sistema
  const getSystemColor = (sistema: string) => {
    return sistema === 'pdvlegal' ? '#2563EB' : '#7C3AED';
  };

  // Se não é admin e ainda está carregando, mostra loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-800">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Loading size="lg" variant="spinner" text="Carregando..." />
        </main>
        <Footer />
      </div>
    );
  }

  // Se não é admin, a página já foi redirecionada
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-800 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Header do Dashboard */}
        <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-[#1E293B] via-[#0A192F] to-[#1E3A8A] border-b border-slate-600/50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 sm:mb-6 md:mb-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Dashboard Administrativo
                  </h1>
                    <p className="text-gray-300 text-base sm:text-lg">
                      Acesso: <span className="text-purple-400 font-semibold">Administrador</span>
                    </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Acompanhe o progresso de aprendizado dos seus clientes
                  </p>
                </div>
                  
                {/* Filtro de Cliente */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-300">Filtrar por Cliente:</label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="w-full sm:w-80 md:w-96 bg-slate-600 border-slate-500 text-white font-medium">
                        <div className="flex items-center justify-between w-full">
                          {selectedClientId === 'all' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📊</span>
                              <span className="text-sm sm:text-base">Todos os Clientes</span>
                            </div>
                          ) : selectedCliente ? (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img 
                                src={selectedCliente.sistema === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                                alt={`${getSystemName(selectedCliente.sistema)} Logo`}
                                className="w-4 h-4 flex-shrink-0"
                              />
                              <span className="text-sm sm:text-base font-semibold truncate max-w-[120px] sm:max-w-[180px] min-w-0 block">{selectedCliente.nome_fantasia}</span>
                              <Badge variant="outline" className="text-xs flex-shrink-0 border-gray-400 text-gray-300 ml-1">
                                {getSystemName(selectedCliente.sistema)}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm sm:text-base">Selecione um cliente</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 w-full sm:w-80 md:w-96">
                        <SelectItem value="all" className="text-white hover:bg-slate-600 focus:bg-slate-600 p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📊</span>
                            <span className="font-medium text-sm sm:text-base">Todos os Clientes</span>
                          </div>
                        </SelectItem>
                        {clientes.map((cliente) => (
                          <SelectItem 
                            key={cliente.user_id} 
                            value={cliente.user_id}
                            className="text-white hover:bg-slate-600 focus:bg-slate-600 p-3"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <img 
                                src={cliente.sistema === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                                alt={`${getSystemName(cliente.sistema)} Logo`}
                                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 object-contain"
                              />
                              <span className="flex-1 font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-[180px] min-w-0 block">{cliente.nome_fantasia}</span>
                              <Badge variant="outline" className="text-xs flex-shrink-0 border-gray-400 text-gray-300 ml-1">
                                {getSystemName(cliente.sistema)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
              {/* Informações do Cliente Selecionado */}
              {selectedCliente && (
                <div className="mb-6">
                  <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={selectedCliente.sistema === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                              alt={`${getSystemName(selectedCliente.sistema)} Logo`}
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-white truncate">{selectedCliente.nome_fantasia}</h3>
                            <p className="text-gray-300 text-sm truncate">{selectedCliente.email} • Sistema: {getSystemName(selectedCliente.sistema)}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            className="text-white border-0 font-medium"
                            style={{ backgroundColor: getSystemColor(selectedCliente.sistema) }}
                          >
                            {getSystemName(selectedCliente.sistema)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {progressLoading ? (
                <div className="py-12">
                  <Loading size="lg" variant="spinner" text="Carregando estatísticas..." />
                </div>
              ) : progressStats ? (
                <div className="space-y-6 md:space-y-8">
                  {/* Cards de Estatísticas Principais - Redesign */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg border-0 text-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          </div>
                      <p className="text-blue-100 text-xs font-medium text-center mb-1">Vídeos Assistidos</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold">{progressStats.geral?.videosAssistidos || 0}</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg border-0 text-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                      <p className="text-purple-100 text-xs font-medium text-center mb-1">Total Disponível</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold">{progressStats.geral?.totalVideos || 0}</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-600 to-green-800 shadow-lg border-0 text-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                      <p className="text-green-100 text-xs font-medium text-center mb-1">Progresso</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold">{progressStats.geral?.percentualCompleto || 0}%</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-600 to-orange-800 shadow-lg border-0 text-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                      <p className="text-orange-100 text-xs font-medium text-center mb-1">Atividade Recente</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold">{progressStats.atividadeRecente || 0}</p>
                    </Card>
                  </div>

                  {/* Gráfico de Progresso Geral e por Módulo */}
                  <div className="mb-10">
                    <DashboardCharts
                      completedVideos={progressStats.geral?.videosAssistidos || 0}
                      totalVideos={progressStats.geral?.totalVideos || 0}
                      moduleStats={progressStats.modulos?.map(m => ({
                        moduleName: m.nome,
                        completedVideos: m.assistidos,
                        totalVideos: m.total
                      }))}
                    />
                  </div>

                  {/* Resumo Geral */}
                  <Card className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium text-sm sm:text-base">
                            {selectedCliente ? `Progresso de ${selectedCliente.nome_fantasia}` : 'Progresso Total'}
                          </span>
                          <span className="text-orange-400 font-bold text-base sm:text-lg">
                            {progressStats.geral?.videosAssistidos || 0}/{progressStats.geral?.totalVideos || 0} vídeos
                            </span>
                          </div>
                          <Progress 
                          value={progressStats.geral?.percentualCompleto || 0} 
                          className="h-3 sm:h-4"
                          />
                        <div className="text-center">
                          <span className="text-xl sm:text-2xl font-bold text-white">
                            {progressStats.geral?.percentualCompleto || 0}% completo
                          </span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>

                  {/* Progresso por Módulo */}
                  {progressStats.modulos && progressStats.modulos.length > 0 && (
                    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                              </svg>
                            </div>
                            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              Progresso por Módulo
                            </span>
                          </CardTitle>
                          <p className="text-gray-400 text-xs sm:text-sm mt-2">
                            Desempenho detalhado por área de conhecimento
                          </p>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          {progressStats.modulos
                            .filter(m => {
                              if (!selectedCliente) return true;
                              if (selectedCliente.sistema === 'hiper') {
                                return ['Hiper Caixa', 'Hiper Loja', 'Hiper Gestão'].includes(m.nome);
                              }
                              if (selectedCliente.sistema === 'pdvlegal') {
                                return ['PDV', 'Retaguarda', 'Totem', 'Invoicy'].includes(m.nome);
                              }
                              return true;
                            })
                            .map((modulo, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 group">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-orange-100 transition-colors duration-300">{modulo.nome}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-orange-400/60 text-orange-400 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 transition-colors duration-300">
                                    {modulo.assistidos}/{modulo.total}
                                  </Badge>
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {modulo.percentual}%
                                  </div>
                                </div>
                              </div>
                              <div className="mb-2 sm:mb-3">
                                <Progress value={modulo.percentual} className="h-2 sm:h-3 bg-slate-800/50" />
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm mb-2 sm:mb-3">
                                <span className="text-orange-300 font-medium">{modulo.percentual}% completo</span>
                                <span className="text-gray-400">{modulo.total} vídeos disponíveis</span>
                              </div>
                              {/* Categorias do módulo */}
                              {modulo.categorias && modulo.categorias.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-600/30">
                                  <div className="text-sm text-orange-300 font-semibold mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    Categorias:
                                  </div>
                                  <div className="space-y-2">
                                    {modulo.categorias.map((cat, cidx) => (
                                      <div key={cidx} className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg border border-slate-600/20 hover:border-orange-500/30 transition-colors duration-200">
                                        <span className="text-gray-300 font-medium">{cat.nome}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-400 text-sm">{cat.assistidos}/{cat.total}</span>
                                          <span className="text-orange-400 font-semibold text-sm">({cat.percentual}%)</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                                  </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Progresso por Categorias */}
                  {progressStats.categorias && progressStats.categorias.length > 0 && (
                    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                            </svg>
                          </div>
                          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Progresso por Categorias
                          </span>
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-2">
                          Acompanhamento detalhado por categoria específica
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {progressStats.categorias
                            .filter(cat => {
                              if (!selectedCliente) return true;
                              // Categorias válidas para cada sistema
                              if (selectedCliente.sistema === 'hiper') {
                                // Categorias dos módulos do Hiper
                                return ['Financeiro', 'Estoque', 'Faturamento', 'Fiscal', 'Cadastros', 'Vendas', 'Relatórios', 'Operações'].includes(cat.nome);
                              }
                              if (selectedCliente.sistema === 'pdvlegal') {
                                // Categorias dos módulos do PDVLegal
                                return ['PDV', 'Retaguarda', 'Totem', 'Invoicy', 'Emissão'].includes(cat.nome);
                              }
                              return true;
                            })
                            .map((categoria, index) => (
                            <div key={index} className="bg-gradient-to-br from-slate-700/40 to-slate-600/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-white text-sm group-hover:text-blue-100 transition-colors duration-300">{categoria.nome}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-blue-400/60 text-blue-400 text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-300">
                                    {categoria.assistidos}/{categoria.total}
                                  </Badge>
                                  <div className="w-7 h-7 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {categoria.percentual}%
                                  </div>
                                </div>
                              </div>
                              <div className="mb-3">
                                <Progress 
                                  value={categoria.percentual} 
                                  className="h-2.5 bg-slate-800/50"
                                />
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-blue-300 font-medium">
                                  {categoria.percentual}% completo
                                </span>
                                <span className="text-gray-400">
                                  {categoria.total} vídeos
                                </span>
                              </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Atividade Recente */}
                    {progressStats.ultimosAssistidos && progressStats.ultimosAssistidos.length > 0 && (
                      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              Vídeos Assistidos Recentemente
                            </span>
                            {selectedCliente && (
                              <Badge variant="outline" className="border-green-400/60 text-green-400 text-xs font-semibold bg-green-500/10 ml-2">
                                {selectedCliente.nome_fantasia}
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-gray-400 text-sm mt-2">
                            Últimos vídeos assistidos e marcados como concluídos
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {progressStats.ultimosAssistidos.slice(0, 5).map((video, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
                                <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-white font-semibold group-hover:text-green-100 transition-colors duration-300 truncate">
                                      {video.titulo}
                                    </p>
                                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                      <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm3.5-9L12 14.5 8.5 11l1.4-1.4 2.1 2.1 3.1-3.1L16.5 10z"/>
                                      </svg>
                                      <p className="text-gray-400 text-xs truncate">
                                        {new Date(video.watchedAt).toLocaleDateString('pt-BR', { 
                                          day: '2-digit', 
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <Badge variant="outline" className="border-green-400/60 text-green-400 text-xs bg-green-500/10 max-w-[70px] truncate overflow-hidden px-2 py-0.5">
                                    Concluído
                                  </Badge>
                                  <svg className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Dicas Administrativas */}
                  <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="bg-purple-500/20 rounded-full p-3 mr-4 flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">💡 Insights Administrativos</h4>
                          <p className="text-gray-300">
                            {selectedCliente 
                              ? `Acompanhe o progresso de ${selectedCliente.nome_fantasia}. Se o engajamento estiver baixo, considere entrar em contato para oferecer suporte.`
                              : 'Use o filtro por cliente para acompanhar o progresso individual e identificar quem precisa de mais suporte ou treinamento.'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </div>
              ) : (
                // Fallback para quando não há dados de progresso
                <div className="space-y-6">
                  <Card className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-8 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                      <h3 className="text-xl font-semibold text-white mb-2">Dashboard Administrativo</h3>
                      <p className="text-gray-300 mb-6">
                        {selectedCliente 
                          ? `${selectedCliente.nome_fantasia} ainda não assistiu nenhum vídeo.`
                          : 'Selecione um cliente para ver suas estatísticas de progresso.'
                        }
                      </p>
                        <Link
                        to="/admin"
                        className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        Ir para Painel Admin
                        </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
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
