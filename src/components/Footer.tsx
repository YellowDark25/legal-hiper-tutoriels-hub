import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-100 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PDVLegal Section */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3B82F6' }}>PDVLegal</h3>
            <p className="text-gray-300 dark:text-gray-400 mb-4">
              Sistema completo de PDV para estabelecimentos comerciais.
            </p>
            <a
              href="https://nexsyn.com.br/pdvlegal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#3B82F6' }}
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Hiper Section */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#A855F7' }}>Hiper</h3>
            <p className="text-gray-300 dark:text-gray-400 mb-4">
              Sistema integrado de gestão empresarial completo.
            </p>
            <a
              href="https://nexsyn.com.br/hiper"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#A855F7' }}
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-200 dark:text-gray-100">Contato</h3>
            <div className="space-y-2 text-gray-300 dark:text-gray-400">
              <p>📧 suporte@nexsyn.com.br</p>
              <p>📞 (65) 9229-8724</p>
              <p>🕒 Segunda a Sexta: 8h às 23h</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">
            © 2024 Nexsyn Soluções Inteligentes. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
