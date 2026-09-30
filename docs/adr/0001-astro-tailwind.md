# ADR 0001: Astro + Tailwind + TypeScript per il redesign

- **Stato:** accettata
- **Data:** 2026-09-30

## Contesto

Il sito era una pagina Vite in JavaScript "vanilla" con CSS e testi tradotti scritti a mano e
duplicati tra HTML e file di traduzione (con un test per evitare che divergessero). Il redesign
richiede un'interfaccia più moderna, minimale e professionale, ispirata ai componenti di
[21st.dev](https://21st.dev) (hero con griglia e glow, card con spotlight, bento, marquee, navbar a
pillola), e una struttura che regga l'aggiunta di nuovi progetti.

Vincoli che non vogliamo perdere: HTML utile senza JavaScript, buone prestazioni (pochi KB al primo
caricamento), CSP restrittiva senza inline, accessibilità AA verificata dai test, deploy su Netlify.

## Decisione

Usiamo **Astro** (output statico) con **Tailwind CSS v4** e **TypeScript**, senza framework
JavaScript lato client. Le parti interattive sono piccoli moduli TypeScript (`src/scripts`).

- **Contenuti e i18n a tipi.** Testi e progetti sono oggetti TypeScript: l'inglese deve avere la
  stessa forma dell'italiano (errore di compilazione altrimenti). Non c'è più duplicazione HTML/JS.
- **Due lingue come pagine statiche** (`/` e `/en/`), non traduzione lato client: SEO, `hreflang`,
  nessun flash di lingua sbagliata, funziona senza JavaScript.
- **Una pagina per progetto** (case study) generata dai dati, al posto dei modali: URL condivisibili,
  DOM leggero nella home, niente gestione di focus-trap a mano.
- **Immagini** con `astro:assets` (varianti responsive WebP generate in build).
- **Effetti in CSS puro** (griglia, glow, spotlight, border beam, marquee, reveal): nessuna libreria di
  animazione, quasi nessun JavaScript, `prefers-reduced-motion` rispettato ovunque.

## Alternative considerate

- **Restare su Vite + JavaScript vanilla.** Zero migrazione, ma il templating manuale (due gallerie
  copiate, testi duplicati) non scala con nuovi progetti e il contenuto tradotto non è visibile
  senza JavaScript per la lingua non predefinita.
- **Astro + React + shadcn/ui.** Permetterebbe di incollare direttamente i componenti di 21st.dev, che
  sono React + Tailwind. Costo: circa 50 KB di JavaScript in più e più complessità per un sito quasi
  interamente statico. La scelta è reversibile: `npx astro add react` più la configurazione shadcn
  abilitano i componenti React come "isole" (`client:visible`) senza toccare il resto.
- **Next.js / Nuxt.** Pensati per applicazioni con server o rendering ibrido; qui aggiungerebbero
  runtime e configurazione senza benefici.

## Conseguenze

- Il sito resta interamente statico: nessun server, header e redirect in `public/_headers` e
  `netlify.toml`.
- Astro 7 richiede Node >= 22.12 (aggiornato in `package.json`, `.nvmrc` e Netlify).
- L'anteprima locale usa `scripts/serve.mjs` (server statico che imita Netlify e applica gli stessi
  header) invece di `astro preview`, che in ambienti non interattivi si avvia in background e non è
  adatto a essere controllato da Playwright.
- Il test e2e sul modello 3D fallisce se un aggiornamento di `model-viewer` cambia l'hash dello stile
  inline autorizzato dalla CSP: è voluto, il messaggio riporta il nuovo hash.
