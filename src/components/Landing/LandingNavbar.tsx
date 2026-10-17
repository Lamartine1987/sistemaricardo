import React, { useState } from 'react';
import { Box, ArrowRight, Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  onEnterApp: () => void;
  onOpenAuthModal: () => void;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  onLogout?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onEnterApp,
  onOpenAuthModal,
  firebaseUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Casos Clínicos', href: '#casos-clinicos' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Cursos', href: '#cursos' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Sobre Dr. Ricardo', href: '#sobre' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full max-w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-cyan-200 shadow-2xs group-hover:scale-105 transition-transform bg-[#0c3960] flex items-center justify-center flex-shrink-0">
            <img 
              src="/logo-square.png" 
              alt="Logo Implant Precision" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center">
                Implant <span className="text-cyan-600 ml-1">Precision</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider font-bold">
                3D OS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">
              Por Dr. Ricardo Campos
            </p>
          </div>
        </div>

        {/* Links Centrais de Navegação (Desktop) */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-cyan-700 transition-colors py-1 relative group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Ações / Entrar na Plataforma */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
          {firebaseUser ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-slate-700 truncate max-w-[130px]" title={firebaseUser.email || ''}>
                  {firebaseUser.displayName || firebaseUser.email}
                </span>
                {onLogout && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    title="Desconectar conta"
                    className="text-slate-400 hover:text-rose-500 p-0.5 ml-1 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={onEnterApp}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md flex items-center space-x-1 sm:space-x-1.5 active:scale-[0.98] cursor-pointer flex-shrink-0"
              >
                <span className="hidden sm:inline">Painel / Sistema</span>
                <span className="sm:hidden">Painel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md flex items-center space-x-1 sm:space-x-1.5 active:scale-[0.98] cursor-pointer flex-shrink-0"
            >
              <span className="hidden sm:inline">Acessar Plataforma</span>
              <span className="sm:hidden">Entrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Botão Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Abrir Menu de Navegação"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-700" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menu Mobile Retrátil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl animate-fade-in text-sm shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block px-3 py-2.5 rounded-xl text-slate-700 hover:text-cyan-700 hover:bg-slate-50 font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          {firebaseUser && onLogout && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-3">
              <span className="text-slate-500 truncate">{firebaseUser.displayName || firebaseUser.email}</span>
              <button
                onClick={onLogout}
                className="text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
