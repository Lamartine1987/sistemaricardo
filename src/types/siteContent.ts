export interface ClinicalCaseItem {
  id: string;
  title: string;
  badge: string;
  tag: string;
  description: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  imageUrl?: string;
  galleryImages?: string[];
  fullContent?: string;
  pdfUrl?: string;
  pdfName?: string;
  implantBrand?: string;
  surgicalTime?: string;
  featuredOnHome?: boolean;
  active: boolean;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconType: 'cpu' | 'shield' | 'lock' | 'user' | 'layers' | 'sparkles';
  highlights: string[];
  imageUrl?: string;
  active: boolean;
  order: number;
}

export interface CourseItem {
  id: string;
  title: string;
  format: string;
  badge: string;
  description: string;
  topics: string[];
  ctaText: string;
  whatsappMessage: string;
  active: boolean;
  order: number;
}

export interface TestimonialItem {
  id: string;
  dentistName: string;
  role: string;
  cityState: string;
  quote: string;
  rating: number;
  initials: string;
  avatarUrl?: string;
  active: boolean;
  order: number;
}

export interface AboutDoctorContent {
  badge: string;
  name: string;
  specialtyBadge: string;
  bio: string;
  cro: string;
  photoUrl?: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  whatsappNumber: string;
  whatsappMessage: string;
}

export interface SiteContentConfig {
  cases: ClinicalCaseItem[];
  services: ServiceItem[];
  courses: CourseItem[];
  testimonials: TestimonialItem[];
  about: AboutDoctorContent;
  updatedAt?: number;
}

