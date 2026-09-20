import React, { useState, useRef } from 'react';
import { DentalCase, CaseFile } from '../../types';
import { uploadCaseFileToStorage } from '../../services/firebase/storage';
import { storeFileInCache } from '../../services/fileCache';
import { 
  X, 
  UploadCloud, 
  FileCode, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Loader2, 
  Zap,
  Layers,
  Archive,
  FolderOpen
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
  name: string;
  sizeStr: string;
  totalBytes: number;
  type: CaseFile['type'];
  file?: File;
  isBundle?: boolean;
  bundleFiles?: File[];
  sliceCount?: number;
  folderName?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const detectFileType = (fileName: string): CaseFile['type'] => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.dcm') || lower.includes('dicom') || lower.includes('tomo')) return 'TOMOGRAPHY';
  if (lower.endsWith('.pdf')) return 'REPORT_PDF';
  if (lower.endsWith('.stl') || lower.endsWith('.ply') || lower.endsWith('.obj')) return 'GUIDE_STL';
  if (lower.includes('bite') || lower.includes('mord')) return 'BITE';
  if (lower.includes('antag') || lower.includes('inf')) return 'SCAN_OPP';
  if (lower.includes('sup') || lower.includes('prep')) return 'SCAN_PRE';
  return 'OTHER';
};

