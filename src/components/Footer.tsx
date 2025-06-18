import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-neutral-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PDVLegal Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-500">PDVLegal</h3>
            <p className="text-neutral-200 mb-4">
              Sistema completo de PDV para estabelecimentos comerciais.
            </p>
            <a
              href="https://nexsyn.com.br/pdvlegal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary-400 transition-colors font-medium"
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Hiper Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-500">Hiper</h3>
            <p className="text-neutral-200 mb-4">
              Sistema integrado de gestão empresarial completo.
            </p>
            <a
              href="https://nexsyn.com.br/hiper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary-400 transition-colors font-medium"
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-500">Contato</h3>
            <div className="space-y-2 text-neutral-200">
              <p>📧 suporte@nexsyn.com.br</p>
              <p>📞 (65) 9229-8724</p>
              <p>🕒 Segunda a Sexta: 8h às 23h</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center relative">
          <p className="text-neutral-300">
            © 2024 Nexsyn Soluções Inteligentes. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
