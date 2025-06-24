import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const Contato: React.FC = () => {
  const { isAdmin, userSystem } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gray-900 dark:bg-gray-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Entre em Contato
            </h1>
            <p className="text-xl text-gray-300 dark:text-gray-400">
              Estamos aqui para ajudar você com nossos sistemas
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                  Informações de Contato
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">suporte@nexsyn.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Telefone</h3>
                      <p className="text-gray-600 dark:text-gray-300">(65) 9229-8724</p>
                      <p className="text-gray-600 dark:text-gray-300">(65) 9293-4536</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Horário de Atendimento</h3>
                      <p className="text-gray-600 dark:text-gray-300">Segunda a Sexta: 8h às 23h</p>
                      <p className="text-gray-600 dark:text-gray-300">Sábado: 8h às 23h</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Endereço</h3>
                      <p className="text-gray-600 dark:text-gray-300">Av. Hitler Sansão</p>
                      <p className="text-gray-600 dark:text-gray-300">Centro - Barra</p>
                      <p className="text-gray-600 dark:text-gray-300">CEP: 01234-567</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                  Nossos Produtos
                </h2>
                
                <div className="space-y-6">
                  {/* PDVLegal - Mostrar se admin ou usuário PDVLegal ou não tem sistema */}
                  {(isAdmin || userSystem === 'pdvlegal' || !userSystem) && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mr-3 p-2">
                        <img 
                          src="/pdv-legal-BLWLrCAG.png" 
                          alt="PDVLegal Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">PDVLegal</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Sistema de PDV completo para estabelecimentos comerciais
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://nexsyn.com.br/pdvlegal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        → Site oficial do PDVLegal
                      </a>
                        <a
                          href="/pdvlegal"
                          className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                          → Ver tutoriais do PDVLegal
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Hiper - Mostrar se admin ou usuário Hiper ou não tem sistema */}
                  {(isAdmin || userSystem === 'hiper' || !userSystem) && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center mr-3 p-2">
                        <img 
                          src="/hiper-logo-D4juEd9-.png" 
                          alt="Hiper Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">Sistema Hiper</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Sistema integrado de gestão empresarial
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://nexsyn.com.br/hiper"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        → Site oficial do Hiper
                      </a>
                        <a
                          href="/hiper"
                          className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                          → Ver tutoriais do Hiper
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* FAQ */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Perguntas Frequentes
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Como acesso os tutoriais?</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Navegue pelas páginas PDVLegal ou Hiper no menu principal e clique nos vídeos que deseja assistir.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Os tutoriais são gratuitos?</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Sim, todos os tutoriais estão disponíveis gratuitamente para clientes dos sistemas.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Como solicito suporte técnico?</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Entre em contato pelos telefones ou emails informados acima durante nosso horário de atendimento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;
