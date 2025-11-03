import { Github, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-2">AI Insurance Claims</h3>
            <p className="text-gray-600 text-sm">
              Intelligent claim analysis using large language models for faster, more accurate insurance processing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/upload" className="hover:text-secondary transition-colors">Upload Document</a></li>
              <li><a href="/query" className="hover:text-secondary transition-colors">Ask AI</a></li>
              <li><a href="/documents" className="hover:text-secondary transition-colors">View Documents</a></li>
              <li><a href="/insights" className="hover:text-secondary transition-colors">Analytics</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-secondary transition-colors"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-gray-600 hover:text-secondary transition-colors"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} AI Insurance Claims. Built with React & AI.</p>
        </div>
      </div>
    </footer>
  );
};
