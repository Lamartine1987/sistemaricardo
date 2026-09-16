export interface AppNotification {
  id: string;
  targetUserType: 'ADMIN' | 'CLIENT';
  targetUserId?: string; // id do dentista específico ou vazio para todos os administradores
  targetUserEmail?: string; // email do dentista para correspondência infalível
  caseId?: string;
  caseCode?: string;
  title: string;
  message: string;
  type: 'NEW_CASE' | 'CASE_ACCEPTED' | 'PLANNING_READY' | 'PAYMENT_CONFIRMED' | 'INFO';
  read: boolean;
  createdAt: string;
}

export type NotificationTrigger = 
  | 'NEW_CASE'            // Disparo: Dentista submete novo caso (para Admin / Dr. Ricardo)
  | 'CASE_ACCEPTED'       // Disparo: Dr. Ricardo aceita e inicia planejamento (para Dentista)
  | 'PLANNING_READY'      // Disparo: Planejamento 3D pronto para inspeção e aprovação (para Dentista)
  | 'PAYMENT_CONFIRMED'   // Disparo: Pagamento PIX aprovado / STL liberado (para Dentista)
  | 'CUSTOM';             // Modelo customizado criado pelo usuário

export interface MessageTemplate {
  id: string;
  trigger: NotificationTrigger;
  title: string;          // Nome legível do modelo
  description: string;    // Descrição explicativa do modelo
  target: 'ADMIN' | 'DENTIST' | 'BOTH'; // Destinatário principal
  content: string;        // Texto com tags {paciente}, {dentista}, etc.
  enabled: boolean;       // Se a notificação automática associada está ativa
  isDefault?: boolean;    // Se é um template padrão de fábrica
}

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-new-case',
    trigger: 'NEW_CASE',
    title: 'Novo Caso Recebido (Para Dr. Ricardo)',
    description: 'Enviado ao WhatsApp do Dr. Ricardo quando um cirurgião-dentista envia um novo caso para planejamento.',
    target: 'ADMIN',
    enabled: true,
    isDefault: true,
    content: `🔔 *Novo Caso para Avaliação - Implant Precision 3D*

Olá, *Dr. Ricardo*!
O cirurgião-dentista *{dentista}* acaba de submeter um novo caso para planejamento cirúrgico.

📋 *Código:* {codigo}
👤 *Paciente:* {paciente}
🛠️ *Guia Solicitada:* {guia}
📁 *Arquivos Anexados:* {arquivos} arquivo(s) 3D

👉 Acesse a plataforma no computador para avaliar os escaneamentos e iniciar o planejamento!`
  },
  {
    id: 'tpl-case-accepted',
    trigger: 'CASE_ACCEPTED',
    title: 'Caso Aceito & Planejamento Iniciado (Para Dentista)',
    description: 'Enviado ao WhatsApp do dentista quando o Dr. Ricardo aceita os escaneamentos e inicia o planejamento.',
    target: 'DENTIST',
    enabled: true,
    isDefault: true,
    content: `🦷 *Implant Precision 3D - Caso Recebido com Sucesso!*

Olá, *Dr(a). {dentista}*!

Seu caso do paciente *{paciente}* (Código: *{codigo}*) foi recebido e *aceito pelo Dr. Ricardo Campos*.

⚡ O planejamento 3D milimétrico e o desenho da guia cirúrgica já estão em andamento em nosso laboratório.

Assim que o modelo tridimensional estiver concluído para sua inspeção e liberação, você receberá um novo aviso por aqui!`
  },
  {
    id: 'tpl-planning-ready',
    trigger: 'PLANNING_READY',
    title: 'Planejamento 3D Pronto para Inspeção (Para Dentista)',
    description: 'Enviado ao dentista quando o projeto 3D estiver concluído e pronto para inspeção e aprovação.',
    target: 'DENTIST',
    enabled: true,
    isDefault: true,
    content: `✨ *Planejamento 3D Pronto para Inspeção!*

Dr(a). *{dentista}*, o projeto cirúrgico tridimensional do paciente *{paciente}* (*{codigo}*) está concluído.

🔍 Você já pode rotacionar a mandíbula e inspecionar os implantes diretamente pelo seu navegador.
💳 *Valor do Planejamento:* R$ {valor}

Acesse o seu portal para aprovar e liberar as guias cirúrgicas STL para impressão!`
  },
  {
    id: 'tpl-payment-confirmed',
    trigger: 'PAYMENT_CONFIRMED',
    title: 'Pagamento Confirmado & Arquivos Liberados (Para Dentista)',
    description: 'Enviado ao dentista confirmando o recebimento do Pix e liberação dos arquivos STL e PDF.',
    target: 'DENTIST',
    enabled: true,
    isDefault: true,
    content: `✅ *Pagamento Confirmado & Arquivos Liberados!*

Dr(a). *{dentista}*, confirmamos o pagamento do caso *{codigo}* (*{paciente}*).

📥 Os arquivos da Guia Cirúrgica (.STL) e o Relatório Cirúrgico (.PDF) foram desbloqueados e já estão disponíveis para download imediato em seu painel!`
  }
];

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  adminPhone: string; // Telefone do Dr. Ricardo para receber notificações
  autoNotifyAdminOnNewCase: boolean;
  autoNotifyDentistOnCaseAccepted: boolean;
  autoNotifyDentistOnPlanningReady: boolean;
  autoNotifyDentistOnPayment: boolean;
  templates: MessageTemplate[];
}

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  apiUrl: 'http://187.127.4.145:3000',
  apiKey: 'minha_chave_super_secreta_123',
  instanceName: 'implantprecision',
  adminPhone: '81999694866',
  autoNotifyAdminOnNewCase: true,
  autoNotifyDentistOnCaseAccepted: true,
  autoNotifyDentistOnPlanningReady: true,
  autoNotifyDentistOnPayment: true,
  templates: DEFAULT_MESSAGE_TEMPLATES
};
