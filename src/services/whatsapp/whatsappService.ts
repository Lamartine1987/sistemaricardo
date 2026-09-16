import { 
  WhatsAppConfig, 
  DEFAULT_WHATSAPP_CONFIG, 
  MessageTemplate, 
  NotificationTrigger, 
  DEFAULT_MESSAGE_TEMPLATES 
} from '../../types/notifications';

const CONFIG_STORAGE_KEY = 'implantprecision_whatsapp_config';

/**
 * Interface com variáveis substituíveis nos templates
 */
export interface TemplateVariables {
  paciente?: string;
  dentista?: string;
  codigo?: string;
  guia?: string;
  arquivos?: string | number;
  valor?: string | number;
  chave_pix?: string;
  link_painel?: string;
  [key: string]: string | number | undefined;
}

/**
 * Substitui tags dinâmicas no formato {tag} pelos valores correspondentes
 */
export const renderMessageTemplate = (templateContent: string, vars: TemplateVariables): string => {
  let result = templateContent;
  for (const [key, val] of Object.entries(vars)) {
    if (val !== undefined && val !== null) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(regex, String(val));
    }
  }
  return result;
};

/**
 * Recupera configurações salvas ou padrão do WhatsApp com auto-migração para VPS
 */
export const getStoredWhatsAppConfig = (): WhatsAppConfig => {
  const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!saved) return DEFAULT_WHATSAPP_CONFIG;

  try {
    const parsed = JSON.parse(saved);
    let needsResave = false;

    // Auto-migração: se a URL antiga apontava para localhost, atualiza para o IP da VPS
    if (!parsed.apiUrl || parsed.apiUrl.includes('localhost')) {
      parsed.apiUrl = DEFAULT_WHATSAPP_CONFIG.apiUrl;
      needsResave = true;
    }

    // Auto-migração: se não tem templates ou está vazio, preenche com os padrões
    if (!Array.isArray(parsed.templates) || parsed.templates.length === 0) {
      parsed.templates = [...DEFAULT_MESSAGE_TEMPLATES];
      needsResave = true;
    } else {
      // Garante que templates padrão ausentes sejam incorporados
      DEFAULT_MESSAGE_TEMPLATES.forEach(defaultTpl => {
        const exists = parsed.templates.some((t: MessageTemplate) => t.trigger === defaultTpl.trigger);
        if (!exists) {
          parsed.templates.push({ ...defaultTpl });
          needsResave = true;
        }
      });
    }

    const merged: WhatsAppConfig = { ...DEFAULT_WHATSAPP_CONFIG, ...parsed };
    if (needsResave) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    return DEFAULT_WHATSAPP_CONFIG;
  }
};

/**
 * Salva as configurações de WhatsApp
 */
export const saveStoredWhatsAppConfig = (config: WhatsAppConfig) => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

/**
 * Obtém template por trigger a partir das configurações salvas
 */
export const getTemplateByTrigger = (
  trigger: NotificationTrigger, 
  customConfig?: WhatsAppConfig
): MessageTemplate | undefined => {
  const config = customConfig || getStoredWhatsAppConfig();
  return config.templates?.find(t => t.trigger === trigger);
};

/**
 * Formata um telefone para o padrão internacional (DDI + DDD + Número)
 */
