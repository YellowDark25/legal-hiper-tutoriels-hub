import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Loading } from '@/components/ui/loading';
import { ButtonLoading } from '@/components/ui/button-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingDemo: React.FC = () => {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { setPageLoading } = useLoading();

  const handleFullScreenDemo = () => {
    setShowFullScreen(true);
    setTimeout(() => setShowFullScreen(false), 3000);
  };

  const handleButtonDemo = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handlePageLoadingDemo = () => {
    setPageLoading(true);
    setTimeout(() => setPageLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-800">
      <Header />
      
      {/* Full Screen Loading Demo */}
      {showFullScreen && <LoadingSpinner />}
      
      <main className="flex-1 pt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Sistema de Loading NexHub
              </h1>
              <p className="text-gray-300 text-lg">
                Demonstração completa dos componentes de loading implementados
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Loading Spinner Completo */}
              <Card className="bg-slate-700/50 border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Loading Spinner Completo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Loading completo com logo, efeitos glow, dots animados e spinner
                  </p>
                  <Button 
                    onClick={handleFullScreenDemo}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    Demonstrar Full Screen Loading
                  </Button>
                </CardContent>
              </Card>

              {/* Loading Componentes */}
              <Card className="bg-slate-700/50 border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                    Componentes de Loading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Spinner Sizes:</h4>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <Loading size="sm" variant="spinner" />
                        <p className="text-gray-400 text-xs mt-2">Small</p>
                      </div>
                      <div className="text-center">
                        <Loading size="md" variant="spinner" />
                        <p className="text-gray-400 text-xs mt-2">Medium</p>
                      </div>
                      <div className="text-center">
                        <Loading size="lg" variant="spinner" />
                        <p className="text-gray-400 text-xs mt-2">Large</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Dots Animation:</h4>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <Loading size="sm" variant="dots" />
                        <p className="text-gray-400 text-xs mt-2">Small</p>
                      </div>
                      <div className="text-center">
                        <Loading size="md" variant="dots" />
                        <p className="text-gray-400 text-xs mt-2">Medium</p>
                      </div>
                      <div className="text-center">
                        <Loading size="lg" variant="dots" />
                        <p className="text-gray-400 text-xs mt-2">Large</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Pulse Effect:</h4>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <Loading size="sm" variant="pulse" />
                        <p className="text-gray-400 text-xs mt-2">Small</p>
                      </div>
                      <div className="text-center">
                        <Loading size="md" variant="pulse" />
                        <p className="text-gray-400 text-xs mt-2">Medium</p>
                      </div>
                      <div className="text-center">
                        <Loading size="lg" variant="pulse" />
                        <p className="text-gray-400 text-xs mt-2">Large</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading com Texto */}
              <Card className="bg-slate-700/50 border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                    Loading com Texto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Loading size="md" variant="spinner" text="Carregando dados..." />
                  <Loading size="md" variant="dots" text="Processando..." />
                  <Loading size="md" variant="pulse" text="Aguarde..." />
                </CardContent>
              </Card>

              {/* Button Loading */}
              <Card className="bg-slate-700/50 border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Button Loading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Loading específico para botões durante operações assíncronas
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleButtonDemo}
                      disabled={buttonLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {buttonLoading ? (
                        <>
                          <ButtonLoading size="sm" className="mr-2" />
                          Carregando...
                        </>
                      ) : (
                        'Demonstrar Button Loading'
                      )}
                    </Button>

                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" disabled className="bg-gray-600">
                        <ButtonLoading size="sm" className="mr-1" />
                        SM
                      </Button>
                      <Button size="default" disabled className="bg-gray-600">
                        <ButtonLoading size="md" className="mr-2" />
                        MD
                      </Button>
                      <Button size="lg" disabled className="bg-gray-600">
                        <ButtonLoading size="lg" className="mr-2" />
                        LG
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Global Loading */}
              <Card className="bg-slate-700/50 border-slate-600/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Sistema Global de Loading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    Sistema centralizado que controla loading em toda a aplicação:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-600/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">🚀 Loading Inicial</h4>
                      <p className="text-gray-300 text-sm">
                        Exibido durante o carregamento inicial da aplicação (1.5s)
                      </p>
                    </div>
                    
                    <div className="bg-slate-600/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">🔄 Loading de Transição</h4>
                      <p className="text-gray-300 text-sm">
                        Para transições entre páginas e operações assíncronas
                      </p>
                      <Button 
                        onClick={handlePageLoadingDemo}
                        size="sm"
                        className="mt-2 bg-orange-500 hover:bg-orange-600"
                      >
                        Testar
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">📋 Funcionalidades Implementadas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>• LoadingSpinner com logo e efeitos</div>
                      <div>• Loading components (spinner, dots, pulse)</div>
                      <div>• ButtonLoading para operações assíncronas</div>
                      <div>• Sistema global via Context</div>
                      <div>• Hook useGlobalLoading</div>
                      <div>• Integração em todas as páginas</div>
                      <div>• Loading de autenticação</div>
                      <div>• Loading de dados do Supabase</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoadingDemo; 