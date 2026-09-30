import './styles/main.css';

import { DEFAULT_LANG, STORAGE_KEYS } from './config.js';
import { initLanguageToggle } from './features/language-toggle.js';
import { initModals } from './features/modals.js';
import { initReveal } from './features/reveal.js';
import { initTheme } from './features/theme.js';
import { initTypewriter } from './features/typewriter.js';
import { initYear } from './features/year.js';
import { createI18n } from './i18n/index.js';
import locales from './i18n/locales/index.js';

const i18n = createI18n({
  locales,
  defaultLang: DEFAULT_LANG,
  storageKey: STORAGE_KEYS.lang,
});

i18n.init();
initTheme({ i18n });
initLanguageToggle({ i18n });
initTypewriter({ i18n });
initModals();
initReveal();
initYear();
