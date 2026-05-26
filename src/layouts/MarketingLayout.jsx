import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shirt, Menu, X, ArrowRight } from 'lucide-react';

export const MarketingLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Background glow effects contained to avoid layout overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="bg-glow-sphere w-[500px] h-[500px] bg-indigo-500 top-[-250px] left-[-200px] absolute animate-pulse-slow"></div>
        <div className="bg-glow-sphere w-[600px] h-[600px] bg-purple-500 bottom-[-300px] right-[-200px] absolute animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Shirt className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              ClosetPro <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>

          {/* Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              className="glow-btn inline-flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10"
            >
              Comenzar Gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-slate-950/90 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-300 hover:text-white py-2"
            >
              Características
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-300 hover:text-white py-2"
            >
              Precios
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-300 hover:text-white py-2"
            >
              Preguntas Frecuentes
            </a>
            <div className="pt-4 flex flex-col gap-3">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-slate-300 font-medium hover:text-white"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 border border-white/10 rounded-xl text-indigo-400">
              <Shirt className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg text-white">ClosetPro AI</span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} ClosetPro AI. Todos los derechos reservados. Gestión inteligente de inventario para tiendas de moda.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
