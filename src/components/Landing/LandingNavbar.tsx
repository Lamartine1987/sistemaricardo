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
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cyber-bg/75 backdrop-blur-xl border-b border-cyber-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-indigo-600 flex items-center justify-center text-black shadow-glow-cyan group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-white flex items-center">
                Implant <span className="text-cyber-cyan ml-1">Precision</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 uppercase tracking-wider font-semibold">
                3D OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Por Dr. Ricardo Campos
            </p>
          </div>
        </div>

        {/* Links Centrais de Navegação (Desktop) */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-mono text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-cyber-cyan transition-colors py-1 relative group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-cyan transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Ações / Entrar na Plataforma */}
        <div className="flex items-center space-x-3">
          {firebaseUser ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyber-surface border border-cyber-cyan/30 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span className="text-slate-200 truncate max-w-[130px]" title={firebaseUser.email || ''}>
                  {firebaseUser.displayName || firebaseUser.email}
                </span>
                {onLogout && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    title="Desconectar conta"
                    className="text-slate-400 hover:text-red-400 p-0.5 ml-1 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={onEnterApp}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs font-mono transition-all shadow-glow-cyan flex items-center space-x-2 active:scale-[0.98]"
              >
                <span>Painel / Sistema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs font-mono transition-all shadow-glow-cyan flex items-center space-x-2 active:scale-[0.98]"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Botão Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl glass-panel border border-cyber-border text-slate-300 hover:text-white transition-colors"
            aria-label="Abrir Menu de Navegação"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyber-cyan" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menu Mobile Retrátil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cyber-bg/95 border-b border-cyber-border/80 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl animate-fade-in font-mono text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block px-3 py-2.5 rounded-xl text-slate-300 hover:text-cyber-cyan hover:bg-cyber-surface/60 transition-colors"
            >
              {link.label}
            </a>
          ))}
          {firebaseUser && onLogout && (
            <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between text-xs px-3">
              <span className="text-slate-400 truncate">{firebaseUser.displayName || firebaseUser.email}</span>
              <button
                onClick={onLogout}
                className="text-rose-400 hover:underline"
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
