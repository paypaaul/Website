/** English translation. Must define exactly the same keys as it.js (enforced by the unit tests). */
export default {
  // Document
  meta_title: 'Paul | Engineering Portfolio',
  meta_description:
    'Portfolio of Paul, an engineer passionate about robotics: 6-DOF robotic arm, hexapod robot, 3D printing, electronics and embedded systems.',
  thanks_meta_title: 'Message sent | Paul',

  // Global UI
  skip_link: 'Skip to content',
  close: 'Close',
  lang_toggle: 'Change language: switch to Italian',
  theme_to_dark: 'Switch to dark theme',
  theme_to_light: 'Switch to light theme',

  // Hero
  hero_title: 'Hi, I am <span class="highlight">Paul</span>',
  hero_prefix: 'I am an engineer who loves',
  hero_phrases_sr: 'building things, solving problems, experimenting, prototyping, robotics.',
  typewriter_phrases: [
    'building things.',
    'solving problems.',
    'experimenting.',
    'prototyping.',
    'robotics.',
  ],
  btn_cv: 'Download CV',
  cv_href: '/docs/cv_en.pdf',
  scroll_down: 'Go to projects',

  // Skills
  tech_stack: 'TECH STACK',
  skill_3d: '3D Printing',

  // Projects
  projects_title: 'My Projects',
  btn_details: 'Tech Details',
  desc_exabot_short:
    'A 3D printed hexapod robot controlled via ESP32. Working prototype focused on mechanics and movement logic.',
  desc_dumbe_short:
    'Anthropomorphic 6-DOF robotic arm fully designed in CAD. Modular design with cycloidal drives.',
  alt_hexapod_card: 'Exabot hexapod robot',
  alt_dumbe_card: 'Dumb-E robotic arm',

  // Project modals
  version: 'Version:',
  exabot_version: 'v1 (Working Prototype)',
  dumbe_version: 'v2 (Work in Progress)',
  specs: 'Specifications',
  spec_tbd: 'to be defined',
  dimensions: 'Dimensions:',
  weight: 'Weight:',
  payload: 'Payload:',
  improvements: 'Improvements',
  wip_status: 'WIP Status',
  carousel_exabot: 'Exabot gallery',
  carousel_dumbe: 'Dumb-E gallery',
  carousel_prev: 'Previous slide',
  carousel_next: 'Next slide',
  loading_3d: 'Loading 3D...',
  alt_exabot_photo: 'Exabot: photo of the hexapod robot',
  alt_exabot_debug: 'Exabot: wiring debug',
  alt_exabot_leg: 'Exabot: detail of a leg',
  alt_dumbe_overview: 'Dumb-E: overview of the arm',
  alt_dumbe_cad: 'Dumb-E: CAD model',
  alt_dumbe_base: 'Dumb-E: arm base',
  alt_dumbe_joint1: 'Dumb-E: first joint',
  alt_dumbe_joint2: 'Dumb-E: second joint',
  alt_dumbe_joint3: 'Dumb-E: third joint',
  alt_dumbe_end_effector: 'Dumb-E: triple gripper end effector',
  alt_dumbe_components: 'Dumb-E: mechanical and electronic components',
  alt_dumbe_3d: 'Dumb-E: interactive 3D model',
  title_video_exabot: 'Exabot: demo video',
  title_video_dumbe_assembly: 'Dumb-E: assembly video',
  title_video_dumbe_demo: 'Dumb-E: robotic arm demo',
  bom_exabot: `<li><strong>Controller:</strong> ESP32 DevKit V1</li><li><strong>Driver:</strong> PCA9685 (I2C)</li><li><strong>Motors:</strong> 18x MG996R</li><li><strong>Power Supply:</strong> LiPo 2S (7.4V) + Buck Converter 15A</li><li><strong>Structure:</strong> 3D printed (PLA) from Thingiverse.</li>`,
  wip_exabot: `<li>Integration of <strong>SSC32-V2.5</strong> (jitter fix).</li><li>Power wiring upgrade.</li><li>Assessment of integration of multiple sensors.</li><li><strong>V2:</strong> Custom Frame under development.</li>`,
  bom_dumbe: `<li><strong>Motors:</strong> Nema 17 (1.7A)</li><li><strong>Gears:</strong> Cycloidal 20:1 (from SweepDynamics)</li><li><strong>Drivers:</strong> TMC2209</li><li><strong>Controller:</strong> ESP32</li><li><strong>Power Supply:</strong> 24V 15A + 5V 5A Buck Converter</li><li><strong>Sensors:</strong> GY-521/GY-6500 for balancing, Hall Effect for homing</li>`,
  wip_dumbe_list: `<li>Structure printing & testing.</li><li>TMC2209 and Power Wiring.</li><li>Firmware development.</li>`,
  design_dumbe_1: '<strong>Structure:</strong> Custom 3D printed (PLA).',
  design_dumbe_2: '<strong>Modularity:</strong> Interchangeable joints.',
  design_dumbe_3: '<strong>End Effector:</strong> Triple Gripper.',

  // Donation
  donate_title: 'Support my projects',
  alt_keychain: 'Laser-engraved wooden keychain',
  donate_text:
    'Building robots involves costs.<br>If you like what I do, a donation helps a lot!<br><br><strong>🎁 GIFT:</strong> As a token of appreciation for donations over <strong>€15</strong>, I will be happy to send you a complimentary laser-engraved wooden keychain.',
  btn_donate: 'Donate with PayPal',
  donate_info: '(Contact me after donation for info)',

  // Contact
  contact_title: "Let's Talk!",
  contact_text: 'Write me for collaborations, questions or just to say hi!',
  form_name: 'Your Name',
  form_email: 'Your Email',
  form_msg: 'Your Message...',
  form_btn: 'Send Message',
  footer_text: "Paolo Vezzini's Portfolio.",

  // Thanks page
  thanks_title: 'Message sent!',
  thanks_text: 'Thanks for getting in touch, I will reply as soon as possible.',
  thanks_back: 'Back to home',
};
