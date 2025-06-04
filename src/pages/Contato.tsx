
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Entre em Contato
            </h1>
            <p className="text-xl text-accent-200 animate-fade-in">
              Estamos aqui para ajudar você com nossos sistemas
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-8 text-neutral-900">
                  Informações de Contato
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">suporte@webautomacao.com.br</p>
                      <p className="text-gray-600">vendas@webautomacao.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Telefone</h3>
                      <p className="text-gray-600">(11) 1234-5678</p>
                      <p className="text-gray-600">(11) 9876-5432</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Horário de Atendimento</h3>
                      <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-gray-600">Sábado: 8h às 12h</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Endereço</h3>
                      <p className="text-gray-600">Rua das Empresas, 123</p>
                      <p className="text-gray-600">Centro - São Paulo/SP</p>
                      <p className="text-gray-600">CEP: 01234-567</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Links */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-8 text-neutral-900">
                  Nossos Produtos
                </h2>
                
                <div className="space-y-6">
                  {/* PDVLegal */}
                  <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-primary">
                    <h3 className="text-xl font-bold mb-3 text-primary">PDVLegal</h3>
                    <p className="text-gray-600 mb-4">
                      Sistema de PDV completo para estabelecimentos comerciais
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://www.webautomacao.com.br/site/produtos/pdv-legal/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:text-primary-600 transition-colors"
                      >
                        → Site oficial do PDVLegal
                      </a>
                      <a
                        href="/pdvlegal"
                        className="block text-secondary hover:text-secondary-600 transition-colors"
                      >
                        → Ver tutoriais do PDVLegal
                      </a>
                    </div>
                  </div>

                  {/* Hiper */}
                  <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-secondary">
                    <h3 className="text-xl font-bold mb-3 text-secondary">Sistema Hiper</h3>
                    <p className="text-gray-600 mb-4">
                      Sistema integrado de gestão empresarial
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://hiper.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:text-primary-600 transition-colors"
                      >
                        → Site oficial do Hiper
                      </a>
                      <a
                        href="/hiper"
                        className="block text-secondary hover:text-secondary-600 transition-colors"
                      >
                        → Ver tutoriais do Hiper
                      </a>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-6 text-neutral-900">
                    Perguntas Frequentes
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Como acesso os tutoriais?</h4>
                      <p className="text-gray-600 text-sm">
                        Navegue pelas páginas PDVLegal ou Hiper no menu principal e clique nos vídeos que deseja assistir.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Os tutoriais são gratuitos?</h4>
                      <p className="text-gray-600 text-sm">
                        Sim, todos os tutoriais estão disponíveis gratuitamente para clientes dos sistemas.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Como solicito suporte técnico?</h4>
                      <p className="text-gray-600 text-sm">
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
