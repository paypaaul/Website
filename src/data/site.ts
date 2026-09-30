/** Facts about the site owner, shared by every page (footer, contact, structured data). */
export const site = {
  name: 'Paul',
  fullName: 'Paolo Vezzini',
  email: 'paolo.vezzini1@gmail.com',
  github: { handle: 'paypaaul', url: 'https://github.com/paypaaul' },
  instagram: { handle: 'pay.paaul', url: 'https://instagram.com/pay.paaul' },
  paypal: 'https://paypal.me/paypaaulpay',
  // LinkedIn: add `linkedin: { handle: '...', url: 'https://www.linkedin.com/in/<profile>' }`, then
  // list it in components/sections/Contact.astro (icon: add "linkedin" to scripts/build-icons.mjs).
} as const;
