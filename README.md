# ⛵ Rotta — Gestionale barche a vela (statico, GitHub Pages ready)

Sito **solo HTML + CSS + JS**, nessun build. Dati demo in `localStorage`.

## Pubblicare su GitHub Pages
1. Crea repo su GitHub, carica questi file (`index.html` in root).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main` / `/ (root)` → Save.
3. Apri `https://TUO-USERNAME.github.io/TUO-REPO/`.
4. Oppure push su `main`: il workflow `.github/workflows/pages.yml` pubblica in automatico.

## Login demo
- `admin@rotta.it` / `admin123` (Admin)
- `broker@rotta.it` / `broker123` (Broker)
- `collab@rotta.it` / `collab123` (Collaboratore, sola lettura)

## Funzioni
Landing + catalogo con filtri + dettaglio + dashboard con grafici canvas + CRUD barche/clienti + Kanban lead drag&drop + trattative → vendita automatica (barca=Venduta) + calendario + vendite CSV + documenti + report + ricerca globale + notifiche + ruoli.
