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
