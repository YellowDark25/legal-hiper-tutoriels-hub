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
  const { stats: progressStats, loading: progressLoading, refetch: refetchProgress } = useProgressStats(
    selectedClientId === 'all' ? undefined : selectedClientId
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

  const selectedCliente = clientes.find(c => c.user_id === (selectedClientId === 'all' ? undefined : selectedClientId));

  return (
    <div className="min-h-screen flex flex-col bg-slate-800 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Header do Dashboard */}
        <section className="py-8 md:py-12 bg-gradient-to-b from-[#1E293B] via-[#0A192F] to-[#1E3A8A] border-b border-slate-600/50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Dashboard Administrativo
                  </h1>
                    <p className="text-gray-300 text-lg">
                      Acesso: <span className="text-purple-400 font-semibold">Administrador</span>
                    </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Acompanhe o progresso de aprendizado dos seus clientes
                  </p>
                </div>
                  
                {/* Filtro de Cliente */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-300">Filtrar por Cliente:</label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="w-72 bg-slate-600 border-slate-500 text-white font-medium">
                        <div className="flex items-center justify-between w-full">
                          {selectedClientId === 'all' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📊</span>
                              <span>Todos os Clientes</span>
                            </div>
                          ) : selectedCliente ? (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img 
                                src={selectedCliente.sistema === 'pdvlegal' ? '/pdv-legal-BLWLrCAG.png' : '/hiper-logo-D4juEd9-.png'}
                                alt={`${getSystemName(selectedCliente.sistema)} Logo`}
                                className="w-4 h-4 flex-shrink-0"
                              />
                              <span className="truncate text-sm">{selectedCliente.nome_fantasia}</span>
                              <Badge variant="outline" className="text-xs flex-shrink-0 border-gray-400 text-gray-300">
                                {getSystemName(selectedCliente.sistema)}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400">Selecione um cliente</span>
                          )}
                        </div>
                      </SelectTrigger>
                                              <SelectContent className="bg-slate-700 border-slate-600 w-72">
                          <SelectItem value="all" className="text-white hover:bg-slate-600 focus:bg-slate-600 p-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">📊</span>
                              <span className="font-medium">Todos os Clientes</span>
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
                                  className="w-5 h-5 flex-shrink-0 object-contain"
                                />
                                <span className="flex-1 truncate font-medium">{cliente.nome_fantasia}</span>
                                <Badge variant="outline" className="text-xs flex-shrink-0 border-gray-400 text-gray-300">
                                  {getSystemName(cliente.sistema)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  </div>
                  
                    <Link
                      to="/admin"
                      className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                      Painel Admin
                    </Link>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg border-0 text-white rounded-2xl flex flex-col items-center justify-center p-6">
                      <div className="flex items-center justify-center mb-3">
                        <svg className="w-10 h-10 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          </div>
                      <p className="text-blue-100 text-sm font-medium">Vídeos Assistidos</p>
                      <p className="text-3xl font-bold">{progressStats.geral?.videosAssistidos || 0}</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg border-0 text-white rounded-2xl flex flex-col items-center justify-center p-6">
                      <div className="flex items-center justify-center mb-3">
                        <svg className="w-10 h-10 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                      <p className="text-purple-100 text-sm font-medium">Total Disponível</p>
                      <p className="text-3xl font-bold">{progressStats.geral?.totalVideos || 0}</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-600 to-green-800 shadow-lg border-0 text-white rounded-2xl flex flex-col items-center justify-center p-6">
                      <div className="flex items-center justify-center mb-3">
                        <svg className="w-10 h-10 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                      <p className="text-green-100 text-sm font-medium">Progresso</p>
                      <p className="text-3xl font-bold">{progressStats.geral?.percentualCompleto || 0}%</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-600 to-orange-800 shadow-lg border-0 text-white rounded-2xl flex flex-col items-center justify-center p-6">
                      <div className="flex items-center justify-center mb-3">
                        <svg className="w-10 h-10 text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                      <p className="text-orange-100 text-sm font-medium">Atividade Recente</p>
                      <p className="text-3xl font-bold">{progressStats.atividadeRecente || 0}</p>
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
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">
                            {selectedCliente ? `Progresso de ${selectedCliente.nome_fantasia}` : 'Progresso Total'}
                          </span>
                          <span className="text-orange-400 font-bold text-lg">
                            {progressStats.geral?.videosAssistidos || 0}/{progressStats.geral?.totalVideos || 0} vídeos
                            </span>
                          </div>
                          <Progress 
                          value={progressStats.geral?.percentualCompleto || 0} 
                          className="h-4"
                          />
                        <div className="text-center">
                          <span className="text-2xl font-bold text-white">
                            {progressStats.geral?.percentualCompleto || 0}% completo
                          </span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>

                  {/* Progresso por Módulo */}
                  {progressStats.modulos && progressStats.modulos.length > 0 && (
                    <Card className="bg-slate-700/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                            </svg>
                          Progresso por Módulo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div key={idx} className="bg-slate-600/30 rounded-lg p-4 border border-orange-500/30 mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white text-base">{modulo.nome}</h4>
                                <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                                  {modulo.assistidos}/{modulo.total}
                                  </Badge>
                                </div>
                              <Progress value={modulo.percentual} className="h-2 mb-2" />
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-400">{modulo.percentual}% completo</span>
                                <span className="text-gray-400">{modulo.total} vídeos</span>
                              </div>
                              {/* Categorias do módulo */}
                              {modulo.categorias && modulo.categorias.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-300 mb-1">Categorias:</div>
                                  <ul className="space-y-1">
                                    {modulo.categorias.map((cat, cidx) => (
                                      <li key={cidx} className="flex justify-between">
                                        <span>{cat.nome}</span>
                                        <span className="text-gray-400">{cat.assistidos}/{cat.total} ({cat.percentual}%)</span>
                                      </li>
                                    ))}
                                  </ul>
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
                    <Card className="bg-slate-700/50 border-slate-600/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                          </svg>
                          Progresso por Categorias
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div key={index} className="bg-slate-600/30 rounded-lg p-4 border border-slate-500/30">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white text-sm">{categoria.nome}</h4>
                                <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                                  {categoria.assistidos}/{categoria.total}
                                </Badge>
                              </div>
                              <Progress 
                                value={categoria.percentual} 
                                className="h-2 mb-2"
                              />
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">
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
                      <Card className="bg-slate-700/50 border-slate-600/50">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Vídeos Assistidos Recentemente
                          {selectedCliente && (
                            <span className="ml-2 text-sm text-gray-400">por {selectedCliente.nome_fantasia}</span>
                          )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {progressStats.ultimosAssistidos.slice(0, 5).map((video, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{video.titulo}</p>
                                    <p className="text-gray-400 text-xs">
                                      {new Date(video.watchedAt).toLocaleDateString('pt-BR', { 
                                        day: '2-digit', 
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
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
