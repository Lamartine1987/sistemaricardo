import React, { useState, useEffect } from 'react';
import { 
  ClinicalCaseItem, 
  ServiceItem, 
  CourseItem, 
  TestimonialItem, 
  SiteContentConfig,
  DEFAULT_SITE_CONTENT
} from '../../types/siteContent';
import { 
  getStoredSiteContent, 
  saveStoredSiteContent, 
  fileToBase64 
} from '../../services/site/siteContentService';
import { 
  Globe, 
  Save, 
  RotateCcw, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  CheckCircle2, 
  Star, 
  Layers, 
  GraduationCap, 
  MessageSquare, 
  User, 
  Stethoscope, 
  Check, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';

interface SiteContentManagerProps {
  onBackToLanding: () => void;
  onNotifyFeedback?: (title: string, message: string) => void;
  siteContent?: SiteContentConfig;
  onUpdateSiteContent?: (newContent: SiteContentConfig) => void;
}

export const SiteContentManager: React.FC<SiteContentManagerProps> = ({ 
  onBackToLanding,
  onNotifyFeedback,
  siteContent,
  onUpdateSiteContent
}) => {
  const [content, setContent] = useState<SiteContentConfig>(() => siteContent || getStoredSiteContent());
  const [activeSubTab, setActiveSubTab] = useState<'CASES' | 'SERVICES' | 'COURSES' | 'TESTIMONIALS' | 'ABOUT'>('CASES');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar se prop externo for fornecido pelo App
  useEffect(() => {
    if (siteContent) {
      setContent(siteContent);
    }
  }, [siteContent]);

  // Função central para aplicar qualquer mudança, salvar em localStorage e propagar
  const applyContentChange = (nextContent: SiteContentConfig) => {
    const saved = saveStoredSiteContent(nextContent);
    setContent(saved);
    if (onUpdateSiteContent) {
      onUpdateSiteContent(saved);
    }
  };

  // Modais de edição/criação
  const [editingCase, setEditingCase] = useState<ClinicalCaseItem | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isNewTestimonialModalOpen, setIsNewTestimonialModalOpen] = useState(false);

  // Salvar no storage e no Firestore com feedback visual
  const handleSaveAll = () => {
    setIsSaving(true);
    applyContentChange(content);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      if (onNotifyFeedback) {
        onNotifyFeedback('Site Atualizado!', 'As alterações foram salvas e publicadas na página inicial.');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar todos os textos e seções do site para os padrões originais de fábrica?')) {
      applyContentChange(DEFAULT_SITE_CONTENT);
      alert('Conteúdo redefinido com sucesso.');
    }
  };

  // Atualização instantânea dos campos da seção Sobre Dr. Ricardo
  const handleAboutChange = (patch: Partial<SiteContentConfig['about']>) => {
    const updated: SiteContentConfig = {
      ...content,
      about: {
        ...content.about,
        ...patch
      }
    };
    applyContentChange(updated);
  };

  // Upload genérico de imagem
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Por favor, selecione uma imagem de até 3MB para garantir carregamento ultrarrápido.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onSuccess(base64);
    } catch {
      alert('Erro ao processar imagem.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">
              Gestão de Conteúdo da Página Inicial (Landing Page)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Alimente o site com fotos, textos, casos clínicos, cursos e depoimentos. Todas as alterações refletem instantaneamente no site público.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          <button
            onClick={() => {
              applyContentChange(content);
              onBackToLanding();
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            title="Abrir a página inicial para conferir o resultado"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600" />
            <span>Ver Site Público</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            title="Restaurar textos padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publicando...' : 'Salvar e Publicar'}</span>
          </button>
        </div>
      </div>

      {/* Banner de Sucesso */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Alterações salvas e publicadas no site com sucesso!</span>
        </div>
      )}

      {/* Sub-Abas dos 5 Menus */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('CASES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'CASES'
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>1. Casos Clínicos ({content.cases.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SERVICES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'SERVICES'
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Serviços ({content.services.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('COURSES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'COURSES'
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>3. Cursos & Mentorias ({content.courses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TESTIMONIALS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'TESTIMONIALS'
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>4. Depoimentos ({content.testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ABOUT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ABOUT'
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>5. Sobre Dr. Ricardo</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ABA DE CASOS CLÍNICOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'CASES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              Gerencie os casos clínicos demonstrativos que aparecem na vitrine do site. Você pode cadastrar fotos antes/depois, tomografia, métricas e descrição da técnica cirúrgica.
            </p>
            <button
              onClick={() => {
                setEditingCase({
                  id: `case-${Date.now()}`,
                  title: '',
                  badge: 'Protocolo Guiado',
                  tag: 'Carga Imediata',
                  description: '',
                  metric1Label: 'Desvio Angular',
                  metric1Value: '< 0.5°',
                  metric2Label: 'Torque Final',
                  metric2Value: '45 N.cm',
                  imageUrl: '',
                  galleryImages: [],
                  fullContent: '',
                  implantBrand: '',
                  surgicalTime: '',
                  pdfName: '',
                  pdfUrl: '',
                  featuredOnHome: false,
                  active: true,
                  order: content.cases.length + 1
                });
                setNewGalleryUrl('');
                setIsNewCaseModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Caso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.cases.map((c) => (
              <div 
                key={c.id} 
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 transition-all relative shadow-xs hover:shadow-md ${
                  c.active ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Imagem Preview se houver */}
                {c.imageUrl ? (
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                    <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Foto anexada ao caso
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between px-4 py-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-white font-semibold text-xs block">Render 3D Ativo</span>
                        <span className="text-[10px] text-slate-400">Exibindo gráfico interativo</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCase({ ...c, galleryImages: c.galleryImages || [] });
                        setNewGalleryUrl('');
                        setIsNewCaseModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-sans font-medium transition-colors flex-shrink-0"
                    >
                      + Foto
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {c.badge || 'Caso Clínico'}
                    </span>
                    {c.featuredOnHome && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ Capa (Home)
                      </span>
                    )}
                    {c.galleryImages && c.galleryImages.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium">
                        📸 +{c.galleryImages.length} fotos
                      </span>
                    )}
                    {(c.pdfUrl || c.pdfName) && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        PDF
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {c.tag}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 min-h-[2.5rem] leading-snug">
                  {c.title || 'Sem título'}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 min-h-[2.25rem] leading-relaxed">
                  {c.description || 'Sem descrição cadastrada.'}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] block font-sans mb-0.5">{c.metric1Label}</span>
                    <span className="font-bold text-xs font-mono text-cyan-800">{c.metric1Value}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] block font-sans mb-0.5">{c.metric2Label}</span>
                    <span className="font-bold text-xs font-mono text-emerald-700">{c.metric2Value}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const updatedCases = content.cases.map(item => item.id === c.id ? { ...item, active: !item.active } : item);
                      applyContentChange({ ...content, cases: updatedCases });
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      c.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {c.active ? 'Ativo no Site' : 'Oculto'}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingCase({ ...c, galleryImages: c.galleryImages || [] });
                        setNewGalleryUrl('');
                        setIsNewCaseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                      title="Editar Caso"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o caso "${c.title}"?`)) {
                          const updatedCases = content.cases.filter(item => item.id !== c.id);
                          applyContentChange({ ...content, cases: updatedCases });
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir Caso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA DE SERVIÇOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'SERVICES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              Apresente as soluções digitais que você oferece aos cirurgiões-dentistas clientes.
            </p>
            <button
              onClick={() => {
                setEditingService({
                  id: `service-${Date.now()}`,
                  title: '',
                  description: '',
                  iconType: 'cpu',
                  highlights: ['Tópico 1', 'Tópico 2'],
                  active: true,
                  order: content.services.length + 1
                });
                setIsNewServiceModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Serviço</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.services.map((s) => (
              <div 
                key={s.id} 
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition-all ${
                  s.active ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{s.title || 'Sem título'}</h3>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingService({ ...s });
                        setIsNewServiceModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                      title="Editar Serviço"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o serviço "${s.title}"?`)) {
                          const updatedServices = content.services.filter(item => item.id !== s.id);
                          applyContentChange({ ...content, services: updatedServices });
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir Serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {s.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] font-sans px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const updatedServices = content.services.map(item => item.id === s.id ? { ...item, active: !item.active } : item);
                      applyContentChange({ ...content, services: updatedServices });
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      s.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {s.active ? 'Ativo no Site' : 'Oculto'}
                  </button>
                  <span className="text-slate-400 text-[10px] font-mono">Ícone: {s.iconType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA DE CURSOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'COURSES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              Gerencie suas turmas de capacitação, cursos presenciais, híbridos e mentorias cirúrgicas individuais.
            </p>
            <button
              onClick={() => {
                setEditingCourse({
                  id: `course-${Date.now()}`,
                  title: '',
                  format: 'Presencial Intensivo',
                  badge: 'Vagas Abertas',
                  description: '',
                  topics: ['Tópico de Aprendizado 1', 'Tópico de Aprendizado 2'],
                  ctaText: 'Consultar Próxima Turma',
                  whatsappMessage: 'Olá Dr. Ricardo! Gostaria de saber sobre o curso.',
                  active: true,
                  order: content.courses.length + 1
                });
                setIsNewCourseModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Curso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.courses.map((c) => (
              <div 
                key={c.id} 
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                  c.active ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {c.format}
                    </span>
                    <span className="text-slate-400 font-medium">{c.badge}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.title || 'Sem título'}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                  <div className="space-y-2 pt-1">
                    {c.topics.map((t, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const updatedCourses = content.courses.map(item => item.id === c.id ? { ...item, active: !item.active } : item);
                      applyContentChange({ ...content, courses: updatedCourses });
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      c.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {c.active ? 'Ativo no Site' : 'Oculto'}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingCourse({ ...c });
                        setIsNewCourseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                      title="Editar Curso"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o curso "${c.title}"?`)) {
                          const updatedCourses = content.courses.filter(item => item.id !== c.id);
                          applyContentChange({ ...content, courses: updatedCourses });
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir Curso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABA DE DEPOIMENTOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'TESTIMONIALS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              Avaliações reais de colegas cirurgiões-dentistas que validam a qualidade técnica e agilidade do seu trabalho.
            </p>
            <button
              onClick={() => {
                setEditingTestimonial({
                  id: `test-${Date.now()}`,
                  dentistName: '',
                  role: 'Especialista em Implantodontia',
                  cityState: 'Recife/PE',
                  quote: '',
                  rating: 5,
                  initials: 'DR',
                  active: true,
                  order: content.testimonials.length + 1
                });
                setIsNewTestimonialModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Depoimento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.testimonials.map((t) => (
              <div 
                key={t.id} 
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                  t.active ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-3 mb-2.5">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.dentistName} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {t.initials || 'DR'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.dentistName}</h4>
                      <p className="text-[10px] text-slate-500">{t.role} • {t.cityState}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={() => {
                        const updatedTestimonials = content.testimonials.map(item => item.id === t.id ? { ...item, active: !item.active } : item);
                        applyContentChange({ ...content, testimonials: updatedTestimonials });
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        t.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {t.active ? 'Ativo no Site' : 'Oculto'}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingTestimonial({ ...t });
                          setIsNewTestimonialModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                        title="Editar Depoimento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o depoimento de "${t.dentistName}"?`)) {
                            const updatedTestimonials = content.testimonials.filter(item => item.id !== t.id);
                            applyContentChange({ ...content, testimonials: updatedTestimonials });
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Depoimento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ABA SOBRE DR. RICARDO */}
      {/* ========================================================================= */}
      {activeSubTab === 'ABOUT' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-600" />
              <span>Perfil Profissional & Biografia do Dr. Ricardo</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Edite sua apresentação no site, credenciais e contatos diretos para novos dentistas parceiros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-200 border-2 border-cyan-500 shadow-md flex items-center justify-center relative group">
                {content.about.photoUrl ? (
                  <img src={content.about.photoUrl} alt="Dr. Ricardo" className="w-full h-full object-cover" />
                ) : (
                  <Stethoscope className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 text-xs font-semibold text-slate-700 hover:text-cyan-700 cursor-pointer shadow-xs transition-all flex items-center space-x-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
                <span>Carregar Nova Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, (url) => handleAboutChange({ photoUrl: url }))}
                />
              </label>

              {content.about.photoUrl && (
                <button
                  type="button"
                  onClick={() => handleAboutChange({ photoUrl: '' })}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Remover foto
                </button>
              )}
            </div>

            {/* Campos de Texto */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Nome de Apresentação</label>
                  <input
                    type="text"
                    value={content.about.name}
                    onChange={(e) => handleAboutChange({ name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Registro Profissional (CRO)</label>
                  <input
                    type="text"
                    value={content.about.cro}
                    onChange={(e) => handleAboutChange({ cro: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Badge Superior</label>
                  <input
                    type="text"
                    value={content.about.badge}
                    onChange={(e) => handleAboutChange({ badge: e.target.value })}
                    placeholder="RESPONSÁVEL TÉCNICO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Badge de Especialidade</label>
                  <input
                    type="text"
                    value={content.about.specialtyBadge}
                    onChange={(e) => handleAboutChange({ specialtyBadge: e.target.value })}
                    placeholder="ESPECIALISTA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Biografia / Apresentação Profissional</label>
                <textarea
                  rows={4}
                  value={content.about.bio}
                  onChange={(e) => handleAboutChange({ bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 leading-relaxed"
                />
              </div>

            </div>

          </div>

          {/* Estatísticas de Destaque */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Métricas de Autoridade (Destaques no Site)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Métrica 1</span>
                <input
                  type="text"
                  placeholder="1.200+"
                  value={content.about.stat1Value}
                  onChange={(e) => handleAboutChange({ stat1Value: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-cyan-700"
                />
                <input
                  type="text"
                  placeholder="Casos Planejados"
                  value={content.about.stat1Label}
                  onChange={(e) => handleAboutChange({ stat1Label: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Métrica 2</span>
                <input
                  type="text"
                  placeholder="10+ Anos"
                  value={content.about.stat2Value}
                  onChange={(e) => handleAboutChange({ stat2Value: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600"
                />
                <input
                  type="text"
                  placeholder="de Experiência"
                  value={content.about.stat2Label}
                  onChange={(e) => handleAboutChange({ stat2Label: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Métrica 3</span>
                <input
                  type="text"
                  placeholder="Zero"
                  value={content.about.stat3Value}
                  onChange={(e) => handleAboutChange({ stat3Value: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-600"
                />
                <input
                  type="text"
                  placeholder="Intercorrências"
                  value={content.about.stat3Label}
                  onChange={(e) => handleAboutChange({ stat3Label: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Contato Direto WhatsApp */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Contato WhatsApp da Seção "Sobre"</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Número de WhatsApp (com DDD)</label>
                <input
                  type="text"
                  placeholder="81999694866"
                  value={content.about.whatsappNumber}
                  onChange={(e) => handleAboutChange({ whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Mensagem Inicial Pré-configurada</label>
                <input
                  type="text"
                  value={content.about.whatsappMessage}
                  onChange={(e) => handleAboutChange({ whatsappMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CASO CLÍNICO */}
      {/* ========================================================================= */}
      {isNewCaseModalOpen && editingCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCase.title ? 'Editar Caso Clínico' : 'Novo Caso Clínico'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha as informações técnicas, conduta cirúrgica e anexe fotos tomográficas e clínicas.
                </p>
              </div>
              <button onClick={() => setIsNewCaseModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Título do Caso Clínico</label>
                <input
                  type="text"
                  placeholder="Ex: Reabilitação Total Superior com Carga Imediata e Seio Pneumatizado"
                  value={editingCase.title}
                  onChange={e => setEditingCase({ ...editingCase, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              {/* Checkbox Destaque na Capa */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <input
                  type="checkbox"
                  id="caseFeaturedOnHome"
                  checked={Boolean(editingCase.featuredOnHome)}
                  onChange={e => setEditingCase({ ...editingCase, featuredOnHome: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-700 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="caseFeaturedOnHome" className="text-xs font-semibold text-amber-950 cursor-pointer flex items-center space-x-1.5">
                  <span>⭐ Destacar este caso na Página Inicial (Exibir na vitrine de 3 casos da capa)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Badge / Categoria Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Protocolo All-on-4 / All-on-6"
                    value={editingCase.badge}
                    onChange={e => setEditingCase({ ...editingCase, badge: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tag Secundária / Técnica</label>
                  <input
                    type="text"
                    placeholder="Ex: Carga Imediata / Flapless"
                    value={editingCase.tag}
                    onChange={e => setEditingCase({ ...editingCase, tag: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Sistema / Marca do Implante</label>
                  <input
                    type="text"
                    placeholder="Ex: Neodent Grand Morse (GM) / Straumann BLX"
                    value={editingCase.implantBrand || ''}
                    onChange={e => setEditingCase({ ...editingCase, implantBrand: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tempo Cirúrgico Estimado</label>
                  <input
                    type="text"
                    placeholder="Ex: 25 min"
                    value={editingCase.surgicalTime || ''}
                    onChange={e => setEditingCase({ ...editingCase, surgicalTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600"
                  />
                </div>
              </div>

              {/* 1. Resumo da Técnica (Área Aumentada) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Resumo da Técnica (Exibido no Card da Vitrine / Capa)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(editingCase.description || '').length} caracteres
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Resumo executivo do caso para a vitrine e cards (ex: Implantes posteriores angulados a 30° com ancoragem no pilar zigomático-maxilar, dispensando enxertos ósseos invasivos e reduzindo o tempo cirúrgico para 25 minutos)..."
                  value={editingCase.description}
                  onChange={e => setEditingCase({ ...editingCase, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15 leading-relaxed font-sans min-h-[100px] resize-y"
                />
              </div>

              {/* 2. Estudo de Caso Completo (Área Ampla para Artigo / Dossiê) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                    <span>Estudo de Caso Completo & Conduta Clínica (Artigo / Dossiê Detalhado)</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-medium">
                      Página do Acervo
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(editingCase.fullContent || '').length} caracteres
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Área ampla para redação técnica: descreva a anamnese, diagnóstico tomográfico 3D, guia cirúrgico, sequência de fresagem, torques, estabilidade e protocolo protético.
                </p>
                <textarea
                  rows={10}
                  placeholder={`Detalhamento completo do caso para estudo dos colegas cirurgiões:
1. Diagnóstico e Planejamento Virtual 3D: Análise tomográfica Cone Beam da maxila...
2. Guia Cirúrgico Prototipado: Posicionamento axial dos implantes e fresagem guiada com irrigação copiosa...
3. Fixação e Carga Imediata: Estabilidade primária bicortical superior a 45 N.cm com captura dos transferentes no mesmo dia...`}
                  value={editingCase.fullContent || ''}
                  onChange={e => setEditingCase({ ...editingCase, fullContent: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15 leading-relaxed font-sans min-h-[220px] resize-y"
                />
              </div>

              {/* Métricas Clínicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Métrica 1 (Rótulo / Valor)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Desvio Angular"
                      value={editingCase.metric1Label}
                      onChange={e => setEditingCase({ ...editingCase, metric1Label: e.target.value })}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="< 0.4°"
                      value={editingCase.metric1Value}
                      onChange={e => setEditingCase({ ...editingCase, metric1Value: e.target.value })}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-cyan-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Métrica 2 (Rótulo / Valor)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Torque Final"
                      value={editingCase.metric2Label}
                      onChange={e => setEditingCase({ ...editingCase, metric2Label: e.target.value })}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="45 N.cm"
                      value={editingCase.metric2Value}
                      onChange={e => setEditingCase({ ...editingCase, metric2Value: e.target.value })}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Arquivo PDF para Download */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nome do Arquivo PDF de Laudo</label>
                  <input
                    type="text"
                    placeholder="Ex: Laudo_Cirurgico_Caso_01.pdf"
                    value={editingCase.pdfName || ''}
                    onChange={e => setEditingCase({ ...editingCase, pdfName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Link Externo do PDF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="https://... ou em branco para gerar auto"
                    value={editingCase.pdfUrl || ''}
                    onChange={e => setEditingCase({ ...editingCase, pdfUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-600 font-mono"
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* 📸 FOTOS DO CASO CLÍNICO (CAPA E GALERIA MULTI-FOTOS) */}
              {/* ======================================================== */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-cyan-700" />
                    <span>Fotos do Caso Clínico (Foto de Capa & Galeria de Imagens)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Anexe a foto de capa e adicione múltiplas fotos complementares (tomografias, radiografias, fotos intraorais antes/depois ou do guia em boca).
                  </p>
                </div>

                {/* 1. Foto Principal de Capa */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-600" />
                      <span>Foto Principal de Capa (Exibida no Card e Vitrine)</span>
                    </label>
                    {editingCase.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingCase({ ...editingCase, imageUrl: '' })}
                        className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Remover Foto de Capa</span>
                      </button>
                    )}
                  </div>

                  {editingCase.imageUrl ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative group flex items-center justify-center p-1">
                      <img src={editingCase.imageUrl} alt="Capa" className="w-full h-full object-contain" />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono">
                        Capa Ativa
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span>Nenhuma foto principal selecionada</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">O site exibirá o gráfico 3D padrão se não houver foto</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-xs">
                      <UploadCloud className="w-4 h-4 text-cyan-600" />
                      <span>Escolher Capa do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageUpload(e, url => setEditingCase({ ...editingCase, imageUrl: url }))}
                      />
                    </label>
                    <span className="text-[11px] text-slate-400 text-center sm:text-left">ou</span>
                    <input
                      type="text"
                      placeholder="Cole a URL da foto de capa aqui..."
                      value={editingCase.imageUrl || ''}
                      onChange={e => setEditingCase({ ...editingCase, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>

                {/* 2. Galeria de Fotos Adicionais do Caso */}
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-700" />
                        <span>Galeria de Fotos Adicionais do Caso</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {(editingCase.galleryImages || []).length} fotos adicionadas na galeria
                      </span>
                    </div>

                    <label className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Adicionar Fotos (Múltiplas)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          try {
                            const base64List = await Promise.all(files.map(f => fileToBase64(f)));
                            const current = editingCase.galleryImages || [];
                            setEditingCase({
                              ...editingCase,
                              galleryImages: [...current, ...base64List]
                            });
                          } catch (err) {
                            alert('Erro ao carregar fotos da galeria.');
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Input para adicionar foto na galeria via URL */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Ou cole a URL de uma foto para incluir na galeria..."
                      value={newGalleryUrl}
                      onChange={e => setNewGalleryUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGalleryUrl.trim()) return;
                        const current = editingCase.galleryImages || [];
                        setEditingCase({
                          ...editingCase,
                          galleryImages: [...current, newGalleryUrl.trim()]
                        });
                        setNewGalleryUrl('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      + Adicionar URL
                    </button>
                  </div>

                  {/* Grid de Thumbnails da Galeria */}
                  {(editingCase.galleryImages && editingCase.galleryImages.length > 0) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {editingCase.galleryImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video shadow-xs flex items-center justify-center p-1">
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = editingCase.galleryImages || [];
                                  setEditingCase({
                                    ...editingCase,
                                    galleryImages: current.filter((_, i) => i !== idx)
                                  });
                                }}
                                className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                title="Remover Foto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const current = editingCase.galleryImages || [];
                                const selectedImg = current[idx];
                                const oldMain = editingCase.imageUrl;
                                const nextGallery = current.filter((_, i) => i !== idx);
                                if (oldMain) nextGallery.unshift(oldMain);
                                setEditingCase({
                                  ...editingCase,
                                  imageUrl: selectedImg,
                                  galleryImages: nextGallery
                                });
                              }}
                              className="w-full py-1 rounded bg-cyan-700/90 hover:bg-cyan-700 text-white text-[10px] font-mono font-medium text-center cursor-pointer transition-colors"
                              title="Tornar esta imagem a foto principal de capa"
                            >
                              Tornar Capa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Nenhuma foto adicional adicionada ainda. Você pode enviar várias imagens de uma vez clicando no botão acima.
                    </p>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewCaseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingCase.title.trim()) {
                    alert('Por favor, informe o título do caso clínico.');
                    return;
                  }
                  const exists = content.cases.some(item => item.id === editingCase.id);
                  const updatedCases = exists
                    ? content.cases.map(item => item.id === editingCase.id ? editingCase : item)
                    : [...content.cases, editingCase];
                  applyContentChange({
                    ...content,
                    cases: updatedCases
                  });
                  setIsNewCaseModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE SERVIÇO */}
      {/* ========================================================================= */}
      {isNewServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingService.title ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setIsNewServiceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Título do Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Planejamento Virtual 3D"
                  value={editingService.title}
                  onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Ícone Representativo</label>
                <select
                  value={editingService.iconType}
                  onChange={e => setEditingService({ ...editingService, iconType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="cpu">Tecnologia / CAD (CPU)</option>
                  <option value="shield">Segurança / Guia Fixo (Escudo)</option>
                  <option value="lock">Pay-to-Unlock / Cadeado</option>
                  <option value="user">Consultoria / Especialista</option>
                  <option value="layers">Camadas / 3D</option>
                  <option value="sparkles">Inovação / Destaque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Tópicos / Destaques (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Alinhamento DICOM + STL, Posição 3D, Todas as marcas"
                  value={editingService.highlights.join(', ')}
                  onChange={e => setEditingService({ 
                    ...editingService, 
                    highlights: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingService.title.trim()) {
                    alert('Informe o título do serviço.');
                    return;
                  }
                  const exists = content.services.some(item => item.id === editingService.id);
                  const updatedServices = exists
                    ? content.services.map(item => item.id === editingService.id ? editingService : item)
                    : [...content.services, editingService];
                  applyContentChange({
                    ...content,
                    services: updatedServices
                  });
                  setIsNewServiceModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CURSO */}
      {/* ========================================================================= */}
      {isNewCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCourse.title ? 'Editar Curso' : 'Novo Curso'}
              </h3>
              <button onClick={() => setIsNewCourseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Título do Curso</label>
                <input
                  type="text"
                  placeholder="Ex: Imersão em Cirurgia Guiada"
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Formato</label>
                  <input
                    type="text"
                    placeholder="Presencial Intensivo / Online"
                    value={editingCourse.format}
                    onChange={e => setEditingCourse({ ...editingCourse, format: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Badge / Status</label>
                  <input
                    type="text"
                    placeholder="Vagas Limitadas / Turmas Abertas"
                    value={editingCourse.badge}
                    onChange={e => setEditingCourse({ ...editingCourse, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Descrição</label>
                <textarea
                  rows={3}
                  value={editingCourse.description}
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Tópicos Inclusos (um por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Hands-on em manequins 3D&#10;Cirurgia ao vivo comentada&#10;Certificado incluso"
                  value={editingCourse.topics.join('\n')}
                  onChange={e => setEditingCourse({
                    ...editingCourse,
                    topics: e.target.value.split('\n').filter(Boolean)
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Texto do Botão CTA</label>
                  <input
                    type="text"
                    placeholder="Consultar Próxima Turma"
                    value={editingCourse.ctaText}
                    onChange={e => setEditingCourse({ ...editingCourse, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Mensagem pro WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Olá Dr. Ricardo! Quero saber do curso..."
                    value={editingCourse.whatsappMessage}
                    onChange={e => setEditingCourse({ ...editingCourse, whatsappMessage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewCourseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingCourse.title.trim()) {
                    alert('Informe o título do curso.');
                    return;
                  }
                  const exists = content.courses.some(item => item.id === editingCourse.id);
                  const updatedCourses = exists
                    ? content.courses.map(item => item.id === editingCourse.id ? editingCourse : item)
                    : [...content.courses, editingCourse];
                  applyContentChange({
                    ...content,
                    courses: updatedCourses
                  });
                  setIsNewCourseModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE DEPOIMENTO */}
      {/* ========================================================================= */}
      {isNewTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTestimonial.dentistName ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h3>
              <button onClick={() => setIsNewTestimonialModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Nome do Dentista</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Alexandre Vasconcelos"
                  value={editingTestimonial.dentistName}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, dentistName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Especialidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Especialista em Implantodontia"
                    value={editingTestimonial.role}
                    onChange={e => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="Ex: Recife/PE"
                    value={editingTestimonial.cityState}
                    onChange={e => setEditingTestimonial({ ...editingTestimonial, cityState: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Depoimento</label>
                <textarea
                  rows={4}
                  placeholder="Relato do cirurgião sobre o sistema ou atendimento..."
                  value={editingTestimonial.quote}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Nota (1 a 5 estrelas)</label>
                <select
                  value={editingTestimonial.rating}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                  <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-700 block">Foto do Profissional (Opcional)</label>
                <div className="flex items-center space-x-2">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Upload de Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageUpload(e, url => setEditingTestimonial({ ...editingTestimonial, avatarUrl: url }))}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">ou</span>
                  <input
                    type="text"
                    placeholder="URL da foto"
                    value={editingTestimonial.avatarUrl || ''}
                    onChange={e => setEditingTestimonial({ ...editingTestimonial, avatarUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewTestimonialModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingTestimonial.dentistName.trim()) {
                    alert('Informe o nome do dentista.');
                    return;
                  }
                  const exists = content.testimonials.some(item => item.id === editingTestimonial.id);
                  const updatedTestimonials = exists
                    ? content.testimonials.map(item => item.id === editingTestimonial.id ? editingTestimonial : item)
                    : [...content.testimonials, editingTestimonial];
                  applyContentChange({
                    ...content,
                    testimonials: updatedTestimonials
                  });
                  setIsNewTestimonialModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
