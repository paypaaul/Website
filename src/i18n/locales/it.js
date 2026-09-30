/**
 * Italian is the default language: the markup in index.html / thanks.html ships with these exact
 * strings (works without JavaScript and for crawlers). tests/unit/locales.test.js enforces it.
 */
export default {
  // Document
  meta_title: 'Paul | Portfolio Engineering',
  meta_description:
    'Portfolio di Paul, ingegnere appassionato di robotica: braccio robotico 6-DOF, robot esapode, stampa 3D, elettronica ed embedded.',
  thanks_meta_title: 'Messaggio inviato | Paul',

  // Global UI
  skip_link: 'Vai al contenuto',
  close: 'Chiudi',
  lang_toggle: "Cambia lingua: passa all'inglese",
  theme_to_dark: 'Attiva il tema scuro',
  theme_to_light: 'Attiva il tema chiaro',

  // Hero
  hero_title: 'Ciao, sono <span class="highlight">Paul</span>',
  hero_prefix: 'Sono un ingegnere a cui piace',
  hero_phrases_sr: 'costruire cose, risolvere problemi, sperimentare, prototipare, la robotica.',
  typewriter_phrases: [
    'costruire cose.',
    'risolvere problemi.',
    'sperimentare.',
    'prototipare.',
    'la robotica.',
  ],
  btn_cv: 'Scarica CV',
  cv_href: '/docs/cv_it.pdf',
  scroll_down: 'Vai ai progetti',

  // Skills
  tech_stack: 'TECH STACK',
  skill_3d: 'Stampa 3D',

  // Projects
  projects_title: 'I Miei Progetti',
  btn_details: 'Dettagli Tecnici',
  desc_exabot_short:
    'Un robot esapode stampato in 3D controllato tramite ESP32. Prototipo funzionante focalizzato sulla meccanica e logica di movimento.',
  desc_dumbe_short:
    'Braccio robotico antropomorfo a 6 gradi di libertà (6-DOF) interamente progettato in CAD. Design modulare con riduttori cicloidali.',
  alt_hexapod_card: 'Robot esapode Exabot',
  alt_dumbe_card: 'Braccio robotico Dumb-E',

  // Project modals
  version: 'Versione:',
  exabot_version: 'v1 (Prototipo Funzionante)',
  dumbe_version: 'v2 (Work in Progress)',
  specs: 'Specifiche',
  spec_tbd: 'da definire',
  dimensions: 'Dimensioni:',
  weight: 'Peso:',
  payload: 'Carico Max:',
  improvements: 'Miglioramenti',
  wip_status: 'Stato Lavori (WIP)',
  carousel_exabot: 'Galleria di Exabot',
  carousel_dumbe: 'Galleria di Dumb-E',
  carousel_prev: 'Slide precedente',
  carousel_next: 'Slide successiva',
  loading_3d: 'Caricamento 3D...',
  alt_exabot_photo: 'Exabot: foto del robot esapode',
  alt_exabot_debug: 'Exabot: debug del cablaggio',
  alt_exabot_leg: 'Exabot: dettaglio di una zampa',
  alt_dumbe_overview: 'Dumb-E: vista generale del braccio',
  alt_dumbe_cad: 'Dumb-E: modello CAD',
  alt_dumbe_base: 'Dumb-E: base del braccio',
  alt_dumbe_joint1: 'Dumb-E: primo giunto',
  alt_dumbe_joint2: 'Dumb-E: secondo giunto',
  alt_dumbe_joint3: 'Dumb-E: terzo giunto',
  alt_dumbe_end_effector: 'Dumb-E: end effector a tripla pinza',
  alt_dumbe_components: 'Dumb-E: componenti meccanici ed elettronici',
  alt_dumbe_3d: 'Dumb-E: modello 3D interattivo',
  title_video_exabot: 'Exabot: video dimostrativo',
  title_video_dumbe_assembly: 'Dumb-E: video di assemblaggio',
  title_video_dumbe_demo: 'Dumb-E: demo del braccio robotico',
  bom_exabot: `<li><strong>Controller:</strong> ESP32 DevKit V1</li><li><strong>Driver:</strong> PCA9685 (I2C)</li><li><strong>Motori:</strong> 18x MG996R</li><li><strong>Alimentazione:</strong> LiPo 2S (7.4V) + Buck 15A</li><li><strong>Struttura:</strong> Stampato in 3D (PLA) da Thingiverse.</li>`,
  wip_exabot: `<li>Integrazione <strong>SSC32-V2.5</strong> per jitter.</li><li>Irrobustimento alimentazione.</li><li>Valutazione integrazione di sensori vari.</li><li><strong>V2:</strong> Telaio custom in via di sviluppo.</li>`,
  bom_dumbe: `<li><strong>Motori:</strong> Nema 17 (1.7A)</li><li><strong>Riduttori:</strong> Cicloidali 20:1 (da SweepDynamics)</li><li><strong>Driver:</strong> TMC2209</li><li><strong>Controller:</strong> ESP32</li><li><strong>Alimentazione:</strong> 24V 15A + 5V 5A Convertitore Buck</li><li><strong>Sensori:</strong> GY-521/GY-6500 per bilanciamento, Hall Effect per homing</li>`,
  wip_dumbe_list: `<li>Stampa struttura e test.</li><li>Cablaggio Alimentazione e TMC2209.</li><li>Sviluppo firmware.</li>`,
  design_dumbe_1: '<strong>Struttura:</strong> Custom stampata in 3D (PLA).',
  design_dumbe_2: '<strong>Modularità:</strong> Giunti intercambiabili.',
  design_dumbe_3: '<strong>End Effector:</strong> Tripla pinza.',

  // Donation
  donate_title: 'Sostieni i miei progetti',
  alt_keychain: 'Portachiavi in legno inciso a laser',
  donate_text:
    'Costruire robot e prototipi ha dei costi vivi.<br>Se ti piace quello che faccio, una donazione mi aiuta molto!<br><br><strong>🎁 GIFT:</strong> Come segno di gratitudine, per le donazioni superiori a 15€ sarò felice di inviarti in omaggio un portachiavi in legno personalizzato inciso a laser.',
  btn_donate: 'Dona con PayPal',
  donate_info: '(Per info dopo la donazione contattami)',

  // Contact
  contact_title: 'Parliamone!',
  contact_text: 'Scrivimi per collaborazioni, domande o anche solo per un saluto!',
  form_name: 'Il tuo nome',
  form_email: 'La tua email',
  form_msg: 'Il tuo messaggio...',
  form_btn: 'Invia Messaggio',
  footer_text: 'Portfolio di Paolo Vezzini.',

  // Thanks page
  thanks_title: 'Messaggio inviato!',
  thanks_text: 'Grazie per avermi scritto, ti risponderò il prima possibile.',
  thanks_back: 'Torna alla home',
};
