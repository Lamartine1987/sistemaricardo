import React, { useState, useEffect, useRef } from 'react';
import { DentalCase, Dentist, UserType, CaseFile } from '../../types';
import { Odontogram } from '../Odontogram/Odontogram';
import { uploadCaseFileToStorage } from '../../services/firebase/storage';
import { storeFileInCache } from '../../services/fileCache';
import { 
  X, 
  UploadCloud, 
  Plus, 
  Sparkles,
  AlertCircle,
  FileCode,
  Trash2,
  FolderOpen,
  Loader2,
  Box,
  Archive,
  Layers
} from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  sizeStr: string;
  totalBytes: number;
  category: 'SCAN_PRE' | 'SCAN_OPP' | 'BITE' | 'TOMOGRAPHY' | 'OTHER';
  file?: File;
  isBundle?: boolean;
  bundleFiles?: File[];
  sliceCount?: number;
  folderName?: string;
}

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentists: Dentist[];
  onCreateCase: (newCase: DentalCase) => void;
  userType?: UserType;
  currentDentistId?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const detectCategory = (fileName: string): AttachedFile['category'] => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.dcm') || lower.includes('dicom') || lower.includes('tomo')) return 'TOMOGRAPHY';
  if (lower.includes('inf') || lower.includes('mandib') || lower.includes('antag')) return 'SCAN_OPP';
  if (lower.includes('mord') || lower.includes('bite') || lower.includes('oclus')) return 'BITE';
  if (lower.includes('sup') || lower.includes('maxil') || lower.endsWith('.stl') || lower.endsWith('.obj')) return 'SCAN_PRE';
  return 'OTHER';
};


