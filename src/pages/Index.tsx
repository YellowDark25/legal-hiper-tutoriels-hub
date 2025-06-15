
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-secondary rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-transparent leading-tight">
                Centro de Tutoriais
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-neutral-200 animate-fade-in max-w-3xl mx-auto leading-relaxed">
                Aprenda a usar os sistemas PDVLegal e Hiper com nossos vídeos tutoriais profissionais e atualizados
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/pdvlegal"
                  className="group bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/25 animate-scale-in transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-3">
                    Ver Tutoriais PDVLegal
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/hiper"
                  className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-primary-900 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-accent-500/25 animate-scale-in transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-3">
                    Ver Tutoriais Hiper
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Systems Overview */}
        <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-900 bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
                Nossos Sistemas
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Soluções completas para gestão empresarial com tecnologia de ponta
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* PDVLegal Card */}
              <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-neutral-100 animate-fade-in overflow-hidden hover:scale-105">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop"
                    alt="PDVLegal"
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      PDV Profissional
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-4 text-primary-900">PDVLegal</h3>
                  <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
                    Sistema completo de Ponto de Venda (PDV) desenvolvido especialmente para 
                    estabelecimentos comerciais que precisam de agilidade e confiabilidade 
                    nas vendas diárias.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      </div>
                      <span className="font-medium">Controle de vendas e estoque</span>
                    </div>
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      </div>
                      <span className="font-medium">Emissão de cupons fiscais</span>
                    </div>
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      </div>
                      <span className="font-medium">Relatórios gerenciais</span>
                    </div>
                  </div>
                  <Link
                    to="/pdvlegal"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-800 to-primary-900 hover:from-primary-900 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-800/25"
                  >
                    Acessar Tutoriais
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Hiper Card */}
              <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-neutral-100 animate-fade-in overflow-hidden hover:scale-105">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop"
                    alt="Sistema Hiper"
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent-500 text-primary-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Gestão Empresarial
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-4 text-primary-900">Hiper</h3>
                  <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
                    Sistema integrado de gestão empresarial que oferece controle total 
                    sobre todos os aspectos do seu negócio, desde vendas até gestão 
                    financeira e administrativa.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-accent-500/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      </div>
                      <span className="font-medium">Gestão completa de estoque</span>
                    </div>
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-accent-500/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      </div>
                      <span className="font-medium">Módulo financeiro avançado</span>
                    </div>
                    <div className="flex items-center text-neutral-700">
                      <div className="w-8 h-8 bg-accent-500/10 rounded-full flex items-center justify-center mr-4">
                        <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      </div>
                      <span className="font-medium">Integração com e-commerce</span>
                    </div>
                  </div>
                  <Link
                    to="/hiper"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-800 to-primary-900 hover:from-primary-900 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-800/25"
                  >
                    Acessar Tutoriais
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-900 bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
                Por que escolher nossos tutoriais?
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Experiência de aprendizado superior com conteúdo profissional
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="group text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:shadow-secondary/25 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary-900">Passo a Passo</h3>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Tutoriais detalhados com explicações claras e objetivas para máximo aproveitamento
                </p>
              </div>
              
              <div className="group text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:shadow-accent-500/25 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-10 h-10 text-primary-800" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary-900">Vídeos HD</h3>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Conteúdo em alta qualidade com resolução crystal clear para melhor visualização
                </p>
              </div>
              
              <div className="group text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:shadow-primary-700/25 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary-900">Sempre Atualizado</h3>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Conteúdo constantemente atualizado com as últimas versões e funcionalidades
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
