import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-100 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* PDVLegal Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: '#3B82F6' }}>PDVLegal</h3>
            <p className="text-sm md:text-base text-gray-300 dark:text-gray-400 mb-3 md:mb-4 leading-relaxed">
              Sistema completo de PDV para estabelecimentos comerciais.
            </p>
            <a
              href="https://nexsyn.com.br/pdvlegal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm md:text-base font-medium hover:opacity-80 transition-opacity duration-200 touch-target"
              style={{ color: '#3B82F6' }}
            >
              Visite o site oficial 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Hiper Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: '#A855F7' }}>Hiper</h3>
            <p className="text-sm md:text-base text-gray-300 dark:text-gray-400 mb-3 md:mb-4 leading-relaxed">
              Sistema integrado de gestão empresarial completo.
            </p>
            <a
              href="https://nexsyn.com.br/hiper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm md:text-base font-medium hover:opacity-80 transition-opacity duration-200 touch-target"
              style={{ color: '#A855F7' }}
            >
              Visite o site oficial 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-200 dark:text-gray-100">Contato</h3>
            <div className="space-y-2 text-sm md:text-base text-gray-300 dark:text-gray-400">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg">📧</span>
                <a href="mailto:suporte@nexsyn.com.br" className="hover:text-white transition-colors touch-target">
                  suporte@nexsyn.com.br
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg">📞</span>
                <a href="tel:+5565992298724" className="hover:text-white transition-colors touch-target">
                  (65) 9229-8724
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg">🕒</span>
                <span>Segunda a Sexta: 8h às 23h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
            © 2024 Nexsyn Soluções Inteligentes. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
