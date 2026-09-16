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
  Info,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyber-border bg-gradient-to-r from-cyber-card via-cyber-surface to-cyber-card shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-blue-600 flex items-center justify-center text-black shadow-glow-cyan">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Configurações do Sistema</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                Painel Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              WhatsApp oficial, QR Code de pareamento, modelos de mensagens editáveis e parâmetros comerciais
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs font-mono transition-all shadow-glow-cyan flex items-center space-x-2 active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingConfig ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {configSaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-mono animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Alterações salvas e aplicadas com sucesso em todo o sistema!</span>
        </div>
      )}

      {/* Navegação de Sub-Abas */}
      <div className="flex flex-wrap gap-2 border-b border-cyber-border pb-3">
        <button
          onClick={() => setActiveSubTab('CONNECTION')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeSubTab === 'CONNECTION'
              ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-cyber-surface/40 hover:bg-cyber-surface border border-transparent'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Conexão WhatsApp & QR Code</span>
          {connectionStatus.status === 'CONNECTED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('TEMPLATES')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeSubTab === 'TEMPLATES'
              ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-cyber-surface/40 hover:bg-cyber-surface border border-transparent'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Modelos de Mensagens</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {config.templates?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('COMMERCIAL')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeSubTab === 'COMMERCIAL'
              ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-cyber-surface/40 hover:bg-cyber-surface border border-transparent'
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
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-5">
              
              <div className="flex items-center justify-between border-b border-cyber-border pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <span>WhatsApp do Laboratório / Dr. Ricardo</span>
                      {connectionStatus.status === 'CONNECTED' ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      ) : connectionStatus.status === 'QR_READY' ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          Aguardando Leitura
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Desconectado
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Servidor VPS: <span className="text-cyber-cyan font-semibold">{config.apiUrl}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkStatus}
                  disabled={isCheckingStatus}
                  className="p-2 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-300 hover:text-white transition-colors"
                  title="Atualizar status da conexão"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin text-cyber-cyan' : ''}`} />
                </button>
              </div>

              {/* Banner de Erro de Conexão, se houver */}
              {connectionError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-red-400 text-xs font-mono animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Falha de Comunicação com Servidor:</span>
                    <p className="text-[11px] text-red-300">{connectionError}</p>
                    <button
                      onClick={handleResetToVpsUrl}
                      className="mt-1 text-[11px] underline text-cyber-cyan hover:text-cyan-300 font-sans block"
                    >
                      Redefinir para URL da VPS Oficial (187.127.4.145:3000)
                    </button>
                  </div>
                </div>
              )}

              {/* Painel Central de Status / QR Code */}
              {connectionStatus.status === 'CONNECTED' ? (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>WhatsApp Conectado com Sucesso</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs font-mono text-emerald-300">
                          Número ativo: +{connectionStatus.phoneNumber || '55...'} {connectionStatus.profileName ? `(${connectionStatus.profileName})` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    As mensagens automáticas de novo caso para o Dr. Ricardo e confirmação de recebimento para os dentistas parceiros estão ativas e funcionando.
                  </p>
                </div>
              ) : connectionStatus.status === 'QR_READY' && qrImageUrl ? (
                <div className="p-5 rounded-xl bg-cyber-surface/80 border border-amber-500/30 text-center space-y-4 animate-fade-in">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Escaneie o QR Code abaixo com seu WhatsApp</span>
                  </div>

                  <div className="flex justify-center p-3 bg-white rounded-2xl w-fit mx-auto shadow-2xl border-4 border-amber-400/50">
                    <img
                      src={qrImageUrl}
                      alt="QR Code WhatsApp Baileys"
                      className="w-56 h-56 object-contain"
                    />
                  </div>

                  <div className="max-w-md mx-auto text-left bg-cyber-bg/70 p-3.5 rounded-xl border border-cyber-border text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-white font-mono flex items-center space-x-1.5">
                      <span>Como conectar seu aparelho:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 font-mono">
                      <li>Abra o WhatsApp no celular do Dr. Ricardo / Clínica.</li>
                      <li>Toque nos 3 pontos (ou Configurações) &gt; <strong className="text-white">Aparelhos Conectados</strong>.</li>
                      <li>Toque em <strong className="text-cyber-cyan">Conectar um aparelho</strong> e aponte a câmera para o QR Code acima.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-cyber-surface/40 border border-cyber-border text-center space-y-4">
                  <QrCode className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">WhatsApp Desconectado</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Clique no botão abaixo para gerar o QR Code de conexão no servidor VPS.
                    </p>
                  </div>
                  <button
                    onClick={handleStartInstance}
                    disabled={isConnecting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2 mx-auto active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>{isConnecting ? 'Gerando QR Code...' : 'Gerar QR Code de Conexão'}</span>
                  </button>
                </div>
              )}

              {/* Configurações Técnicas de Endpoint da API */}
              <div className="pt-2 border-t border-cyber-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Parâmetros do Servidor VPS</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToVpsUrl}
                    className="text-[10px] font-mono text-slate-400 hover:text-cyber-cyan underline transition-colors"
                  >
                    Restaurar Padrão VPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">URL da API (VPS)</label>
                    <input
                      type="text"
                      value={config.apiUrl}
                      onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
                      placeholder="http://187.127.4.145:3000"
                      className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Nome da Instância</label>
                    <input
                      type="text"
                      value={config.instanceName}
                      onChange={e => setConfig({ ...config, instanceName: e.target.value })}
                      placeholder="implantprecision"
                      className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Chave Secreta da API (x-api-key)</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Chave secreta..."
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Coluna Direita: Teste de Envio e Telefone do Dr. Ricardo (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Destinatário Admin */}
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-cyber-border pb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Telefone do Dr. Ricardo</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Recebedor das notificações de novos casos</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">
                  Número de WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  value={config.adminPhone}
                  onChange={e => setConfig({ ...config, adminPhone: e.target.value })}
                  placeholder="Ex: 81999694866"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 font-sans">
                  Número que receberá a mensagem instantânea assim que qualquer dentista enviar um novo caso para avaliação.
                </p>
              </div>
            </div>

            {/* Teste Imediato de Disparo */}
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-cyber-border pb-3">
                <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Testar Disparo de Mensagem</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Envie uma mensagem de teste para qualquer número</p>
                </div>
              </div>

              <form onSubmit={handleSendTestMessage} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Telefone Destino (com DDD)</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="Ex: 81999694866"
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Texto do Teste</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingTest || !testPhone.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-cyan/40 text-cyber-cyan hover:text-white text-xs font-mono transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  <span>{isSendingTest ? 'Enviando pelo WhatsApp...' : 'Enviar Teste Agora'}</span>
                </button>

                {testResult && (
                  <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center space-x-2 animate-fade-in ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-cyber-border bg-cyber-surface/30">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                <span>Modelos de Mensagens WhatsApp</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                  {config.templates?.length || 0} modelos
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Edite os textos, insira variáveis dinâmicas ou crie novos modelos personalizados.
              </p>
            </div>

            <button
              onClick={() => setIsNewTemplateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all flex items-center space-x-1.5 shadow-glow-cyan active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Mensagem Personalizada</span>
            </button>
          </div>

          {/* Dica de Variáveis Dinâmicas */}
          <div className="p-4 rounded-xl bg-cyber-bg/60 border border-cyber-border text-xs space-y-2">
            <span className="font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Variáveis Disponíveis para Personalização:</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_TAGS.map(({ tag, desc }) => (
                <span 
                  key={tag}
                  title={desc}
                  className="px-2.5 py-1 rounded-lg bg-cyber-surface border border-cyber-border font-mono text-[11px] text-cyber-cyan flex items-center space-x-1"
                >
                  <code className="font-bold">{tag}</code>
                  <span className="text-slate-400 text-[10px]">({desc})</span>
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
                  className="p-5 rounded-2xl glass-panel border border-cyber-border space-y-4 hover:border-cyber-cyan/30 transition-all bg-cyber-card/60"
                >
                  {/* Header do Card do Template */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyber-border/70 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white font-sans">{tpl.title}</h4>
                        {tpl.isDefault ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Padrão
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Customizada
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {tpl.target === 'ADMIN' ? '👤 Dr. Ricardo' : tpl.target === 'DENTIST' ? '🦷 Cirurgião-Dentista' : '🌐 Geral'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{tpl.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Toggle de Ativação */}
                      <label className="flex items-center space-x-1.5 cursor-pointer px-2.5 py-1 rounded-lg bg-cyber-surface border border-cyber-border text-xs font-mono">
                        <input
                          type="checkbox"
                          checked={tpl.enabled}
                          onChange={e => handleToggleTemplate(tpl.id, e.target.checked)}
                          className="rounded border-cyber-border text-cyber-cyan focus:ring-cyber-cyan bg-cyber-bg"
                        />
                        <span className={tpl.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                          {tpl.enabled ? 'Ativo' : 'Desativado'}
                        </span>
                      </label>

                      {/* Botão de Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(isPreviewing ? null : tpl.id)}
                        className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1 ${
                          isPreviewing 
                            ? 'bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan' 
                            : 'bg-cyber-surface border-cyber-border text-slate-400 hover:text-white'
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
                          className="p-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-400 hover:text-amber-300 transition-colors"
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
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                          title="Excluir esta mensagem personalizada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de Inserção Rápida de Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mr-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Inserir no texto:
                    </span>
                    {AVAILABLE_TAGS.map(({ tag }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleInsertTagAtCursor(tpl.id, tag)}
                        className="px-2 py-0.5 rounded-md bg-cyber-surface/80 hover:bg-cyber-cyan/20 border border-cyber-border hover:border-cyber-cyan/40 text-[10px] font-mono text-slate-300 hover:text-cyber-cyan transition-colors"
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
                      className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none resize-y leading-relaxed"
                      placeholder="Escreva a mensagem aqui utilizando tags como {paciente}, {dentista}, {codigo}..."
                    />
                  </div>

                  {/* Prévia Estilo WhatsApp */}
                  {isPreviewing && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 font-semibold">
                          <Smartphone className="w-3 h-3" />
                          <span>Prévia no WhatsApp do Destinatário (com dados simulados):</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Hoje às 14:32</span>
                      </div>
                      <div className="max-w-md bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs font-sans whitespace-pre-wrap shadow-lg leading-relaxed border border-emerald-400/20">
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
          <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-cyber-border pb-3">
              <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Parâmetros Comerciais & Laboratório</h3>
                <p className="text-[11px] text-slate-400 font-mono">Valores de referência e chave Pix de pagamento</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Valor Base da Guia Cirúrgica</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-slate-500">R$</span>
                  <input
                    type="text"
                    defaultValue="320,00"
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl pl-9 pr-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Chave Pix de Recebimento</label>
                <input
                  type="text"
                  defaultValue="financeiro@implantprecision.com.br"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-surface/60 border border-cyber-border/80 text-xs text-slate-300 font-sans flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
                <span>Prazo padrão de entrega do planejamento: <strong className="text-white">5 dias úteis</strong>.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CRIAR NOVA MENSAGEM CUSTOMIZADA                      */}
      {/* ============================================================ */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyber-cyan/15 text-cyber-cyan">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Criar Novo Modelo de Mensagem</h3>
              </div>
              <button
                onClick={() => setIsNewTemplateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Título / Nome da Mensagem *</label>
                <input
                  type="text"
                  required
                  value={newTemplateTitle}
                  onChange={e => setNewTemplateTitle(e.target.value)}
                  placeholder="Ex: Tomografia Complementar Solicitada"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Destinatário</label>
                  <select
                    value={newTemplateTarget}
                    onChange={e => setNewTemplateTarget(e.target.value as any)}
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="DENTIST">🦷 Cirurgião-Dentista</option>
                    <option value="ADMIN">👤 Dr. Ricardo (Admin)</option>
                    <option value="BOTH">🌐 Todos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Finalidade / Descrição</label>
                  <input
                    type="text"
                    value={newTemplateDesc}
                    onChange={e => setNewTemplateDesc(e.target.value)}
                    placeholder="Ex: Quando faltar corte tomográfico"
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags rápidas */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 block">Conteúdo da Mensagem *</label>
                <div className="flex flex-wrap gap-1 pb-1">
                  {AVAILABLE_TAGS.map(({ tag }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTemplateContent(prev => prev + ' ' + tag)}
                      className="px-2 py-0.5 rounded bg-cyber-surface text-[10px] font-mono text-cyber-cyan border border-cyber-border hover:border-cyber-cyan/50"
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
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all shadow-glow-cyan"
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

