# Carte Vote

**[carte-vote.fr](https://carte-vote.fr)** — Visualisation interactive des résultats des élections municipales françaises sous forme de carte choroplèthe.

## À propos

Carte Vote affiche les résultats du 1er tour des élections municipales 2026 commune par commune. Chaque commune est colorée selon la famille politique du candidat élu ou en tête :

- **Bleu** — Droite
- **Rouge** — Gauche
- **Orange** — Centre
- **Teal** — Divers / Régional
- **Gris** — Sans étiquette
- **Blanc** — En attente du 2nd tour (pas de vainqueur au 1er tour)

Les règles électorales du tour 1 sont appliquées : une liste est élue si elle obtient plus de 50 % des suffrages exprimés **et** au moins 25 % des inscrits.

## Fonctionnalités

- **Carte choroplèthe interactive** — navigation restreinte aux frontières de la France métropolitaine
- **Panel détail commune** — cliquer sur une commune affiche les listes en compétition avec les têtes de liste, les scores du 1er tour, et les sections 2nd tour le cas échéant ; appuyer sur Échap pour fermer
- **Barre de recherche** — recherche insensible aux accents, espaces et symboles (ex. "saint emilion" trouve "Saint-Émilion") ; raccourci **⌘K / Ctrl+K** pour y accéder au clavier
- **Légende avec pourcentages** — visualisation de la répartition des familles politiques sur l'ensemble des communes

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

Le site est exporté en statique (`next build`) et déployé via GitHub Pages.