export const DEFAULT_SITE_CONTENT: SiteContentConfig = {
  updatedAt: 1704067200000,
  cases: [
    {
      id: 'case-01',
      title: 'Reabilitação Total Superior com Seio Pneumatizado',
      badge: 'Protocolo All-on-4',
      tag: 'Carga Imediata',
      description: 'Implantes posteriores angulados a 30° com ancoragem no pilar zigomático-maxilar, dispensando enxertos ósseos invasivos e reduzindo o tempo cirúrgico para 25 minutos.',
      fullContent: `O paciente procurou a clínica com edentulismo maxilar severo e pneumatização acentuada dos seios maxilares bilaterais. O planejamento convencional exigiria enxertos ósseos de levantamento de seio maxilar com tempo de espera de 6 a 8 meses antes da reabilitação definitiva.

Através do planejamento cirúrgico 3D guiado pelo Dr. Ricardo Cezar, foi desenvolvido o protocolo All-on-4 modificado:
1. Posicionamento de dois implantes anteriores axiais em região de caninos/incisivos laterais.
2. Dois implantes posteriores angulados a 30 graus contornando a parede anterior do seio maxilar, alcançando estabilidade primária bicortical superior a 45 N.cm.
3. Cirurgia guiada de precisão executada em apenas 25 minutos, viabilizando a instalação de prótese provisória fixa tipo protocolo em carga imediata no mesmo dia.`,
      metric1Label: 'Desvio Angular',
      metric1Value: '< 0.4°',
      metric2Label: 'Torque Final',
      metric2Value: '45 N.cm',
      implantBrand: 'Neodent Grand Morse (GM)',
      surgicalTime: '25 min',
      pdfName: 'Laudo_Cirurgico_Caso_01_AllOn4.pdf',
      featuredOnHome: true,
      imageUrl: '',
      active: true,
      order: 1
    },
    {
      id: 'case-02',
      title: 'Unitário Anterior no Elemento 21 com Preservação Papilar',
      badge: 'Estética Anterior',
      tag: 'Cirurgia Flapless',
      description: 'Posicionamento proteticamente orientado em área estética nobre. Instalação sem retalho mucoperiósteo e com provisionalização imediata com contorno biológico ideal.',
      fullContent: `Caso desafiador em zona de altíssima exigência estética. O elemento 21 apresentava fratura radicular oblíqua subgengival. O objetivo clínico primário era a exodontia minimamente traumática seguida de implante imediato com enxerto conjuntivo e coroa provisória imediata.

Conduta de Planejamento 3D:
1. Sobreposição do escaneamento intraoral colorido com a tomografia Cone Beam de alta resolução.
2. Posicionamento tridimensional do implante direcionado para a parede palatina da cavidade alveolar, garantindo um gap vestibular de 2.0 mm preenchido com biomaterial.
3. Cirurgia sem retalho (Flapless) com guia cirúrgica de assentamento dento-suportado estável.
4. Preservação integral do zênite gengival e das papilas interdentais, proporcionando estética idêntica ao dente natural vizinho.`,
      metric1Label: 'Tolerância',
      metric1Value: '± 0.08 mm',
      metric2Label: 'Preservação Tecidual',
      metric2Value: '100% Intacta',
      implantBrand: 'Straumann Bone Level Tapered (BLT)',
      surgicalTime: '20 min',
      pdfName: 'Planejamento_3D_Estetica_21.pdf',
      featuredOnHome: true,
      imageUrl: '',
      active: true,
      order: 2
    },
    {
      id: 'case-03',
      title: 'Molar Inferior com Nervo Alveolar Próximo',
      badge: 'Mandíbula Crítica',
      tag: 'Margem 1.8mm',
      description: 'Segmentação tomográfica detalhada do trajeto do nervo alveolar inferior. Guia cirúrgica rígida com trava de stop de broca garantindo zero risco de parestesia.',
      fullContent: `Reabilitação do primeiro molar inferior (elemento 36) em paciente com atrofia óssea vertical moderada. A distância da crista óssea alveolar até o teto do canal mandibular era de apenas 10.3 mm.

Abordagem Tecnológica e Segurança Cirúrgica:
1. Segmentação volumétrica tridimensional do canal mandibular e da emergência do forame mentual.
2. Escolha de implante cônico de 8.5 mm de comprimento com margem de segurança biológica calculada de 1.8 mm do feixe vasculonervoso.
3. Confecção de guia cirúrgica de alta rigidez estrutural com buchas metálicas e kit de fresagem guiada com stop mecânico.
4. Perfuração e instalação do implante com torque de 50 N.cm sem qualquer toque ou proximidade crítica com a parede cortical do canal. Pós-operatório sem dor e com 0% de parestesia.`,
      metric1Label: 'Margem de Nervo',
      metric1Value: '1.8 mm Seguro',
      metric2Label: 'Risco Parestesia',
      metric2Value: '0% Controlado',
      implantBrand: 'DSP Biomedical Hexágono Interno',
      surgicalTime: '18 min',
      pdfName: 'Relatorio_Segmentacao_Mandibular_36.pdf',
      featuredOnHome: true,
      imageUrl: '',
      active: true,
      order: 3
    }
  ],

  services: [
    {
      id: 'service-01',
      title: 'Planejamento Virtual 3D Personalizado',
      description: 'Fusão milimétrica dos exames tomográficos DICOM com o escaneamento intraoral (STL/PLY). Posicionamento guiado proteticamente respeitando a tábua óssea e as emergências protéticas ideais para todas as marcas de implantes.',
      iconType: 'cpu',
      highlights: ['Alinhamento DICOM + STL', 'Posição Inclinada 3D', 'Todas as Marcas'],
      active: true,
      order: 1
    },
    {
      id: 'service-02',
      title: 'Modelagem e Confecção de Guias Cirúrgicas',
      description: 'Guias cirúrgicas dente-suportadas, mucosa-suportadas ou osso-suportadas. Arquivos STL exportados em malha fechada de alta resolução compatíveis com qualquer impressora 3D ou envio da guia física já impressa e adaptada.',
      iconType: 'shield',
      highlights: ['Anilhas Metálicas Fixas', 'Resina Biocompatível', 'Alta Resistência'],
      active: true,
      order: 2
    },
    {
      id: 'service-03',
      title: 'Protocolo Pay-to-Unlock & Visualização 3D',
      description: 'Você pode inspecionar e girar o planejamento cirúrgico 3D livremente no seu navegador antes de pagar. Ao aprovar, o pagamento via PIX é identificado automaticamente em segundos e os arquivos finais são liberados na hora.',
      iconType: 'lock',
      highlights: ['Inspeção 3D sem Custo', 'PIX Instantâneo', 'Zero Inadimplência'],
      active: true,
      order: 3
    },
    {
      id: 'service-04',
      title: 'Consultoria & Suporte Cirúrgico Direto',
      description: 'Canal direto com o Dr. Ricardo Campos para discutir casos clínicos desafiadores, escolha da sequência de fresas, estabilidade primária e suporte pré e pós-operatório via WhatsApp dedicado.',
      iconType: 'user',
      highlights: ['Atendimento Humanizado', 'Agilidade no Prazo', 'Suporte Técnico'],
      active: true,
      order: 4
    }
  ],

  courses: [
    {
      id: 'course-01',
      title: 'Imersão em Cirurgia Guiada',
      format: 'Presencial Intensivo',
      badge: 'Vagas Limitadas',
      description: 'Do pedido tomográfico e escaneamento intraoral à execução em boca com kits de fresagem guiada. Hands-on completo em biomodelos e cirurgia demonstrativa ao vivo.',
      topics: [
        'Hands-on prático em manequins 3D',
        'Cirurgia ao vivo comentada passo a passo',
        'Certificado e material didático incluso'
      ],
      ctaText: 'Consultar Próxima Turma',
      whatsappMessage: 'Olá Dr. Ricardo! Gostaria de informações sobre a Imersão em Cirurgia Guiada.',
      active: true,
      order: 1
    },
    {
      id: 'course-02',
      title: 'Planejamento Virtual 3D & DICOM/STL',
      format: 'Online & Ao Vivo',
      badge: 'Turmas Recorrentes',
      description: 'Aprenda a manipular softwares de planejamento cirúrgico odontológico, segmentar estruturas nobres, analisar densidade óssea e desenhar guias cirúrgicas com assertividade.',
      topics: [
        'Metodologia 100% prática em softwares 3D',
        'Estudos de casos reais dos alunos',
        'Acesso a gravações e banco de arquivos'
      ],
      ctaText: 'Saiba Mais sobre o Curso',
      whatsappMessage: 'Olá Dr. Ricardo! Tenho interesse no curso de Planejamento Virtual 3D e DICOM.',
      active: true,
      order: 2
    },
    {
      id: 'course-03',
      title: 'Mentoria Cirúrgica One-on-One',
      format: 'Mentoria VIP',
      badge: 'Individual',
      description: 'O Dr. Ricardo acompanha você passo a passo nos seus primeiros casos guiados no consultório. Revisão detalhada de cada caso clínico, garantindo total segurança para você e seu paciente.',
      topics: [
        'Acompanhamento dos seus próprios casos',
        'Suporte direto via WhatsApp com Dr. Ricardo',
        'Confiança máxima nas primeiras cirurgias'
      ],
      ctaText: 'Aplicar para Mentoria VIP',
      whatsappMessage: 'Olá Dr. Ricardo! Gostaria de saber sobre a Mentoria Cirúrgica One-on-One.',
      active: true,
      order: 3
    }
  ],

  testimonials: [
    {
      id: 'test-01',
      dentistName: 'Dr. Alexandre Vasconcelos',
      role: 'Especialista em Implantodontia',
      cityState: 'Recife/PE',
      quote: 'A previsibilidade das minhas cirurgias mudou completamente. Operar sabendo milimetricamente a inclinação e a profundidade eliminou o estresse da cirurgia e meus pacientes praticamente não têm inchaço nem dor no pós-operatório.',
      rating: 5,
      initials: 'AV',
      active: true,
      order: 1
    },
    {
      id: 'test-02',
      dentistName: 'Dra. Camila Nogueira',
      role: 'Cirurgiã Bucomaxilofacial',
      cityState: 'São Paulo/SP',
      quote: 'A adaptação das guias cirúrgicas planejadas pelo Dr. Ricardo é simplesmente perfeita. O suporte pré-operatório que ele oferece antes de furar traz uma segurança incomparável para casos críticos.',
      rating: 5,
      initials: 'CN',
      active: true,
      order: 2
    },
    {
      id: 'test-03',
      dentistName: 'Dr. Felipe Albuquerque',
      role: 'Reabilitação Oral & Implantes',
      cityState: 'Curitiba/PR',
      quote: 'A plataforma web onde consigo inspecionar o caso em 3D, girar o modelo e liberar no PIX instantâneo é fantástica! Agilizou muito a minha rotina e o atendimento é nota 10.',
      rating: 5,
      initials: 'FA',
      active: true,
      order: 3
    }
  ],

  about: {
    badge: 'RESPONSÁVEL TÉCNICO',
    name: 'Dr. Ricardo Campos',
    specialtyBadge: 'ESPECIALISTA',
    bio: 'Cirurgião-dentista especialista em Implantodontia e pioneiro no fluxo digital e cirurgia guiada 3D. Com anos de dedicação à alta precisão cirúrgica, desenvolveu o Implant Precision 3D para que colegas cirurgiões tenham acesso a planejamentos virtuais de classe mundial, com máxima segurança anatômica e excelentes resultados protéticos.',
    cro: 'CRO-PE 00.000',
    photoUrl: '',
    stat1Value: '1.200+',
    stat1Label: 'Casos Planejados',
    stat2Value: '10+ Anos',
    stat2Label: 'de Experiência',
    stat3Value: 'Zero',
    stat3Label: 'Intercorrências',
    whatsappNumber: '81999694866',
    whatsappMessage: 'Olá Dr. Ricardo! Acessei o site e gostaria de falar com você.'
  }
};
