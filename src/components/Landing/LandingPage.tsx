import React, { useState, useEffect } from 'react';
import { ImplantScrollCanvas } from './ImplantScrollCanvas';
import { LandingNavbar } from './LandingNavbar';
import { 
  ArrowRight, 
  Box, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Activity, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ChevronDown,
  Cpu,
  Eye,
  Sliders
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuthModal: () => void;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuthModal,
  firebaseUser,
  onLogout
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calcular progresso do scroll de 0 a 1 em tempo real
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const current = window.scrollY / totalScroll;
      setScrollProgress(Math.min(Math.max(current, 0), 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-cyber-bg text-slate-100 font-sans selection:bg-cyber-cyan selection:text-black overflow-x-hidden">
      
      {/* 🌟 WebGL 3D Canvas Fixo no Fundo (O Parafuso Gigante & Leito Ósseo) */}
      <ImplantScrollCanvas scrollProgress={scrollProgress} />

      {/* 🧭 Barra de Navegação */}
      <LandingNavbar 
        onEnterApp={onEnterApp} 
        onOpenAuthModal={onOpenAuthModal} 
        firebaseUser={firebaseUser}
        onLogout={onLogout}
      />

      {/* 📊 HUD Lateral Indicador de Telemetria Cirúrgica */}
      <div className="fixed right-6 bottom-8 z-30 hidden lg:flex flex-col items-end space-y-2 pointer-events-none">
        <div className="p-3 rounded-2xl glass-panel-glow border border-cyber-border text-right backdrop-blur-md">
          <div className="flex items-center space-x-2 justify-end mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
            <span className="text-[10px] font-mono text-cyber-cyan font-bold tracking-wider">
              TELEMETRIA 3D ATIVA
            </span>
          </div>
          <div className="text-xs font-mono text-white">
            Profundidade: <span className="text-cyber-cyan font-bold">{(scrollProgress * 11.5).toFixed(1)} mm</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Torque: <span className="text-emerald-400 font-bold">{Math.round(scrollProgress * 45)} N.cm</span>
          </div>
          <div className="w-28 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-75"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 📜 CONTEÚDO NARRATIVO SCROLLYTELLING (Posicionado sobre o 3D) */}
      <div className="relative z-10">

        {/* 🚀 SEÇÃO 1: HERO (Scroll 0%) */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto pt-20">
          <div className="max-w-2xl space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLANEJAMENTO CIRÚRGICO ODONTOLÓGICO 3D</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              A Nova Dimensão da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-blue-400 to-indigo-400">
                Implantodontia Digital.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Desenvolvido pelo <strong className="text-white">Dr. Ricardo Campos</strong> para cirurgiões-dentistas de alta performance. Envie o escaneamento oral do paciente, receba o projeto 3D milimétrico, inspecione no navegador e libere as guias cirúrgicas instantaneamente.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-sm font-mono transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>{firebaseUser ? 'Painel / Sistema' : 'Acessar Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#tecnologia"
                className="px-5 py-3.5 rounded-2xl glass-panel border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-cyan/40 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4 text-cyber-cyan" />
                <span>Explorar Tecnologia</span>
              </a>
            </div>

            {/* Dica de Scroll */}
            <div className="pt-8 flex items-center space-x-3 text-xs font-mono text-slate-500 animate-bounce">
              <ChevronDown className="w-4 h-4 text-cyber-cyan" />
              <span>Role a página para iniciar o assentamento do implante 3D</span>
            </div>

          </div>
        </section>

        {/* 🔬 SEÇÃO 2: ENGENHARIA CAD & PRECISÃO (Scroll ~ 25%) */}
        <section id="tecnologia" className="min-h-screen flex items-center px-4 sm:px-8 max-w-7xl mx-auto py-24">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Card Esquerdo Flutuante */}
            <div className="p-8 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-6 shadow-2xl max-w-xl">
              <div className="p-3 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan w-fit">
                <Cpu className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-cyber-cyan uppercase tracking-wider font-semibold">
                  01 // Precisão Sub-Milimétrica
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Alinhamento Protético Guiado por Tomografia
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  O Dr. Ricardo correlaciona o escaneamento intraoral com a tomografia Cone Beam (DICOM). O implante é posicionado respeitando a tábua óssea vestibular, o canal mandibular e a futura coroa protética.
                </p>
              </div>

              {/* Grid de Especificações Médicas */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-cyber-surface/90 border border-cyber-border">
                  <span className="text-[10px] font-mono text-slate-400 block">Torque Alvo</span>
                  <span className="text-lg font-bold font-mono text-cyber-cyan">45 N.cm</span>
                </div>
                <div className="p-3 rounded-xl bg-cyber-surface/90 border border-cyber-border">
                  <span className="text-[10px] font-mono text-slate-400 block">Tolerância de Fresagem</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">± 0.08 mm</span>
                </div>
              </div>
            </div>

            {/* Espaço Vazio na Direita para o Implante 3D brilhar */}
            <div className="hidden lg:block" />

          </div>
        </section>

        {/* 🔩 SEÇÃO 3: FRESAGEM GUIADA & DESCIDA DO IMPLANTE (Scroll ~ 50%) */}
        <section id="cirurgia-guiada" className="min-h-screen flex items-center px-4 sm:px-8 max-w-7xl mx-auto py-24">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Espaço Vazio na Esquerda para o Implante 3D */}
            <div className="hidden lg:block" />

            {/* Card Direito Flutuante */}
            <div className="p-8 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-6 shadow-2xl max-w-xl">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
                <Layers className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  02 // Cirurgia Sem Incisão e Sem Pontos
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  A Guia Cirúrgica com Anilha Metálica Fixa
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Conforme você rola a página, observe o implante adentrando perfeitamente no alvéolo ósseo. A guia cirúrgica em resina biocompatível orienta a fresa sem desvios angulares, reduzindo o tempo de cirurgia de 60 para 15 minutos.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pós-operatório rápido com mínimo sangramento</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Arquivos STL exportados em alta resolução prontos para impressão 3D</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 💳 SEÇÃO 4: PROTOCOLO PAY-TO-UNLOCK (Scroll ~ 75%) */}
        <section id="pay-to-unlock" className="min-h-screen flex items-center px-4 sm:px-8 max-w-7xl mx-auto py-24">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Card Esquerdo: Solução de Pagamento Automático */}
            <div className="p-8 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-6 shadow-2xl max-w-xl">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  03 // Fim da Inadimplência & Cobrança Manual
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Protocolo Pay-to-Unlock: Visualização Livre, Liberação no PIX
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  O dentista parceiro abre a plataforma e gira a boca do paciente em 3D livremente para validar a técnica cirúrgica. Ao aprovar, o sistema gera o QR Code PIX dinâmico. Assim que liquidado pelo banco, os arquivos STL finais são liberados instantaneamente.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyber-surface/90 border border-cyber-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Tempo de Liquidação</span>
                  <span className="text-sm font-bold text-white">Instantâneo (2 segundos)</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% Automatizado
                </span>
              </div>
            </div>

            {/* Espaço Vazio na Direita */}
            <div className="hidden lg:block" />

          </div>
        </section>

        {/* 🏆 SEÇÃO 5: FINAL / CALL TO ACTION (Scroll 100%) */}
        <section id="sobre" className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 max-w-5xl mx-auto py-24 text-center">
          
          <div className="p-8 sm:p-12 rounded-3xl glass-panel-glow border border-cyber-cyan/40 bg-cyber-card/90 backdrop-blur-2xl space-y-6 max-w-3xl shadow-glow-cyan">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-indigo-600 flex items-center justify-center text-black shadow-glow-cyan">
              <Box className="w-8 h-8 fill-black stroke-black" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-cyber-cyan uppercase tracking-widest font-bold">
                IMPLANT PRECISION 3D • SISTEMA OPERACIONAL CIRÚRGICO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Pronto para Elevar o Nível dos Seus Casos?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Acesse agora o sistema para gerenciar planejamentos, inspecionar modelos 3D em tempo real e acompanhar cada paciente.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-sm font-mono transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>Entrar na Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel border border-cyber-border text-slate-200 hover:text-white hover:border-cyber-cyan/40 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
              >
                <span>Login com Google / E-mail</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-4 text-[11px] font-mono text-slate-400">
              <span>Dr. Ricardo Campos • Responsável Técnico</span>
              <span>•</span>
              <span className="text-cyber-cyan">Cloud Firestore Ativo</span>
            </div>

          </div>

        </section>

        {/* 🦶 Footer Institucional */}
        <footer className="border-t border-cyber-border py-8 bg-cyber-surface/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Implant Precision 3D</span>
              <span>•</span>
              <span>Tecnologia Odontológica de Alta Precisão</span>
            </div>
            <div>
              <span>Inspirado no design de classe mundial da Lusion.co</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};