export const DeliverPlanningModal: React.FC<DeliverPlanningModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onDeliverPlanning
}) => {
  const [planningFiles, setPlanningFiles] = useState<AttachedFileItem[]>([]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>(
    caseItem.notes || 'Planejamento cirúrgico 3D concluído conforme especificações anatômicas. Guias prontas para impressão e uso clínico.'
  );
  const [amount, setAmount] = useState<number>(caseItem.payment.amount || 320.00);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const dicomFiles: File[] = [];
    const regularFiles: File[] = [];
    let detectedFolderName = '';

    for (const file of fileArray) {
      const relPath = (file as any).webkitRelativePath as string | undefined;
      if (relPath && relPath.includes('/')) {
        const rootFolder = relPath.split('/')[0] || relPath.split('\\')[0];
        if (!detectedFolderName) detectedFolderName = rootFolder;
        dicomFiles.push(file);
      } else {
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.dcm') || lower.endsWith('.dicom') || lower.includes('slice') || lower.includes('ct_')) {
          dicomFiles.push(file);
        } else {
          regularFiles.push(file);
        }
      }
    }

    const newItems: AttachedFileItem[] = [];

    // Se houver pasta ou 2+ arquivos DICOM, agrupa em um pacote consolidado
    if (dicomFiles.length >= 2 || (detectedFolderName && dicomFiles.length > 0)) {
      const totalBytes = dicomFiles.reduce((acc, f) => acc + f.size, 0);
      const folderTitle = detectedFolderName || 'Tomografia_DICOM';
      newItems.push({
        id: `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${folderTitle}.zip`,
        folderName: folderTitle,
        sizeStr: formatSize(totalBytes),
        totalBytes,
        type: 'TOMOGRAPHY',
        isBundle: true,
        bundleFiles: dicomFiles,
        sliceCount: dicomFiles.length
      });
    } else if (dicomFiles.length === 1) {
      const f = dicomFiles[0];
      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        file: f,
        sizeStr: formatSize(f.size),
        totalBytes: f.size,
        type: 'TOMOGRAPHY'
      });
    }

    for (const file of regularFiles) {
      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        file,
        sizeStr: formatSize(file.size),
        totalBytes: file.size,
        type: detectFileType(file.name)
      });
    }

    setPlanningFiles(prev => [...prev, ...newItems]);
    setErrorMessage(null);
  };

  const handleRemoveFile = (id: string) => {
    setPlanningFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateFileType = (id: string, type: CaseFile['type']) => {
    setPlanningFiles(prev => prev.map(f => f.id === id ? { ...f, type } : f));
  };

  const handleReportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReportFile(file);
      setErrorMessage(null);
    }
  };

  // Criação de modelo de simulação rápido (caso Dr. Ricardo queira testar sem abrir CAD externo)
  const handleUseMockPlanningFiles = () => {
    const mockGuideBlob = new Blob(['SOLID Guia Cirurgica ImplantPrecision 3D'], { type: 'application/sla' });
    const mockGuide = new File([mockGuideBlob], `Guia_Cirurgica_Planejada_${caseItem.caseCode}.stl`, { type: 'application/sla' });
    
    const mockPdfBlob = new Blob(['%PDF-1.4 Relatório Cirúrgico Dr. Ricardo Campos'], { type: 'application/pdf' });
    const mockReport = new File([mockPdfBlob], `Relatorio_Cirurgico_Perfurações_${caseItem.caseCode}.pdf`, { type: 'application/pdf' });

    setPlanningFiles(prev => [
      ...prev.filter(f => f.name !== mockGuide.name),
      {
        id: `guide-mock-${Date.now()}`,
        name: mockGuide.name,
        file: mockGuide,
        sizeStr: formatSize(mockGuide.size),
        totalBytes: mockGuide.size,
        type: 'GUIDE_STL'
      }
    ]);
    setReportFile(mockReport);
    setNotes(`Planejamento cirúrgico virtual aprovado pelo Dr. Ricardo Campos.\n• Tipo de Guia: ${caseItem.surgicalGuideType.replace('_', ' ')}\n• Kit Recomendado: Neodent Helix GM\n• Sequência de brocas com stops milimétricos conforme relatório cirúrgico em anexo.`);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (planningFiles.length === 0 && !reportFile) {
      setErrorMessage('Por favor, anexe ao menos um arquivo de planejamento (Guia STL, Tomografia, ZIP ou Relatório) para entregar ao dentista.');
      return;
    }

    setIsSubmitting(true);
    setUploadPercent(0);
    setErrorMessage(null);

    try {
      const newCaseFiles: CaseFile[] = [];

      // 1. Processar Arquivos de Planejamento (Campo 1)
      for (let i = 0; i < planningFiles.length; i++) {
        const item = planningFiles[i];

        if (item.isBundle && item.bundleFiles && item.bundleFiles.length > 0) {
          setIsCompressing(true);
          setUploadPercent(0);
          setStatusMessage(`Compactando ${item.bundleFiles.length} arquivos da pasta ${item.folderName || ''} em .ZIP...`);

          const JSZipModule = await import('jszip');
          const JSZipClass = JSZipModule.default || JSZipModule;
          const zip = new (JSZipClass as any)();

          for (const file of item.bundleFiles) {
            const relPath = (file as any).webkitRelativePath as string | undefined;
            const entryPath = relPath ? relPath : file.name;
            zip.file(entryPath, file);
          }

          const zipBlob = await zip.generateAsync(
            {
              type: 'blob',
              compression: 'DEFLATE',
              compressionOptions: { level: 6 }
            },
            (metadata: { percent: number }) => {
              setUploadPercent(metadata.percent);
              setStatusMessage(
                `Compactando pasta (${item.sliceCount} arquivos): ${Math.round(metadata.percent)}%...`
              );
            }
          );

          setIsCompressing(false);
          setUploadPercent(0);

          const zipFileName = `${item.folderName || 'Planejamento_Arquivos'}_${caseItem.caseCode}.zip`;
          setStatusMessage(`Enviando pacote compactado ${zipFileName}...`);

          const uploadRes = await uploadCaseFileToStorage(
            zipBlob,
            caseItem.caseCode,
            (percent, transferred, total) => {
              setUploadPercent(percent);
              const mbT = (transferred / (1024 * 1024)).toFixed(1);
              const mbTotal = (total / (1024 * 1024)).toFixed(1);
              setStatusMessage(
                `Enviando ${zipFileName}: ${Math.round(percent)}% (${mbT} MB / ${mbTotal} MB)`
              );
            },
            zipFileName
          );

          await storeFileInCache(
            [item.id, zipFileName, uploadRes.downloadUrl, `${caseItem.caseCode}_${zipFileName}`],
            zipBlob
          );

          newCaseFiles.push({
            id: item.id,
            name: zipFileName,
            type: item.type,
            size: uploadRes.size,
            uploadedAt: new Date().toISOString(),
            downloadUrl: uploadRes.downloadUrl,
            isLocked: true
          });
        } else if (item.file) {
          setStatusMessage(`Enviando arquivo ${i + 1} de ${planningFiles.length}: ${item.name}...`);
          const uploadRes = await uploadCaseFileToStorage(
            item.file, 
            caseItem.caseCode,
            (percent, transferred, total) => {
              setUploadPercent(percent);
              const mbT = (transferred / (1024 * 1024)).toFixed(1);
              const mbTotal = (total / (1024 * 1024)).toFixed(1);
              setStatusMessage(
                `Enviando ${item.name}: ${Math.round(percent)}% (${mbT} MB / ${mbTotal} MB)`
              );
            }
          );

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
      }

      // 2. Processar Relatório Cirúrgico PDF (Campo 2)
      if (reportFile) {
        setStatusMessage(`Enviando Relatório Cirúrgico (${reportFile.name})...`);
        const uploadRes = await uploadCaseFileToStorage(
          reportFile, 
          caseItem.caseCode,
          (percent, transferred, total) => {
            setUploadPercent(percent);
            const mbT = (transferred / (1024 * 1024)).toFixed(1);
            const mbTotal = (total / (1024 * 1024)).toFixed(1);
            setStatusMessage(`Enviando Relatório Cirúrgico: ${Math.round(percent)}% (${mbT} MB / ${mbTotal} MB)`);
          }
        );
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
          isLocked: true
        });
      }

      setUploadPercent(100);
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
      setIsCompressing(false);
      setStatusMessage('');
      setUploadPercent(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header do Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-sans">
                <span>Enviar Planejamento Cirúrgico ao Dentista</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Paciente: <strong className="text-slate-800">{caseItem.patientName}</strong> • {caseItem.caseCode} • Dr(a). {caseItem.dentistName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Envio */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Alerta de Orientação */}
          <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-start space-x-3 text-xs text-cyan-900">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-cyan-600" />
            <div className="space-y-1">
              <span className="font-semibold block text-slate-900 font-sans">
                Entrega Técnica do Laboratório de Planejamento 3D
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px] font-sans">
                Anexe os arquivos gerados no seu software CAD (exocad, 3Shape, RealGUIDE, etc.). O colega receberá a notificação no WhatsApp e na plataforma com os dados do caso e a liberação para download após a quitação do valor.
              </p>
            </div>
          </div>

          {/* Campo 1: Arquivos do Planejamento Cirúrgico (STL, DICOM, ZIP, etc.) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                <FileCode className="w-4 h-4 text-cyan-600" />
                <span>1. Arquivos do Planejamento Cirúrgico (.STL, .ZIP, DICOM, etc.) *</span>
              </label>
              <div className="flex items-center space-x-3">
                {planningFiles.length > 0 && (
                  <span className="text-[11px] font-sans font-semibold text-cyan-700">
                    {planningFiles.length} {planningFiles.length === 1 ? 'arquivo' : 'arquivos'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleUseMockPlanningFiles}
                  className="text-[11px] font-sans font-semibold text-cyan-700 hover:text-cyan-800 underline cursor-pointer"
                  title="Preencher com arquivos simulados de alta precisão para teste rápido"
                >
                  + Gerar Guia de Teste
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={e => {
                if (e.target.files) handleFilesSelect(e.target.files);
                e.target.value = '';
              }}
              multiple
              accept="*/*"
              className="hidden"
            />

            <input
              type="file"
              ref={folderInputRef}
              onChange={e => {
                if (e.target.files) handleFilesSelect(e.target.files);
                e.target.value = '';
              }}
              multiple
              {...({ webkitdirectory: '', directory: '' } as any)}
              className="hidden"
            />

            {planningFiles.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files);
                }}
                className={`p-5 rounded-xl border-2 border-dashed transition-all text-center space-y-2.5 ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-50/40 scale-[0.99]'
                    : 'border-slate-300 hover:border-cyan-500 bg-slate-50/70 hover:bg-cyan-50/20'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 text-slate-400">
                  <UploadCloud className="w-6 h-6 text-cyan-600" />
                  <Archive className="w-5 h-5 text-purple-500" />
                  <Layers className="w-5 h-5 text-amber-500" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 font-sans">
                    Clique ou arraste qualquer arquivo do planejamento cirúrgico
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Suporta arquivos <strong className="text-cyan-700">.STL</strong>, <strong className="text-purple-700">.ZIP</strong>, <strong className="text-amber-700">DICOM (.dcm)</strong>, pastas completas, imagens ou relatórios
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-cyan-700 font-medium shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Selecionar Arquivos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-amber-700 font-medium shadow-2xs transition-colors flex items-center space-x-1.5 hover:text-amber-800 cursor-pointer"
                    title="Selecionar pasta completa com tomografia DICOM ou arquivos do caso"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Selecionar Pasta</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                  {planningFiles.map(item => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        item.isBundle
                          ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            item.isBundle
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : item.name.toLowerCase().endsWith('.zip') || item.name.toLowerCase().endsWith('.rar')
                              ? 'bg-purple-50 text-purple-600 border border-purple-200'
                              : item.name.toLowerCase().endsWith('.pdf')
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : item.type === 'TOMOGRAPHY'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          }`}
                        >
                          {item.isBundle ? (
                            <Layers className="w-4 h-4 text-amber-600" />
                          ) : item.name.toLowerCase().endsWith('.zip') || item.name.toLowerCase().endsWith('.rar') ? (
                            <Archive className="w-4 h-4 text-purple-600" />
                          ) : item.name.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-4 h-4 text-rose-600" />
                          ) : item.type === 'TOMOGRAPHY' ? (
                            <Layers className="w-4 h-4 text-amber-600" />
                          ) : (
                            <FileCode className="w-4 h-4 text-cyan-600" />
                          )}
                        </div>

                        <div className="truncate flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-900 font-bold font-sans truncate" title={item.name}>
                              {item.isBundle ? (item.folderName || item.name) : item.name}
                            </span>
                            {item.isBundle && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300/80 whitespace-nowrap">
                                {item.sliceCount} arquivos
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {item.sizeStr} {item.isBundle ? '• Será compactado em .ZIP ao enviar' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <select
                          value={item.type}
                          onChange={e => handleUpdateFileType(item.id, e.target.value as CaseFile['type'])}
                          className="bg-white border border-slate-200 text-[11px] font-sans text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 shadow-2xs font-medium"
                        >
                          <option value="GUIDE_STL">Guia Cirúrgica (STL)</option>
                          <option value="TOMOGRAPHY">Tomografia (DICOM)</option>
                          <option value="OTHER">Arquivo Compactado/Outro</option>
                          <option value="REPORT_PDF">Relatório Cirúrgico (PDF)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remover arquivo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botões de Adicionar Mais dentro do Campo 1 */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-[11px] text-slate-400 font-sans">
                    Total: {planningFiles.length} {planningFiles.length === 1 ? 'item' : 'itens'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-cyan-700 font-medium shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Mais Arquivos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-amber-700 font-medium shadow-2xs transition-colors flex items-center space-x-1 hover:text-amber-800 cursor-pointer"
                      title="Adicionar pasta completa com tomografia DICOM ou arquivos"
                    >
                      <FolderOpen className="w-3 h-3 text-amber-500" />
                      <span>Adicionar Pasta</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo 2: Relatório Cirúrgico & Sequência de Perfuração (.PDF) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>2. Relatório Cirúrgico & Perfurações (.PDF)</span>
              <span className="text-[10px] font-normal text-slate-400 font-sans">(Opcional)</span>
            </label>

            <input
              type="file"
              ref={reportInputRef}
              onChange={handleReportSelect}
              accept=".pdf"
              className="hidden"
            />

            {reportFile ? (
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-900 block truncate font-sans">
                      {reportFile.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {formatSize(reportFile.size)} • Documento PDF Cirúrgico
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => reportInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-sans bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs font-medium"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFile(null)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => reportInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-rose-400 bg-slate-50/70 hover:bg-rose-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 font-sans">
                      Anexar Relatório Cirúrgico (.PDF)
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Instruções de kit, fresas, offsets e stops de perfuração
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg text-xs font-sans font-medium bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900 shadow-2xs cursor-pointer"
                >
                  Selecionar PDF
                </button>
              </div>
            )}
          </div>

          {/* Seção 3: Valor e Instruções Clínicas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block font-sans">
                Valor do Projeto (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-cyan-500 focus:bg-white outline-none font-sans"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block font-sans">
                Observações Técnicas para o Cirurgião:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva detalhes como kits, sequência de brocas ou offsets..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-cyan-500 focus:bg-white outline-none resize-none font-sans"
              />
            </div>
          </div>

          {/* Opção de Disparo no WhatsApp */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block font-sans">
                  Notificar Dentista no WhatsApp
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
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
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Feedback de Progresso de Envio e Compactação em Tempo Real */}
          {isSubmitting && (
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-2 text-emerald-950 font-semibold truncate">
                  {isCompressing ? (
                    <Archive className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  )}
                  <span className="truncate">{statusMessage || 'Enviando arquivos do planejamento...'}</span>
                </div>
                <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] shrink-0 ml-2">
                  {Math.round(uploadPercent)}%
                </span>
              </div>

              <div className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-200 ease-out rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, uploadPercent))}%` }}
                />
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 font-sans cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center space-x-2 active:scale-95 disabled:opacity-50 font-sans cursor-pointer"
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
