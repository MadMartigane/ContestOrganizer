# TODO - État de la Session de Développement

## 1. Contexte du Projet

**Projet** : ContestOrganizer - Outil pour organiser et profiter des concours sportifs
**Technologie** : Migration Stencil → Vanilla Web Components
**Stack** : TypeScript, Shoelace, BaseElement pattern, Signals

Le projet migre progressivement les composants Stencil vers des Web Components Vanilla utilisant `BaseElement` et le pattern Signal.

---

## 🐛 Bugs

### BUG-001 : Alignement des scores dans les matchs FOOT

**Gravité** : Mineur  
**Contexte** : Dans les matchs de type FOOT, les scores des deux équipes sont affichés l'un sous l'autre, tous deux alignés à gauche.  
**Comportement actuel** : Les deux scores apparaissent groupés sur la gauche, non alignés sous leur équipe respective.  
**Comportement attendu** : Chaque score doit être aligné sous l'équipe dont il est le score (score de l'équipe à domicile aligné à droite sous l'équipe domicile, score visiteur aligné à gauche sous l'équipe visiteur).  
**Fichiers concernés** : `src/components/match-tile/match-tile.ts`

---

## ✨ Features

### FEAT-001 : Type de tournoi par défaut NBA

**Priorité** : Élevée  
**Contexte** : Lors de la création d'un nouveau tournoi, le type de sport est actuellement FOOT.  
**Comportement actuel** : Le sélecteur de type de tournoi propose FOOT comme valeur par défaut.  
**Comportement attendu** : Le type par défaut doit être NBA.  
**Fichiers concernés** : `src/components/page-tournament-select/page-tournament-select.tsx`

---

## 🔧 Améliorations

### IMPROV-001 : Équilibrage en temps réel de la génération aléatoire NBA

**Priorité** : Moyenne  
**Contexte** : La génération automatique de matchs pour les tournois NBA crée des combinaisons aléatoires, mais l'algorithme actuel produit souvent des séries déséquilibrées.  
**Problème identifié** : L'algorithme sélectionne l'équipe avec le plus de matchs restants puis cherche un adversaire, créant parfois des longues séries avec la même équipe pendant que d'autres équipes n'ont aucun match. L'équilibre n'est vérifié qu'après coup, pas à chaque itération.  
**Amélioration attendue** : À chaque génération de match, l'algorithme doit tendre vers l'équilibre global. Avant de créer un match, vérifier que la sélection ne crée pas de déséquilibre temporaire (ex : même équipe jouée 3 fois de suite alors que d'autres n'ont pas joué). L'équilibre doit être vérifié et appliqué à chaque itération, pas uniquement lors du résultat final.  
**Fichiers concernés** : `src/modules/nba/nba.scheduler.ts`

---

## 🚀 Migration Stencil → Vanilla

### Documentation du Format TODO.md

Ce fichier est parsé par le script `scripts/generate-status.ts` pour générer les données affichées dans le composant `<app-status-news>`.

**Format attendu :**
- **Sections** : Définies par `## [emoji] Titre` (🐛 Bugs, ✨ Features, 🔧 Améliorations, 🚀 Migration)
- **Items** : Définis par `### [ID] : Titre` (ex: `BUG-001`, `MIG-001`)
- **Métadonnées** : Champs en gras `**Champ** : Valeur`
- **Fichiers** : Chemins entre backticks `` `path/to/file` ``

**Exécution du script :**
```bash
pnpm exec tsx scripts/generate-status.ts [patch|minor|major] [--skip-version]
```

Le script génère :
- `src/generated/status-data.json` - Données JSON pour le composant
- `src/generated/status-data.d.ts` - Types TypeScript
- Met à jour `package.json` version (sauf avec `--skip-version`)

---

### Statut de la Migration

**Composants Migrés ✅** (9/20) :
- `action-bar`, `app-status-news`, `error-message`, `mad-match-tile`, `mad-scorer-common`, `mad-select-team`, `page-404`, `page-config`, `page-home`, `page-match`

**Composants à Migrer ⏳** (11/20) :

| Priorité | Composant | Tag | Complexité | Dépendances | Status |
|----------|-----------|-----|------------|-------------|--------|
| 1 | page-config | `page-config` | Low | Aucune | ✅ |
| 2 | page-tournament-select | `page-tournament-select` | Low | Aucune | ✅ |
| 3 | input-number | `mad-input-number` | Low | Aucune | ✅ |
| 4 | team-tile | `mad-team-tile` | Low | Aucune | ✅ |
| 5 | scorer-basket | `mad-scorer-basket` | Low | Aucune | ✅ |
| 6 | scorer-rugby | `mad-scorer-rugby` | Low | Aucune | ✅ |
| 7 | grid-default | `grid-default` | Medium | mad-select-team ✅ | ✅ |
| 8 | grid-basket | `grid-basket` | Medium | mad-select-team ✅, action-bar ✅ | ✅ |
| 9 | page-tournament | `page-tournament` | High | grid-basket ✅, grid-default ✅, input-number ✅, error-message ✅ | ✅ |
| 10 | mad-route | `mad-route` | Medium | Aucune (router) | ✅ |
| 11 | app-root | `app-root` | High | mad-route ✅, toutes les pages ✅ | ✅ |

---

### MIG-001 : Migration de page-config

**Priorité** : Élevée  
**Ordre** : 1  
**Composant** : `page-config`  
**Tag** : `page-config`  
**Fichier source** : `src/components/page-config/page-config.tsx`  
**Fichier cible** : `src/components/page-config/page-config.ts`  
**Complexité** : Low  
**Dépendances** : Aucune (composant standalone)  
**Description** : Page de configuration simple, affiche les paramètres de l'application. Bon candidat pour démarrer la migration.  
**Status** : ✅ Terminé