export const formatPhoneToInternational = (rawPhone: string): string => {
  const clean = rawPhone.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`;
  }
  return clean;
};

export interface WhatsAppInstanceStatusResponse {
  status: 'CONNECTED' | 'QR_READY' | 'STARTING' | 'DISCONNECTED' | 'NOT_FOUND' | 'ERROR';
  qr?: string;
  phoneNumber?: string;
  profileName?: string;
  errorMessage?: string;
}

/**
 * Inicia ou solicita criação da instância no whatsapp-api
 */
export const createWhatsAppInstance = async (
  customConfig?: Partial<WhatsAppConfig>
): Promise<{ success: boolean; message: string }> => {
  const config = { ...getStoredWhatsAppConfig(), ...customConfig };
  const baseUrl = config.apiUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey
      },
      body: JSON.stringify({
        instanceName: config.instanceName
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        message: data.error || data.message || `Erro do servidor (${response.status}: ${response.statusText})`
      };
    }

    return {
      success: true,
      message: data.message || 'Instância inicializada com sucesso.'
    };
  } catch (error: any) {
    console.warn('⚠️ [WhatsApp] Falha ao conectar ao servidor whatsapp-api:', error.message);
    return {
      success: false,
      message: `Não foi possível conectar ao servidor (${baseUrl}). Verifique se a URL e a internet estão ativas.`
    };
  }
};

/**
 * Consulta o status da instância e QR Code
 */
export const fetchWhatsAppInstanceStatus = async (
  customConfig?: Partial<WhatsAppConfig>
): Promise<WhatsAppInstanceStatusResponse> => {
  const config = { ...getStoredWhatsAppConfig(), ...customConfig };
  const baseUrl = config.apiUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${baseUrl}/instance/status/${config.instanceName}`, {
      method: 'GET',
      headers: {
        'x-api-key': config.apiKey
      }
    });

    if (response.status === 404 || response.status === 403) {
      // Instância ainda não registrada no PostgreSQL da VPS
      return { status: 'NOT_FOUND' };
    }

    if (!response.ok) {
      return { status: 'ERROR', errorMessage: `Erro ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return {
      status: data.status || 'DISCONNECTED',
      qr: data.qr || '',
      phoneNumber: data.phoneNumber || '',
      profileName: data.profileName || ''
    };
  } catch (error: any) {
    return {
      status: 'ERROR',
      errorMessage: `Falha na conexão com o servidor (${baseUrl}). Verifique a URL da API.`
    };
  }
};

/**
 * Desconecta a instância do WhatsApp
 */
export const logoutWhatsAppInstance = async (
  customConfig?: Partial<WhatsAppConfig>
): Promise<{ success: boolean; message: string }> => {
  const config = { ...getStoredWhatsAppConfig(), ...customConfig };
  const baseUrl = config.apiUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${baseUrl}/instance/logout/${config.instanceName}`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey
      }
    });
    const data = await response.json().catch(() => ({}));
    return { success: response.ok, message: data.message || 'Instância desconectada.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Falha ao desconectar.' };
  }
};

/**
 * Envia mensagem de texto via whatsapp-api
 */
