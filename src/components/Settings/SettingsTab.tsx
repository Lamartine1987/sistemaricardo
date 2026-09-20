import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  Send, 
  Sliders, 
  Bell, 
  DollarSign, 
  Clock, 
  Save, 
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Tag,
  Sparkles,
  X
} from 'lucide-react';
import { 
  WhatsAppConfig, 
  DEFAULT_WHATSAPP_CONFIG, 
  MessageTemplate, 
  DEFAULT_MESSAGE_TEMPLATES 
} from '../../types/notifications';
import { 
  getStoredWhatsAppConfig, 
  saveStoredWhatsAppConfig, 
  createWhatsAppInstance, 
  fetchWhatsAppInstanceStatus, 
  logoutWhatsAppInstance, 
  sendWhatsAppMessage,
  renderMessageTemplate,
  TemplateVariables,
  WhatsAppInstanceStatusResponse 
} from '../../services/whatsapp/whatsappService';

interface SettingsTabProps {
  onNotifyFeedback?: (title: string, message: string) => void;
}

type SettingsSubTab = 'CONNECTION' | 'TEMPLATES' | 'COMMERCIAL';

const AVAILABLE_TAGS = [
  { tag: '{paciente}', desc: 'Nome do Paciente' },
  { tag: '{dentista}', desc: 'Nome do Dentista' },
  { tag: '{codigo}', desc: 'Código do Caso (ex: IMP-2026-001)' },
  { tag: '{guia}', desc: 'Tipo de Guia Cirúrgica' },
  { tag: '{arquivos}', desc: 'Qtd. de Arquivos 3D' },
  { tag: '{valor}', desc: 'Valor em Reais (ex: 320,00)' },
  { tag: '{chave_pix}', desc: 'Chave Pix Configurada' },
  { tag: '{link_painel}', desc: 'Link do Sistema' }
];

const SAMPLE_VARS: TemplateVariables = {
  paciente: 'Dr. Roberto Albuquerque',
  dentista: 'Dra. Camila Lima',
  codigo: 'IMP-2026-005',
  guia: 'Guia Dentossuportada Total',
  arquivos: '3',
  valor: '320,00',
  chave_pix: 'financeiro@implantprecision.com.br',
  link_painel: 'https://implantprecision.com.br'
};

