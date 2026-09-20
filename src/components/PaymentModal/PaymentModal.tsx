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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight font-sans">
                Gatekeeper de Liberação Cirúrgica
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {caseItem.caseCode} • {caseItem.patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Preço & Resumo do Item */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block font-sans">Total do Planejamento Clínico</span>
                  <div className="text-2xl font-bold font-sans text-slate-900 tracking-tight flex items-baseline space-x-1">
                    <span className="text-sm text-cyan-700 font-normal">R$</span>
                    <span>{caseItem.payment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 font-sans">
                    Aguardando PIX
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1 font-sans">
                    {caseItem.implantSites.length} implante(s) planejado(s)
                  </span>
                </div>
              </div>

              {/* QR Code PIX */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                  <img
                    src={caseItem.payment.pixQrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PIX-DEMO"}
                    alt="QR Code PIX"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500 font-sans">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Aguardando leitura do QR Code no App do Banco...</span>
                </div>
              </div>

              {/* Botão Copia e Cola PIX */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block font-sans">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={caseItem.payment.pixCode}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors flex items-center space-x-1.5 shadow-2xs font-sans"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Aviso de Gatekeeping */}
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-xs text-cyan-900 font-sans">
                <ShieldAlert className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span>
                  Assim que o pagamento for liquidado, a guia cirúrgica em STL e o relatório clínico serão liberados instantaneamente para download e produção.
                </span>
              </div>

              {/* Botão de Simulação Instantânea de Pagamento para Teste do Piloto */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 active:scale-[0.99] font-sans"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validando Liquidação PIX...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Simular Pagamento Instantâneo (Demonstração)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2 font-sans">
                  (No ambiente de produção, este webhook é disparado automaticamente pela API do Asaas / Banco)
                </p>
              </div>
            </div>
          ) : (
            /* Tela de Sucesso */
            <div className="text-center py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 font-sans">
                  Pagamento Confirmado com Sucesso!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto font-sans">
                  O projeto do paciente <strong className="text-slate-900">{caseItem.patientName}</strong> foi aprovado e todos os arquivos técnicos foram desbloqueados.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 font-sans">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Recibo:</span>
                  <span className="font-mono text-cyan-700 font-medium">#REC-{caseItem.caseCode}-2026</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status do Pedido:</span>
                  <span className="text-emerald-700 font-semibold">Arquivos STL Liberados</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Pago:</span>
                  <span className="font-sans text-slate-900 font-bold">R$ {caseItem.payment.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold transition-colors font-sans"
                >
                  Fechar Janela
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-sm font-sans"
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
