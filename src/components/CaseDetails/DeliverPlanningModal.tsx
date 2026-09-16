import React, { useState, useRef } from 'react';
import { DentalCase, CaseFile } from '../../types';
import { uploadCaseFileToStorage } from '../../services/firebase/storage';
import { storeFileInCache } from '../../services/fileCache';
import { 
  X, 
  UploadCloud, 
  FileCode, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  MessageSquare,
  Loader2,
  FileCheck,
  Zap
} from 'lucide-react';

interface DeliverPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DentalCase;
  onDeliverPlanning?: (
    caseId: string, 
    newFiles: CaseFile[], 
    notes?: string, 
    amount?: number,
    notifyWhatsApp?: boolean
  ) => Promise<void> | void;
}

interface AttachedFileItem {
  id: string;
  file: File;
  name: string;
  sizeStr: string;
  type: 'GUIDE_STL' | 'REPORT_PDF' | 'SCAN_OPP' | 'BITE';
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DeliverPlanningModal: React.FC<DeliverPlanningModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onDeliverPlanning
}) => {
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<AttachedFileItem[]>([]);
  const [notes, setNotes] = useState<string>(
    caseItem.notes || 'Planejamento cirúrgico 3D concluído conforme especificações anatômicas. Guias prontas para impressão e uso clínico.'
  );
  const [amount, setAmount] = useState<number>(caseItem.payment.amount || 320.00);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const guideInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGuideSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGuideFile(file);
      setErrorMessage(null);
    }
  };

  const handleReportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReportFile(file);
      setErrorMessage(null);
    }
  };

  const handleExtraFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: AttachedFileItem[] = Array.from(e.target.files).map(f => ({
        id: `extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        name: f.name,
        sizeStr: formatSize(f.size),
        type: f.name.toLowerCase().endsWith('.pdf') ? 'REPORT_PDF' : 'GUIDE_STL'
      }));
      setExtraFiles(prev => [...prev, ...newItems]);
      setErrorMessage(null);
    }
  };

  // Criação de modelo de simulação rápido (caso Dr. Ricardo queira testar sem abrir CAD externo)
  const handleUseMockPlanningFiles = () => {
    // Cria arquivos mock em memória com nomes clínicos reais
    const mockGuideBlob = new Blob(['SOLID Guia Cirurgica ImplantPrecision 3D'], { type: 'application/sla' });
    const mockGuide = new File([mockGuideBlob], `Guia_Cirurgica_Planejada_${caseItem.caseCode}.stl`, { type: 'application/sla' });
    
    const mockPdfBlob = new Blob(['%PDF-1.4 Relatório Cirúrgico Dr. Ricardo Campos'], { type: 'application/pdf' });
    const mockReport = new File([mockPdfBlob], `Relatorio_Cirurgico_Perfurações_${caseItem.caseCode}.pdf`, { type: 'application/pdf' });

    setGuideFile(mockGuide);
    setReportFile(mockReport);
    setNotes(`Planejamento cirúrgico virtual aprovado pelo Dr. Ricardo Campos.\n• Tipo de Guia: ${caseItem.surgicalGuideType.replace('_', ' ')}\n• Kit Recomendado: Neodent Helix GM\n• Sequência de brocas com stops milimétricos conforme relatório cirúrgico em anexo.`);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideFile && !reportFile && extraFiles.length === 0) {
      setErrorMessage('Por favor, selecione ao menos o arquivo da Guia Cirúrgica (.STL) ou o Relatório (.PDF) para enviar ao dentista.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newCaseFiles: CaseFile[] = [];

      // 1. Processar Guia Cirúrgica STL
      if (guideFile) {
        setStatusMessage(`Enviando Guia Cirúrgica (${guideFile.name})...`);
        const uploadRes = await uploadCaseFileToStorage(guideFile, caseItem.caseCode);
        const guideId = `guide-${Date.now()}`;

        await storeFileInCache(
          [guideId, guideFile.name, uploadRes.downloadUrl, `${caseItem.caseCode}_${guideFile.name}`],
          guideFile
        );

        newCaseFiles.push({
          id: guideId,
          name: guideFile.name,
          type: 'GUIDE_STL',
          size: uploadRes.size,
          uploadedAt: new Date().toISOString(),
          downloadUrl: uploadRes.downloadUrl,
          isLocked: true // Fica bloqueada para o dentista até pagamento PIX
        });
      }

      // 2. Processar Relatório Cirúrgico PDF
      if (reportFile) {
        setStatusMessage(`Enviando Relatório Cirúrgico (${reportFile.name})...`);
        const uploadRes = await uploadCaseFileToStorage(reportFile, caseItem.caseCode);
        const reportId = `report-${Date.now()}`;

        await storeFileInCache(
          [reportId, reportFile.name, uploadRes.downloadUrl, `${caseItem.caseCode}_${reportFile.name}`],
          reportFile
        );

        newCaseFiles.push({
          id: reportId,
          name: reportFile.name,
          type: 'REPORT_PDF',
          size: uploadRes.size,
          uploadedAt: new Date().toISOString(),
          downloadUrl: uploadRes.downloadUrl,
          isLocked: true // Fica bloqueado até pagamento PIX
        });
      }

      // 3. Processar Arquivos Extras
      for (let i = 0; i < extraFiles.length; i++) {
        const item = extraFiles[i];
        setStatusMessage(`Enviando arquivo adicional ${i + 1} de ${extraFiles.length}...`);
        const uploadRes = await uploadCaseFileToStorage(item.file, caseItem.caseCode);

        await storeFileInCache(
          [item.id, item.name, uploadRes.downloadUrl, `${caseItem.caseCode}_${item.name}`],
          item.file
        );

        newCaseFiles.push({
          id: item.id,
          name: item.name,
          type: item.type,
          size: uploadRes.size,
          uploadedAt: new Date().toISOString(),
          downloadUrl: uploadRes.downloadUrl,
          isLocked: true
        });
      }

      setStatusMessage('Disparando notificação e WhatsApp para o dentista...');
      if (onDeliverPlanning) {
        await onDeliverPlanning(caseItem.id, newCaseFiles, notes, amount, notifyWhatsApp);
      }

      onClose();
    } catch (err: any) {
      console.error('Erro ao enviar planejamento:', err);
      setErrorMessage(err.message || 'Houve um erro ao processar o envio dos arquivos do planejamento.');
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl glass-panel-glow bg-cyber-bg border border-cyber-border overflow-hidden shadow-2xl">
        
        {/* Header do Modal */}
        <div className="p-5 sm:p-6 border-b border-cyber-border flex items-center justify-between bg-cyber-surface/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan">
              <Sparkles className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center space-x-2">
                <span>Enviar Planejamento Cirúrgico ao Dentista</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Paciente: <strong className="text-slate-200">{caseItem.patientName}</strong> • {caseItem.caseCode} • Dr(a). {caseItem.dentistName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Envio */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Alerta de Orientação */}
          <div className="p-3.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/25 flex items-start space-x-3 text-xs text-cyber-cyan">
            <Zap className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-slate-200">
                Entrega Técnica do Laboratório de Planejamento 3D
              </span>
              <p className="text-slate-300/80 leading-relaxed text-[11px]">
                Anexe os arquivos gerados no seu software CAD (exocad, 3Shape, RealGUIDE, etc.). O colega receberá a notificação no WhatsApp e na plataforma com a prévia 3D da guia e o botão para liberação via PIX.
              </p>
            </div>
          </div>

          {/* Seção 1: Guia Cirúrgica (.STL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-200 flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-cyber-cyan" />
                <span>1. Arquivo da Guia Cirúrgica 3D (.STL / .PLY) *</span>
              </label>
              <button
                type="button"
                onClick={handleUseMockPlanningFiles}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline"
                title="Preencher com arquivos simulados de alta precisão para teste rápido"
              >
                + Gerar Guia de Teste
              </button>
            </div>

            <input
              type="file"
              ref={guideInputRef}
              onChange={handleGuideSelect}
              accept=".stl,.ply,.obj"
              className="hidden"
            />

            {guideFile ? (
              <div className="p-3.5 rounded-xl bg-cyber-card border border-cyber-cyan/40 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-lg bg-cyber-cyan/15 text-cyber-cyan">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-mono font-semibold text-white block truncate">
                      {guideFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatSize(guideFile.size)} • Guia Cirúrgica Pronta
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => guideInputRef.current?.click()}
                    className="px-2.5 py-1 rounded text-[11px] font-mono bg-cyber-surface hover:bg-cyber-surface/80 text-slate-300 border border-cyber-border"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideFile(null)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => guideInputRef.current?.click()}
                className="p-5 rounded-xl border-2 border-dashed border-cyber-border hover:border-cyber-cyan/50 bg-cyber-surface/40 hover:bg-cyber-surface/60 transition-all cursor-pointer text-center space-y-1 group"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-cyber-cyan mx-auto transition-colors" />
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  Clique para selecionar o arquivo da <strong className="text-cyber-cyan">Guia Cirúrgica (.STL)</strong>
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Suporta arquivos .STL, .PLY ou .OBJ exportados do software CAD
                </p>
              </div>
            )}
          </div>

          {/* Seção 2: Relatório Cirúrgico & Sequência de Perfuração (.PDF) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-200 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>2. Relatório Cirúrgico & Perfurações (.PDF)</span>
            </label>

            <input
              type="file"
              ref={reportInputRef}
              onChange={handleReportSelect}
              accept=".pdf"
              className="hidden"
            />

            {reportFile ? (
              <div className="p-3.5 rounded-xl bg-cyber-card border border-rose-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-mono font-semibold text-white block truncate">
                      {reportFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatSize(reportFile.size)} • Documento PDF Cirúrgico
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => reportInputRef.current?.click()}
                    className="px-2.5 py-1 rounded text-[11px] font-mono bg-cyber-surface hover:bg-cyber-surface/80 text-slate-300 border border-cyber-border"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFile(null)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => reportInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-cyber-border hover:border-rose-500/50 bg-cyber-surface/40 hover:bg-cyber-surface/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-rose-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300 group-hover:text-white">
                      Anexar Relatório Cirúrgico (.PDF)
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Instruções de kit, fresas, offsets e stops de perfuração
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded text-xs font-mono bg-cyber-surface border border-cyber-border text-slate-300 group-hover:text-white"
                >
                  Selecionar PDF
                </button>
              </div>
            )}
          </div>

          {/* Seção 3: Valor e Instruções Clínicas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-200 block">
                Valor do Projeto (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-cyber-card border border-cyber-border text-white text-xs font-mono font-bold focus:border-cyber-cyan outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-200 block">
                Observações Técnicas para o Cirurgião:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva detalhes como kits, sequência de brocas ou offsets..."
                className="w-full p-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-xs font-mono focus:border-cyber-cyan outline-none resize-none"
              />
            </div>
          </div>

          {/* Opção de Disparo no WhatsApp */}
          <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Notificar Dentista no WhatsApp
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Enviar aviso automático para {caseItem.dentistPhone || 'WhatsApp cadastrado'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-cyber-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-bold text-xs transition-all shadow-glow-cyan flex items-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || 'Processando envio...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Planejamento ao Dentista</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
