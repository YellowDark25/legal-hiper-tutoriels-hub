
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PDVLegal Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-300">PDVLegal</h3>
            <p className="text-gray-300 mb-4">
              Sistema completo de PDV para estabelecimentos comerciais.
            </p>
            <a
              href="https://www.webautomacao.com.br/site/produtos/pdv-legal/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary-300 transition-colors"
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Hiper Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-300">Hiper</h3>
            <p className="text-gray-300 mb-4">
              Sistema integrado de gestão empresarial completo.
            </p>
            <a
              href="https://hiper.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary-300 transition-colors"
            >
              Visite o site oficial →
            </a>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-300">Contato</h3>
            <div className="space-y-2 text-gray-300">
              <p>📧 suporte@webautomacao.com.br</p>
              <p>📞 (11) 1234-5678</p>
              <p>🕒 Segunda a Sexta: 8h às 18h</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Web Automação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
