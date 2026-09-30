import debugging from '@/assets/img/debugging_hexapod.webp';
import hexapod from '@/assets/img/hexapod.webp';
import leg from '@/assets/img/leg_hexapod.webp';
import { both, row, type Project } from './types';

export const exabot: Project = {
  slug: 'exabot',
  name: 'Exabot',
  kind: { it: 'Robot esapode', en: 'Hexapod robot' },
  version: 'v1',
  status: { it: 'Prototipo funzionante', en: 'Working prototype' },
  summary: {
    it: 'Un robot esapode stampato in 3D controllato tramite ESP32. Prototipo funzionante focalizzato sulla meccanica e logica di movimento.',
    en: 'A 3D printed hexapod robot controlled via ESP32. Working prototype focused on mechanics and movement logic.',
  },
  tags: ['ESP32', 'PCA9685', '18× MG996R', 'PLA'],
  cover: hexapod,
  coverAlt: { it: 'Robot esapode Exabot', en: 'Exabot hexapod robot' },
  media: [
    {
      type: 'image',
      src: hexapod,
      alt: { it: 'Exabot: foto del robot esapode', en: 'Exabot: photo of the hexapod robot' },
    },
    {
      type: 'image',
      src: debugging,
      alt: { it: 'Exabot: debug del cablaggio', en: 'Exabot: wiring debug' },
    },
    {
      type: 'image',
      src: leg,
      alt: { it: 'Exabot: dettaglio di una zampa', en: 'Exabot: detail of a leg' },
    },
    {
      type: 'video',
      youtubeId: 'HTOONVzCEAM',
      title: { it: 'Exabot: video dimostrativo', en: 'Exabot: demo video' },
    },
  ],
  bom: [
    row({ it: 'Controller', en: 'Controller' }, both('ESP32 DevKit V1')),
    row({ it: 'Driver', en: 'Driver' }, both('PCA9685 (I2C)')),
    row({ it: 'Motori', en: 'Motors' }, both('18x MG996R')),
    row(
      { it: 'Alimentazione', en: 'Power supply' },
      {
        it: 'LiPo 2S (7.4V) + Buck 15A',
        en: 'LiPo 2S (7.4V) + Buck Converter 15A',
      },
    ),
    row(
      { it: 'Struttura', en: 'Structure' },
      { it: 'Stampato in 3D (PLA) da Thingiverse', en: '3D printed (PLA) from Thingiverse' },
    ),
  ],
  // TODO: add `specs` (dimensions, weight, payload) once measured; the page hides the block until then.
  roadmap: [
    {
      it: 'Integrazione **SSC32-V2.5** per il jitter.',
      en: 'Integration of **SSC32-V2.5** (jitter fix).',
    },
    { it: 'Irrobustimento dell’alimentazione.', en: 'Power wiring upgrade.' },
    {
      it: 'Valutazione dell’integrazione di sensori vari.',
      en: 'Assessment of integration of multiple sensors.',
    },
    {
      it: '**V2:** telaio custom in via di sviluppo.',
      en: '**V2:** custom frame under development.',
    },
  ],
};
