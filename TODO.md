# Brief : Modernisation Progressive - ContestOrganizer

## Contexte

Projet **ContestOrganizer** : application de gestion de tournois sportifs existante construite avec **Stencil.js** + **TypeScript** (strict: false) + **Tailwind CSS** + **Shoelace UI**.

L'objectif est une **modernisation par étape** sans migration franche : appliquer les nouvelles technologies et styles de codage sur les nouvelles features et le code modifié, tout en conservant le legacy fonctionnel.

---

## Philosophie de Migration

### Principe fondamental : "Touch it, modernize it"
- Code existant non modifié → reste en l'état (Stencil acceptable)
- Nouveau code → applique les nouvelles règles
- Code modifié → évalue la migration vers vanilla si refactoring majeur

### Paradigme cible : Vanilla-First 2026
- **NO frameworks** (React, Vue, Angular, et même Stencil pour le nouveau code)
- **NO heavy dependencies** pour des features gérées nativement
- **NO Virtual DOM** — DOM réel et DocumentFragments
- **NO global CSS** — styles scoped dans Web Components ou CSS Modules
- **Native APIs prioritaires** : Custom Elements, Shadow DOM, Signals, Popover API, View Transitions, Container Queries

---

## Choix Techniques Déjà Validés

Ces choix sont **non négociables** et doivent être intégrés à l'architecture :

| Domaine | Choix | Version/Notes |
|---------|-------|---------------|
| **Build tool** | Vite | Latest (remplace Stencil) |
| **Langage** | TypeScript | Strict mode activé |
| **Lint/Format** | Biome | Via Ultracite |
| **Testing** | Vitest | Remplace Jest/Stencil test |
| **Styling** | CSS Nesting natif | Container Queries, CSS Variables |
| **Package manager** | pnpm | Déjà en place |
| **State management** | Signals (natif/polyfill) | Fine-grained reactivity |
| **Components** | Custom Elements natifs | Web Components vanilla |

### Outils EXCLUS (ne pas proposer) :
- ❌ Tailwind CSS (même v4)
- ❌ Sass/Less/PostCSS sauf si absolument nécessaire
- ❌ Lodash, classnames, et autres utilitaires remplaçables par du natif
- ❌ Framer-motion ou animations JS (préférer CSS + View Transitions API)

---

## Objectifs de la Modernisation

### Objectif 1 : Fondations Techniques
Mettre en place l'infrastructure permettant le développement vanilla moderne :
- Configuration Vite pour build + dev server
- TypeScript strict avec les bonnes libs (ES2022+, DOM modernes)
- Support CSS Nesting natif + Container Queries
- Tests unitaires avec Vitest (compat ESM natifs)

### Objectif 2 : Architecture Vanilla
Créer une architecture permettant de développer des composants vanilla côté à côté avec le legacy Stencil :
- Système de composants Custom Elements natifs
- Gestion d'état réactive (Signals)
- Communication inter-composants (events, attributes)
- Coexistence avec les composants Stencil existants

### Objectif 3 : Migration Progressive
Permettre une transition douce sans casser l'existant :
- Nouveaux composants → dossier dédié vanilla
- Modifications majeures → évaluation migration
- Router existant → compatibilité avec Custom Elements
- State global → migration progressive si pertinent

### Objectif 4 : Qualité & DX
Maintenir une expérience développeur fluide :
- Hot Module Replacement (Vite)
- Lint/Format automatique (Biome/Ultracite)
- Tests rapides et fiables (Vitest)
- Documentation claire des conventions

---

## Contraintes & Contexte Spécifique

### Code existant à considérer
- **Router custom** (`src/modules/router/router.ts`) — doit rester compatible
- **Services de données** (tournois, matchs, API externe) — à préserver
- **Shoelace UI** — dépendance externe lourde, remplacement progressif à prévoir
- **IndexedDB** — déjà utilisé pour la persistence

### Support navigateur cible
- CSS Nesting natif : ~92% (suffisant)
- Container Queries : ~95% (suffisant)
- View Transitions API : progressive enhancement acceptable
- Popover API : polyfill ou progressive enhancement acceptable

### Environnement de développement
- Node >= 18.x
- pnpm >= 8.x
- Git hooks (Husky) déjà configurés

---

## Livrables Attendus

L'agent architecte doit fournir :

1. **Structure de dossiers** proposée pour le projet modernisé
2. **Architecture des composants vanilla** (BaseElement, système de Signals, etc.)
3. **Stratégie de coexistence** Stencil/Vanilla (communication, routing, state)
4. **Plan de migration par phase** (fondations → composants → features)
5. **Configuration technique** (Vite, tsconfig, Vitest)
6. **Conventions de code** à documenter
7. **Risques identifiés** et mitigation proposée

---

## Notes Importantes

- **Ne pas imposer de solution** : l'agent doit proposer LA meilleure approche, pas suivre un chemin pré-défini
- **Pragmatisme** : la perfection est l'ennemi de la livraison, privilégier l'itération
- **Documentation** : chaque décision architecturale doit être justifiée
- **Interopérabilité** : le legacy doit continuer de fonctionner pendant toute la migration

---

## Ressources de Référence

- [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) — Standards de codage cibles
- [AGENTS.md](./AGENTS.md) — Standards actuels (à remplacer)
- `package.json` — Dépendances actuelles
- `stencil.config.ts` — Configuration build actuelle
- `src/` — Code source existant à analyser