export const sendWhatsAppMessage = async (
  toPhone: string,
  text: string,
  customConfig?: Partial<WhatsAppConfig>
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const config = { ...getStoredWhatsAppConfig(), ...customConfig };
  const baseUrl = config.apiUrl.replace(/\/+$/, '');
  const cleanNumber = formatPhoneToInternational(toPhone);

  if (!cleanNumber) {
    return { success: false, error: 'Número de telefone inválido.' };
  }

  try {
    const response = await fetch(`${baseUrl}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey
      },
      body: JSON.stringify({
        instanceName: config.instanceName,
        number: cleanNumber,
        text
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Falha no envio da mensagem.');
    }

    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.warn(`⚠️ [WhatsApp] Não foi possível enviar WhatsApp para ${cleanNumber}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ==========================================
// FORMATAÇÃO DE MENSAGENS COM TEMPLATES
// ==========================================

/**
 * Notificação para o Dr. Ricardo quando o Dentista envia novo caso
 */
export const buildNewCaseAdminMessage = (
  patientName: string,
  dentistName: string,
  caseCode: string,
  guideType: string,
  filesCount: number,
  config?: WhatsAppConfig
): string => {
  const tpl = getTemplateByTrigger('NEW_CASE', config);
  const vars: TemplateVariables = {
    paciente: patientName,
    dentista: dentistName,
    codigo: caseCode,
    guia: guideType.replace('_', ' '),
    arquivos: filesCount
  };

  if (tpl && tpl.content) {
    return renderMessageTemplate(tpl.content, vars);
  }

  return `🔔 *Novo Caso para Avaliação - Implant Precision 3D*\n\n` +
    `Olá, *Dr. Ricardo*!\n` +
    `O cirurgião-dentista *${dentistName}* acaba de submeter um novo caso para planejamento cirúrgico.\n\n` +
    `📋 *Código:* ${caseCode}\n` +
    `👤 *Paciente:* ${patientName}\n` +
    `🛠️ *Guia Solicitada:* ${guideType.replace('_', ' ')}\n` +
    `📁 *Arquivos Anexados:* ${filesCount} arquivo(s) 3D\n\n` +
    `👉 Acesse a plataforma no computador para avaliar os escaneamentos e iniciar o planejamento!`;
};

/**
 * Notificação para o Dentista quando o Dr. Ricardo aceita o caso
 */
export const buildCaseAcceptedDentistMessage = (
  patientName: string,
  dentistName: string,
  caseCode: string,
  config?: WhatsAppConfig
): string => {
  const tpl = getTemplateByTrigger('CASE_ACCEPTED', config);
  const vars: TemplateVariables = {
    paciente: patientName,
    dentista: dentistName,
    codigo: caseCode
  };

  if (tpl && tpl.content) {
    return renderMessageTemplate(tpl.content, vars);
  }

  return `🦷 *Implant Precision 3D - Caso Recebido com Sucesso!*\n\n` +
    `Olá, *Dr(a). ${dentistName}*!\n\n` +
    `Seu caso do paciente *${patientName}* (Código: *${caseCode}*) foi recebido e *aceito pelo Dr. Ricardo Campos*.\n\n` +
    `⚡ O planejamento 3D milimétrico e o desenho da guia cirúrgica já estão em andamento em nosso laboratório.\n\n` +
    `Assim que o modelo tridimensional estiver concluído para sua inspeção e liberação, você receberá um novo aviso por aqui!`;
};

/**
 * Notificação para o Dentista quando o planejamento 3D está concluído (pronto para aprovar)
 */
export const buildPlanningReadyDentistMessage = (
  patientName: string,
  dentistName: string,
  caseCode: string,
  amount: number,
  config?: WhatsAppConfig
): string => {
  const tpl = getTemplateByTrigger('PLANNING_READY', config);
  const vars: TemplateVariables = {
    paciente: patientName,
    dentista: dentistName,
    codigo: caseCode,
    valor: amount.toFixed(2).replace('.', ',')
  };

  if (tpl && tpl.content) {
    return renderMessageTemplate(tpl.content, vars);
  }

  return `✨ *Planejamento 3D Pronto para Inspeção!*\n\n` +
    `Dr(a). *${dentistName}*, o projeto cirúrgico tridimensional do paciente *${patientName}* (*${caseCode}*) está concluído.\n\n` +
    `🔍 Você já pode rotacionar a mandíbula e inspecionar os implantes diretamente pelo seu navegador.\n` +
    `💳 *Valor do Planejamento:* R$ ${amount.toFixed(2).replace('.', ',')}\n\n` +
    `Acesse o seu portal para aprovar e liberar as guias cirúrgicas STL para impressão!`;
};

/**
 * Notificação para o Dentista na confirmação do pagamento
 */
export const buildPaymentConfirmedDentistMessage = (
  patientName: string,
  dentistName: string,
  caseCode: string,
  config?: WhatsAppConfig
): string => {
  const tpl = getTemplateByTrigger('PAYMENT_CONFIRMED', config);
  const vars: TemplateVariables = {
    paciente: patientName,
    dentista: dentistName,
    codigo: caseCode
  };

  if (tpl && tpl.content) {
    return renderMessageTemplate(tpl.content, vars);
  }

  return `✅ *Pagamento Confirmado & Arquivos Liberados!*\n\n` +
    `Dr(a). *${dentistName}*, confirmamos o pagamento do caso *${caseCode}* (*${patientName}*).\n\n` +
    `📥 Os arquivos da Guia Cirúrgica (.STL) e o Relatório Cirúrgico (.PDF) foram desbloqueados e já estão disponíveis para download imediato em seu painel!`;
};

