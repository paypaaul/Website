import baseImage from '@/assets/img/base.webp';
import cad from '@/assets/img/CAD.webp';
import components from '@/assets/img/components.webp';
import endEffector from '@/assets/img/end_eff.webp';
import overview from '@/assets/img/dumbe.webp';
import joint1 from '@/assets/img/joint1.webp';
import joint2 from '@/assets/img/joint2.webp';
import joint3 from '@/assets/img/joint3.webp';
import { both, row, type Project } from './types';

export const dumbe: Project = {
  slug: 'dumb-e',
  name: 'Dumb-E',
  kind: { it: 'Manipolatore 6-DOF', en: '6-DOF Manipulator' },
  version: 'v2',
  status: { it: 'Work in progress', en: 'Work in progress' },
  summary: {
    it: 'Braccio robotico antropomorfo a 6 gradi di libertà (6-DOF) interamente progettato in CAD. Design modulare con riduttori cicloidali.',
    en: 'Anthropomorphic 6-DOF robotic arm fully designed in CAD. Modular design with cycloidal drives.',
  },
  tags: ['6-DOF', 'ESP32', 'TMC2209', 'Nema 17'],
  cover: overview,
  coverAlt: { it: 'Braccio robotico Dumb-E', en: 'Dumb-E robotic arm' },
  media: [
    {
      type: 'image',
      src: overview,
      alt: { it: 'Dumb-E: vista generale del braccio', en: 'Dumb-E: overview of the arm' },
    },
    { type: 'image', src: cad, alt: { it: 'Dumb-E: modello CAD', en: 'Dumb-E: CAD model' } },
    {
      type: 'image',
      src: baseImage,
      alt: { it: 'Dumb-E: base del braccio', en: 'Dumb-E: arm base' },
    },
    {
      type: 'image',
      src: joint1,
      alt: { it: 'Dumb-E: primo giunto', en: 'Dumb-E: first joint' },
    },
    {
      type: 'image',
      src: joint2,
      alt: { it: 'Dumb-E: secondo giunto', en: 'Dumb-E: second joint' },
    },
    {
      type: 'image',
      src: joint3,
      alt: { it: 'Dumb-E: terzo giunto', en: 'Dumb-E: third joint' },
    },
    {
      type: 'image',
      src: endEffector,
      alt: {
        it: 'Dumb-E: end effector a tripla pinza',
        en: 'Dumb-E: triple gripper end effector',
      },
    },
    {
      type: 'image',
      src: components,
      alt: {
        it: 'Dumb-E: componenti meccanici ed elettronici',
        en: 'Dumb-E: mechanical and electronic components',
      },
    },
    {
      type: 'model',
      file: 'dumbe.glb',
      alt: { it: 'Dumb-E: modello 3D interattivo', en: 'Dumb-E: interactive 3D model' },
    },
    {
      type: 'video',
      youtubeId: 'MQ-Nnzp1ekA',
      title: { it: 'Dumb-E: video di assemblaggio', en: 'Dumb-E: assembly video' },
    },
    {
      type: 'video',
      youtubeId: 'e-37Qjs5Gcw',
      title: { it: 'Dumb-E: demo del braccio robotico', en: 'Dumb-E: robotic arm demo' },
    },
  ],
  bom: [
    row({ it: 'Motori', en: 'Motors' }, both('Nema 17 (1.7A)')),
    row(
      { it: 'Riduttori', en: 'Gears' },
      { it: 'Cicloidali 20:1 (da SweepDynamics)', en: 'Cycloidal 20:1 (from SweepDynamics)' },
    ),
    row({ it: 'Driver', en: 'Drivers' }, both('TMC2209')),
    row({ it: 'Controller', en: 'Controller' }, both('ESP32')),
    row(
      { it: 'Alimentazione', en: 'Power supply' },
      {
        it: '24V 15A + 5V 5A Convertitore Buck',
        en: '24V 15A + 5V 5A Buck Converter',
      },
    ),
    row(
      { it: 'Sensori', en: 'Sensors' },
      {
        it: 'GY-521/GY-6500 per bilanciamento, Hall Effect per homing',
        en: 'GY-521/GY-6500 for balancing, Hall Effect for homing',
      },
    ),
  ],
  design: [
    row(
      { it: 'Struttura', en: 'Structure' },
      { it: 'Custom stampata in 3D (PLA)', en: 'Custom 3D printed (PLA)' },
    ),
    row(
      { it: 'Modularità', en: 'Modularity' },
      { it: 'Giunti intercambiabili', en: 'Interchangeable joints' },
    ),
    row({ it: 'End effector', en: 'End effector' }, { it: 'Tripla pinza', en: 'Triple gripper' }),
  ],
  roadmap: [
    { it: 'Stampa struttura e test.', en: 'Structure printing & testing.' },
    { it: 'Cablaggio alimentazione e TMC2209.', en: 'TMC2209 and power wiring.' },
    { it: 'Sviluppo firmware.', en: 'Firmware development.' },
  ],
};
