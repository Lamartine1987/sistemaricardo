import React from 'react';
import { Box, ArrowRight, LogIn, Flame, Sparkles } from 'lucide-react';

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
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cyber-bg/70 backdrop-blur-xl border-b border-cyber-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-indigo-600 flex items-center justify-center text-black shadow-glow-cyan">
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

        {/* Links Centrais de Navegação Rápida */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-slate-300">
          <a href="#tecnologia" className="hover:text-cyber-cyan transition-colors">Tecnologia</a>
          <a href="#cirurgia-guiada" className="hover:text-cyber-cyan transition-colors">Cirurgia Guiada</a>
          <a href="#pay-to-unlock" className="hover:text-cyber-cyan transition-colors">Pay-to-Unlock</a>
          <a href="#sobre" className="hover:text-cyber-cyan transition-colors">Sobre o Dr. Ricardo</a>
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
        </div>

      </div>
    </nav>
  );
};
