import React, { useState, useEffect } from 'react';
import { ImplantScrollCanvas } from './ImplantScrollCanvas';
import { LandingNavbar } from './LandingNavbar';
import { 
  SiteContentConfig 
} from '../../types/siteContent';
import { 
  getStoredSiteContent 
} from '../../services/site/siteContentService';
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
  Sliders,
  GraduationCap,
  Star,
  Quote,
  Stethoscope,
  Award,
  Phone,
  Calendar,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuthModal: () => void;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  onLogout?: () => void;
  siteContent?: SiteContentConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuthModal,
  firebaseUser,
  onLogout,
  siteContent
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [localContent, setLocalContent] = useState<SiteContentConfig>(() => getStoredSiteContent());

  // Listener para atualizações instantâneas de conteúdo (mesma aba ou abas sincronizadas)
  useEffect(() => {
    const handleImmediateUpdate = (e: any) => {
      if (e.detail) {
        setLocalContent(e.detail);
      } else {
        setLocalContent(getStoredSiteContent());
      }
    };

    window.addEventListener('implantprecision_site_updated', handleImmediateUpdate);
    window.addEventListener('storage', handleImmediateUpdate);

    return () => {
      window.removeEventListener('implantprecision_site_updated', handleImmediateUpdate);
      window.removeEventListener('storage', handleImmediateUpdate);
    };
  }, []);

  // O conteúdo renderizado é prioritariamente o fornecido pelo App ou o recuperado do cache local
  const content = siteContent || localContent;

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

  // Helper para renderizar ícone do serviço
  const renderServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'cpu':
        return <Cpu className="w-6 h-6 text-cyber-cyan" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'lock':
        return <Lock className="w-6 h-6 text-amber-400" />;
      case 'user':
        return <UserCheck className="w-6 h-6 text-indigo-400" />;
      case 'layers':
        return <Layers className="w-6 h-6 text-cyan-400" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-fuchsia-400" />;
      default:
        return <Cpu className="w-6 h-6 text-cyber-cyan" />;
    }
  };

  const cleanWhatsAppNumber = content.about.whatsappNumber.replace(/\D/g, '') || '81999694866';

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

        {/* 🚀 SEÇÃO 1: HERO */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto pt-24 pb-16">
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
              Desenvolvido pelo <strong className="text-white">{content.about.name}</strong> para cirurgiões-dentistas de alta performance. Envie o escaneamento oral do paciente, receba o projeto 3D milimétrico, inspecione no navegador e libere as guias cirúrgicas instantaneamente.
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
                href="#casos-clinicos"
                className="px-5 py-3.5 rounded-2xl glass-panel border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-cyan/40 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4 text-cyber-cyan" />
                <span>Ver Casos Clínicos</span>
              </a>
            </div>

            {/* Dica de Scroll */}
            <div className="pt-8 flex items-center space-x-3 text-xs font-mono text-slate-500 animate-bounce">
              <ChevronDown className="w-4 h-4 text-cyber-cyan" />
              <span>Role a página para explorar casos, serviços e a telemetria 3D</span>
            </div>

          </div>
        </section>

        {/* 🔬 SEÇÃO 2: CASOS CLÍNICOS (Alimentado dinamicamente) */}
        <section id="casos-clinicos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>EXPERIÊNCIA & CASOS REAIS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Casos Clínicos de Alta Complexidade
            </h2>
            <p className="text-sm text-slate-300">
              Da tomografia Cone Beam tridimensional à execução cirúrgica guiada com precisão sub-milimétrica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.cases.filter(c => c.active).map((c) => (
              <div 
                key={c.id}
                className="p-6 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-4 shadow-xl hover:border-cyber-cyan/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Imagem do Caso se cadastrada */}
                  {c.imageUrl && (
                    <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-cyber-border/80 mb-3 relative group">
                      <img 
                        src={c.imageUrl} 
                        alt={c.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 font-semibold">
                      {c.badge}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {c.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-cyber-border/70 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{c.metric1Label}</span>
                    <span className="text-cyber-cyan font-bold">{c.metric1Value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{c.metric2Label}</span>
                    <span className="text-emerald-400 font-bold">{c.metric2Value}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* 🛠️ SEÇÃO 3: SERVIÇOS (Alimentado dinamicamente) */}
        <section id="servicos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <Layers className="w-3.5 h-3.5" />
              <span>SOLUÇÕES COMPLETAS CAD/CAM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Serviços Odontológicos Digitais
            </h2>
            <p className="text-sm text-slate-300">
              Fluxo cirúrgico digital integrado: você envia os exames do paciente e o Dr. Ricardo entrega o projeto validado pronto para fresagem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.services.filter(s => s.active).map((s) => (
              <div 
                key={s.id}
                className="p-7 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-4 shadow-xl flex flex-col justify-between hover:border-cyber-cyan/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-surface border border-cyber-border flex items-center justify-center">
                    {renderServiceIcon(s.iconType)}
                  </div>
                  <h3 className="text-xl font-bold text-white">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-cyber-border/70">
                  {s.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-1 rounded bg-cyber-surface border border-cyber-border text-slate-300">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🎓 SEÇÃO 4: CURSOS (Alimentado dinamicamente) */}
        <section id="cursos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>FORMAÇÃO & MENTORIA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Cursos e Capacitações com {content.about.name}
            </h2>
            <p className="text-sm text-slate-300">
              Aprenda a metodologia clínica comprovada para dominar a cirurgia guiada e transformar a previsibilidade dos seus procedimentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.courses.filter(c => c.active).map((c) => (
              <div 
                key={c.id}
                className="p-7 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-5 shadow-xl flex flex-col justify-between hover:border-cyber-cyan/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 font-semibold">
                      {c.format}
                    </span>
                    <span className="text-slate-400">{c.badge}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {c.description}
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-slate-300">
                    {c.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`https://wa.me/55${cleanWhatsAppNumber}?text=${encodeURIComponent(c.whatsappMessage || 'Olá Dr. Ricardo! Quero saber sobre o curso.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-cyber-surface border border-cyber-cyan/30 hover:bg-cyber-cyan/15 text-cyber-cyan text-xs font-mono font-semibold text-center transition-all block mt-4"
                >
                  {c.ctaText || 'Consultar Vagas no WhatsApp'}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 💬 SEÇÃO 5: DEPOIMENTOS (Alimentado dinamicamente) */}
        <section id="depoimentos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <Quote className="w-3.5 h-3.5" />
              <span>AVALIAÇÕES & PARCEIROS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              O Que Dizem os Cirurgiões-Dentistas
            </h2>
            <p className="text-sm text-slate-300">
              Profissionais que elevaram o padrão cirúrgico de seus consultórios com o suporte do {content.about.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.testimonials.filter(t => t.active).map((t) => (
              <div 
                key={t.id}
                className="p-7 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 backdrop-blur-2xl space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-cyber-border/70 flex items-center space-x-3">
                  {t.avatarUrl ? (
                    <img 
                      src={t.avatarUrl} 
                      alt={t.dentistName} 
                      className="w-10 h-10 rounded-full object-cover border border-cyber-cyan/40" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {t.initials || 'DR'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.dentistName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{t.role} • {t.cityState}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🏆 SEÇÃO 6: SOBRE DR. RICARDO (Alimentado dinamicamente) */}
        <section id="sobre" className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 max-w-5xl mx-auto py-24 scroll-mt-20">
          
          <div className="w-full p-8 sm:p-12 rounded-3xl glass-panel-glow border border-cyber-cyan/40 bg-cyber-card/90 backdrop-blur-2xl space-y-8 shadow-glow-cyan">
            
            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
              {/* Avatar / Destaque Dr. Ricardo */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-indigo-600 p-1 shadow-glow-cyan">
                    <div className="w-full h-full rounded-[22px] bg-cyber-bg flex items-center justify-center overflow-hidden">
                      {content.about.photoUrl ? (
                        <img 
                          src={content.about.photoUrl} 
                          alt={content.about.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Stethoscope className="w-16 h-16 text-cyber-cyan stroke-[1.5]" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-emerald-500 text-black text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                    <Award className="w-3 h-3" />
                    <span>{content.about.specialtyBadge || 'ESPECIALISTA'}</span>
                  </div>
                </div>
              </div>

              {/* Texto Bio */}
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
                  <span>{content.about.badge || 'RESPONSÁVEL TÉCNICO'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {content.about.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {content.about.bio}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-center">
                    <span className="text-base font-bold text-cyber-cyan font-mono block">
                      {content.about.stat1Value}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {content.about.stat1Label}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-center">
                    <span className="text-base font-bold text-emerald-400 font-mono block">
                      {content.about.stat2Value}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {content.about.stat2Label}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-center col-span-2 sm:col-span-1">
                    <span className="text-base font-bold text-amber-400 font-mono block">
                      {content.about.stat3Value}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {content.about.stat3Label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box de Ação */}
            <div className="pt-6 border-t border-cyber-border/70 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-sm font-mono transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>{firebaseUser ? 'Acessar Painel do Sistema' : 'Acessar Plataforma & Enviar Caso'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/55${cleanWhatsAppNumber}?text=${encodeURIComponent(content.about.whatsappMessage || 'Olá Dr. Ricardo! Acessei o site e gostaria de falar com você.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel border border-cyber-border text-slate-200 hover:text-white hover:border-cyber-cyan/40 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Falar no WhatsApp com {content.about.name}</span>
              </a>
            </div>

            <div className="flex items-center justify-center space-x-4 text-[11px] font-mono text-slate-400 text-center">
              <span>{content.about.name} • {content.about.cro}</span>
              <span>•</span>
              <span className="text-cyber-cyan">Implant Precision 3D</span>
            </div>

          </div>

        </section>

        {/* 🦶 Footer Institucional */}
        <footer className="border-t border-cyber-border py-8 bg-cyber-surface/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Implant Precision 3D</span>
              <span>•</span>
              <span>Planejamento & Cirurgia Guiada de Alta Precisão</span>
            </div>
            <div>
              <span>Por {content.about.name} • Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};
