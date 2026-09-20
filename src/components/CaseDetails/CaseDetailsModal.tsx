import React, { useState } from 'react';
import { DentalCase, UserType, CaseFile } from '../../types';
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
  Activity, 
  Award, 
  Trash2, 
  Scan, 
  FileCode, 
  Info, 
  Send, 
  UploadCloud, 
  Sparkles,
  Layers,
  Archive
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

  if (!isOpen || !caseItem) return null;

  const isPaid = caseItem.status === 'APPROVED_PAID' || caseItem.status === 'IN_PRODUCTION' || caseItem.status === 'COMPLETED' || caseItem.payment?.status === 'PAID';

  // Verifica se o laboratório/admin já enviou os arquivos do planejamento (guia cirúrgica STL, relatório PDF ou arquivos bloqueados)
  const hasDeliveredPlanningFiles = caseItem.files.some(f => f.isLocked || f.type === 'GUIDE_STL');

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-6xl my-auto rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-800">
          
          {/* Header Modal */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 bg-slate-50/90">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                    {caseItem.patientName}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                    {caseItem.caseCode}
                  </span>
                  {caseItem.priority === 'URGENT' && (
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold">
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Solicitante: <span className="text-slate-700 font-medium">{caseItem.dentistName}</span> ({caseItem.dentistCro})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botões de Ação por Status */}
              {!hasDeliveredPlanningFiles && !isPaid ? (
                userType === 'ADMIN' ? (
                  <div className="flex items-center space-x-2">
                    {caseItem.status === 'ANALYSIS' && onAcceptCase && (
                      <button
                        onClick={() => onAcceptCase(caseItem.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Receber & Iniciar</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                      title="Enviar arquivos CAD/CAM (Guia STL e Relatório) para o dentista"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Planejamento</span>
                    </button>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Excluir este caso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-sans font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {caseItem.status === 'PLANNING'
                          ? 'Planejamento 3D em Andamento'
                          : 'Aguardando Avaliação do Dr. Ricardo'}
                      </span>
                    </div>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-sans transition-all flex items-center space-x-1.5 active:scale-95 shadow-xs cursor-pointer"
                        title="Excluir caso"
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Aprovar & Pagar PIX (R$ {caseItem.payment.amount.toFixed(2)})</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                      title="Enviar ou atualizar arquivos do planejamento CAD para o dentista"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar / Atualizar Guia STL</span>
                    </button>
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Aguardando Aprovação e Pagamento</span>
                    </div>
                    {onDeleteCase && (
                      <button
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Excluir este caso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Projeto Pago & Liberado</span>
                  </div>
                  {userType === 'ADMIN' && (
                    <button
                      onClick={() => setIsDeliverPlanningOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-cyan-700 text-xs font-sans font-medium transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                      title="Enviar arquivos adicionais ou atualizados"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Adicionar Arquivo</span>
                    </button>
                  )}
                  {userType === 'ADMIN' && onDeleteCase && (
                    <button
                      onClick={() => onDeleteCase(caseItem.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Excluir este caso (Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Modal com Scroll */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Se ainda não foi entregue o planejamento: Exibir Painel de Inspeção dos Arquivos do Paciente Enviados */}
            {!hasDeliveredPlanningFiles && !isPaid ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-xs">
                {/* Cabeçalho do Painel de Arquivos */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-sans">
                          Arquivos Enviados pelo Dentista para Avaliação
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                          {caseItem.status === 'PLANNING' ? 'EM PLANEJAMENTO 3D' : 'AGUARDANDO PLANEJAMENTO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-sans">
                        Paciente: <strong className="text-slate-800">{caseItem.patientName}</strong> • {caseItem.files.length} arquivo(s) disponível(is) para download e inspeção
                      </p>
                    </div>
                  </div>

                  {userType === 'ADMIN' && (
                    <div className="flex items-center space-x-2">
                      {caseItem.status === 'ANALYSIS' && onAcceptCase && (
                        <button
                          onClick={() => onAcceptCase(caseItem.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Receber & Iniciar Planejamento</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                        title="Enviar guia cirúrgica STL e relatório para o dentista"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Planejamento</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Banner Informativo */}
                <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start space-x-3">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 space-y-1">
                    <p className="font-semibold text-blue-950 font-sans">
                      Arquivos Clínicos em Fase de Avaliação
                    </p>
                    <p className="text-blue-800/80 leading-relaxed text-[11px] font-sans">
                      Os arquivos clínicos brutos foram recebidos com sucesso. A guia cirúrgica sob medida e o relatório de perfurações serão gerados e disponibilizados para download após o Dr. Ricardo realizar o planejamento técnico.
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
                      let badgeColor = 'text-slate-600 border-slate-200 bg-slate-50';
                      if (isDicom) {
                        categoryLabel = 'Tomografia Cone Beam (DICOM)';
                        badgeColor = 'text-blue-700 border-blue-200 bg-blue-50';
                      } else if (isStl) {
                        categoryLabel = 'Escaneamento Intraoral (STL)';
                        badgeColor = 'text-purple-700 border-purple-200 bg-purple-50';
                      } else if (file.type === 'BITE') {
                        categoryLabel = 'Registro Oclusal (Bite)';
                        badgeColor = 'text-amber-700 border-amber-200 bg-amber-50';
                      }

                      return (
                        <div
                          key={file.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`p-3 rounded-xl shrink-0 ${
                              isDicom 
                                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                                : isStl 
                                ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                                : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                            }`}>
                              {isDicom ? <Scan className="w-5 h-5" /> : isStl ? <FileCode className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>

                            <div className="truncate">
                              <span className="text-xs font-mono font-medium text-slate-800 block truncate group-hover:text-cyan-700 transition-colors" title={file.name}>
                                {file.name}
                              </span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-medium ${badgeColor}`}>
                                  {categoryLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {file.size}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center space-x-2">
                            <a
                              href={file.downloadUrl || '#'}
                              download={file.name}
                              onClick={(e) => {
                                if (!file.downloadUrl || file.downloadUrl === '#') {
                                  e.preventDefault();
                                  alert(`Iniciando download do arquivo clínico: ${file.name}`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-600 hover:text-white border border-cyan-200 text-cyan-700 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
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
              </div>
            ) : null}

            {/* Grid com Informações Técnicas e Arquivos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Coluna 1: Especificações Clínicas */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-sans">
                  <Award className="w-4 h-4 text-cyan-600" />
                  <span>Especificações do Planejamento</span>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block font-medium">Tipo de Guia Cirúrgica:</span>
                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                      {caseItem.surgicalGuideType.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-medium">Sítios & Implantes Planejados:</span>
                    <div className="mt-1 space-y-1.5">
                      {caseItem.implantSites.map((site, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="font-sans text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                            Dente {site.toothNumber}
                          </span>
                          <span className="text-slate-700 font-medium">{site.implantBrand} ({site.implantDiameter}x{site.implantLength}mm)</span>
                          {site.boneDensity && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                              {site.boneDensity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-medium">Notas Clínicas do Dr. Ricardo:</span>
                    <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic text-[11px] leading-relaxed">
                      "{caseItem.notes || 'Sem observações adicionais.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Dados do Dentista & Prazos */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-sans">
                  <User className="w-4 h-4 text-cyan-600" />
                  <span>Dentista Solicitante</span>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block font-medium">Nome do Colega:</span>
                    <span className="font-bold text-slate-900 text-sm">{caseItem.dentistName}</span>
                    <span className="text-slate-500 block">{caseItem.dentistCro}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{caseItem.dentistPhone}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Criado em:</span>
                      <span className="text-slate-800 font-medium">{new Date(caseItem.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Previsão Cirúrgica:</span>
                      <span className="text-cyan-700 font-semibold">{new Date(caseItem.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-200">
                      <span className="text-slate-600 font-medium">Valor do Planejamento:</span>
                      <span className="font-bold text-slate-900 text-sm">R$ {caseItem.payment.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Arquivos & Gatekeeper Pay-to-Unlock */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 font-sans">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span>Repositório de Arquivos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPaid ? (
                      <span className="text-xs font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1 shrink-0">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>Liberado</span>
                      </span>
                    ) : hasDeliveredPlanningFiles ? (
                      <span className="text-xs font-sans font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1 shrink-0">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>{userType === 'ADMIN' ? 'Aguardando Pagamento' : 'Aguardando PIX'}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-sans font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center space-x-1 shrink-0">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{caseItem.status === 'PLANNING' ? 'Em Planejamento' : 'Em Análise'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {caseItem.files.map((file) => {
                    // O arquivo só é bloqueado para o CLIENTE antes do pagamento; o ADMIN sempre pode baixar
                    const isFileLocked = userType === 'CLIENT' && !isPaid && file.isLocked;
                    const lowerName = file.name.toLowerCase();
                    const isDicom = file.type === 'TOMOGRAPHY' || lowerName.endsWith('.dcm') || lowerName.includes('dicom') || lowerName.includes('tomo');
                    const isPdf = file.type === 'REPORT_PDF' || lowerName.endsWith('.pdf');
                    const isZip = lowerName.endsWith('.zip') || lowerName.endsWith('.rar') || lowerName.endsWith('.7z');
                    const isStl = file.type === 'GUIDE_STL' || file.type === 'SCAN_PRE' || file.type === 'SCAN_OPP' || lowerName.endsWith('.stl') || lowerName.endsWith('.ply');

                    let categoryLabel = 'Arquivo Clínico';
                    if (file.type === 'GUIDE_STL' || lowerName.includes('guia')) categoryLabel = 'Guia Cirúrgica (STL)';
                    else if (isPdf) categoryLabel = 'Relatório Cirúrgico (PDF)';
                    else if (isDicom) categoryLabel = 'Tomografia (DICOM)';
                    else if (isZip) categoryLabel = 'Arquivo Compactado (.ZIP)';
                    else if (isStl) categoryLabel = 'Modelo 3D (STL)';

                    return (
                      <div
                        key={file.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isFileLocked 
                            ? 'bg-slate-50 border-slate-200/80 opacity-80' 
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-cyan-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isFileLocked 
                              ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                              : isDicom 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : isZip
                              ? 'bg-purple-50 text-purple-600 border border-purple-200'
                              : isPdf
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                          }`}>
                            {isFileLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : isDicom ? (
                              <Layers className="w-4 h-4 text-blue-600" />
                            ) : isZip ? (
                              <Archive className="w-4 h-4 text-purple-600" />
                            ) : isPdf ? (
                              <FileText className="w-4 h-4 text-rose-600" />
                            ) : (
                              <FileCode className="w-4 h-4 text-cyan-600" />
                            )}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-mono font-medium text-slate-800 block truncate" title={file.name}>
                              {file.name}
                            </span>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-sans">
                                {file.size} • {categoryLabel}
                              </span>
                              {userType === 'ADMIN' && file.isLocked && !isPaid && (
                                <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/80 font-medium">
                                  Bloqueado p/ Dentista
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isFileLocked ? (
                            <button
                              onClick={() => setIsPaymentOpen(true)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                            >
                              Pagar p/ Baixar
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <a
                                href={file.downloadUrl || '#'}
                                download={file.name}
                                onClick={(e) => {
                                  if (!file.downloadUrl || file.downloadUrl === '#') {
                                    e.preventDefault();
                                    alert(`Iniciando download seguro do arquivo: ${file.name}`);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-600 hover:text-white border border-cyan-200 text-cyan-700 text-xs font-semibold transition-colors flex items-center space-x-1 whitespace-nowrap cursor-pointer"
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
                {!hasDeliveredPlanningFiles && !isPaid ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                    <div className="flex items-center justify-center space-x-1.5 text-blue-700 text-xs font-sans font-semibold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {caseItem.status === 'PLANNING' ? 'Planejamento 3D em Andamento' : 'Em Análise Clínica'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      {userType === 'ADMIN'
                        ? 'Analise os arquivos do paciente acima. Você pode iniciar o caso ou enviar diretamente a guia STL e relatório final.'
                        : 'A guia cirúrgica e o relatório de perfurações serão disponibilizados para liberação e download assim que o Dr. Ricardo concluir o planejamento técnico.'}
                    </p>
                    {userType === 'ADMIN' && (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => setIsDeliverPlanningOpen(true)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar Guia STL & Relatório ao Dentista</span>
                        </button>
                        {caseItem.status === 'ANALYSIS' && onAcceptCase && (
                          <button
                            onClick={() => onAcceptCase(caseItem.id)}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-medium text-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Liberar Guia Cirúrgica (PIX)</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-amber-200 text-center space-y-2.5">
                      <div className="flex items-center justify-center space-x-1.5 text-amber-800 text-xs font-sans font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Planejamento Enviado • Aguardando Aprovação/PIX</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        O dentista foi notificado. Caso precise atualizar os arquivos STL ou PDF do planejamento, clique abaixo:
                      </p>
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Reenviar / Atualizar Guia STL & Relatório</span>
                      </button>
                    </div>
                  )
                ) : (
                  userType === 'ADMIN' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-1.5 text-emerald-800 text-xs font-sans font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Caso Aprovado & Pago pelo Dentista</span>
                      </div>
                      <button
                        onClick={() => setIsDeliverPlanningOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-cyan-700 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
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