export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  dentists,
  onCreateCase,
  userType = 'ADMIN',
  currentDentistId
}) => {
  const defaultDentistId = (userType === 'CLIENT' && currentDentistId) 
    ? currentDentistId 
    : (dentists[0]?.id || '');

  const [patientName, setPatientName] = useState('');
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [selectedDentistId, setSelectedDentistId] = useState(defaultDentistId);
  const [surgicalGuideType, setSurgicalGuideType] = useState<DentalCase['surgicalGuideType']>('DENTO_SUPORTADA');
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([36]);
  const [notes, setNotes] = useState('');
  const [amount] = useState<number>(320.00);

  // Telefone para Notificações do Dentista
  const currentDentistObj = dentists.find(d => d.id === selectedDentistId) || dentists[0];
  const [dentistPhone, setDentistPhone] = useState(currentDentistObj?.phone || '81999694866');

  // Estados de Upload de Arquivos
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userType === 'CLIENT' && currentDentistId) {
      setSelectedDentistId(currentDentistId);
    }
  }, [userType, currentDentistId]);

  useEffect(() => {
    const d = dentists.find(item => item.id === selectedDentistId);
    if (d?.phone) {
      setDentistPhone(d.phone);
    }
  }, [selectedDentistId, dentists]);

  if (!isOpen) return null;

  const handleToggleTooth = (toothNumber: number) => {
    setSelectedTeeth(prev => 
      prev.includes(toothNumber) 
        ? prev.filter(t => t !== toothNumber) 
        : [...prev, toothNumber].sort((a, b) => a - b)
    );
  };

  const handleAddFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Detectar se os arquivos vêm de uma pasta (webkitRelativePath) ou se são múltiplos arquivos DICOM
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

    const newItems: AttachedFile[] = [];

    // Se houver múltiplos arquivos DICOM ou arquivos oriundos de pasta, agrupa em 1 único cartão de volume
    if (dicomFiles.length >= 2 || (detectedFolderName && dicomFiles.length > 0)) {
      const totalBytes = dicomFiles.reduce((acc, f) => acc + f.size, 0);
      const folderTitle = detectedFolderName || 'Tomografia_DICOM';
      newItems.push({
        id: `bundle-dicom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${folderTitle}.zip`,
        folderName: folderTitle,
        sizeStr: formatFileSize(totalBytes),
        totalBytes,
        category: 'TOMOGRAPHY',
        isBundle: true,
        bundleFiles: dicomFiles,
        sliceCount: dicomFiles.length
      });
    } else if (dicomFiles.length === 1) {
      // 1 arquivo DICOM avulso
      const f = dicomFiles[0];
      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        file: f,
        sizeStr: formatFileSize(f.size),
        totalBytes: f.size,
        category: 'TOMOGRAPHY'
      });
    }

    // Demais arquivos 3D normais (.stl, .obj, .ply, .zip, etc.)
    for (const file of regularFiles) {
      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        file,
        sizeStr: formatFileSize(file.size),
        totalBytes: file.size,
        category: detectCategory(file.name)
      });
    }

    setAttachedFiles(prev => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleChangeCategory = (id: string, category: AttachedFile['category']) => {
    setAttachedFiles(prev => prev.map(f => f.id === id ? { ...f, category } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsUploading(true);
    setUploadPercent(0);
    setUploadStatusText('Iniciando processamento do caso...');

    try {
      const dentist = dentists.find(d => d.id === selectedDentistId) || dentists[0];
      const newCaseId = `case-${Date.now()}`;
      const codeNumber = Math.floor(100 + Math.random() * 900);
      const caseCode = `IMP-2026-${codeNumber}`;

      // Upload de cada arquivo anexado para o Firebase Storage / Local Blob
      const uploadedCaseFiles: CaseFile[] = [];

      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const item = attachedFiles[i];

          if (item.isBundle && item.bundleFiles && item.bundleFiles.length > 0) {
            // FASE 1: Compactação Client-Side com JSZip sob demanda
            setIsCompressing(true);
            setUploadPercent(0);
            setUploadStatusText(`Preparando compactação de ${item.bundleFiles.length} fatias DICOM...`);

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
                setUploadStatusText(
                  `Compactando tomografia (${item.sliceCount} cortes): ${Math.round(metadata.percent)}% concluído...`
                );
              }
            );

            setIsCompressing(false);
            setUploadPercent(0);

            // FASE 2: Upload Seguro do arquivo ZIP compactado
            const zipFileName = `Tomografia_DICOM_${caseCode}.zip`;
            setUploadStatusText(`Enviando ${zipFileName}...`);

            const uploadRes = await uploadCaseFileToStorage(
              zipBlob,
              caseCode,
              (percent, bytesTransferred, totalBytes) => {
                setUploadPercent(percent);
                const mbTransferred = (bytesTransferred / (1024 * 1024)).toFixed(1);
                const mbTotal = (totalBytes / (1024 * 1024)).toFixed(1);
                setUploadStatusText(
                  `Enviando ${zipFileName}: ${Math.round(percent)}% (${mbTransferred} MB / ${mbTotal} MB)`
                );
              },
              zipFileName
            );

            // Salvar no cache local
            await storeFileInCache(
              [item.id, zipFileName, uploadRes.downloadUrl, `${caseCode}_${zipFileName}`, caseCode],
              zipBlob
            );

            uploadedCaseFiles.push({
              id: item.id,
              name: zipFileName,
              type: 'TOMOGRAPHY',
              size: uploadRes.size,
              uploadedAt: new Date().toISOString(),
              downloadUrl: uploadRes.downloadUrl,
              isLocked: false // Arquivos enviados pelo cliente são sempre liberados
            });
          } else if (item.file) {
            setUploadPercent(0);
            setUploadStatusText(`Enviando arquivo ${i + 1} de ${attachedFiles.length}: ${item.name}...`);

            const uploadRes = await uploadCaseFileToStorage(
              item.file,
              caseCode,
              (percent, bytesTransferred, totalBytes) => {
                setUploadPercent(percent);
                const mbTransferred = (bytesTransferred / (1024 * 1024)).toFixed(1);
                const mbTotal = (totalBytes / (1024 * 1024)).toFixed(1);
                setUploadStatusText(
                  `Enviando ${item.name}: ${Math.round(percent)}% (${mbTransferred} MB / ${mbTotal} MB)`
                );
              }
            );

            // Salvar arquivo bruto no cache local
            await storeFileInCache(
              [item.id, item.name, uploadRes.downloadUrl, `${caseCode}_${item.name}`, caseCode],
              item.file
            );

            uploadedCaseFiles.push({
              id: item.id,
              name: item.name,
              type: item.category === 'OTHER' ? 'SCAN_PRE' : item.category,
              size: uploadRes.size,
              uploadedAt: new Date().toISOString(),
              downloadUrl: uploadRes.downloadUrl,
              isLocked: false
            });
          }
        }
      } else {
        // Fallback padrão se nenhum arquivo foi selecionado no teste
        uploadedCaseFiles.push({
          id: `file-scan-${Date.now()}`,
          name: 'Escaneamento_Intraoral_Pre_Op.stl',
          type: 'SCAN_PRE',
          size: '19.2 MB',
          uploadedAt: new Date().toISOString(),
          downloadUrl: '#',
          isLocked: false
        });
      }

      setUploadPercent(100);
      setUploadStatusText('Caso cadastrado com sucesso!');

      const newCase: DentalCase = {
        id: newCaseId,
        caseCode,
        patientName,
        patientIdentifier: patientIdentifier || patientName.split(' ').map(n => n[0]).join('.').toUpperCase(),
        dentistId: dentist.id,
        dentistName: dentist.name,
        dentistCro: dentist.cro,
        dentistPhone: dentistPhone.trim() || dentist.phone || '',
        status: 'ANALYSIS',
        priority: 'NORMAL',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        surgicalGuideType,
        notes,
        implantSites: selectedTeeth.map(t => ({
          toothNumber: t,
          implantBrand: 'Neodent Helix GM',
          implantDiameter: 4.0,
          implantLength: 11.5,
          boneDensity: 'D2'
        })),
        payment: {
          id: `pay-${Date.now()}`,
          amount,
          pixCode: `00020126580014br.gov.bcb.pix0136${caseCode.toLowerCase()}-implantprecision5204000053039865406${amount.toFixed(2)}5802BR5915Dr Ricardo Plan6009Sao Paulo62070503***6304E88A`,
          pixQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014br.gov.bcb.pix0136${caseCode.toLowerCase()}-implantprecision5204000053039865406${amount.toFixed(2)}5802BR5915Dr Ricardo Plan6009Sao Paulo62070503***6304E88A`,
          status: 'PENDING'
        },
        files: uploadedCaseFiles
      };

      onCreateCase(newCase);
      setPatientName('');
      setPatientIdentifier('');
      setNotes('');
      setAttachedFiles([]);
      onClose();
    } catch (error) {
      console.error('Erro ao submeter caso:', error);
      alert('Houve um erro ao processar os arquivos do caso. Tente novamente.');
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
      setUploadStatusText('');
      setUploadPercent(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".stl,.obj,.ply,.dcm,.zip,.rar,.7z"
        className="hidden"
        onChange={e => {
          if (e.target.files) handleAddFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
        onChange={e => {
          if (e.target.files) handleAddFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {userType === 'CLIENT' ? 'Enviar Novo Caso para Planejamento' : 'Cadastrar Novo Planejamento de Implante'}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {userType === 'CLIENT' 
                  ? 'Envie os escaneamentos do seu paciente para o Dr. Ricardo planejar' 
                  : 'Especificação técnica e envio de arquivos para o dentista'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Paciente */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                Nome do Paciente *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Iniciais / Identificador */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                Iniciais / Prontuário
              </label>
              <input
                type="text"
                value={patientIdentifier}
                onChange={e => setPatientIdentifier(e.target.value)}
                placeholder="Ex: C.E.S."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dentista Solicitante */}
            {userType === 'ADMIN' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                  Dentista Solicitante (Cliente) *
                </label>
                <select
                  value={selectedDentistId}
                  onChange={e => setSelectedDentistId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
                >
                  {dentists.map(d => (
                    <option key={d.id} value={d.id} className="text-slate-800">
                      {d.name} ({d.clinicName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                  Sua Clínica / Responsável
                </label>
                <div className="px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium font-sans">
                  {dentists.find(d => d.id === selectedDentistId)?.name || 'Dr. Marcelo Vieira'}
                </div>
              </div>
            )}

            {/* Tipo de Guia Cirúrgica */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                Tipo de Guia Desejada
              </label>
              <select
                value={surgicalGuideType}
                onChange={e => setSurgicalGuideType(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              >
                <option value="DENTO_SUPORTADA">Dento-suportada (Apoiada em dentes remanescentes)</option>
                <option value="MUCO_SUPORTADA">Muco-suportada (Casos de protocolo sobre gengiva)</option>
                <option value="OSSEO_SUPORTADA">Ósseo-suportada (Casos avançados de cirurgia aberta)</option>
              </select>
            </div>
          </div>

          {/* WhatsApp do Dentista para Notificações */}
          <div className="p-3.5 rounded-xl bg-cyan-50/50 border border-cyan-100 space-y-1.5">
            <label className="text-xs font-semibold text-cyan-900 flex items-center space-x-1.5 font-sans">
              <span>WhatsApp do Dentista para Notificações Automáticas *</span>
            </label>
            <input
              type="text"
              required
              value={dentistPhone}
              onChange={e => setDentistPhone(e.target.value)}
              placeholder="Ex: 81999694866 (com DDD)"
              className="w-full px-3.5 py-2 text-xs bg-white border border-cyan-200 focus:border-cyan-500 rounded-xl text-slate-900 font-sans focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 font-sans">
              Você receberá avisos automáticos neste WhatsApp assim que o Dr. Ricardo aceitar os escaneamentos e quando o planejamento estiver pronto.
            </p>
          </div>

          {/* Odontograma Interativo */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
              Marque no Odontograma a Posição dos Implantes a Realizar:
            </label>
            <Odontogram 
              selectedTeeth={selectedTeeth} 
              onToggleTooth={handleToggleTooth} 
            />
            {selectedTeeth.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Selecione ao menos um dente para prosseguir.</span>
              </p>
            )}
          </div>

          {/* Upload de Arquivos 3D com Suporte Completo a Clique e Drag & Drop */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 block font-sans">
                Arquivos de Escaneamento 3D (.STL, .OBJ, .PLY ou DICOM)
              </label>
              {attachedFiles.length > 0 && (
                <span className="text-[11px] font-sans font-semibold text-cyan-700">
                  {attachedFiles.length} {attachedFiles.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
                </span>
              )}
            </div>

            {/* Área de Drop / Clique */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
                isDragging 
                  ? 'border-cyan-500 bg-cyan-50 scale-[0.99] shadow-sm' 
                  : 'border-slate-300 hover:border-cyan-500 bg-slate-50/70 hover:bg-cyan-50/30'
              }`}
            >
              <UploadCloud className={`w-10 h-10 mx-auto mb-2 transition-transform group-hover:scale-110 ${
                isDragging ? 'text-cyan-600 animate-bounce' : 'text-cyan-600/80'
              }`} />
              <p className="text-xs text-slate-700 font-medium">
                Arraste os arquivos de escaneamento ou <span className="text-cyan-600 underline font-semibold">procure no computador</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                Suporta modelos STL, OBJ, PLY, pastas de Tomografia DICOM ou arquivos compactados (.ZIP, .RAR)
              </p>

              <div className="mt-3 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-cyan-700 font-medium shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Selecionar Arquivos</span>
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium shadow-xs transition-colors flex items-center space-x-1.5 hover:text-slate-900"
                  title="Selecionar pasta completa com fatias DICOM"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Selecionar Pasta DICOM</span>
                </button>
              </div>
            </div>

            {/* Lista de Arquivos Anexados */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                {attachedFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      fileItem.isBundle
                        ? 'bg-amber-50/60 border-amber-200/90 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        fileItem.isBundle
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-cyan-50 text-cyan-600'
                      }`}>
                        {fileItem.isBundle ? (
                          <Layers className="w-4 h-4 text-amber-600" />
                        ) : fileItem.name.endsWith('.zip') || fileItem.name.endsWith('.rar') ? (
                          <Archive className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Box className="w-4 h-4 text-cyan-600" />
                        )}
                      </div>
                      <div className="truncate flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-900 font-bold font-sans truncate" title={fileItem.name}>
                            {fileItem.isBundle ? (fileItem.folderName || fileItem.name) : fileItem.name}
                          </span>
                          {fileItem.isBundle && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300/80 whitespace-nowrap">
                              {fileItem.sliceCount} cortes (.dcm)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                          {fileItem.sizeStr} {fileItem.isBundle ? '• Será compactado em .ZIP único ao enviar (economia de espaço e envio rápido)' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Classificação do Tipo de Arquivo */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <select
                        value={fileItem.category}
                        onChange={e => handleChangeCategory(fileItem.id, e.target.value as AttachedFile['category'])}
                        className="bg-white border border-slate-200 text-[11px] font-sans text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium shadow-xs"
                      >
                        <option value="SCAN_PRE">Arcada Superior (Prep)</option>
                        <option value="SCAN_OPP">Arcada Inferior (Antag)</option>
                        <option value="BITE">Registro de Mordida</option>
                        <option value="TOMOGRAPHY">Tomografia (DICOM)</option>
                        <option value="OTHER">Arquivo Compactado/Outro</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(fileItem.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title={fileItem.isBundle ? 'Remover pasta DICOM completa' : 'Remover arquivo'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações Clínicas */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
              {userType === 'CLIENT' ? 'Instruções para o Dr. Ricardo' : 'Notas Técnicas do Planejamento'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Paciente possui pouca espessura na vestibular, planejar implante mais lingualizado..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none font-sans"
            />
          </div>

          {/* Feedback de Progresso de Envio e Compactação em Tempo Real */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-cyan-50/90 border border-cyan-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-2 text-cyan-950 font-semibold truncate">
                  {isCompressing ? (
                    <Archive className="w-4 h-4 text-amber-600 animate-bounce flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-cyan-600 animate-spin flex-shrink-0" />
                  )}
                  <span className="truncate">{uploadStatusText || 'Processando arquivos do caso...'}</span>
                </div>
                <span className="font-bold text-cyan-800 bg-white px-2.5 py-0.5 rounded-full border border-cyan-200 text-[11px] flex-shrink-0 ml-2">
                  {Math.round(uploadPercent)}%
                </span>
              </div>

              {/* Barra de Progresso Real */}
              <div className="w-full h-2.5 bg-cyan-200/60 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-200 ease-out rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, uploadPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-cyan-700 font-sans">
                <span>
                  {isCompressing 
                    ? 'Compactação .ZIP inteligente em andamento (reduzindo espaço no banco)...'
                    : 'Transmissão criptografada direta para a nuvem'}
                </span>
                <span className="font-medium">Aguarde a conclusão</span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedTeeth.length === 0 || isUploading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{userType === 'CLIENT' ? 'Enviar para Avaliação' : 'Criar Planejamento 3D'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
