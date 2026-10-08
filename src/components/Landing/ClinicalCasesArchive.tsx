import React, { useState, useMemo } from 'react';
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
  const [selectedCase, setSelectedCase] = useState<ClinicalCaseItem | null>(() => {
    if (initialSelectedCaseId) {
      return siteContent.cases.find(c => c.id === initialSelectedCaseId) || null;
    }
    return null;
  });

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
    <div className="min-h-screen bg-cyber-bg text-slate-100 font-sans selection:bg-cyber-cyan selection:text-black">
      
      {/* 🧭 Barra Superior Fixa com Botão de Retorno */}
      <header className="sticky top-0 z-40 bg-cyber-bg/90 backdrop-blur-xl border-b border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyber-border hover:border-cyber-cyan/50 text-slate-300 hover:text-white text-xs font-mono transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyber-cyan group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para o Início</span>
          </button>

          <div className="hidden md:flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Acervo de Cirurgias Guiadas & Planejamentos 3D
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={firebaseUser ? onEnterApp : onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-black text-xs font-mono font-bold transition-all shadow-glow-cyan flex items-center space-x-1.5 cursor-pointer"
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>ESTUDOS DE CASO DOCUMENTADOS • DR. RICARDO CEZAR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Acervo Completo de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-blue-400 to-indigo-400">
              Casos Clínicos & Cirurgias Guiadas
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Consulte a documentação passo a passo de cirurgias guiadas, reconstruções totais, enxertos e reabilitações em áreas críticas. Filtre por patologia, baixe laudos cirúrgicos e inspecione as métricas milimétricas.
          </p>
        </div>

        {/* 🔍 Painel de Busca e Filtros Inteligentes */}
        <div className="mt-8 p-4 sm:p-6 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyber-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquise por diagnóstico, técnica (ex: All-on-4, Flapless, Dente 21, Nervo Alveolar)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/90 border border-cyber-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                  ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan font-bold'
                  : 'glass-panel border-cyber-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Apenas com Laudo PDF</span>
            </button>
          </div>

          {/* Filtros em Pílulas (Categorias / Técnicas) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-cyber-cyan to-blue-500 text-black font-bold shadow-glow-cyan'
                  : 'glass-panel border border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              Todos os Casos ({activeCases.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-cyber-cyan to-blue-500 text-black font-bold shadow-glow-cyan'
                    : 'glass-panel border border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Contador de Resultados */}
          <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Exibindo <strong className="text-cyber-cyan">{filteredCases.length}</strong> de {activeCases.length} estudos de caso
            </span>
            {(searchQuery || selectedCategory !== 'ALL' || hasPdfOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setHasPdfOnly(false);
                }}
                className="text-cyber-cyan hover:underline"
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
          <div className="text-center py-20 rounded-3xl glass-panel border border-cyber-border space-y-4 max-w-xl mx-auto my-10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyber-cyan/30 flex items-center justify-center mx-auto text-cyber-cyan">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhum estudo de caso encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Não encontramos nenhum caso clínico correspondente aos termos ou filtros selecionados. Tente buscar por outros termos ou redefinir os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setHasPdfOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyber-cyan transition-colors"
            >
              Ver todos os casos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="p-6 rounded-3xl glass-panel-glow border border-cyber-border bg-cyber-card/85 hover:border-cyber-cyan/60 transition-all flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="space-y-4">
                  
                  {/* Foto ou Render 3D */}
                  {c.imageUrl ? (
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-900 border border-cyber-border relative group">
                      <img 
                        src={c.imageUrl} 
                        alt={c.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyber-cyan flex items-center space-x-1 border border-cyber-cyan/30">
                        <Eye className="w-3 h-3" />
                        <span>Ver Estudo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyber-border/80 flex items-center justify-between px-4 py-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan flex-shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-white font-bold text-xs block">Render Cirúrgico 3D</span>
                          <span className="text-[10px] text-slate-400 font-mono">Modelo Digital Concluído</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-cyber-border text-slate-300 text-[10px] font-mono">
                        Dossiê
                      </span>
                    </div>
                  )}

                  {/* Badges de Categoria */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-[10px] font-mono font-semibold">
                      {c.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.tag}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyber-cyan transition-colors leading-snug line-clamp-2 min-h-[3rem]">
                    {c.title}
                  </h3>

                  {/* Resumo */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 min-h-[3rem]">
                    {c.description}
                  </p>

                  {/* Marca de Implante e Tempo se houver */}
                  {(c.implantBrand || c.surgicalTime) && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                      {c.implantBrand && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          <span>🔩</span>
                          <span className="truncate max-w-[140px]">{c.implantBrand}</span>
                        </span>
                      )}
                      {c.surgicalTime && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          <Clock className="w-3 h-3 text-cyber-cyan" />
                          <span>{c.surgicalTime}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cyber-border/70">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyber-border/80">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{c.metric1Label}</span>
                      <span className="text-xs font-mono font-bold text-cyber-cyan">{c.metric1Value}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyber-border/80">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{c.metric2Label}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{c.metric2Value}</span>
                    </div>
                  </div>

                </div>

                {/* Rodapé do Card */}
                <div className="pt-4 mt-3 border-t border-cyber-border/70 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyber-cyan font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Ler estudo clínico</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  {(c.pdfUrl || c.pdfName) && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                      <FileText className="w-3 h-3 text-cyber-cyan" />
                      <span>PDF</span>
                    </span>
                  )}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-cyber-card border border-cyber-border/90 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-cyber-border pb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="px-3 py-1 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-xs font-mono font-bold">
                    {selectedCase.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-cyber-border text-xs font-mono">
                    {selectedCase.tag}
                  </span>
                  {selectedCase.surgicalTime && (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-cyber-border text-xs font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyber-cyan" />
                      <span>{selectedCase.surgicalTime}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {selectedCase.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-xl bg-slate-900 border border-cyber-border text-slate-400 hover:text-white hover:border-cyber-cyan/50 transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem Principal ou Galeria */}
            {selectedCase.imageUrl ? (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-cyber-border relative">
                <img 
                  src={selectedCase.imageUrl} 
                  alt={selectedCase.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyber-border flex items-center justify-center p-6 text-center">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>PLANEJAMENTO VIRTUAL 3D CONCLUÍDO</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Arquivos tomográficos DICOM e escaneamento oral alinhados com precisão sub-milimétrica.
                  </p>
                </div>
              </div>
            )}

            {/* Galeria de Fotos Adicionais se houver */}
            {selectedCase.galleryImages && selectedCase.galleryImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Outras imagens do caso:</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {selectedCase.galleryImages.map((imgUrl, i) => (
                    <div key={i} className="h-20 rounded-xl overflow-hidden border border-cyber-border bg-slate-900">
                      <img src={imgUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HUD de Métricas e Telemetria Cirúrgica */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyber-border">
                <span className="text-[10px] font-mono text-slate-400 block">{selectedCase.metric1Label}</span>
                <span className="text-sm font-mono font-bold text-cyber-cyan">{selectedCase.metric1Value}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyber-border">
                <span className="text-[10px] font-mono text-slate-400 block">{selectedCase.metric2Label}</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{selectedCase.metric2Value}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyber-border col-span-2 sm:col-span-2">
                <span className="text-[10px] font-mono text-slate-400 block">Sistema / Marca</span>
                <span className="text-xs font-mono font-bold text-slate-200 truncate block">
                  {selectedCase.implantBrand || 'Neodent / Straumann Guiado'}
                </span>
              </div>
            </div>

            {/* Descrição e Conduta Clínica Aprofundada */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold font-mono text-cyber-cyan uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Conduta Clínica & Detalhamento do Planejamento</span>
              </h3>
              
              <div className="text-sm text-slate-200 leading-relaxed space-y-3 font-sans whitespace-pre-line p-4 rounded-2xl bg-slate-900/60 border border-cyber-border/70">
                {selectedCase.fullContent || selectedCase.description}
              </div>
            </div>

            {/* Seção de Documento / PDF para Download */}
            <div className="p-4 rounded-2xl glass-panel border border-cyber-cyan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    {selectedCase.pdfName || `Laudo_Cirurgico_${selectedCase.badge.replace(/\s+/g, '_')}.pdf`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ficha técnica, posicionamento axial e tolerâncias de broca
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPdf(selectedCase)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold text-xs flex items-center space-x-1.5 transition-all shadow-glow-cyan cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Laudo / PDF</span>
              </button>
            </div>

            {/* CTA WhatsApp Direto com Dr. Ricardo */}
            <div className="pt-2 border-t border-cyber-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Deseja planejar um caso semelhante ou tirar dúvidas clínicas?
              </div>

              <a
                href={`https://wa.me/55${cleanWhatsApp}?text=${encodeURIComponent(`Olá Dr. Ricardo! Estive no seu acervo e gostaria de planejar um caso semelhante a: "${selectedCase.title}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar com Dr. Ricardo no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
