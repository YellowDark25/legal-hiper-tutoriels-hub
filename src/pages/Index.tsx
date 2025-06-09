
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800 text-neutral-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Centro de Tutoriais
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-neutral-100 animate-fade-in">
              Aprenda a usar os sistemas PDVLegal e Hiper com nossos vídeos tutoriais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pdvlegal"
                className="bg-secondary hover:bg-secondary-600 text-neutral-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg animate-scale-in"
              >
                Ver Tutoriais PDVLegal
              </Link>
              <Link
                to="/hiper"
                className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg animate-scale-in"
              >
                Ver Tutoriais Hiper
              </Link>
            </div>
          </div>
        </section>

        {/* Systems Overview */}
        <section className="py-16 bg-neutral-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-900">
              Nossos Sistemas
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* PDVLegal Card */}
              <div className="bg-neutral-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-primary-200 animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop"
                  alt="PDVLegal"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-primary-900">PDVLegal</h3>
                  <p className="text-primary-700 mb-6">
                    Sistema completo de Ponto de Venda (PDV) desenvolvido especialmente para 
                    estabelecimentos comerciais que precisam de agilidade e confiabilidade 
                    nas vendas diárias.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                      Controle de vendas e estoque
                    </div>
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                      Emissão de cupons fiscais
                    </div>
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                      Relatórios gerenciais
                    </div>
                  </div>
                  <Link
                    to="/pdvlegal"
                    className="inline-block bg-primary-800 hover:bg-primary-900 text-neutral-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Acessar Tutoriais
                  </Link>
                </div>
              </div>

              {/* Hiper Card */}
              <div className="bg-neutral-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-primary-200 animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop"
                  alt="Sistema Hiper"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-primary-900">Hiper</h3>
                  <p className="text-primary-700 mb-6">
                    Sistema integrado de gestão empresarial que oferece controle total 
                    sobre todos os aspectos do seu negócio, desde vendas até gestão 
                    financeira e administrativa.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                      Gestão completa de estoque
                    </div>
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                      Módulo financeiro avançado
                    </div>
                    <div className="flex items-center text-sm text-primary-600">
                      <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                      Integração com e-commerce
                    </div>
                  </div>
                  <Link
                    to="/hiper"
                    className="inline-block bg-primary-800 hover:bg-primary-900 text-neutral-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Acessar Tutoriais
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-900">
              Por que escolher nossos tutoriais?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-neutral-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Passo a Passo</h3>
                <p className="text-primary-700">
                  Tutoriais detalhados com explicações claras e objetivas
                </p>
              </div>
              
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-primary-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Vídeos HD</h3>
                <p className="text-primary-700">
                  Conteúdo em alta qualidade para melhor visualização
                </p>
              </div>
              
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-neutral-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Atualizado</h3>
                <p className="text-primary-700">
                  Conteúdo sempre atualizado com as últimas versões
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
