/**
 * Italian (default language). `en.ts` must satisfy the exact same shape: TypeScript fails the
 * build if a key is missing, so the two languages can never drift apart.
 */
export const it = {
  meta: {
    title: 'Paul | Ingegnere · Robotica & Embedded',
    description:
      'Portfolio di Paul, ingegnere appassionato di robotica: braccio robotico 6-DOF, robot esapode, stampa 3D, elettronica ed embedded.',
    locale: 'it_IT',
    thanksTitle: 'Messaggio inviato | Paul',
  },
  a11y: {
    skipToContent: 'Vai al contenuto',
    loading3d: 'Caricamento 3D…',
  },
  nav: {
    label: 'Navigazione principale',
    home: 'Vai alla home',
    projects: 'Progetti',
    skills: 'Competenze',
    support: 'Supporta',
    contact: 'Contatti',
    openMenu: 'Apri il menu',
    switchLang: 'Read this page in English',
    langCode: 'EN',
    themeToDark: 'Attiva il tema scuro',
    themeToLight: 'Attiva il tema chiaro',
  },
  hero: {
    badge: 'Aperto a collaborazioni',
    greeting: 'Ciao, sono',
    name: 'Paul',
    prefix: 'Sono un ingegnere a cui piace',
    phrases: [
      'costruire cose.',
      'risolvere problemi.',
      'sperimentare.',
      'prototipare.',
      'la robotica.',
    ],
    description:
      'Progetto e costruisco robot: meccanica, elettronica e firmware, dal CAD al codice.',
    ctaProjects: 'Vedi i progetti',
    ctaCv: 'Scarica CV',
    specs: ['6-DOF', 'ESP32', '18× MG996R', 'Cicloidali 20:1'],
    showcaseLabel: 'Progetto in evidenza',
    showcaseCta: 'Scopri Dumb-E',
    showcaseAlt: 'Il braccio robotico Dumb-E in un laboratorio',
  },
  marquee: {
    label: 'Tecnologie con cui lavoro',
    skills: {
      python: 'Python',
      embedded: 'C / Embedded',
      cad: 'CAD Design',
      printing: 'Stampa 3D',
      electronics: 'Elettronica',
      github: 'GitHub',
    },
  },
  projects: {
    eyebrow: 'Progetti',
    title: 'Cose che ho costruito',
    description: 'Prototipi di robotica su cui lavoro: meccanica, elettronica e firmware.',
    cta: 'Dettagli tecnici',
  },
  skills: {
    eyebrow: 'Competenze',
    title: 'Dalla meccanica al firmware',
    description: 'Tre aree che si incontrano in ogni progetto.',
    mechanics: {
      title: 'Meccanica',
      text: 'Progettazione CAD, stampa 3D in PLA e riduttori cicloidali 20:1 per giunti modulari.',
      tags: ['CAD', 'Stampa 3D', 'PLA', 'Cicloidali'],
    },
    electronics: {
      title: 'Elettronica',
      text: 'ESP32, driver PCA9685 e TMC2209, motori Nema 17 e MG996R, alimentazione LiPo e convertitori buck.',
      tags: ['ESP32', 'TMC2209', 'PCA9685', 'LiPo'],
    },
    firmware: {
      title: 'Firmware',
      text: 'C / embedded su ESP32 per il controllo dei movimenti, con sensori IMU e Hall per bilanciamento e homing.',
      tags: ['C', 'Embedded', 'IMU', 'Hall'],
    },
  },
  support: {
    eyebrow: 'Supporto',
    title: 'Sostieni i miei progetti',
    paragraphs: [
      'Costruire robot e prototipi ha dei costi vivi.',
      'Se ti piace quello che faccio, una donazione mi aiuta molto!',
    ],
    giftLabel: 'Regalo',
    gift: 'Come segno di gratitudine, per le donazioni superiori a 15€ sarò felice di inviarti in omaggio un portachiavi in legno personalizzato inciso a laser.',
    cta: 'Dona con PayPal',
    info: 'Per info dopo la donazione, contattami.',
    imageAlt: 'Portachiavi in legno inciso a laser',
  },
  contact: {
    eyebrow: 'Contatti',
    title: 'Parliamone!',
    text: 'Scrivimi per collaborazioni, domande o anche solo per un saluto!',
    channels: 'Oppure trovami qui',
    form: {
      name: 'Nome',
      namePlaceholder: 'Il tuo nome',
      email: 'Email',
      emailPlaceholder: 'nome@esempio.it',
      message: 'Messaggio',
      messagePlaceholder: 'Come posso aiutarti?',
      submit: 'Invia messaggio',
      honeypot: 'Non compilare questo campo se sei una persona:',
    },
  },
  footer: {
    text: 'Portfolio di Paolo Vezzini.',
    backToTop: 'Torna su',
  },
  project: {
    back: 'Tutti i progetti',
    version: 'Versione',
    status: 'Stato',
    gallery: 'Galleria di',
    prev: 'Slide precedente',
    next: 'Slide successiva',
    goTo: 'Vai alla slide',
    video: 'Video',
    model3d: 'Modello 3D',
    bom: 'Distinta materiali',
    specs: 'Specifiche',
    design: 'Design',
    roadmap: 'Prossimi passi',
    nextProject: 'Prossimo progetto',
    contactCta: 'Hai domande su questo progetto?',
    contactButton: 'Scrivimi',
  },
  thanks: {
    title: 'Messaggio inviato!',
    text: 'Grazie per avermi scritto, ti risponderò il prima possibile.',
    back: 'Torna alla home',
  },
};

export type Dictionary = typeof it;
