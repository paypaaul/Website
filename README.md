# Website

Portfolio personale di Paolo Vezzini: sito statico bilingue (IT/EN), tema chiaro/scuro, con schede
progetto interattive (gallerie, video, modello 3D). Deploy su Netlify.

## Stack

| Area          | Scelta                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Build         | [Vite](https://vite.dev) (multi-page: `index.html`, `thanks.html`)          |
| Linguaggi     | HTML semantico, CSS (cascade layers + BEM), JavaScript ES modules (vanilla) |
| 3D            | [`<model-viewer>`](https://modelviewer.dev), caricato solo quando serve     |
| Test          | Vitest + jsdom (unit), Playwright + axe-core (e2e, accessibilità)           |
| Qualità       | ESLint, Stylelint, html-validate, Prettier, GitHub Actions                  |
| Hosting/Forms | Netlify (header di sicurezza, redirect, Netlify Forms)                      |

## Flusso di lavoro (branch)

| Branch | Ruolo                                                                               |
| ------ | ----------------------------------------------------------------------------------- |
| `main` | **Produzione.** Ogni push pubblica il sito su Netlify. Si aggiorna solo tramite PR. |
| `dev`  | **Sviluppo.** Branch di integrazione: qui si lavora e si accumulano le modifiche.   |

```
feature/xyz ──PR──▶ dev ──PR (release)──▶ main ──▶ Netlify (produzione)
```

- Per modifiche piccole si può lavorare direttamente su `dev`; per quelle più grandi si crea un
  branch `feature/...` da `dev` e si apre una PR verso `dev`.
- Per pubblicare si apre una PR `dev` → `main`: la CI (lint, test unitari, build, e2e) e il
  **deploy preview** di Netlify permettono di controllare il risultato prima del merge.
- Il merge in `main` si fa con un _merge commit_ (non squash), così `dev` e `main` non divergono.
- La CI gira a ogni push su `main` e `dev` e su ogni PR.

## Avvio rapido

Richiede Node.js >= 20 (vedi `.nvmrc`).

```bash
npm ci            # installa le dipendenze
npm run dev       # server di sviluppo con hot reload
npm run build     # build di produzione in dist/
npm run preview   # serve dist/ (con gli stessi header/CSP di produzione)
```

> Il sito usa moduli ES: aprire `index.html` con doppio click (`file://`) non funziona, usare
> `npm run dev`.

## Script

| Comando                   | Cosa fa                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `npm run check`           | Tutto ciò che gira in CI: lint + format + unit test + build         |
| `npm run lint`            | ESLint, Stylelint e html-validate                                   |
| `npm run format`          | Formatta con Prettier (`format:check` per solo verificare)          |
| `npm test`                | Test unitari (`test:watch` in modalità watch)                       |
| `npm run test:e2e`        | Test end-to-end su Chromium (desktop + mobile) contro il build      |
| `npm run icons`           | Rigenera `public/icons.svg` (sprite icone) da Font Awesome Free     |
| `npm run vendor:draco`    | Ricopia il decoder Draco in `public/vendor/draco/`                  |
| `npm run optimize:images` | Converte PNG/JPG in WebP: `node scripts/optimize-images.mjs in out` |

## Struttura del progetto

```
.
├── index.html, thanks.html     Pagine (sorgente del markup)
├── public/                     File copiati così come sono in dist/
│   ├── _headers                Header di sicurezza (CSP, ...) e cache - fonte unica
│   ├── docs/                   CV (cv_it.pdf, cv_en.pdf)
│   ├── icons.svg               Sprite SVG generato da scripts/build-icons.mjs
│   ├── theme-init.js           Applica il tema prima del primo paint (no flash)
│   └── vendor/draco/           Decoder Draco self-hosted per il modello 3D
├── src/
│   ├── main.js                 Entry point: inizializza le feature
│   ├── config.js               Costanti condivise (chiavi storage, lingua di default, ...)
│   ├── assets/{img,models}/    Immagini WebP e modello .glb (con hash in build)
│   ├── i18n/                   Motore di traduzione + locales/{it,en}.js
│   ├── features/               Una cartella-file per comportamento (vedi sotto)
│   ├── lib/                    Utility senza dipendenze dal dominio (storage sicuro)
│   └── styles/                 tokens, base, utilities + components/*.css (BEM)
├── tests/
│   ├── unit/                   Vitest: logica, i18n, integrità dei locale
│   └── e2e/                    Playwright: flussi reali, CSP, accessibilità
├── scripts/                    Tool di manutenzione (icone, immagini, Draco)
├── netlify.toml                Build, publish dir, redirect
└── .github/                    CI, Dependabot, template PR, CODEOWNERS
```

### Feature (`src/features/`)

| File                 | Responsabilità                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `theme.js`           | Tema chiaro/scuro: toggle, persistenza, preferenza di sistema                            |
| `language-toggle.js` | Pulsante lingua                                                                          |
| `typewriter.js`      | Animazione di scrittura dell'hero (disattivata con `prefers-reduced-motion`)             |
| `modals.js`          | Schede progetto su `<dialog>` nativo (focus trap, Esc, backdrop)                         |
| `carousel.js`        | Galleria accessibile: tastiera, swipe, stop dei video, contatore automatico              |
| `lazy-modules.js`    | Caricamento on-demand di dipendenze pesanti (`data-lazy-module`)                         |
| `model-viewer.js`    | Registra `<model-viewer>` e risolve il `.glb` (caricato solo alla prima visualizzazione) |
| `reveal.js`          | Animazioni allo scroll (`data-reveal`)                                                   |

## Come si fa...

**Aggiungere o cambiare un testo.** Ogni testo traducibile ha un attributo `data-i18n="chiave"` (o
`data-i18n-attr="attributo:chiave"`). Aggiungi la chiave in **entrambi** `src/i18n/locales/it.js` e
`en.js`, e scrivi lo stesso testo italiano nell'HTML (serve senza JavaScript e ai crawler).
`npm test` fallisce se le lingue hanno chiavi diverse, se una chiave non è usata, o se l'HTML
diverge da `it.js`.

**Aggiungere una slide a una galleria.** Copia un `<div class="carousel__slide" data-carousel-slide hidden>`
in `index.html`. Il contatore "n / totale" si aggiorna da solo. Per un video usa `data-src` (non
`src`) sull'iframe: viene caricato solo quando la slide è visibile e fermato quando si esce.

**Aggiungere un'immagine.** Converti con `npm run optimize:images`, mettila in `src/assets/img/` e
riferiscila con `./src/assets/img/nome.webp`, con `width`/`height` e `loading="lazy"`.

**Aggiungere un'icona.** Aggiungila all'elenco in `scripts/build-icons.mjs`, esegui `npm run icons`,
usa `<svg class="icon"><use href="/icons.svg#nome"></use></svg>`.

**Aggiungere il link LinkedIn.** In `index.html`, sezione `.social-links`, c'è un commento con il
punto esatto; l'icona si chiama `linkedin`.

## Sicurezza

Gli header (CSP restrittiva, `nosniff`, `Referrer-Policy`, ...) sono in `public/_headers`. Lo stesso
file è letto da `vite preview`, quindi i test e2e girano con la CSP di produzione.

- I terzi ammessi sono solo `cdn.counter.dev` (analytics) e `youtube-nocookie.com` (video).
- `model-viewer` inietta uno `<style>` inline: la CSP lo autorizza con il suo hash SHA-256
  (`style-src`). **Dopo un aggiornamento di `@google/model-viewer`** l'hash può cambiare: il test e2e
  "loads and renders the 3D model" fallisce e il messaggio del browser riporta il nuovo hash da
  mettere in `public/_headers`.
- Se aggiorni `@google/model-viewer`, esegui anche `npm run vendor:draco`.

## Form di contatto

Usa Netlify Forms (`data-netlify`) con honeypot (`bot-field`) e pagina di conferma `thanks.html`.
Netlify rileva il form durante il deploy.

## Note

- Analytics: lo script di [counter.dev](https://counter.dev) è caricato anche in sviluppo locale.
- Le icone sono [Font Awesome Free](https://fontawesome.com/license/free) (CC BY 4.0).