---

### MIG-002 : Migration de page-tournament-select

**Priorité** : Élevée  
**Ordre** : 2  
**Composant** : `page-tournament-select`  
**Tag** : `page-tournament-select`  
**Fichier source** : `src/components/page-tournament-select/page-tournament-select.tsx`  
**Fichier cible** : `src/components/page-tournament-select/page-tournament-select.ts`  
**Complexité** : Low  
**Dépendances** : Aucune  
**Description** : Page de sélection des tournois, affiche la liste des tournois existants.  
**Status** : ✅ Terminé

---

### MIG-003 : Migration de input-number

**Priorité** : Élevée  
**Ordre** : 3  
**Composant** : `input-number`  
**Tag** : `mad-input-number`  
**Fichier source** : `src/components/input-number/input-number.tsx`  
**Fichier cible** : `src/components/input-number/input-number.ts`  
**Complexité** : Low  
**Dépendances** : Aucune  
**Description** : Composant input numérique, utilisé par les grilles et pages de tournoi.  
**Status** : ✅ Terminé

---

### MIG-004 : Migration de team-tile

**Priorité** : Élevée  
**Ordre** : 4  
**Composant** : `team-tile`  
**Tag** : `mad-team-tile`  
**Fichier source** : `src/components/team-tile/team-tile.tsx`  
**Fichier cible** : `src/components/team-tile/team-tile.ts`  
**Complexité** : Low  
**Dépendances** : Aucune  
**Description** : Tuile d'affichage d'une équipe avec image.  
**Status** : ✅ Terminé

---

### MIG-005 : Migration de scorer-basket

**Priorité** : Moyenne  
**Ordre** : 5  
**Composant** : `scorer-basket`  
**Tag** : `mad-scorer-basket`  
**Fichier source** : `src/components/scorer-basket/scorer-basket.tsx`  
**Fichier cible** : `src/components/scorer-basket/scorer-basket.ts`  
**Complexité** : Low  
**Dépendances** : Aucune  
**Description** : Composant de score pour matchs de basket.  
**Status** : ✅ Terminé

---

### MIG-006 : Migration de scorer-rugby

**Priorité** : Moyenne  
**Ordre** : 6  
**Composant** : `scorer-rugby`  
**Tag** : `mad-scorer-rugby`  
**Fichier source** : `src/components/scorer-rugby/scorer-rugby.tsx`  
**Fichier cible** : `src/components/scorer-rugby/scorer-rugby.ts`  
**Complexité** : Low  
**Dépendances** : Aucune  
**Description** : Composant de score pour matchs de rugby.  
**Status** : ✅ Terminé

---

### MIG-007 : Migration de grid-default

**Priorité** : Moyenne  
**Ordre** : 7  
**Composant** : `grid-default`  
**Tag** : `grid-default`  
**Fichier source** : `src/components/grid-default/grid-default.tsx`  
**Fichier cible** : `src/components/grid-default/grid-default.ts`  
**Complexité** : Medium  
**Dépendances** : `mad-select-team` ✅ (déjà migré)  
**Description** : Grille d'affichage par défaut pour les tournois.  
**Status** : ✅ Terminé

---

### MIG-008 : Migration de grid-basket

**Priorité** : Moyenne  
**Ordre** : 8  
**Composant** : `grid-basket`  
**Tag** : `grid-basket`  
**Fichier source** : `src/components/grid-basket/grid-basket.tsx`  
**Fichier cible** : `src/components/grid-basket/grid-basket.ts`  
**Complexité** : Medium  
**Dépendances** : `mad-select-team` ✅, `action-bar` ✅ (déjà migrés)  
**Description** : Grille d'affichage spécifique NBA avec classement.  
**Status** : ✅ Terminé

---

### MIG-009 : Migration de page-tournament

**Priorité** : Moyenne  
**Ordre** : 9  
**Composant** : `page-tournament`  
**Tag** : `page-tournament`  
**Fichier source** : `src/components/page-tournament/page-tournament.tsx`  
**Fichier cible** : `src/components/page-tournament/page-tournament.ts`  
**Complexité** : High  
**Dépendances** : `grid-basket` ✅, `grid-default` ✅, `input-number` ✅, `error-message` ✅  
**Description** : Page d'édition d'un tournoi, composant complexe avec génération de matchs.  
**Status** : ✅ Terminé

---

### MIG-010 : Migration de mad-route

**Priorité** : Basse  
**Ordre** : 10  
**Composant** : `mad-route`  
**Tag** : `mad-route`  
**Fichier source** : `src/components/mad-route/mad-route.tsx`  
**Fichier cible** : `src/components/mad-route/mad-route.ts`  
**Complexité** : Medium  
**Dépendances** : Router module  
**Description** : Composant de routing, essentiel pour app-root.  
**Status** : ✅ Terminé

---

### MIG-011 : Migration de app-root

**Priorité** : Basse  
**Ordre** : 11  
**Composant** : `app-root`  
**Tag** : `app-root`  
**Fichier source** : `src/components/app-root/app-root.tsx`  
**Fichier cible** : `src/components/app-root/app-root.ts`  
**Complexité** : High  
**Dépendances** : `mad-route` ✅, toutes les pages ✅  
**Description** : Composant racine, routeur principal de l'application. À faire en dernier.  
**Status** : ✅ Terminé
