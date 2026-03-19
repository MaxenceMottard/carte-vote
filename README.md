# Carte Vote

**[carte-vote.fr](https://carte-vote.fr)** — Visualisation interactive des résultats des élections municipales françaises sous forme de carte choroplèthe.

## À propos

Carte Vote affiche les résultats du 1er tour des élections municipales 2026 commune par commune. Chaque commune est colorée selon la famille politique du candidat élu ou en tête :

- **Bleu** — Droite
- **Rouge** — Gauche
- **Orange** — Centre
- **Gris** — Divers / en attente du 2nd tour

Les règles électorales du tour 1 sont appliquées : une liste est élue si elle obtient plus de 50 % des suffrages exprimés **et** au moins 25 % des inscrits.

## Stack technique

- [Next.js](https://nextjs.org) — Framework React (export statique)
- [Leaflet](https://leafletjs.com) / [React-Leaflet](https://react-leaflet.js.org) — Carte interactive
- [Tailwind CSS](https://tailwindcss.com) — Styles
- [Cloudflare R2](https://developers.cloudflare.com/r2/) — Hébergement des données

## Sources des données

Les données électorales proviennent de [data.gouv.fr](https://www.data.gouv.fr), la plateforme nationale des données ouvertes, exploitées via le serveur MCP officiel [datagouv/datagouv-mcp](https://github.com/datagouv/datagouv-mcp).

Les fichiers JSON et GeoJSON sont hébergés sur Cloudflare R2 sous `data.carte-vote.fr` :

| Fichier | URL |
|---|---|
| Candidats élus T1 | `https://data.carte-vote.fr/municipales-2026/candidats-elus-t1.json` |
| Résultats communes T1 | `https://data.carte-vote.fr/municipales-2026/resultats-communes-t1.json` |
| GeoJSON communes (simplifié) | `https://data.carte-vote.fr/geojson/communes-simplifiees.geojson` |

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement

Le site est exporté en statique (`next build`) et déployé via Cloudflare Pages.
