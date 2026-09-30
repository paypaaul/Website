# Website

Portfolio personale di Paolo Vezzini: sito statico bilingue (IT/EN), tema chiaro/scuro, una pagina
per ogni progetto con galleria, video e modello 3D. Deploy su Netlify.

## Stack

| Area          | Scelta                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------- |
| Framework     | [Astro](https://astro.build): HTML statico, zero JavaScript di framework, routing i18n   |
| Stile         | [Tailwind CSS v4](https://tailwindcss.com) + design token in CSS (`src/styles`)          |
| Linguaggio    | TypeScript (strict) per dati, i18n e script; componenti `.astro`                         |
| Font, icone   | Geist (self-hosted); sprite SVG con Lucide e Simple Icons                                |
| 3D            | [`<model-viewer>`](https://modelviewer.dev), caricato solo quando serve                  |
| Test          | Vitest + jsdom (unit), Playwright + axe-core (e2e, accessibilità, CSP)                   |
| Qualità       | `astro check`, ESLint, Prettier (+ plugin Astro/Tailwind), html-validate, GitHub Actions |
| Hosting/Forms | Netlify (header di sicurezza, redirect, Netlify Forms)                                   |

Le scelte architetturali sono motivate in [`docs/adr/`](docs/adr/).

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
- Per pubblicare si apre una PR `dev` → `main`: la CI (typecheck, lint, test unitari, build, e2e) e il
  **deploy preview** di Netlify permettono di controllare il risultato prima del merge.
- Il merge in `main` si fa con un _merge commit_ (non squash), così `dev` e `main` non divergono.
- La CI gira a ogni push su `main` e `dev` e su ogni PR.

## Avvio rapido

Richiede Node.js >= 22.12 (vedi `.nvmrc`).

```bash
npm ci            # installa le dipendenze
npm run dev       # server di sviluppo con hot reload
npm run build     # build di produzione in dist/
npm run preview   # serve dist/ come Netlify: URL con slash, header/CSP di produzione, 404
```

## Script

| Comando                   | Cosa fa                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- |
| `npm run check`           | Tutto ciò che gira in CI: typecheck + lint + format + unit test + build + HTML    |
| `npm run typecheck`       | `astro check`: tipi di TypeScript e dei componenti `.astro`                       |
| `npm run lint`            | ESLint (TypeScript + Astro); `lint:html` valida l'HTML generato in `dist/`        |
| `npm run format`          | Formatta con Prettier (`format:check` per solo verificare)                        |
| `npm test`                | Test unitari (`test:watch` in modalità watch)                                     |
| `npm run test:e2e`        | Test end-to-end su Chromium (desktop + mobile) contro il build di produzione      |
| `npm run icons`           | Rigenera `src/assets/icons.svg` (sprite) e `icon-names.ts` da Lucide/Simple Icons |
| `npm run og`              | Rigenera l'immagine social `public/og.jpg`                                        |
| `npm run vendor:draco`    | Ricopia il decoder Draco in `public/vendor/draco/`                                |
| `npm run optimize:images` | Converte PNG/JPG in WebP: `node scripts/optimize-images.mjs in out`               |

## Struttura del progetto

```
.
├── astro.config.mjs, netlify.toml, tsconfig.json
├── public/                     File copiati così come sono in dist/
│   ├── _headers                Header di sicurezza (CSP, ...) e cache - fonte unica
│   ├── docs/                   CV (cv_it.pdf, cv_en.pdf)
│   ├── theme-init.js           Applica il tema prima del primo paint (no flash)
│   ├── og.jpg, favicon.svg, robots.txt
│   └── vendor/draco/           Decoder Draco self-hosted per il modello 3D
├── src/
│   ├── pages/                  Rotte: index, en/index, progetti/[slug], en/projects/[slug], 404, ...
│   ├── layouts/BaseLayout      <head> (SEO, hreflang, Open Graph, JSON-LD), navbar, footer
│   ├── components/
│   │   ├── ui/                 Mattoni: Button, Icon, SectionHeading
│   │   ├── layout/             Navbar, Footer
│   │   ├── sections/           Hero, TechMarquee, Projects, Skills, Support, Contact
│   │   ├── project/            Gallery, SpecCard (pagina progetto)
│   │   └── pages/              HomePage, ProjectPage, ThanksPage (condivise tra IT e EN)
│   ├── data/                   Contenuti tipizzati: progetti (uno per file) e dati del sito
│   ├── i18n/                   Dizionari it/en tipizzati, URL localizzati, parser del **grassetto**
│   ├── scripts/                TypeScript lato browser (un modulo per comportamento)
│   ├── styles/                 tokens.css, effects.css, gallery.css, global.css (Tailwind)
│   └── assets/                 Immagini WebP, modello .glb, sprite icone (con hash in build)
├── tests/
│   ├── unit/                   Vitest: i18n, routing, dati, galleria, tema, ...
│   └── e2e/                    Playwright: flussi reali, CSP, SEO, accessibilità
├── scripts/                    Tool di manutenzione e `serve.mjs` (server di produzione locale)
└── .github/                    CI, Dependabot, template PR, CODEOWNERS
```

### Lingue e URL

L'italiano è la lingua di default e vive alla radice; l'inglese sotto `/en/`. Entrambe le lingue sono
**pagine statiche complete** (HTML, SEO e `hreflang` corretti, funzionano senza JavaScript). Il
pulsante lingua è un normale link alla stessa pagina nell'altra lingua.

| Pagina   | Italiano            | Inglese                |
| -------- | ------------------- | ---------------------- |
| Home     | `/`                 | `/en/`                 |
| Progetto | `/progetti/dumb-e/` | `/en/projects/dumb-e/` |
| Grazie   | `/grazie/`          | `/en/thanks/`          |

### Script lato browser (`src/scripts/`)

| File              | Responsabilità                                                                       |
| ----------------- | ------------------------------------------------------------------------------------ |
| `theme.ts`        | Tema chiaro/scuro: toggle, persistenza, preferenza di sistema, transizione a cerchio |
| `nav.ts`          | Evidenzia la sezione corrente; chiude il menu mobile                                 |
| `word-rotate.ts`  | Frasi rotanti dell'hero (statica con `prefers-reduced-motion`)                       |
| `reveal.ts`       | Animazioni allo scroll (`data-reveal`)                                               |
| `spotlight.ts`    | Luce che segue il puntatore sulle card (`data-spotlight`)                            |
| `gallery.ts`      | Galleria accessibile: tastiera, swipe, thumbnail, stop dei video                     |
| `lazy-modules.ts` | Caricamento on-demand di dipendenze pesanti (`data-lazy-module`)                     |
| `model-viewer.ts` | Registra `<model-viewer>` e risolve il `.glb` (caricato alla prima visualizzazione)  |

## Design system

- **Token** (`src/styles/tokens.css`): colori semantici per tema chiaro e scuro (`background`,
  `foreground`, `card`, `muted-foreground`, `border`, `accent`, `primary`, ...). I componenti usano solo
  questi nomi (es. `bg-card`, `text-muted-foreground`), mai colori grezzi. Le coppie testo/sfondo sono
  verificate per contrasto AA dai test e2e (axe).
- **Effetti** (`src/styles/effects.css`): linee animate dello sfondo dell'hero
  (`components/ui/BackgroundPaths.astro`, SVG + CSS), griglia con glow (404 e pagina di ringraziamento),
  testo con gradiente, card con spotlight, bordo luminoso (`border-beam`), marquee, reveal con blur,
  pulsante con riflesso. Ispirati al vocabolario dei componenti shadcn/21st.dev ma in CSS puro, senza
  framework JavaScript.
- **Movimento**: tutto rispetta `prefers-reduced-motion` (contenuto sempre visibile, niente animazioni).

## Come si fa...

**Cambiare un testo.** Tutti i testi sono in `src/i18n/it.ts` e `src/i18n/en.ts`. L'inglese deve avere
esattamente la stessa struttura dell'italiano: TypeScript (e `npm run typecheck`) fallisce se manca
una chiave. Le stringhe non contengono HTML; per il grassetto si usa `**testo**` dove supportato.

**Aggiungere un progetto.** Copia `src/data/projects/exabot.ts` in un nuovo file, compila i campi
(testi in italiano e inglese, immagini, media, distinta materiali) e aggiungilo a
`src/data/projects/index.ts`. Card in home, pagina IT/EN, sitemap e link "prossimo progetto" si
generano da soli. I test verificano che ogni testo esista in entrambe le lingue.

**Aggiungere una slide a una galleria.** Aggiungi un elemento a `media` del progetto: `image`,
`video` (solo l'ID YouTube: si carica quando la slide è visibile e si ferma quando si esce) oppure
`model` (un `.glb` in `src/assets/models/`). Contatore e thumbnail sono automatici.

**Aggiungere un'immagine.** Converti con `npm run optimize:images`, mettila in `src/assets/img/` e
usa il componente `<Image>` di Astro: genera da solo le varianti responsive, con `width`/`height`.

**Aggiungere un'icona.** Aggiungila a `scripts/build-icons.mjs`, esegui `npm run icons` e usa
`<Icon name="..." />` (i nomi sono tipizzati).

**Aggiungere il link LinkedIn.** In `src/data/site.ts` c'è il commento con i passi esatti.

**Inserire dimensioni/peso/carico di Exabot.** In `src/data/projects/exabot.ts` aggiungi `specs`: il
blocco compare da solo nella pagina (finché non è definito, non viene mostrato).

## Sicurezza

Gli header (CSP restrittiva, `nosniff`, `Referrer-Policy`, ...) sono in `public/_headers`. `npm run
preview` e i test e2e li applicano, quindi girano con la CSP di produzione. Nessuno stile né script è
inline (`build.inlineStylesheets: 'never'`, `assetsInlineLimit: 0`).

- I terzi ammessi sono solo `cdn.counter.dev` (analytics) e `youtube-nocookie.com` (video).
- `model-viewer` inietta uno `<style>` inline: la CSP lo autorizza con il suo hash SHA-256
  (`style-src`). **Dopo un aggiornamento di `@google/model-viewer`** l'hash può cambiare: il test e2e
  "loads and renders the 3D model" fallisce e il messaggio del browser riporta il nuovo hash da
  mettere in `public/_headers`.
- Se aggiorni `@google/model-viewer`, esegui anche `npm run vendor:draco`.

## Form di contatto

Usa Netlify Forms (`data-netlify`) con honeypot (`bot-field`) e pagina di conferma localizzata
(`/grazie/`, `/en/thanks/`). Netlify rileva il form durante il deploy.

## Note

- Analytics: [counter.dev](https://counter.dev) viene caricato solo nel build di produzione.
- Le icone sono [Lucide](https://lucide.dev) (ISC) e [Simple Icons](https://simpleicons.org) (CC0);
  il font è [Geist](https://vercel.com/font) (SIL OFL 1.1).
- L'URL del sito (canonical, sitemap, Open Graph) viene dalla variabile `URL` di Netlify, quindi segue
  il dominio principale configurato; in locale usa il valore di default in `astro.config.mjs`.
