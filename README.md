# 🦷 Implant Precision 3D — Plataforma Hi-Tech de Planejamento Cirúrgico & Paywall Odontológico

Plataforma web de altíssima fidelidade visual (Cyber-Medical / Linear-Style) desenvolvida para o **Dr. Ricardo** avaliar escaneamentos orais 3D, planejar implantes e guias cirúrgicas, e disponibilizar a aprovação para dentistas parceiros com **sistema de desbloqueio financeiro imediato via PIX (Pay-to-Unlock)**.

---

## ⚡ Principais Funcionalidades

1. **Visualizador 3D WebGL em Tempo Real (Three.js & React Three Fiber):**
   - Renderização anatômica da arcada dentária, dentes e leito alveolar.
   - Implantes de titânio estilizados com roscas cirúrgicas e plataforma protética hexagonal.
   - Guia cirúrgica translúcida em resina biocompatível com anilhas de perfuração metálicas.
   - Controles de órbita 360°, zoom, rotação, atalhos de câmera (Frontal, Oclusal, Lateral) e controle de transparência do osso (**efeito Raio-X**).

2. **Gatekeeper Financeiro (Pay-to-Unlock):**
   - O dentista parceiro pode inspecionar o modelo 3D livremente para validar a técnica cirúrgica.
   - O download dos arquivos finais (`.STL` prontos para impressão 3D e relatório cirúrgico em PDF) permanece **travado**.
   - Modal com **PIX Dinâmico com QR Code e Copia-e-Cola**.
   - Simulação instantânea de webhook bancário para validação imediata do fluxo durante testes.
   - Ao confirmar o pagamento, os arquivos são destravados instantaneamente na tela com comemoração visual de confetes.

3. **Odontograma Interativo FDI:**
   - Seleção visual de dentes (11 a 48) para indicação precisa dos sítios de perfuração dos implantes.

4. **Alternador de Perfis (Dr. Ricardo vs Dentista Parceiro):**
   - **Visão Administrador (Dr. Ricardo):** Gerenciamento de todos os casos, faturamento total, métricas de inadimplência zero e diretório de dentistas com link direto para WhatsApp.
   - **Visão Dentista Parceiro (Dr. Marcelo):** Experiência do cliente final aprovando seus casos e realizando o pagamento do projeto.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (caso ainda não tenha feito)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🔥 Como Conectar com o Firebase

A arquitetura do projeto já está 100% modularizada e pronta para o Firebase (`src/services/firebase/config.ts`).

Assim que você criar o projeto no Firebase Console, basta criar ou editar o arquivo `.env` na raiz do projeto com as credenciais:

```env
VITE_FIREBASE_API_KEY=seu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

O sistema detecta as variáveis automaticamente e passa do modo piloto local para o Firebase em tempo real (Auth, Firestore e Storage).
