# TODO - État de la Session de Développement

## 1. Contexte du Projet

**Projet** : ContestOrganizer - Outil pour organiser et profiter des concours sportifs
**Technologie** : Migration Stencil → Vanilla Web Components
**Stack** : TypeScript, Shoelace, BaseElement pattern, Signals

Le projet migre progressivement les composants Stencil vers des Web Components Vanilla utilisant `BaseElement` et le pattern Signal.

---

## 2. Problème Actuel : Tuiles d'Équipe Non Affichées

### Bug Description
Sur la page `/match`, les tuiles de match (`<mad-match-tile>`) s'affichent, mais les tuiles d'équipe (`<mad-team-tile>`) à l'intérieur ne s'affichent pas. Elles montrent uniquement le placeholder "Sélection…".

### Historique des Tentatives

#### Tentative 1 : Migration complète de match-tile
- **Action** : Migration de `match-tile.tsx` (Stencil) vers `match-tile.ts` (Vanilla)
- **Changement API** : Passage d'une API Promise-based à une API ID-based
- **Résultat** : ❌ Les tuiles d'équipe ne s'affichent toujours pas
- **Fichiers modifiés** :
  - Créé : `src/components/match-tile/match-tile.ts`
  - Supprimé : `src/components/match-tile/match-tile.tsx`
  - Modifié : `src/components/page-match/page-match.ts` (mise à jour API)

#### Tentative 2 : Configuration TypeScript
- **Action** : Mise à jour de `tsconfig.json` pour supporter les composants Vanilla
- **Changements** :
  - `target`: ES2015 → ES2023
  - `lib`: ["dom", "es2015"] → ["dom", "es2023"]
  - Ajout `paths`: `@core/*` → `./src/core/*`
- **Résultat** : ✅ Configuration corrigée (0 erreurs TS), mais ❌ pas d'impact visuel

#### Tentative 3 : Two-Pass Rendering Pattern
- **Action** : Implémentation du pattern "Two-Pass Rendering" pour passer les données aux composants Stencil enfants
- **Changements** :
  - Ajout interface `MadTeamTileElement` (type-safe, sans `any`)
  - Modification `_render()` :
    - Pass 1 : Création du HTML avec sélecteurs
    - Pass 2 : `querySelector()` + assignation propriétés JS
  - Suppression des attributs `data-team` (inefficaces)
- **Résultat** : ❌ Aucun changement visuel, pas d'erreur console

---

## 3. Analyse Technique

### Architecture Actuelle

```
page-match.ts (Vanilla)
  └── mad-match-tile (Vanilla)
        └── mad-team-tile (Stencil) ← Problème ici
```

### Flux de Données

1. **page-match.ts** passe `host-id` et `visitor-id` à `<mad-match-tile>`
2. **match-tile.ts** (Vanilla) fetch les données d'équipe via `tournaments.getTournamentTeam()`
3. **match-tile.ts** stocke dans des Signals (`_hostSignal`, `_visitorSignal`)
4. **match-tile.ts** tente de passer les données à `<mad-team-tile>` (Stencil)

### Points de Friction Identifiés

#### Friction 1 : Property vs Attribute
- **Problème** : Les composants Stencil utilisent `@Prop()` qui attend des propriétés JS
- **Contrainte** : Vanilla avec `innerHTML` ne peut passer que des attributs HTML (strings)
- **Tentative** : Two-Pass Rendering avec `querySelector` + assignation propriété

#### Friction 2 : Timing de Rendu
- **Hypothèse** : Le deuxième pass (assignation propriétés) pourrait s'exécuter avant que le Stencil component soit hydraté
- **À vérifier** : Ordre d'exécution entre Vanilla render et Stencil componentWillLoad

#### Friction 3 : Reactivité
- **Problème** : `mad-team-tile` (Stencil) utilise `@Watch()` sur la prop `team`
- **Question** : L'assignation de propriété après le premier render déclenche-t-elle le `@Watch` ?

---

## 4. Pistes à Explorer

