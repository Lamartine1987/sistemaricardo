import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DentalCase } from '../../types';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  QrCode, 
  ShieldAlert, 
  Sparkles, 
  X, 
  Lock, 
  Zap,
  ArrowRight,
  Download
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DentalCase;
  onPaymentSuccess: (caseId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onPaymentSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(caseItem.payment.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#10B981', '#38BDF8', '#F59E0B']
    });
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      triggerConfetti();
      onPaymentSuccess(caseItem.id);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-gradient-to-r from-cyber-surface via-cyber-card to-cyber-surface">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Gatekeeper de Liberação Cirúrgica
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {caseItem.caseCode} • {caseItem.patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Preço & Resumo do Item */}
              <div className="p-4 rounded-xl bg-cyber-surface/70 border border-cyber-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total do Planejamento Clínico</span>
                  <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline space-x-1">
                    <span className="text-sm text-cyber-cyan font-normal">R$</span>
                    <span>{caseItem.payment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/30">
                    Aguardando PIX
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {caseItem.implantSites.length} implante(s) planejado(s)
                  </span>
                </div>
              </div>

              {/* QR Code PIX */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 relative group">
                <div className="p-3 bg-white rounded-xl shadow-xl">
                  <img
                    src={caseItem.payment.pixQrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PIX-DEMO"}
                    alt="QR Code PIX"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Aguardando leitura do QR Code no App do Banco...</span>
                </div>
              </div>

              {/* Botão Copia e Cola PIX */}
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1.5 block">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={caseItem.payment.pixCode}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-cyber-surface border border-cyber-border rounded-lg text-slate-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-xs font-medium text-white hover:border-cyber-cyan hover:text-cyber-cyan transition-colors flex items-center space-x-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyber-emerald" />
                        <span className="text-cyber-emerald">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Aviso de Gatekeeping */}
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-xs text-slate-300">
                <ShieldAlert className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                <span>
                  Assim que o pagamento for liquidado, a guia cirúrgica em STL e o relatório clínico serão liberados instantaneamente para download e produção.
                </span>
              </div>

              {/* Botão de Simulação Instantânea de Pagamento para Teste do Piloto */}
              <div className="pt-2 border-t border-cyber-border">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-sm transition-all shadow-glow-cyan flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Validando Liquidação PIX...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Simular Pagamento Instantâneo (Demonstração)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  (No ambiente de produção, este webhook é disparado automaticamente pela API do Asaas / Banco)
                </p>
              </div>
            </div>
          ) : (
            /* Tela de Sucesso */
            <div className="text-center py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyber-emerald/20 border border-cyber-emerald/40 flex items-center justify-center text-cyber-emerald shadow-glow-emerald">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  Pagamento Confirmado com Sucesso!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  O projeto do paciente <strong className="text-white">{caseItem.patientName}</strong> foi aprovado e todos os arquivos técnicos foram desbloqueados.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyber-surface border border-cyber-border text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Recibo:</span>
                  <span className="font-mono text-cyber-cyan">#REC-{caseItem.caseCode}-2026</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status do Pedido:</span>
                  <span className="text-cyber-emerald font-semibold">Arquivos STL Liberados</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Pago:</span>
                  <span className="font-mono text-white font-bold">R$ {caseItem.payment.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyber-surface border border-cyber-border text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Fechar Janela
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyber-emerald hover:bg-emerald-400 text-black text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-glow-emerald"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivos Finais</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
