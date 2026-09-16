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
  FileText,
  Trash2,
  FolderOpen,
  Loader2,
  CheckCircle2,
  Box,
  Archive,
  Layers
} from 'lucide-react';

interface AttachedFile {
  id: string;
  file: File;
  name: string;
  sizeStr: string;
  category: 'SCAN_PRE' | 'SCAN_OPP' | 'BITE' | 'TOMOGRAPHY' | 'OTHER';
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

const getCategoryLabel = (category: AttachedFile['category']): string => {
  switch (category) {
    case 'SCAN_PRE': return 'Arcada Superior / Preparo';
    case 'SCAN_OPP': return 'Arcada Antagonista / Mandíbula';
    case 'BITE': return 'Registro de Mordida';
    case 'TOMOGRAPHY': return 'Tomografia (DICOM)';
    case 'OTHER': return 'Arquivo Compactado / Outro';
  }
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
  const [amount, setAmount] = useState<number>(320.00);

  // Telefone para Notificações do Dentista
  const currentDentistObj = dentists.find(d => d.id === selectedDentistId) || dentists[0];
  const [dentistPhone, setDentistPhone] = useState(currentDentistObj?.phone || '81999694866');

  // Estados de Upload de Arquivos
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

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

    const newItems: AttachedFile[] = fileArray.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      sizeStr: formatFileSize(file.size),
      category: detectCategory(file.name)
    }));

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
          setUploadStatusText(`Enviando arquivo ${i + 1} de ${attachedFiles.length}: ${item.name}...`);
          
          const uploadRes = await uploadCaseFileToStorage(item.file, caseCode);
          
          // Salvar arquivo bruto no cache local para carregamento instantâneo no visualizador 3D
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
            isLocked: false // Arquivos enviados pelo cliente são sempre liberados
          });
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

      const newCase: DentalCase = {
        id: newCaseId,
        caseCode,
        patientName,
        patientIdentifier: patientIdentifier || patientName.split(' ').map(n => n[0]).join('.').toUpperCase(),
        dentistId: dentist.id,
        dentistName: dentist.name,
        dentistCro: dentist.cro,
        dentistPhone: dentistPhone.trim() || dentist.phone || '',
        status: userType === 'CLIENT' ? 'ANALYSIS' : 'PENDING_APPROVAL',
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
      setUploadStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      
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

      <div className="relative w-full max-w-3xl my-auto rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-surface/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {userType === 'CLIENT' ? 'Enviar Novo Caso para Planejamento' : 'Cadastrar Novo Planejamento de Implante'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {userType === 'CLIENT' 
                  ? 'Envie os escaneamentos do seu paciente para o Dr. Ricardo planejar' 
                  : 'Especificação técnica e envio de arquivos para o dentista'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Paciente */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Nome do Paciente *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full px-3.5 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            {/* Iniciais / Identificador */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Iniciais / Prontuário
              </label>
              <input
                type="text"
                value={patientIdentifier}
                onChange={e => setPatientIdentifier(e.target.value)}
                placeholder="Ex: C.E.S."
                className="w-full px-3.5 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dentista Solicitante */}
            {userType === 'ADMIN' ? (
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Dentista Solicitante (Cliente) *
                </label>
                <select
                  value={selectedDentistId}
                  onChange={e => setSelectedDentistId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
                >
                  {dentists.map(d => (
                    <option key={d.id} value={d.id} className="bg-cyber-surface text-white">
                      {d.name} ({d.clinicName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Sua Clínica / Responsável
                </label>
                <div className="px-3.5 py-2.5 text-xs bg-cyber-surface/50 border border-cyber-border rounded-xl text-slate-300 font-medium">
                  {dentists.find(d => d.id === selectedDentistId)?.name || 'Dr. Marcelo Vieira'}
                </div>
              </div>
            )}

            {/* Tipo de Guia Cirúrgica */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Tipo de Guia Desejada
              </label>
              <select
                value={surgicalGuideType}
                onChange={e => setSurgicalGuideType(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              >
                <option value="DENTO_SUPORTADA">Dento-suportada (Apoiada em dentes remanescentes)</option>
                <option value="MUCO_SUPORTADA">Muco-suportada (Casos de protocolo sobre gengiva)</option>
                <option value="OSSEO_SUPORTADA">Ósseo-suportada (Casos avançados de cirurgia aberta)</option>
              </select>
            </div>
          </div>

          {/* WhatsApp do Dentista para Notificações */}
          <div className="p-3 rounded-xl bg-cyber-surface/40 border border-cyber-border space-y-1">
            <label className="text-xs font-mono text-cyber-cyan font-semibold flex items-center space-x-1.5">
              <span>WhatsApp do Dentista para Notificações Automáticas *</span>
            </label>
            <input
              type="text"
              required
              value={dentistPhone}
              onChange={e => setDentistPhone(e.target.value)}
              placeholder="Ex: 81999694866 (com DDD)"
              className="w-full px-3.5 py-2 text-xs bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl text-white font-mono focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 font-sans">
              Você receberá avisos automáticos neste WhatsApp assim que o Dr. Ricardo aceitar os escaneamentos e quando o 3D estiver pronto.
            </p>
          </div>

          {/* Odontograma Interativo */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">
              Marque no Odontograma a Posição dos Implantes a Realizar:
            </label>
            <Odontogram 
              selectedTeeth={selectedTeeth} 
              onToggleTooth={handleToggleTooth} 
            />
            {selectedTeeth.length === 0 && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Selecione ao menos um dente para prosseguir.</span>
              </p>
            )}
          </div>

          {/* Upload de Arquivos 3D com Suporte Completo a Clique e Drag & Drop */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-slate-300 block">
                Arquivos de Escaneamento 3D (.STL, .OBJ, .PLY ou DICOM)
              </label>
              {attachedFiles.length > 0 && (
                <span className="text-[11px] font-mono text-cyber-cyan">
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
                  ? 'border-cyber-cyan bg-cyber-cyan/10 scale-[0.99] shadow-glow-cyan' 
                  : 'border-cyber-border hover:border-cyber-cyan/60 bg-cyber-surface/40 hover:bg-cyber-surface/60'
              }`}
            >
              <UploadCloud className={`w-10 h-10 mx-auto mb-2 transition-transform group-hover:scale-110 ${
                isDragging ? 'text-cyber-cyan animate-bounce' : 'text-cyber-cyan/70'
              }`} />
              <p className="text-xs text-slate-200 font-medium">
                Arraste os arquivos de escaneamento ou <span className="text-cyber-cyan underline font-semibold">procure no computador</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Suporta modelos STL, OBJ, PLY, pastas de Tomografia DICOM ou arquivos compactados (.ZIP, .RAR)
              </p>

              <div className="mt-3 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs text-cyber-cyan font-mono transition-colors flex items-center space-x-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Selecionar Arquivos</span>
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs text-slate-300 font-mono transition-colors flex items-center space-x-1.5 hover:text-white"
                  title="Selecionar pasta completa com fatias DICOM"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Selecionar Pasta DICOM</span>
                </button>
              </div>
            </div>

            {/* Lista de Arquivos Anexados */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {attachedFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="p-2.5 rounded-xl bg-cyber-surface/80 border border-cyber-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg bg-cyber-cyan/10 text-cyber-cyan flex-shrink-0">
                        {fileItem.category === 'TOMOGRAPHY' ? (
                          <Layers className="w-4 h-4 text-amber-400" />
                        ) : fileItem.name.endsWith('.zip') || fileItem.name.endsWith('.rar') ? (
                          <Archive className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Box className="w-4 h-4 text-cyber-cyan" />
                        )}
                      </div>
                      <div className="truncate flex-1">
                        <span className="font-mono text-slate-200 block truncate font-medium" title={fileItem.name}>
                          {fileItem.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {fileItem.sizeStr}
                        </span>
                      </div>
                    </div>

                    {/* Classificação do Tipo de Arquivo */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={fileItem.category}
                        onChange={e => handleChangeCategory(fileItem.id, e.target.value as AttachedFile['category'])}
                        className="bg-cyber-bg border border-cyber-border text-[11px] font-mono text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyber-cyan"
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
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover arquivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações Clínicas */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              {userType === 'CLIENT' ? 'Instruções para o Dr. Ricardo' : 'Notas Técnicas do Planejamento'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Paciente possui pouca espessura na vestibular, planejar implante mais lingualizado..."
              className="w-full px-3.5 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan resize-none"
            />
          </div>

          {/* Feedback de Progresso de Envio */}
          {isUploading && (
            <div className="p-3.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center space-x-3 text-xs font-mono text-cyber-cyan animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>{uploadStatusText || 'Enviando arquivos e cadastrando caso...'}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-cyber-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl bg-cyber-surface border border-cyber-border text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedTeeth.length === 0 || isUploading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-2 disabled:opacity-50"
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
