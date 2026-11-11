# Anima Forge

A character sheet builder for **Anima: Beyond Fantasy**, built with TypeScript and Tailwind CSS. It runs entirely in the browser (no server, no PHP) and can be hosted for free on GitHub Pages.

Anima Forge is a rewrite of the original [Anima Unico](https://github.com/wwhere/animaunico) generator. It keeps the game data from that project, adds a new interface with a light/dark theme, and can import characters saved by the old app.

> Unofficial fan project. It is not affiliated with or endorsed by Anima Project Studio or Edge Entertainment. See [Credits and legal](#credits-and-legal).

## Features

- **Attributes**: the 8 characteristics with bonus table, plus resistances (Physical, Disease, Poison, Magic, Psychic) and regeneration.
- **Race**: 18 races (including the Nephilim variants) with their racial traits. Attribute, resistance and regeneration bonuses are applied to the sheet automatically.
- **Combat**: Attack, Block, Dodge and Wear Armor with the class cost per point and the class combat limit, plus Life multiples.
- **Ki**: Ki points and accumulation for the six Ki attributes.
- **Magic**: Zeon, ACT, Zeon Regeneration, Magic Level, Magic Projection, Summon, Dominate, Bind and Banish.
- **Paths**: the 11 magic paths with their spells, opposite-path cost, and free access spell slots.
- **Psychic**: Psychic Projection and the class psychic limit.
- **Advantages**: 173 advantages and disadvantages with Creation Point (CP) accounting. Many of them (attribute, resistance, regeneration and secondary-ability effects) are applied to the sheet and tagged **on sheet**.
- **Equipment**: money tracker, 138 weapons, armors you can wear (with combined protection), general items, and a **Magic items** tab where you create your own items (name, type, quality 0 / +5 / +10 / +15 and a description of their abilities).
- **Secondary**: the 47 secondary abilities with natural bonus.
- **Elan**: synchronization with each of the 14 gods and the gifts you can acquire.
- **Light and dark theme**, responsive layout (works on phones), and an always-visible header with Free DP, CP, Life, Initiative, Ki, Zeon and Total DP.
- **Saving**: the sheet is saved automatically in the browser (`localStorage`). You can also export it to a JSON file and import it again.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev      # development server with hot reload
npm run build    # type-check and build to dist/
npm run preview  # serve the production build locally
```

## Deploying to GitHub Pages

The repository includes a workflow at `.github/workflows/deploy.yml`.

1. Push the project to a GitHub repository (branch `main`).
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds the project and publishes it. Follow the progress in the **Actions** tab.

The Vite `base` is set to `./`, so the site works under any repository name.

## Importing characters from the old app

Use the **Import** button and choose a `.animaUnico` file saved by the old generator. Anima Forge detects the format and converts it.

Imported: name, level, class, race, attributes, combat/Ki/Zeon/Magic/secondary points, advantages and disadvantages you chose (with their options), natural bonus, Elan and its gifts, magic paths, weapons, armors, items and money.

Not imported (a warning lists whatever is present in the file): Ki techniques, martial arts, psychic disciplines, Ars Magnus, loose spells, metamagic spheres, and the free access spells chosen in each path.

The old format stores Development Points spent, not points bought, so the importer converts them using the current class costs. After importing, check that Free DP looks right.

## Project structure

```
index.html            page shell and theme initialization
src/main.ts           the whole app: state, rules and rendering (one section per tab)
src/style.css         Tailwind import and the light theme colors
src/classes.json      22 classes: costs, life, limits, innate bonuses
src/vantagens.json    advantages and disadvantages
src/racas.json        races and racial traits
src/magia.json        paths, spells and free access spells
src/elan.json         gods and Elan gifts
src/equip.json        weapons, armors and general equipment
src/habilidades.json  secondary abilities
src/legacy.json       id maps used to import old-app characters
```

The app has no framework: `render()` builds the HTML from the state, and one delegated click/change handler updates the state. To add or change a tab, edit `TABS`, add a branch in `painel()`, and handle any new action in the click handler.

The file names in `src/` (`vantagens`, `racas`, `magia`, `equip`, `habilidades`) come from the original Spanish project.

The light theme works by overriding the Tailwind color variables in `src/style.css`, so no markup changes are needed to restyle it.

## Known limitations

- Rules and formulas were read from the old app's code, not re-checked against the book. Please verify them against your rulebook, especially: total DP (600 at level 1, +100 per level), Life and Initiative, the natural bonus pools (one physical, one mental, plus one extra with Increased Natural Bonus per level), combined armor protection (all worn pieces are summed), and the currency ratio (1 gold = 10 silver = 100 copper).
- Magic paths assume all spells up to the path level are known, with a maximum path level of 80.
- Not implemented yet: loose spells, subpaths, metamagic, psychic disciplines, Ki techniques, martial arts and creature archetypes.
- Some racial traits have no description in the source data (for example parts of Devah and Devah Nephilim).
- Magic items are notes only: their quality bonus does not change any sheet number.
- Game data is in English, translated from the original Spanish where no English existed.

## Credits and legal

- Original generator: [Anima Unico](https://github.com/wwhere/animaunico), MIT License, copyright (c) 2013 Guillermo Heras Prieto and (c) 2014 wwhere. This project reuses its game data and rules logic. See [LICENSE](LICENSE).
- *Anima: Beyond Fantasy* is copyright Anima Project Studio. The text describing game elements (advantages, races, gifts and so on) is copyright Edge Entertainment. This is an unofficial fan tool, and these rights remain with their owners.
