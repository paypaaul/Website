/** Wires the language button: toggles the language and shows the active language code. */
export function initLanguageToggle({ i18n, doc = document }) {
  const button = doc.querySelector('[data-language-toggle]');
  const label = doc.querySelector('[data-language-label]');
  if (!button) return;

  const renderLabel = () => {
    if (label) label.textContent = i18n.lang.toUpperCase();
  };

  renderLabel();
  button.addEventListener('click', () => {
    i18n.toggle();
    renderLabel();
  });
}
