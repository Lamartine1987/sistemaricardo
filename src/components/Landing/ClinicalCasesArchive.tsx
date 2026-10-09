import React, { useState, useMemo, useEffect } from 'react';
import { ClinicalCaseItem, SiteContentConfig } from '../../types/siteContent';
import { 
  ArrowLeft, 
  Search, 
  X, 
  FileText, 
  Download, 
  Sparkles, 
  Clock, 
  Stethoscope, 
  Eye, 
  MessageCircle, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface ClinicalCasesArchiveProps {
  onBackToLanding: () => void;
  onEnterApp: () => void;
  onOpenAuthModal: () => void;
  firebaseUser?: { email?: string | null; displayName?: string | null } | null;
  siteContent: SiteContentConfig;
  initialSelectedCaseId?: string | null;
}

export const ClinicalCasesArchive: React.FC<ClinicalCasesArchiveProps> = ({
  onBackToLanding,
  onEnterApp,
  onOpenAuthModal,
  firebaseUser,
  siteContent,
  initialSelectedCaseId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hasPdfOnly, setHasPdfOnly] = useState<boolean>(false);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<ClinicalCaseItem | null>(() => {
    if (initialSelectedCaseId) {
      return siteContent.cases.find(c => c.id === initialSelectedCaseId) || null;
    }
    return null;
  });

  const activeModalImages = useMemo(() => {
    if (!selectedCase) return [];
    const list = [
      ...(selectedCase.imageUrl ? [selectedCase.imageUrl] : []),
      ...(selectedCase.galleryImages || [])
    ];
    return list.filter((img, idx, arr) => arr.indexOf(img) === idx);
  }, [selectedCase]);

  const activeImageToDisplay = activeModalImage && activeModalImages.includes(activeModalImage)
    ? activeModalImage
    : (activeModalImages[0] || null);

  const handleNextImage = () => {
    if (activeModalImages.length <= 1) return;
    const currentIdx = activeModalImages.indexOf(activeImageToDisplay || '');
    const nextIdx = (currentIdx + 1) % activeModalImages.length;
    setActiveModalImage(activeModalImages[nextIdx]);
  };

  const handlePrevImage = () => {
    if (activeModalImages.length <= 1) return;
    const currentIdx = activeModalImages.indexOf(activeImageToDisplay || '');
    const prevIdx = (currentIdx - 1 + activeModalImages.length) % activeModalImages.length;
    setActiveModalImage(activeModalImages[prevIdx]);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeModalImages, activeImageToDisplay]);

  const activeCases = useMemo(() => {
    return siteContent.cases.filter(c => c.active);
  }, [siteContent.cases]);

  // Extrair categorias / badges únicas para os filtros em pílulas
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeCases.forEach(c => {
      if (c.badge) set.add(c.badge);
      if (c.tag) set.add(c.tag);
    });
    return Array.from(set);
  }, [activeCases]);

  // Filtragem dos casos
  const filteredCases = useMemo(() => {
    return activeCases.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.fullContent && c.fullContent.toLowerCase().includes(q)) ||
        c.badge.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        (c.implantBrand && c.implantBrand.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'ALL' || 
        c.badge === selectedCategory || 
        c.tag === selectedCategory;

      const matchesPdf = !hasPdfOnly || Boolean(c.pdfUrl || c.pdfName);

      return matchesSearch && matchesCategory && matchesPdf;
    });
  }, [activeCases, searchQuery, selectedCategory, hasPdfOnly]);

  const cleanWhatsApp = siteContent.about.whatsappNumber.replace(/\D/g, '') || '81999694866';

  // Helper para gerar download de laudo de exemplo se não houver PDF binário
  const handleDownloadPdf = (caseItem: ClinicalCaseItem) => {
    if (caseItem.pdfUrl) {
      window.open(caseItem.pdfUrl, '_blank');
      return;
    }

    // Gerar um documento de laudo clínico elegante via Blob de texto/HTML formatado
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laudo Clínico - ${caseItem.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
          .header { border-bottom: 2px solid #0891b2; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 20px; font-weight: bold; color: #0891b2; }
          h1 { font-size: 22px; color: #0f172a; margin-top: 15px; }
          .badge { display: inline-block; background: #cffafe; color: #0e7490; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
          .metrics { display: flex; gap: 15px; margin: 25px 0; }
          .metric-box { flex: 1; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
          .metric-val { font-size: 16px; font-weight: bold; color: #0891b2; margin-top: 4px; }
          .content { line-height: 1.8; font-size: 14px; white-space: pre-line; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">IMPLANT PRECISION 3D • DR. RICARDO CEZAR</div>
          <span class="badge">${caseItem.badge} • ${caseItem.tag}</span>
          <h1>${caseItem.title}</h1>
        </div>
        <div class="metrics">
          <div class="metric-box">
            <div class="metric-label">${caseItem.metric1Label}</div>
            <div class="metric-val">${caseItem.metric1Value}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">${caseItem.metric2Label}</div>
            <div class="metric-val">${caseItem.metric2Value}</div>
          </div>
          ${caseItem.implantBrand ? `
          <div class="metric-box">
            <div class="metric-label">Sistema de Implante</div>
            <div class="metric-val" style="font-size: 13px;">${caseItem.implantBrand}</div>
          </div>` : ''}
        </div>
        <h3>Conduta de Planejamento & Execução Cirúrgica</h3>
        <div class="content">${caseItem.fullContent || caseItem.description}</div>
        <div class="footer">
          Documento gerado pela Plataforma Implant Precision 3D • Responsável Técnico: ${siteContent.about.name} (${siteContent.about.cro})
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      
      {/* 🧭 Barra Superior Fixa com Botão de Retorno */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-mono font-medium transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-700 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para o Início</span>
          </button>

          <div className="hidden md:flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
              Acervo de Cirurgias Guiadas & Planejamentos 3D
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-mono font-bold transition-all shadow-sm hover:shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{firebaseUser ? 'Acessar Painel' : 'Enviar Caso'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 🌟 Hero Header do Acervo */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
            <span>ESTUDOS DE CASO DOCUMENTADOS • DR. RICARDO CEZAR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Acervo Completo de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-teal-700 to-slate-900">
              Casos Clínicos & Cirurgias Guiadas
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Consulte a documentação passo a passo de cirurgias guiadas, reconstruções totais, enxertos e reabilitações em áreas críticas. Filtre por patologia, baixe laudos cirúrgicos e inspecione as métricas milimétricas com alto conforto visual de leitura.
          </p>
        </div>

        {/* 🔍 Painel de Busca e Filtros Inteligentes */}
        <div className="mt-8 p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquise por diagnóstico, técnica (ex: All-on-4, Flapless, Dente 21, Nervo Alveolar)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro: Apenas com PDF */}
            <button
              onClick={() => setHasPdfOnly(!hasPdfOnly)}
              className={`px-4 py-3 rounded-2xl border text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                hasPdfOnly
                  ? 'bg-cyan-50 border-cyan-600 text-cyan-800 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-700" />
              <span>Apenas com Laudo PDF</span>
            </button>
          </div>

          {/* Filtros em Pílulas (Categorias / Técnicas) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-cyan-700 text-white font-bold shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Todos os Casos ({activeCases.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-cyan-700 text-white font-bold shadow-sm'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Contador de Resultados */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              Exibindo <strong className="text-cyan-800 font-bold">{filteredCases.length}</strong> de {activeCases.length} estudos de caso
            </span>
            {(searchQuery || selectedCategory !== 'ALL' || hasPdfOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setHasPdfOnly(false);
                }}
                className="text-cyan-700 hover:text-cyan-900 font-medium hover:underline cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 📚 Grid de Casos Clínicos */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {filteredCases.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto text-cyan-700">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum estudo de caso encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Não encontramos nenhum caso clínico correspondente aos termos ou filtros selecionados. Tente buscar por outros termos ou redefinir os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setHasPdfOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-mono text-cyan-800 font-semibold transition-colors cursor-pointer"
            >
              Ver todos os casos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setActiveModalImage(c.imageUrl || (c.galleryImages?.[0] || null));
                }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-cyan-500/60 transition-all flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="space-y-4">
                  
                  {/* Foto ou Render 3D */}
                  {c.imageUrl ? (
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      <img 
                        src={c.imageUrl} 
                        alt={c.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-mono text-cyan-900 font-bold flex items-center space-x-1 border border-slate-200 shadow-xs">
                        <Eye className="w-3 h-3 text-cyan-700" />
                        <span>Ver Estudo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between px-4 py-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-800 font-bold text-xs block">Render Cirúrgico 3D</span>
                          <span className="text-[10px] text-slate-500 font-mono">Modelo Digital Concluído</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-medium">
                        Dossiê
                      </span>
                    </div>
                  )}

                  {/* Badges de Categoria */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-bold">
                      {c.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      {c.tag}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug line-clamp-2 min-h-[3rem]">
                    {c.title}
                  </h3>

                  {/* Resumo */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 min-h-[3rem]">
                    {c.description}
                  </p>

                  {/* Marca de Implante e Tempo se houver */}
                  {(c.implantBrand || c.surgicalTime) && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-600">
                      {c.implantBrand && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                          <span>🔩</span>
                          <span className="truncate max-w-[140px] font-medium">{c.implantBrand}</span>
                        </span>
                      )}
                      {c.surgicalTime && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                          <Clock className="w-3 h-3 text-cyan-700" />
                          <span className="font-medium">{c.surgicalTime}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-100">
                      <span className="text-[10px] font-mono text-slate-500 block mb-0.5">{c.metric1Label}</span>
                      <span className="text-xs font-mono font-bold text-cyan-800">{c.metric1Value}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[10px] font-mono text-slate-500 block mb-0.5">{c.metric2Label}</span>
                      <span className="text-xs font-mono font-bold text-emerald-700">{c.metric2Value}</span>
                    </div>
                  </div>

                </div>

                {/* Rodapé do Card */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-700 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Ler estudo clínico</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {c.galleryImages && c.galleryImages.length > 0 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-cyan-800 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200">
                        <ImageIcon className="w-3 h-3 text-cyan-700" />
                        <span>+{c.galleryImages.length}</span>
                      </span>
                    )}

                    {(c.pdfUrl || c.pdfName) && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-600 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                        <FileText className="w-3 h-3 text-cyan-700" />
                        <span className="font-medium">PDF</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 📖 MODAL DO DOSSIÊ COMPLETO DO CASO CLÍNICO */}
      {/* ========================================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-mono font-bold">
                    {selectedCase.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium">
                    {selectedCase.tag}
                  </span>
                  {selectedCase.surgicalTime && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyan-700" />
                      <span className="font-medium">{selectedCase.surgicalTime}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {selectedCase.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedCase(null);
                  setActiveModalImage(null);
                }}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem Principal ou Galeria Interativa */}
            {(() => {
              const modalImages = activeModalImages;

              if (activeImageToDisplay) {
                return (
                  <div className="space-y-3">
                    <div 
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-full min-h-[300px] max-h-[520px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative group flex items-center justify-center p-2 cursor-zoom-in shadow-inner transition-colors hover:border-cyan-500/50"
                      title="Clique para abrir imagem em Tela Cheia com zoom"
                    >
                      <img 
                        src={activeImageToDisplay} 
                        alt={selectedCase.title} 
                        className="max-h-[500px] w-auto max-w-full object-contain mx-auto select-none rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.01]" 
                      />

                      {/* Botão de Tela Cheia */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLightboxOpen(true);
                        }}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-mono font-medium flex items-center space-x-1.5 shadow-md backdrop-blur-sm cursor-pointer transition-colors border border-white/10"
                        title="Ver em tela cheia com zoom"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tela Cheia</span>
                      </button>

                      {modalImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-mono text-white flex items-center space-x-1 border border-white/10 pointer-events-none">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{modalImages.indexOf(activeImageToDisplay) + 1} de {modalImages.length} fotos</span>
                        </div>
                      )}
                    </div>

                    {/* Miniaturas da Galeria Interativa */}
                    {modalImages.length > 1 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-slate-500 font-medium block">
                          Galeria de fotos do caso (clique para alternar a imagem):
                        </span>
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1 no-scrollbar">
                          {modalImages.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveModalImage(imgUrl)}
                              className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border transition-all cursor-pointer relative group ${
                                activeImageToDisplay === imgUrl
                                  ? 'ring-2 ring-cyan-600 border-cyan-600 shadow-sm scale-[1.02]'
                                  : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                                #{i + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-cyan-50 via-slate-50 to-cyan-50 border border-cyan-200 flex items-center justify-center p-6 text-center">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-2 text-cyan-800 font-mono text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-700" />
                      <span>PLANEJAMENTO VIRTUAL 3D CONCLUÍDO</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Arquivos tomográficos DICOM e escaneamento oral alinhados com precisão sub-milimétrica.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* HUD de Métricas e Telemetria Cirúrgica */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100">
                <span className="text-[10px] font-mono text-slate-500 block">{selectedCase.metric1Label}</span>
                <span className="text-sm font-mono font-bold text-cyan-800">{selectedCase.metric1Value}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-mono text-slate-500 block">{selectedCase.metric2Label}</span>
                <span className="text-sm font-mono font-bold text-emerald-700">{selectedCase.metric2Value}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-2">
                <span className="text-[10px] font-mono text-slate-500 block">Sistema / Marca</span>
                <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                  {selectedCase.implantBrand || 'Neodent / Straumann Guiado'}
                </span>
              </div>
            </div>

            {/* Descrição e Conduta Clínica Aprofundada */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold font-mono text-cyan-800 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-700" />
                <span>Conduta Clínica & Detalhamento do Planejamento</span>
              </h3>
              
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-sans whitespace-pre-line p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                {selectedCase.fullContent || selectedCase.description}
              </div>
            </div>

            {/* Seção de Documento / PDF para Download */}
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    {selectedCase.pdfName || `Laudo_Cirurgico_${selectedCase.badge.replace(/\s+/g, '_')}.pdf`}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ficha técnica, posicionamento axial e tolerâncias de broca
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPdf(selectedCase)}
                className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-mono font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm hover:shadow cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Laudo / PDF</span>
              </button>
            </div>

            {/* CTA WhatsApp Direto com Dr. Ricardo */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Deseja planejar um caso semelhante ou tirar dúvidas clínicas?
              </div>

              <a
                href={`https://wa.me/55${cleanWhatsApp}?text=${encodeURIComponent(`Olá Dr. Ricardo! Estive no seu acervo e gostaria de planejar um caso semelhante a: "${selectedCase.title}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar com Dr. Ricardo no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 LIGHTBOX EM TELA CHEIA (FULLSCREEN VIEWER COM ZOOM & NAVEGAÇÃO) */}
      {/* ========================================================================= */}
      {isLightboxOpen && selectedCase && activeImageToDisplay && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header da Lightbox */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10" onClick={e => e.stopPropagation()}>
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-cyan-400 font-bold block">
                {selectedCase.badge} • FOTO {activeModalImages.indexOf(activeImageToDisplay) + 1} DE {activeModalImages.length}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
                {selectedCase.title}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">ESC</kbd> fechar • <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">→</kbd> navegar
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Fechar Tela Cheia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área Central da Imagem com Setas */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden" onClick={e => e.stopPropagation()}>
            {activeModalImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                title="Foto Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img 
              src={activeImageToDisplay} 
              alt={selectedCase.title} 
              className="max-h-[80vh] max-w-[92vw] object-contain select-none shadow-2xl rounded-lg" 
            />

            {activeModalImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                title="Próxima Foto (Seta Direita)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Rodapé com Miniaturas Rápidas na Lightbox */}
          {activeModalImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pt-2 no-scrollbar" onClick={e => e.stopPropagation()}>
              {activeModalImages.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveModalImage(imgUrl)}
                  className={`h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageToDisplay === imgUrl
                      ? 'ring-2 ring-cyan-400 border-cyan-400 scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