### Piste 1 : Migration Complète de team-tile
Migrer `team-tile.tsx` (Stencil) vers `team-tile.ts` (Vanilla) pour éliminer la friction Stencil/Vanilla.

**Avantages** :
- Cohérence totale du stack
- Pas de friction property/attribute
- Communication directe entre composants Vanilla

**Inconvénients** :
- Plus de travail
- Risque de régression
- team-tile est utilisé ailleurs ?

### Piste 2 : Utiliser des Événements Personnalisés
Au lieu de passer des données via propriétés, utiliser le système d'événements :
- `match-tile` émet un événement "request-team-data"
- Le parent (ou un service) répond avec les données
- Alternative : Utiliser un store global (Signal-based)

### Piste 3 : DOM Insertion Programmatique
Créer les éléments `<mad-team-tile>` avec `document.createElement()` et setter les propriétés AVANT l'insertion dans le DOM.

```typescript
// Au lieu de innerHTML
const tile = document.createElement('mad-team-tile');
(tile as MadTeamTileElement).team = host.team;
this.shadowRoot?.appendChild(tile);
```

### Piste 4 : Débugger le Two-Pass Actuel
Ajouter des `console.log` pour vérifier :
1. Est-ce que le `querySelector` trouve l'élément ?
2. Est-ce que la propriété est assignée ?
3. Est-ce que le `@Watch` de team-tile est déclenché ?
4. Quel est l'état du render dans team-tile ?

---

## 5. Skill Créé

Un skill de migration a été créé pour documenter ces problèmes :

**Fichier** : `.opencode/skills/stencil-migration/SKILL.md`

**Contenu** :
- Property vs Attribute Trap
- Promise vs String Trap
- Boolean Attribute Trap
- Two-Pass Rendering Pattern (type-safe)
- Migration Checklist

---

## 6. Fichiers Clés

| Fichier | Rôle | Statut |
|---------|------|--------|
| `src/components/page-match/page-match.ts` | Page principale /match | ✅ Migré Vanilla |
| `src/components/match-tile/match-tile.ts` | Tuile de match | ✅ Migré Vanilla |
| `src/components/match-tile/match-tile.tsx` | Ancien Stencil | ❌ Supprimé |
| `src/components/team-tile/team-tile.tsx` | Tuile d'équipe | 🔲 Stencil (à migrer ?) |
| `src/core/base-element.ts` | Classe de base | ✅ Stable |
| `src/core/signal.ts` | Système de réactivité | ✅ Stable |
| `tsconfig.json` | Config TypeScript | ✅ Mis à jour ES2023 |

---

## 7. Prochaines Étapes Recommandées

### Option A : Migrer team-tile (Recommandé)
1. Créer `src/components/team-tile/team-tile.ts` (Vanilla)
2. Supprimer `src/components/team-tile/team-tile.tsx` (Stencil)
3. Tester l'intégration complète

### Option B : Debugger Plus En Profondeur
1. Ajouter logs dans `match-tile.ts` (Two-Pass)
2. Ajouter logs dans `team-tile.tsx` (@Watch, render)
3. Analyser le timing exact

### Option C : Refactoriser l'Architecture
1. Utiliser un store global pour les données d'équipe
2. `team-tile` s'abonne au store plutôt que de recevoir des props
3. Pattern "props down, events up"

---

## 8. Commandes Utiles

```bash
# Vérifier TypeScript
pnpm exec tsc --noEmit

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm exec ultracite check

# Dev server
pnpm dev
```

---

## 9. Notes pour le Prochain Développeur

1. **Le problème n'est PAS résolu** - Les tuiles d'équipe ne s'affichent toujours pas
2. **Pas d'erreur console** - Le problème est silencieux
3. **Three iterations made** sans succès visuel
4. **Le skill stencil-migration** contient la documentation des patterns
5. **Tester avec des console.log** avant toute nouvelle approche
6. **Considérer la migration complète** de team-tile comme solution la plus propre

**Contact/Contexte** : Dernière tentative = Two-Pass Rendering Pattern avec types stricts. Aucun changement visuel observé malgré validation technique (build, tests, lint OK).