export const SettingsTab: React.FC<SettingsTabProps> = ({ onNotifyFeedback }) => {
  // Aba ativa de configurações
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('CONNECTION');

  // Configurações salvas
  const [config, setConfig] = useState<WhatsAppConfig>(getStoredWhatsAppConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Estado da Conexão WhatsApp
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppInstanceStatusResponse>({
    status: 'DISCONNECTED'
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Teste de Envio Geral
  const [testPhone, setTestPhone] = useState(config.adminPhone || '81999694866');
  const [testMessage, setTestMessage] = useState('Olá! Este é um teste do sistema Implant Precision 3D via WhatsApp.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preview de Templates
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Modal para Criar Nova Mensagem Customizada
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateTarget, setNewTemplateTarget] = useState<'ADMIN' | 'DENTIST' | 'BOTH'>('DENTIST');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  // Polling para checar status e QR Code quando estiver em processo de conexão
  const pollingRef = useRef<any>(null);

  const checkStatus = async () => {
    setIsCheckingStatus(true);
    setConnectionError(null);
    try {
      const res = await fetchWhatsAppInstanceStatus(config);
      setConnectionStatus(res);
      if (res.status === 'ERROR' && res.errorMessage) {
        setConnectionError(res.errorMessage);
      }
    } catch (e: any) {
      setConnectionStatus({ status: 'ERROR', errorMessage: e.message });
      setConnectionError(e.message || 'Erro ao comunicar com o servidor WhatsApp.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Polling ativo quando aguarda QR Code
  useEffect(() => {
    if (connectionStatus.status === 'QR_READY' || connectionStatus.status === 'STARTING') {
      pollingRef.current = setInterval(async () => {
        const res = await fetchWhatsAppInstanceStatus(config);
        setConnectionStatus(res);
        if (res.status === 'CONNECTED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (onNotifyFeedback) {
            onNotifyFeedback('WhatsApp Conectado!', 'Aparelho pareado com sucesso no Implant Precision 3D.');
          }
        }
      }, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connectionStatus.status, config]);

  const handleStartInstance = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const res = await createWhatsAppInstance(config);
      if (!res.success) {
        setConnectionError(res.message || 'Falha ao iniciar instância no servidor.');
        return;
      }
      // Checa status após pequeno delay para dar tempo do Baileys gerar o QR
      setTimeout(checkStatus, 1500);
      setTimeout(checkStatus, 3500);
    } catch (e: any) {
      setConnectionError(e.message || 'Erro ao iniciar conexão.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar este número de WhatsApp?')) return;
    try {
      await logoutWhatsAppInstance(config);
      await checkStatus();
    } catch (e: any) {
      alert('Erro ao desconectar: ' + e.message);
    }
  };

  const handleResetToVpsUrl = () => {
    const updated = { 
      ...config, 
      apiUrl: DEFAULT_WHATSAPP_CONFIG.apiUrl,
      apiKey: DEFAULT_WHATSAPP_CONFIG.apiKey,
      instanceName: DEFAULT_WHATSAPP_CONFIG.instanceName
    };
    setConfig(updated);
    saveStoredWhatsAppConfig(updated);
    setConnectionError(null);
    alert('Configurações redefinidas para a VPS oficial (http://187.127.4.145:3000). Clique em Atualizar Status.');
  };

  const handleSaveConfig = () => {
    setIsSavingConfig(true);
    saveStoredWhatsAppConfig(config);
    setTimeout(() => {
      setIsSavingConfig(false);
      setConfigSaveSuccess(true);
      setTimeout(() => setConfigSaveSuccess(false), 3000);
    }, 400);
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    const res = await sendWhatsAppMessage(testPhone, testMessage, config);
    setIsSendingTest(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Mensagem de teste enviada com sucesso para o WhatsApp!'
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Falha ao enviar mensagem de teste. Verifique se o WhatsApp está conectado.'
      });
    }
  };

  // Manipulação de Templates
  const handleUpdateTemplateContent = (templateId: string, newContent: string) => {
    setConfig(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, content: newContent } : t)
    }));
  };

  const handleToggleTemplate = (templateId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, enabled } : t)
    }));
  };

  const handleInsertTagAtCursor = (templateId: string, tag: string) => {
    const targetEl = document.getElementById(`template-textarea-${templateId}`) as HTMLTextAreaElement | null;
    const currentTpl = config.templates.find(t => t.id === templateId);
    if (!currentTpl) return;

    if (targetEl) {
      const start = targetEl.selectionStart || 0;
      const end = targetEl.selectionEnd || 0;
      const text = currentTpl.content;
      const updatedText = text.substring(0, start) + tag + text.substring(end);
      handleUpdateTemplateContent(templateId, updatedText);

      setTimeout(() => {
        targetEl.focus();
        targetEl.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      handleUpdateTemplateContent(templateId, currentTpl.content + ' ' + tag);
    }
  };

  const handleRestoreTemplateDefault = (templateId: string) => {
    const defaultTpl = DEFAULT_MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (!defaultTpl) return;

    if (confirm(`Deseja restaurar o texto padrão de "${defaultTpl.title}"?`)) {
      setConfig(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === templateId ? { ...t, content: defaultTpl.content } : t)
      }));
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Deseja realmente excluir esta mensagem personalizada?')) {
      setConfig(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== templateId)
      }));
    }
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateContent.trim()) {
      alert('Por favor, preencha o título e o conteúdo da mensagem.');
      return;
    }

    const newTpl: MessageTemplate = {
      id: `tpl-custom-${Date.now()}`,
      trigger: 'CUSTOM',
      title: newTemplateTitle.trim(),
      description: newTemplateDesc.trim() || 'Mensagem personalizada criada pelo usuário.',
      target: newTemplateTarget,
      content: newTemplateContent,
      enabled: true,
      isDefault: false
    };

    const updated = {
      ...config,
      templates: [...config.templates, newTpl]
    };

    setConfig(updated);
    saveStoredWhatsAppConfig(updated);

    // Reset form
    setNewTemplateTitle('');
    setNewTemplateDesc('');
    setNewTemplateContent('');
    setIsNewTemplateModalOpen(false);
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 3000);
  };

  const qrImageUrl = connectionStatus.qr 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(connectionStatus.qr)}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-2xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Configurações do Sistema</h2>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase font-semibold">
                Painel Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              WhatsApp oficial, QR Code de pareamento, modelos de mensagens editáveis e parâmetros comerciais
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs font-sans transition-all shadow-sm flex items-center space-x-2 active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingConfig ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {configSaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-700 text-xs font-sans animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>Alterações salvas e aplicadas com sucesso em todo o sistema!</span>
        </div>
      )}

      {/* Navegação de Sub-Abas */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('CONNECTION')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans transition-all ${
            activeSubTab === 'CONNECTION'
              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Conexão WhatsApp & QR Code</span>
          {connectionStatus.status === 'CONNECTED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('TEMPLATES')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans transition-all ${
            activeSubTab === 'TEMPLATES'
              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Modelos de Mensagens</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-sans font-semibold">
            {config.templates?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('COMMERCIAL')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans transition-all ${
            activeSubTab === 'COMMERCIAL'
              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Parâmetros Comerciais</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-ABA 1: CONEXÃO WHATSAPP & QR CODE                       */}
      {/* ============================================================ */}
      {activeSubTab === 'CONNECTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Card Central de Conexão (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
                      <span>WhatsApp do Laboratório / Dr. Ricardo</span>
                      {connectionStatus.status === 'CONNECTED' ? (
                        <span className="flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : connectionStatus.status === 'QR_READY' ? (
                        <span className="flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          Aguardando Leitura
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                          Desconectado
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Servidor VPS: <span className="text-cyan-700 font-semibold">{config.apiUrl}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkStatus}
                  disabled={isCheckingStatus}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Atualizar status da conexão"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin text-cyan-600' : ''}`} />
                </button>
              </div>

              {/* Banner de Erro de Conexão, se houver */}
              {connectionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-xs font-sans animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Falha de Comunicação com Servidor:</span>
                    <p className="text-[11px] text-rose-600">{connectionError}</p>
                    <button
                      onClick={handleResetToVpsUrl}
                      className="mt-1 text-[11px] underline text-cyan-700 hover:text-cyan-800 font-sans block font-semibold"
                    >
                      Redefinir para URL da VPS Oficial (187.127.4.145:3000)
                    </button>
                  </div>
                </div>
              )}

              {/* Painel Central de Status / QR Code */}
              {connectionStatus.status === 'CONNECTED' ? (
                <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                          <span>WhatsApp Conectado com Sucesso</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-xs font-sans text-emerald-800 font-medium">
                          Número ativo: +{connectionStatus.phoneNumber || '55...'} {connectionStatus.profileName ? `(${connectionStatus.profileName})` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-sans font-medium transition-colors flex items-center space-x-1.5 shadow-2xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                    As mensagens automáticas de novo caso para o Dr. Ricardo e confirmação de recebimento para os dentistas parceiros estão ativas e funcionando.
                  </p>
                </div>
              ) : connectionStatus.status === 'QR_READY' && qrImageUrl ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-amber-200 text-center space-y-4 animate-fade-in">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-sans font-medium">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <span>Escaneie o QR Code abaixo com seu WhatsApp</span>
                  </div>

                  <div className="flex justify-center p-3 bg-white rounded-2xl w-fit mx-auto shadow-md border-4 border-amber-200">
                    <img
                      src={qrImageUrl}
                      alt="QR Code WhatsApp Baileys"
                      className="w-56 h-56 object-contain"
                    />
                  </div>

                  <div className="max-w-md mx-auto text-left bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 shadow-2xs font-sans">
                    <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                      <span>Como conectar seu aparelho:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Abra o WhatsApp no celular do Dr. Ricardo / Clínica.</li>
                      <li>Toque nos 3 pontos (ou Configurações) &gt; <strong className="text-slate-900">Aparelhos Conectados</strong>.</li>
                      <li>Toque em <strong className="text-cyan-700">Conectar um aparelho</strong> e aponte a câmera para o QR Code acima.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <QrCode className="w-12 h-12 mx-auto text-slate-400 opacity-60" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-sans">WhatsApp Desconectado</h4>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Clique no botão abaixo para gerar o QR Code de conexão no servidor VPS.
                    </p>
                  </div>
                  <button
                    onClick={handleStartInstance}
                    disabled={isConnecting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs font-sans transition-all shadow-sm flex items-center space-x-2 mx-auto active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>{isConnecting ? 'Gerando QR Code...' : 'Gerar QR Code de Conexão'}</span>
                  </button>
                </div>
              )}

              {/* Configurações Técnicas de Endpoint da API */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                    <Sliders className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Parâmetros do Servidor VPS</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToVpsUrl}
                    className="text-[10px] font-sans text-slate-500 hover:text-cyan-700 underline transition-colors"
                  >
                    Restaurar Padrão VPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-sans font-medium text-slate-600">URL da API (VPS)</label>
                    <input
                      type="text"
                      value={config.apiUrl}
                      onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
                      placeholder="http://187.127.4.145:3000"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-sans font-medium text-slate-600">Nome da Instância</label>
                    <input
                      type="text"
                      value={config.instanceName}
                      onChange={e => setConfig({ ...config, instanceName: e.target.value })}
                      placeholder="implantprecision"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-medium text-slate-600">Chave Secreta da API (x-api-key)</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Chave secreta..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Coluna Direita: Teste de Envio e Telefone do Dr. Ricardo (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Destinatário Admin */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-slate-800">
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Telefone do Dr. Ricardo</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Recebedor das notificações de novos casos</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block font-sans">
                  Número de WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  value={config.adminPhone}
                  onChange={e => setConfig({ ...config, adminPhone: e.target.value })}
                  placeholder="Ex: 81999694866"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-sans focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500 font-sans">
                  Número que receberá a mensagem instantânea assim que qualquer dentista enviar um novo caso para avaliação.
                </p>
              </div>
            </div>

            {/* Teste Imediato de Disparo */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-slate-800">
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Testar Disparo de Mensagem</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Envie uma mensagem de teste para qualquer número</p>
                </div>
              </div>

              <form onSubmit={handleSendTestMessage} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-medium text-slate-600">Telefone Destino (com DDD)</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="Ex: 81999694866"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-sans focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-medium text-slate-600">Texto do Teste</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl p-2.5 text-xs text-slate-900 font-sans focus:outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingTest || !testPhone.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-sans font-semibold transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 text-cyan-600 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  <span>{isSendingTest ? 'Enviando pelo WhatsApp...' : 'Enviar Teste Agora'}</span>
                </button>

                {testResult && (
                  <div className={`p-2.5 rounded-xl border text-xs font-sans flex items-center space-x-2 animate-fade-in ${
                    testResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </form>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-ABA 2: MODELOS DE MENSAGENS (EDITÁVEIS & CUSTOMIZADAS)    */}
      {/* ============================================================ */}
      {activeSubTab === 'TEMPLATES' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Bar dos Templates */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-sans">
                <span>Modelos de Mensagens WhatsApp</span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
                  {config.templates?.length || 0} modelos
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Edite os textos, insira variáveis dinâmicas ou crie novos modelos personalizados.
              </p>
            </div>

            <button
              onClick={() => setIsNewTemplateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs font-sans transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Mensagem Personalizada</span>
            </button>
          </div>

          {/* Dica de Variáveis Dinâmicas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="font-sans text-slate-700 font-semibold flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-600" />
              <span>Variáveis Disponíveis para Personalização:</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_TAGS.map(({ tag, desc }) => (
                <span 
                  key={tag}
                  title={desc}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-sans text-[11px] text-cyan-800 flex items-center space-x-1 shadow-2xs"
                >
                  <code className="font-bold text-cyan-900">{tag}</code>
                  <span className="text-slate-500 text-[10px]">({desc})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Lista de Modelos */}
          <div className="space-y-5">
            {config.templates.map(tpl => {
              const isPreviewing = previewTemplateId === tpl.id;
              const renderedPreview = renderMessageTemplate(tpl.content, SAMPLE_VARS);

              return (
                <div 
                  key={tpl.id} 
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4 hover:border-cyan-300 hover:shadow-md transition-all shadow-xs text-slate-800"
                >
                  {/* Header do Card do Template */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 font-sans">{tpl.title}</h4>
                        {tpl.isDefault ? (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
                            Padrão
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                            Customizada
                          </span>
                        )}
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {tpl.target === 'ADMIN' ? '👤 Dr. Ricardo' : tpl.target === 'DENTIST' ? '🦷 Cirurgião-Dentista' : '🌐 Geral'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans">{tpl.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Toggle de Ativação */}
                      <label className="flex items-center space-x-1.5 cursor-pointer px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans">
                        <input
                          type="checkbox"
                          checked={tpl.enabled}
                          onChange={e => handleToggleTemplate(tpl.id, e.target.checked)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className={tpl.enabled ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {tpl.enabled ? 'Ativo' : 'Desativado'}
                        </span>
                      </label>

                      {/* Botão de Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(isPreviewing ? null : tpl.id)}
                        className={`p-1.5 rounded-lg border text-xs font-sans transition-colors flex items-center space-x-1 ${
                          isPreviewing 
                            ? 'bg-cyan-50 border-cyan-200 text-cyan-700 font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Alternar prévia de visualização"
                      >
                        {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span className="text-[11px] hidden sm:inline">{isPreviewing ? 'Fechar Prévia' : 'Prévia'}</span>
                      </button>

                      {/* Restaurar Padrão */}
                      {tpl.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleRestoreTemplateDefault(tpl.id)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-amber-600 transition-colors"
                          title="Restaurar texto padrão de fábrica"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Excluir (se customizado) */}
                      {!tpl.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors"
                          title="Excluir esta mensagem personalizada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de Inserção Rápida de Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-sans font-medium text-slate-500 flex items-center gap-1 mr-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Inserir no texto:
                    </span>
                    {AVAILABLE_TAGS.map(({ tag }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleInsertTagAtCursor(tpl.id, tag)}
                        className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-[10px] font-sans text-slate-600 hover:text-cyan-800 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* Campo de Texto Editável */}
                  <div className="space-y-1">
                    <textarea
                      id={`template-textarea-${tpl.id}`}
                      rows={6}
                      value={tpl.content}
                      onChange={e => handleUpdateTemplateContent(tpl.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl p-3.5 text-xs text-slate-900 font-sans focus:outline-none resize-y leading-relaxed transition-all"
                      placeholder="Escreva a mensagem aqui utilizando tags como {paciente}, {dentista}, {codigo}..."
                    />
                  </div>

                  {/* Prévia Estilo WhatsApp */}
                  {isPreviewing && (
                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans text-emerald-800 flex items-center space-x-1 font-semibold">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>Prévia no WhatsApp do Destinatário (com dados simulados):</span>
                        </span>
                        <span className="text-[10px] font-sans text-slate-500">Hoje às 14:32</span>
                      </div>
                      <div className="max-w-md bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-sm text-xs font-sans whitespace-pre-wrap shadow-sm leading-relaxed border border-emerald-600/30">
                        {renderedPreview}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-ABA 3: PARÂMETROS COMERCIAIS                             */}
      {/* ============================================================ */}
      {activeSubTab === 'COMMERCIAL' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-slate-800">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Parâmetros Comerciais & Laboratório</h3>
                <p className="text-[11px] text-slate-500 font-sans">Valores de referência e chave Pix de pagamento</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 font-sans">Valor Base da Guia Cirúrgica</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">R$</span>
                  <input
                    type="text"
                    defaultValue="320,00"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 font-sans">Chave Pix de Recebimento</label>
                <input
                  type="text"
                  defaultValue="financeiro@implantprecision.com.br"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none transition-all font-sans"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-sans flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>Prazo padrão de entrega do planejamento: <strong className="text-slate-900">5 dias úteis</strong>.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CRIAR NOVA MENSAGEM CUSTOMIZADA                      */}
      {/* ============================================================ */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">Criar Novo Modelo de Mensagem</h3>
              </div>
              <button
                onClick={() => setIsNewTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 font-sans">Título / Nome da Mensagem *</label>
                <input
                  type="text"
                  required
                  value={newTemplateTitle}
                  onChange={e => setNewTemplateTitle(e.target.value)}
                  placeholder="Ex: Tomografia Complementar Solicitada"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-sans focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 font-sans">Destinatário</label>
                  <select
                    value={newTemplateTarget}
                    onChange={e => setNewTemplateTarget(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-sans focus:outline-none transition-all"
                  >
                    <option value="DENTIST">🦷 Cirurgião-Dentista</option>
                    <option value="ADMIN">👤 Dr. Ricardo (Admin)</option>
                    <option value="BOTH">🌐 Todos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 font-sans">Finalidade / Descrição</label>
                  <input
                    type="text"
                    value={newTemplateDesc}
                    onChange={e => setNewTemplateDesc(e.target.value)}
                    placeholder="Ex: Quando faltar corte tomográfico"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-sans focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tags rápidas */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block font-sans">Conteúdo da Mensagem *</label>
                <div className="flex flex-wrap gap-1 pb-1">
                  {AVAILABLE_TAGS.map(({ tag }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTemplateContent(prev => prev + ' ' + tag)}
                      className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-sans text-cyan-800 border border-slate-200 hover:border-cyan-300"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={5}
                  value={newTemplateContent}
                  onChange={e => setNewTemplateContent(e.target.value)}
                  placeholder="Olá Dr(a). {dentista}! Notamos que no caso {codigo} do paciente {paciente}..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl p-3 text-xs text-slate-900 font-sans focus:outline-none resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs font-sans transition-all shadow-sm"
                >
                  Salvar Mensagem
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

