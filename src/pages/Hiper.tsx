import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HiperModules from '../components/HiperModules';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Hiper: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, userSystem, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Verificar acesso à página
  useEffect(() => {
    if (!authLoading && !isAdmin && userSystem && userSystem !== 'hiper') {
      toast({
        title: 'Acesso Negado',
        description: 'Você só pode acessar tutoriais do seu sistema.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, userSystem, authLoading, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 transition-colors duration-200">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section 
          className="relative py-16 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)'
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
                    src="/hiper-logo-D4juEd9-.png" 
                    alt="Hiper Logo" 
                    className="w-12 h-12 object-contain animate-bounce-slow"
                    onError={(e) => {
                      console.error('Erro ao carregar logo Hiper:', e);
                      e.currentTarget.style.display = 'none';
                      const fallbackIcon = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallbackIcon) {
                        (fallbackIcon as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                  {/* Fallback Icon */}
                  <svg 
                    className="fallback-icon w-12 h-12 text-white hidden" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Hiper
                  </h1>
                  <p className="text-xl md:text-2xl text-purple-100 font-light">
                    Sistema Completo de Gestão
                  </p>
                </div>
              </div>
              
              {/* Descrição */}
              <p className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
                Domine todas as funcionalidades do sistema Hiper com nossos tutoriais organizados por módulos especializados. 
                Aprenda desde configurações básicas até recursos avançados de gestão empresarial.
              </p>
            </div>
          </div>
        </section>

        {/* Módulos do Hiper */}
        <section className="py-12 bg-slate-900">
          <div className="container mx-auto px-4">
            <HiperModules />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Hiper;
