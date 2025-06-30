import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-100 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* PDVLegal Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4" style={{ color: '#3B82F6' }}>PDVLegal</h3>
            <p className="text-sm md:text-base text-gray-300 dark:text-gray-400 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
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
            <h3 className="text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4" style={{ color: '#7C3AED' }}>Hiper</h3>
            <p className="text-sm md:text-base text-gray-300 dark:text-gray-400 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
              Sistema integrado de gestão empresarial completo.
            </p>
            <a
              href="https://nexsyn.com.br/hiper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm md:text-base font-medium hover:opacity-80 transition-opacity duration-200 touch-target"
              style={{ color: '#7C3AED' }}
            >
              Visite o site oficial 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* NexSyn Section */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">NexSyn</h3>
            <p className="text-sm md:text-base text-gray-300 dark:text-gray-400 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
              Empresa especializada em soluções tecnológicas para gestão empresarial.
            </p>
            <a
              href="https://nexsyn.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm md:text-base font-medium text-orange-400 hover:text-orange-300 transition-colors duration-200 touch-target"
            >
              Conheça a NexSyn 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
            © 2024 NexSyn. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
