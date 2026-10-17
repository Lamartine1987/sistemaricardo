import React, { useState, useEffect } from 'react';
import { ImplantScrollCanvas } from './ImplantScrollCanvas';
import { LandingNavbar } from './LandingNavbar';
import { 
  SiteContentConfig,
  isCaseFieldVisible
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
  UserCheck,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuthModal: () => void;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  onLogout?: () => void;
  siteContent?: SiteContentConfig;
  onOpenCasesArchive?: (caseId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuthModal,
  firebaseUser,
  onLogout,
  siteContent,
  onOpenCasesArchive
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
        return <Cpu className="w-6 h-6 text-cyan-700" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
      case 'lock':
        return <Lock className="w-6 h-6 text-amber-600" />;
      case 'user':
        return <UserCheck className="w-6 h-6 text-indigo-600" />;
      case 'layers':
        return <Layers className="w-6 h-6 text-cyan-600" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-purple-600" />;
      default:
        return <Cpu className="w-6 h-6 text-cyan-700" />;
    }
  };

  const cleanWhatsAppNumber = content.about.whatsappNumber.replace(/\D/g, '') || '81999694866';

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
      
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
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 text-right backdrop-blur-md shadow-lg shadow-slate-200/60">
          <div className="flex items-center space-x-2 justify-end mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
            </span>
            <span className="text-[10px] font-mono text-cyan-700 font-bold tracking-wider">
              TELEMETRIA 3D ATIVA
            </span>
          </div>
          <div className="text-xs font-mono text-slate-800 font-semibold">
            Profundidade: <span className="text-cyan-700 font-bold">{(scrollProgress * 11.5).toFixed(1)} mm</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Torque: <span className="text-emerald-600 font-bold">{Math.round(scrollProgress * 45)} N.cm</span>
          </div>
          <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/60">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-75"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 📜 CONTEÚDO NARRATIVO SCROLLYTELLING (Posicionado sobre o 3D) */}
      <div className="relative z-10">

        {/* 🚀 SEÇÃO 1: HERO */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto pt-24 pb-16">
          <div className="max-w-2xl space-y-6 backdrop-blur-md sm:backdrop-blur-none bg-white/80 sm:bg-transparent p-5 sm:p-0 rounded-3xl border border-white/90 sm:border-transparent shadow-xs sm:shadow-none">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-[10px] sm:text-xs font-semibold shadow-xs max-w-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
              <span className="truncate">PLANEJAMENTO CIRÚRGICO ODONTOLÓGICO 3D</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight break-words">
              A Nova Dimensão da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-800">
                Implantodontia Digital.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Desenvolvido pelo <strong className="text-slate-900 font-semibold">{content.about.name}</strong> para cirurgiões-dentistas de alta performance. Envie o escaneamento oral do paciente, receba o projeto 3D milimétrico, inspecione no navegador e libere as guias cirúrgicas instantaneamente.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
              >
                <span>{firebaseUser ? 'Painel / Sistema' : 'Acessar Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#casos-clinicos"
                className="px-5 py-3.5 rounded-2xl bg-white/90 hover:bg-white border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-700 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2 backdrop-blur-xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-cyan-600" />
                <span>Ver Casos Clínicos</span>
              </a>
            </div>

            {/* Dica de Scroll */}
            <div className="pt-8 flex items-center space-x-3 text-xs font-medium text-slate-500 animate-bounce">
              <ChevronDown className="w-4 h-4 text-cyan-600" />
              <span>Role a página para explorar casos, serviços e a telemetria 3D</span>
            </div>

          </div>
        </section>

        {/* 🔬 SEÇÃO 2: CASOS CLÍNICOS (Alimentado dinamicamente) */}
        <section id="casos-clinicos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-semibold shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              <span>EXPERIÊNCIA & CASOS REAIS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Casos Clínicos de Alta Complexidade
            </h2>
            <p className="text-sm text-slate-500">
              Da tomografia Cone Beam tridimensional à execução cirúrgica guiada com precisão sub-milimétrica.
            </p>
          </div>

          {/* Vitrine dos 3 Casos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.cases
              .filter(c => c.active)
              .slice()
              .sort((a, b) => (b.featuredOnHome ? 1 : 0) - (a.featuredOnHome ? 1 : 0))
              .slice(0, 3)
              .map((c) => {
                const coverImg = isCaseFieldVisible(c, 'showPhotos')
                  ? (c.imageUrl || c.galleryImages?.[0] || null)
                  : null;
                const showBadge = isCaseFieldVisible(c, 'showBadge');
                const showTag = isCaseFieldVisible(c, 'showTag');
                const showDesc = isCaseFieldVisible(c, 'showDescription');
                const showFull = isCaseFieldVisible(c, 'showFullContent');
                const showBrand = isCaseFieldVisible(c, 'showImplantBrand');
                const showTime = isCaseFieldVisible(c, 'showSurgicalTime');
                const showM1 = isCaseFieldVisible(c, 'showMetric1');
                const showM2 = isCaseFieldVisible(c, 'showMetric2');
                const showPdf = isCaseFieldVisible(c, 'showPdf');

                return (
                  <div 
                    key={c.id}
                    onClick={() => onOpenCasesArchive?.(c.id)}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-400 space-y-4 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      {/* Imagem do Caso se cadastrada e visível */}
                      {coverImg && (
                        <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 relative group">
                          <img 
                            src={coverImg} 
                            alt={c.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                      )}

                      {(showBadge || showTag) && (
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {showBadge ? (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
                              {c.badge}
                            </span>
                          ) : <span />}
                          {showTag && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {c.tag}
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2">
                        {c.title}
                      </h3>

                      {showDesc ? (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>
                      ) : showFull ? (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {c.fullContent}
                        </p>
                      ) : null}

                      {(showBrand || showTime) && (
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-600 flex-wrap">
                          {showBrand && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                              <span>🔩</span>
                              <span className="truncate max-w-[150px] font-medium">{c.implantBrand}</span>
                            </span>
                          )}
                          {showTime && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                              <Clock className="w-3 h-3 text-cyan-600" />
                              <span className="font-medium">{c.surgicalTime}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      {(showM1 || showM2) && (
                        <div className={`grid gap-2 text-xs ${showM1 && showM2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {showM1 && (
                            <div>
                              {c.metric1Label && <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">{c.metric1Label}</span>}
                              {c.metric1Value && <span className="text-cyan-700 font-bold">{c.metric1Value}</span>}
                            </div>
                          )}
                          {showM2 && (
                            <div>
                              {c.metric2Label && <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">{c.metric2Label}</span>}
                              {c.metric2Value && <span className="text-emerald-600 font-bold">{c.metric2Value}</span>}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs text-cyan-700">
                        <span className="font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                          <span>Ver estudo completo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        {showPdf && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
                            Laudo PDF
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>

          {/* Botão de Destaque para Abrir o Acervo Completo */}
          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={() => onOpenCasesArchive?.()}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 sm:space-x-3 cursor-pointer group active:scale-[0.98] text-center"
            >
              <span>Explorar Acervo de Casos ({content.cases.filter(c => c.active).length} Estudos)</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* 🛠️ SEÇÃO 3: SERVIÇOS (Alimentado dinamicamente) */}
        <section id="servicos" className="min-h-screen flex flex-col justify-center px-4 sm:px-8 max-w-7xl mx-auto py-24 scroll-mt-20">
          <div className="space-y-4 mb-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-semibold shadow-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>SOLUÇÕES COMPLETAS CAD/CAM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Serviços Odontológicos Digitais
            </h2>
            <p className="text-sm text-slate-500">
              Fluxo cirúrgico digital integrado: você envia os exames do paciente e o Dr. Ricardo entrega o projeto validado pronto para fresagem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.services.filter(s => s.active).map((s) => (
              <div 
                key={s.id}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-400 space-y-4 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shadow-2xs">
                    {renderServiceIcon(s.iconType)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {s.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-semibold shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
              <span>FORMAÇÃO & MENTORIA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Cursos e Capacitações com {content.about.name}
            </h2>
            <p className="text-sm text-slate-500">
              Aprenda a metodologia clínica comprovada para dominar a cirurgia guiada e transformar a previsibilidade dos seus procedimentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.courses.filter(c => c.active).map((c) => (
              <div 
                key={c.id}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-400 space-y-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                      {c.format}
                    </span>
                    <span className="text-slate-500 font-medium">{c.badge}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.description}
                  </p>

                  <ul className="space-y-2 pt-2 text-xs text-slate-700">
                    {c.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`https://wa.me/55${cleanWhatsAppNumber}?text=${encodeURIComponent(c.whatsappMessage || 'Olá Dr. Ricardo! Quero saber sobre o curso.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold text-center transition-all block mt-4"
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-semibold shadow-xs">
              <Quote className="w-3.5 h-3.5 text-cyan-600" />
              <span>AVALIAÇÕES & PARCEIROS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O Que Dizem os Cirurgiões-Dentistas
            </h2>
            <p className="text-sm text-slate-500">
              Profissionais que elevaram o padrão cirúrgico de seus consultórios com o suporte do {content.about.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.testimonials.filter(t => t.active).map((t) => (
              <div 
                key={t.id}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-400 space-y-4 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                  {t.avatarUrl ? (
                    <img 
                      src={t.avatarUrl} 
                      alt={t.dentistName} 
                      className="w-10 h-10 rounded-full object-cover border border-cyan-200" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {t.initials || 'DR'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.dentistName}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{t.role} • {t.cityState}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🏆 SEÇÃO 6: SOBRE DR. RICARDO (Alimentado dinamicamente) */}
        <section id="sobre" className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 max-w-5xl mx-auto py-24 scroll-mt-20">
          
          <div className="w-full p-6 sm:p-12 rounded-3xl bg-white/95 border border-slate-200/90 backdrop-blur-2xl space-y-6 sm:space-y-8 shadow-xl shadow-slate-200/50">
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-left">
              {/* Avatar / Destaque Dr. Ricardo */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 p-1 shadow-md">
                    <div className="w-full h-full rounded-[22px] bg-slate-100 flex items-center justify-center overflow-hidden">
                      {content.about.photoUrl ? (
                        <img 
                          src={content.about.photoUrl} 
                          alt={content.about.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Stethoscope className="w-16 h-16 text-cyan-600 stroke-[1.5]" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                    <Award className="w-3 h-3" />
                    <span>{content.about.specialtyBadge || 'ESPECIALISTA'}</span>
                  </div>
                </div>
              </div>

              {/* Texto Bio */}
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
                  <span>{content.about.badge || 'RESPONSÁVEL TÉCNICO'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {content.about.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {content.about.bio}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                    <span className="text-lg font-bold text-cyan-700 block">
                      {content.about.stat1Value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {content.about.stat1Label}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                    <span className="text-lg font-bold text-emerald-600 block">
                      {content.about.stat2Value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {content.about.stat2Label}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-lg font-bold text-amber-600 block">
                      {content.about.stat3Value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {content.about.stat3Label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box de Ação */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <button
                onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer text-center"
              >
                <span>{firebaseUser ? 'Acessar Painel do Sistema' : 'Acessar Plataforma & Enviar Caso'}</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>

              <a
                href={`https://wa.me/55${cleanWhatsAppNumber}?text=${encodeURIComponent(content.about.whatsappMessage || 'Olá Dr. Ricardo! Acessei o site e gostaria de falar com você.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center space-x-2 text-center cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>WhatsApp com Dr. Ricardo</span>
              </a>
            </div>

            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 text-center font-medium">
              <span>{content.about.name} • {content.about.cro}</span>
              <span>•</span>
              <span className="text-cyan-700 font-semibold">Implant Precision 3D</span>
            </div>

          </div>

        </section>

        {/* 🦶 Footer Institucional */}
        <footer className="border-t border-slate-200 py-8 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-200 bg-[#0c3960] flex items-center justify-center flex-shrink-0">
                <img src="/logo-square.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Implant Precision 3D</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="hidden sm:inline">Planejamento & Cirurgia Guiada de Alta Precisão</span>
              </div>
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
