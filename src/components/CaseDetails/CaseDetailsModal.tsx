import React, { useState } from 'react';
import { DentalCase, UserType, CaseFile } from '../../types';
import { DentalViewer3D } from '../DentalViewer3D/DentalViewer3D';
import { PaymentModal } from '../PaymentModal/PaymentModal';
import { DeliverPlanningModal } from './DeliverPlanningModal';
import { 
  X, 
  Lock, 
  Unlock, 
  Download, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Award,
  Trash2,
  Scan,
  FileCode,
  Info,
  Eye,
  Box,
  Send,
  UploadCloud,
  Sparkles
} from 'lucide-react';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DentalCase | null;
  onPaymentSuccess: (caseId: string) => void;
  userType?: UserType;
  onAcceptCase?: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
  onDeliverPlanning?: (
    caseId: string, 
    newFiles: CaseFile[], 
    notes?: string, 
    amount?: number,
    notifyWhatsApp?: boolean
  ) => Promise<void> | void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onPaymentSuccess,
  userType = 'ADMIN',
  onAcceptCase,
  onDeleteCase,
  onDeliverPlanning
}) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDeliverPlanningOpen, setIsDeliverPlanningOpen] = useState(false);
  const [selected3DFileId, setSelected3DFileId] = useState<string | undefined>(undefined);
  const [analysisViewMode, setAnalysisViewMode] = useState<'FILES' | '3D'>('FILES');

  if (!isOpen || !caseItem) return null;

  const isPaid = caseItem.status === 'APPROVED_PAID' || caseItem.status === 'IN_PRODUCTION' || caseItem.status === 'COMPLETED';

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-6xl my-auto rounded-2xl glass-panel-glow bg-cyber-bg border border-cyber-border overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          
          {/* Header Modal */}
          <div className="p-6 border-b border-cyber-border flex items-center justify-between flex-wrap gap-4 bg-cyber-surface/90">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    {caseItem.patientName}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-cyber-cyan">
                    {caseItem.caseCode}
                  </span>
                  {caseItem.priority === 'URGENT' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Solicitante: {caseItem.dentistName} ({caseItem.dentistCro})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botões de Ação por Status */}
              {caseItem.status === 'ANALYSIS' ? (
                userType === 'ADMIN' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAcceptCase && onAcceptCase(caseItem.id)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receber & Iniciar</span>
                    </button>
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5 active:scale-95"
                      title="Enviar arquivos CAD/CAM (Guia STL e Relatório) para o dentista"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Planejamento</span>
                    </button>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir este caso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aguardando Aceite do Dr. Ricardo</span>
                    </div>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-mono transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
                        title="Excluir caso (permitido antes do Dr. Ricardo aceitar e iniciar o planejamento)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Caso</span>
                      </button>
                    )}
                  </div>
                )
              ) : !isPaid ? (
                userType === 'CLIENT' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Aprovar & Pagar PIX (R$ {caseItem.payment.amount.toFixed(2)})</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5 active:scale-95"
                      title="Enviar ou atualizar arquivos do planejamento CAD para o dentista"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar / Atualizar Guia STL</span>
                    </button>
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aguardando Aprovação e Pagamento</span>
                    </div>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir este caso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Projeto Pago & Liberado</span>
                  </div>
                  {userType === 'ADMIN' && (
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan text-xs font-medium transition-all flex items-center space-x-1.5 active:scale-95"
                      title="Enviar arquivos adicionais ou atualizados"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Adicionar Arquivo</span>
                    </button>
                  )}
                  {userType === 'ADMIN' && onDeleteCase && (
                    <button
                      onClick={() => onDeleteCase(caseItem.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir este caso (Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Modal com Scroll */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Se o caso estiver em ANALYSIS: Exibir Painel de Inspeção dos Arquivos do Paciente Enviados */}
            {caseItem.status === 'ANALYSIS' ? (
              <div className="rounded-2xl glass-panel border border-cyber-cyan/30 bg-cyber-surface/60 overflow-hidden shadow-glow-cyan/10">
                {/* Cabeçalho do Painel de Arquivos */}
                <div className="p-4 sm:p-5 border-b border-cyber-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyber-surface/80">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                          Arquivos Enviados pelo Dentista para Avaliação
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          AGUARDANDO PLANEJAMENTO
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Paciente: <strong className="text-slate-200">{caseItem.patientName}</strong> • {caseItem.files.length} arquivo(s) disponível(is) para download e inspeção
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAnalysisViewMode(prev => prev === 'FILES' ? '3D' : 'FILES')}
                      className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-cyan/40 text-cyber-cyan text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                    >
                      {analysisViewMode === 'FILES' ? (
                        <>
                          <Box className="w-3.5 h-3.5" />
                          <span>Abrir no Visualizador 3D</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Lista de Arquivos</span>
                        </>
                      )}
                    </button>

                    {userType === 'ADMIN' && (
                      <div className="flex items-center space-x-2">
                        {onAcceptCase && (
                          <button
                            onClick={() => onAcceptCase(caseItem.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Receber & Iniciar 3D</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsDeliverPlanningOpen(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5 active:scale-95"
                          title="Enviar guia cirúrgica STL e relatório para o dentista"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Planejamento</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {analysisViewMode === '3D' ? (
                  <div className="p-4">
                    <DentalViewer3D 
                      patientName={caseItem.patientName} 
                      caseCode={caseItem.caseCode} 
                      isUnlocked={false}
                      files={caseItem.files}
                      selectedFileId={selected3DFileId}
                      onSelectFile={(f) => setSelected3DFileId(f.id)}
                    />
                  </div>
                ) : (
                  <>
                    {/* Banner Informativo */}
                    <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start space-x-3">
                      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-200 space-y-1">
                        <p className="font-semibold text-blue-100">
                          Simulação 3D e Guia Cirúrgica em Fase de Avaliação
                        </p>
                        <p className="text-blue-300/80 leading-relaxed text-[11px]">
                          Os arquivos clínicos brutos foram recebidos com sucesso. A visualização tridimensional com os implantes posicionados e a guia cirúrgica sob medida serão geradas e disponibilizadas após o Dr. Ricardo realizar o planejamento técnico.
                        </p>
                      </div>
                    </div>

                    {/* Lista de Arquivos Enviados */}
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {caseItem.files.map((file) => {
                          const isDicom = file.type === 'TOMOGRAPHY' || file.name.toLowerCase().endsWith('.dcm') || file.name.toLowerCase().includes('dcm') || file.name.toLowerCase().includes('tomo');
                          const isStl = file.type === 'SCAN_PRE' || file.type === 'SCAN_OPP' || file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.ply');

                          let categoryLabel = 'Arquivo Clínico';
                          let badgeColor = 'text-slate-400 border-slate-500/30 bg-slate-500/10';
                          if (isDicom) {
                            categoryLabel = 'Tomografia Cone Beam (DICOM)';
                            badgeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
                          } else if (isStl) {
                            categoryLabel = 'Escaneamento Intraoral (STL)';
                            badgeColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
                          } else if (file.type === 'BITE') {
                            categoryLabel = 'Registro Oclusal (Bite)';
                            badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
                          }

                          return (
                            <div
                              key={file.id}
                              className="p-4 rounded-xl bg-cyber-card/80 border border-cyber-border hover:border-cyber-cyan/40 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className={`p-3 rounded-xl shrink-0 ${
                                  isDicom 
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' 
                                    : isStl 
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                                    : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                                }`}>
                                  {isDicom ? <Scan className="w-5 h-5" /> : isStl ? <FileCode className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>

                                <div className="truncate">
                                  <span className="text-xs font-mono font-medium text-white block truncate group-hover:text-cyber-cyan transition-colors" title={file.name}>
                                    {file.name}
                                  </span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${badgeColor}`}>
                                      {categoryLabel}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {file.size}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center space-x-2">
                                {(isDicom || isStl) && (
                                  <button
                                    onClick={() => {
                                      setSelected3DFileId(file.id);
                                      setAnalysisViewMode('3D');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-cyan hover:text-black border border-cyber-border text-slate-300 text-xs font-semibold transition-all flex items-center space-x-1"
                                    title="Inspecionar no Visualizador 3D"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-cyber-cyan" />
                                    <span className="hidden sm:inline">Ver 3D</span>
                                  </button>
                                )}

                                <a
                                  href={file.downloadUrl || '#'}
                                  download={file.name}
                                  onClick={(e) => {
                                    if (!file.downloadUrl || file.downloadUrl === '#') {
                                      e.preventDefault();
                                      alert(`Iniciando download do arquivo clínico: ${file.name}`);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan hover:text-black border border-cyber-cyan/30 text-cyber-cyan text-xs font-semibold transition-all flex items-center space-x-1.5"
                                  title="Baixar este arquivo para inspeção"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Baixar</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Visualizador 3D Integrado (Disponível quando o caso já foi planejado / aceito) */
              <div id="dental-3d-viewer-container">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Ambiente de Inspeção 3D do Caso (Tridimensional WebGL)</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Rotacione com o botão esquerdo | Zoom com a roda do mouse
                  </span>
                </div>
                <DentalViewer3D 
                  patientName={caseItem.patientName} 
                  caseCode={caseItem.caseCode} 
                  isUnlocked={isPaid}
                  files={caseItem.files}
                  selectedFileId={selected3DFileId}
                  onSelectFile={(f) => setSelected3DFileId(f.id)}
                />
              </div>
            )}

            {/* Grid com Informações Técnicas e Arquivos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Coluna 1: Especificações Clínicas */}
              <div className="p-5 rounded-2xl glass-panel border border-cyber-border space-y-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white border-b border-cyber-border pb-3">
                  <Award className="w-4 h-4 text-cyber-cyan" />
                  <span>Especificações do Planejamento</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono">Tipo de Guia Cirúrgica:</span>
                    <span className="font-semibold text-slate-200">
                      {caseItem.surgicalGuideType.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-mono">Sítios & Implantes Planejados:</span>
                    <div className="mt-1 space-y-1.5">
                      {caseItem.implantSites.map((site, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-cyber-surface/80 border border-cyber-border flex items-center justify-between">
                          <span className="font-mono text-cyber-cyan font-bold">Dente {site.toothNumber}</span>
                          <span className="text-slate-300">{site.implantBrand} ({site.implantDiameter}x{site.implantLength}mm)</span>
                          {site.boneDensity && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-card border border-cyber-border text-slate-400">
                              {site.boneDensity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-mono">Notas Clínicas do Dr. Ricardo:</span>
                    <p className="mt-1 p-2.5 rounded-lg bg-cyber-surface/60 border border-cyber-border text-slate-300 italic text-[11px] leading-relaxed">
                      "{caseItem.notes || 'Sem observações adicionais.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Dados do Dentista & Prazos */}
              <div className="p-5 rounded-2xl glass-panel border border-cyber-border space-y-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white border-b border-cyber-border pb-3">
                  <User className="w-4 h-4 text-cyber-cyan" />
                  <span>Dentista Solicitante</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono">Nome do Colega:</span>
                    <span className="font-semibold text-white text-sm">{caseItem.dentistName}</span>
                    <span className="text-slate-400 block">{caseItem.dentistCro}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{caseItem.dentistPhone}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-cyber-surface/70 border border-cyber-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Criado em:</span>
                      <span className="text-slate-300">{new Date(caseItem.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Previsão Cirúrgica:</span>
                      <span className="text-cyber-cyan font-semibold">{new Date(caseItem.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-cyber-border">
                      <span className="text-slate-400 font-mono">Valor do Planejamento:</span>
                      <span className="font-bold text-white font-mono">R$ {caseItem.payment.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Arquivos & Gatekeeper Pay-to-Unlock */}
              <div className="p-5 rounded-2xl glass-panel-glow border border-cyber-border space-y-4">
                <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                    <FileText className="w-4 h-4 text-cyber-cyan" />
                    <span>Repositório de Arquivos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userType === 'ADMIN' && (
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                        title="Enviar ou atualizar guia STL e relatório cirúrgico"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Enviar Guia STL</span>
                      </button>
                    )}
                    {isPaid ? (
                      <span className="text-[11px] font-mono text-cyber-emerald flex items-center space-x-1">
                        <Unlock className="w-3 h-3" />
                        <span>Liberado</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-cyber-amber flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Bloqueado</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {caseItem.files.map((file) => {
                    const isFileLocked = !isPaid && file.isLocked;

                    return (
                      <div
                        key={file.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isFileLocked 
                            ? 'bg-cyber-surface/40 border-cyber-border/50 opacity-75' 
                            : 'bg-cyber-surface border-cyber-border hover:border-cyber-cyan/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`p-2 rounded-lg ${isFileLocked ? 'bg-amber-500/10 text-amber-400' : 'bg-cyber-cyan/10 text-cyber-cyan'}`}>
                            {isFileLocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-mono font-medium text-slate-200 block truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {file.size} • {file.type}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isFileLocked ? (
                            <button
                              onClick={() => setIsPaymentOpen(true)}
                              className="px-2.5 py-1 rounded bg-cyber-amber/10 border border-cyber-amber/30 text-cyber-amber text-[10px] font-semibold hover:bg-cyber-amber/20 transition-colors whitespace-nowrap"
                            >
                              Pagar p/ Baixar
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              {(file.type === 'TOMOGRAPHY' || file.type === 'SCAN_PRE' || file.type === 'SCAN_OPP' || file.type === 'GUIDE_STL' || file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.dcm')) && (
                                <button
                                  onClick={() => {
                                    setSelected3DFileId(file.id);
                                    if (analysisViewMode === 'FILES') setAnalysisViewMode('3D');
                                    const viewerEl = document.getElementById('dental-3d-viewer-container');
                                    if (viewerEl) {
                                      viewerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all flex items-center space-x-1 whitespace-nowrap active:scale-95 ${
                                    selected3DFileId === file.id
                                      ? 'bg-cyber-cyan text-black font-bold shadow-glow-cyan'
                                      : 'bg-cyber-surface hover:bg-cyber-cyan hover:text-black border border-cyber-border text-slate-300'
                                  }`}
                                  title="Visualizar este arquivo no visualizador 3D acima"
                                >
                                  <Eye className={`w-3 h-3 ${selected3DFileId === file.id ? 'text-black' : 'text-cyber-cyan'}`} />
                                  <span>{selected3DFileId === file.id ? 'No 3D' : 'Ver 3D'}</span>
                                </button>
                              )}
                              <a
                                href={file.downloadUrl || '#'}
                                download={file.name}
                                onClick={(e) => {
                                  if (!file.downloadUrl || file.downloadUrl === '#') {
                                    e.preventDefault();
                                    alert(`Iniciando download seguro do arquivo: ${file.name}`);
                                  }
                                }}
                                className="px-2.5 py-1 rounded bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan text-[10px] font-semibold hover:bg-cyber-cyan hover:text-black transition-colors flex items-center space-x-1 whitespace-nowrap"
                              >
                                <span>Baixar</span>
                                <Download className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botão de Liberar Guia / Ações do Administrador */}
                {caseItem.status === 'ANALYSIS' ? (
                  <div className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border text-center space-y-2.5">
                    <div className="flex items-center justify-center space-x-1.5 text-blue-300 text-xs font-mono font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Em Análise Clínica</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {userType === 'ADMIN'
                        ? 'Analise os arquivos do paciente acima. Você pode iniciar o caso ou enviar diretamente a guia STL e relatório final.'
                        : 'A guia cirúrgica e o relatório de perfurações serão disponibilizados para liberação e download assim que o Dr. Ricardo concluir o planejamento 3D.'}
                    </p>
                    {userType === 'ADMIN' && (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => setIsDeliverPlanningOpen(true)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar Guia STL & Relatório ao Dentista</span>
                        </button>
                        {onAcceptCase && (
                          <button
                            onClick={() => onAcceptCase(caseItem.id)}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-medium text-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Apenas Iniciar Planejamento</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : !isPaid ? (
                  userType === 'CLIENT' ? (
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Liberar Guia Cirúrgica (PIX)</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-cyan/30 text-center space-y-2.5">
                      <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-mono font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Planejamento Enviado • Aguardando Aprovação/PIX</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        O dentista foi notificado. Caso precise atualizar os arquivos STL ou PDF do planejamento, clique abaixo:
                      </p>
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Reenviar / Atualizar Guia STL & Relatório</span>
                      </button>
                    </div>
                  )
                ) : (
                  userType === 'ADMIN' ? (
                    <div className="p-3 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-1.5 text-cyber-emerald text-xs font-mono font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Caso Aprovado & Pago pelo Dentista</span>
                      </div>
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-cyber-surface hover:bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Adicionar Arquivo Complementar</span>
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Envio de Planejamento CAD/CAM (Dr. Ricardo -> Dentista) */}
      <DeliverPlanningModal
        isOpen={isDeliverPlanningOpen}
        onClose={() => setIsDeliverPlanningOpen(false)}
        caseItem={caseItem}
        onDeliverPlanning={onDeliverPlanning}
      />

      {/* Modal de Pagamento PIX */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        caseItem={caseItem}
        onPaymentSuccess={onPaymentSuccess}
      />
    </>
  );
};
