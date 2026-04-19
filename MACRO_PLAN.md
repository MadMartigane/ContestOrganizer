# ContestOrganizer — Plan Macro d'Implémentation

## Philosophie du plan

Ce plan décompose l'intégralité des fonctionnalités décrites dans les spécifications fonctionnelles en **18 tâches macro** organisées en **7 phases**. Chaque tâche constitue un incrément autonome qui apporte une valeur réelle et exploitable à l'application.

### Principes directeurs

- **Mobile-first & responsive** : Chaque tâche intègre la contrainte smartphone/tablette comme usage principal. Les interfaces sont conçues pour le tactile en priorité, adaptées ensuite au desktop.
- **Moteur multi-sport dès la base** : L'architecture et les modèles de données supportent les 5 sports (Foot, Basket, NBA, NFL, Rugby) dès les fondations, même si les premières itérations se concentrent sur le NBA.
- **Incrémental et agile** : Chaque tâche complétée laisse l'application dans un état utilisable et fonctionnel. Pas de dépendance cassée, pas de travail « mort ».
- **Orienté résultat** : Chaque tâche décrit le QUOI et le POURQUOI, pas le COMMENT. Les choix techniques sont rappelés succinctement.
- **localStorage d'abord, API ensuite** : Toutes les fonctionnalités sont construites sur la persistance locale. La synchronisation backend arrive en toute fin de parcours.

### Ordre de priorité sportif

1. **NBA** — premier sport entièrement fonctionnel
2. **Basket** — extension du moteur
3. **NFL** — extension du moteur
4. **Foot** — extension du moteur
5. **Rugby** — extension du moteur

---

## Vue d'ensemble des phases

| Phase | Intitulé | Tâches | Livrable principal |
|-------|----------|--------|--------------------|
| **1** | Fondations | T1 → T3 | Shell de navigation, modèles de données, composants réutilisables |
| **2** | Navigation & Tournois | T4 → T5 | Page d'accueil fonctionnelle, CRUD complet des tournois |
| **3** | Grille & Équipes NBA | T6 → T8 | Grille de tournoi NBA, recherche d'équipes, remplissage automatique |
| **4** | Système de Matchs | T9 → T11 | Création de matchs, scoring sport-specific, affichage optimisé |
| **5** | Classement & NBA Avancé | T12 → T13 | Algorithmes de classement complets, génération calendrier NBA 82 matchs |
| **6** | Configuration & Multi-Sport | T14 → T15 | Page configuration, support des 5 sports |
| **7** | Synchronisation & Qualité | T16 → T18 | Synchronisation API REST, corrections, tests unitaires |

---

## Résumé des dépendances

```
T1 ─────────────────────────────────────────────────────── T14 (Config)
 │                                                         
 ├── T4 (Accueil + 404)                                    
 │                                                         
 ├── T2 ── T3 ── T5 (CRUD Tournois) ── T16 (API sync)     
 │              │                                            
 │              └── T6 (Grille) ── T7 (Recherche) ── T8 (Magic Fill-up)
 │                                   │                    
 │                                   └── T9 (Création matchs)
 │                                        ├── T10 (Scoring) ── T11 (Affichage)
 │                                        │                └── T12 (Classement) ── T15 (Multi-sport)
 │                                        │                                      └── T17 (Bugs)
 │                                        └── T13 (Calendrier NBA)                    │
 │                                                                                    │
 │                                                              T18 (Tests) ──────────┘
```

### Table des dépendances

| Tâche | Dépend de | Peut être parallèle avec |
|-------|-----------|--------------------------|
| T1 | — | T2 |
| T2 | — | T1 |
| T3 | T2 | T4 |
| T4 | T1 | T3, T5 |
| T5 | T1, T2, T3 | T4 |
| T6 | T5 | — |
| T7 | T6 | — |
| T8 | T7 | — |
| T9 | T6 | T7, T8 |
| T10 | T9 | T13 |
| T11 | T10 | T12, T13 |
| T12 | T10 | T11, T13 |
| T13 | T9 | T10, T11, T12 |
| T14 | T1 | T2 → T18 |
| T15 | T12 | T14, T16 |
| T16 | T5 | T14, T15 |
| T17 | T15 | T16, T18 |
| T18 | T17 | T16 |

---

# Phase 1 — Fondations

## T1 · Shell de navigation, routage et gestion du thème

### Objectif

Établir la structure complète de navigation de l'application avec toutes les routes, la gestion du thème sombre/clair et le layout responsive de base. Cette tâche pose les fondations sur lesquelles toutes les pages seront construites.

### Portée

- **Structure de routage** : Création de toutes les routes définies dans les spécifications (`/home`, `/tournaments`, `/tournament/[tournamentId]`, `/match/[tournamentId]`, `/team-select/[teamId]/[teamType]`, `/config`), chacune avec un contenu temporaire de placeholder.
- **Redirection racine** : La route `/` redirige automatiquement vers `/home`.
- **Page 404** : Route de fallback pour toute URL non reconnue.
- **Layout racine** : Layout global intégrant le support du thème et la structure responsive (enveloppe Skeleton UI, zone de contenu principal).
- **Système de thème** :
  - Détection automatique de la préférence OS (`prefers-color-scheme`) au premier chargement.
  - Suivi en temps réel des changements de préférence système tant que l'utilisateur n'a pas fait de choix manuel.
  - Persistance du choix utilisateur dans localStorage (`CONTEST_ORGANIZER_SETTING`, clé `darkMode`).
  - Application du thème via le système de thèmes Skeleton (Cerberus), basculé à la racine du document.
  - Gestion des cas limites : localStorage indisponible ou corrompu → fallback sur préférence OS.
- **Composant Breadcrumb** : Composant réutilisable acceptant une liste d'items (label, lien, état courant). Configurable par page selon la navigation map définie dans les specs.
- **Design mobile-first** : Layout conçu pour un affichage smartphone en priorité, s'adaptant aux tablettes et desktop.

### Dépendances

Aucune.

### Critères d'acceptation

- [ ] Toutes les routes sont accessibles via URL directe (deep linking)
- [ ] `/` redirige vers `/home`
- [ ] Le thème sombre/clair s'applique correctement et suit la préférence OS par défaut
- [ ] Le choix de thème persiste après rechargement de la page
- [ ] Le breadcrumb affiche les items configurés avec liens cliquables et état courant
- [ ] Le layout est responsive et s'adapte du smartphone au desktop
- [ ] La navigation historique (back/forward du navigateur) fonctionne

### Rappel technique

SvelteKit file-based routing · `@sveltejs/adapter-static` (SPA mode) · Skeleton UI v4 thème Cerberus · Tailwind CSS v4 · Svelte 5 runes (`$props()`, `$effect()`)

---

## T2 · Modèles de domaine et persistance localStorage

### Objectif

Définir l'ensemble des structures de données du domaine métier et implémenter la couche de persistance locale. Cette couche constitue le socle sur lequel repose toute la logique applicative.

### Portée

- **Types et interfaces TypeScript** :
  - `TournamentType` : union des 5 sports (Foot, Basket, NBA, NFL, Rugby) avec leurs emojis et libellés d'affichage.
  - `MatchStatus` : union des 3 statuts (PENDING, DOING, DONE) avec labels et couleurs associés.
  - `Tournament` : id, name, type, grid (TeamRow[]), matchs (Match[]), timestamp.
  - `TeamRow` : id, type, team (GenericTeam | undefined), points, scoredGoals, concededGoals, goalAverage, scheduledMatchs.
  - `GenericTeam` : id, name, type, logo (optionnel), league (optionnel), country (optionnel avec id, name, code, flag).
  - `Match` : id, hostId, visitorId, goals ({host, visitor}), status.
  - Constantes de configuration par sport (scorers, colonnes de grille, comportements).
- **Génération d'identifiants** : Génération d'ID numériques uniques par méthode cryptographique (3 × 32-bit aléatoire, sélection d'un).
- **Service de persistance localStorage** :
  - Clé : `CONTEST_ORGANIZER_TOURNAMENTS`.
  - Format : `{ timestamp: number, tournaments: Tournament[] }`.
  - Opérations : chargement, sauvegarde, création, lecture, mise à jour, suppression de tournois.
  - Mise à jour automatique du timestamp à chaque modification.
  - Gestion des cas limites : localStorage indisponible, données corrompues.
- **Utilitaires de grille** :
  - Redimensionnement de grille (ajout/suppression de slots, préservation des données existantes).
  - Contraintes : min 2, max 32, pas de 2, défaut 4.
  - Réinitialisation complète d'une grille.
- **Gestion des paramètres applicatifs** :
  - Clé : `CONTEST_ORGANIZER_SETTING`.
  - Persistance du mode sombre et de la locale.

### Dépendances

Aucune (peut être développée en parallèle de T1).

### Critères d'acceptation

- [ ] Tous les types et interfaces compilent en TypeScript strict
- [ ] Les 5 types de tournoi sont définis avec leurs métadonnées (emoji, libellé)
- [ ] Le CRUD localStorage fonctionne : créer, lire, mettre à jour, supprimer un tournoi
- [ ] Les IDs générés sont uniques et dans la plage attendue
- [ ] Le redimensionnement de grille préserve les équipes et stats existantes
- [ ] Le timestamp est mis à jour à chaque opération de sauvegarde
- [ ] Les données corrompues dans localStorage sont gérées gracieusement (fallback)

### Rappel technique

TypeScript strict · Svelte 5 runes (`$state()`) · localStorage API · Web Crypto API

---

## T3 · Composants réutilisables de base

### Objectif

Construire les briques UI partagées utilisées par l'ensemble des pages de l'application. Ces composants garantissent la cohérence visuelle et réduisent la duplication.

### Portée

- **Dialogue de confirmation** :
  - Icône 🚨, message personnalisable, boutons « Oui » (primaire) et « Non » (warning).
  - Le clic sur l'overlay ne ferme PAS le dialogue.
  - Retourne `true` (confirmé) ou `false` (annulé).
  - Utilisé pour : suppression de tournoi, réinitialisation de grille, suppression de match, génération calendrier NBA.
- **Dialogue d'alerte** :
  - Icône ⚠️, message personnalisable, bouton « Fermer » (primaire).
  - Le clic sur l'overlay ne ferme PAS le dialogue.
  - Utilisé pour : validations bloquantes, avertissements NBA.
- **Barre d'actions (Action Bar)** :
  - Conteneur horizontal de boutons, aligné à droite.
  - Utilisé comme zone d'actions récurrente en pied de page.
- **Composant de message d'erreur** :
  - Alerte rouge/danger avec icône 🐛, titre « Erreur » en gras, texte descriptif.
  - Bouton optionnel « Retour à l'accueil ».
- **Champ numérique (Number Input)** :
  - Input labelisé avec boutons d'incrémentation/décrémentation.
  - Configurable : min, max, step, valeur par défaut, état lecture seule.
  - La valeur est bornée dans la plage valide. Entrée invalide → valeur précédente restaurée.
- **Composant Team Tile (tuile d'équipe)** :
  - Affichage logo + nom, variantes normal et inversé (reverse).
  - Chargement paresseux du logo via IntersectionObserver (seuil 10%).
  - Placeholder animé (SVG basketball pulsant) pendant le chargement.
  - État d'erreur du logo (icône bouclier avec X, 64×64).
  - Support du badge de rang (positionné à droite pour l'hôte, à gauche pour le visiteur).
  - État « pas d'équipe » avec emoji ⏳.
  - Responsive : empilé pleine largeur sur petit écran.
  - Respect de `prefers-reduced-motion` (animation désactivée).

### Dépendances

T2 (types TeamRow, GenericTeam, structures de badge de rang).

### Critères d'acceptation

- [ ] Le dialogue de confirmation affiche le message personnalisé, ne se ferme pas au clic overlay, retourne le bon booléen
- [ ] Le dialogue d'alerte affiche le message et ne se ferme qu'avec le bouton « Fermer »
- [ ] La barre d'actions affiche les boutons alignés à droite de manière responsive
- [ ] Le message d'erreur affiche titre, description et bouton optionnel
- [ ] Le champ numérique respecte min/max/step et restaure la valeur précédente en cas d'entrée invalide
- [ ] Le Team Tile charge le logo en différé, affiche le placeholder animé, gère l'erreur de chargement
- [ ] Tous les composants sont responsive mobile-first
- [ ] `prefers-reduced-motion` est respecté dans les animations

### Rappel technique

Skeleton UI v4 components · Svelte 5 runes · IntersectionObserver · Tailwind CSS v4

---

# Phase 2 — Navigation & Tournois

## T4 · Page d'accueil et page 404

### Objectif

Livrer la première expérience utilisateur visible de l'application : une page d'accueil accueillante avec navigation fonctionnelle et une page d'erreur 404 pour les routes inconnues.

### Portée

- **Page d'accueil (`/home`)** :
  - Breadcrumb : icône 🏠 seule (page courante, non cliquable).
  - Titre de la page : « Contest Tournament » (clé i18n `app_title`).
  - Carrousel d'images rotatif : affiche une illustration à la fois, centrée, rotation automatique toutes les 5 secondes avec sélection aléatoire parmi 5 illustrations sportives. Pas de contrôle utilisateur.
  - Badge de version de l'application (clé `app_version` avec paramètre `version`).
  - Deux boutons de navigation principaux (grands, côte à côte) :
    - ⚙ « Configuration » → `/config`
    - 🏆 « Tournois » → `/tournaments`
- **Page 404** :
  - Breadcrumb décoratif : trois cercles « 4 » « 0 » « 4 ».
  - Titre d'erreur : « 404 - La page demandée n'existe pas. » (clé `error_404_title`).
  - Carrousel d'images en boucle automatique avec 2 illustrations (400×300) et points de pagination.
  - Deux boutons de navigation en pied de page :
    - 🏠 « Accueil » → `/home`
    - 🏆 « Tournois » → `/tournaments`
- **Design mobile-first** pour les deux pages.

### Dépendances

T1 (routing, layout, thème, breadcrumb).

### Critères d'acceptation

- [ ] La page `/home` affiche le titre, le carrousel avec rotation automatique et les deux boutons de navigation
- [ ] Le badge de version affiche la version courante de l'application
- [ ] Les boutons naviguent correctement vers `/config` et `/tournaments`
- [ ] La page 404 s'affiche pour toute URL inconnue (ex : `/unknown-route`)
- [ ] Le carrousel de la page 404 tourne en boucle avec points de pagination
- [ ] Les boutons de la page 404 naviguent correctement
- [ ] Les deux pages sont responsive mobile-first

### Rappel technique

SvelteKit routing · Skeleton UI · Paraglide JS (i18n) · Tailwind CSS v4

---

## T5 · Page de sélection des tournois — CRUD complet

### Objectif

Permettre la gestion complète du cycle de vie des tournois : création avec choix du sport, affichage de la liste, suppression sécurisée. C'est la première page à forte valeur métier de l'application.

### Portée

- **Breadcrumb** : 🏠 Home (cliquable → `/home`) → 🏆 Tournaments (courant).
- **Liste des tournois** (quand des tournois existent) :
  - Menu vertical des tournois dans l'ordre d'insertion.
  - Chaque item affiche : nom du tournoi, type de sport avec emoji, badge pilule avec nombre d'équipes, icône 🗑 (couleur warning) pour la suppression, icône ➡ pour la navigation.
  - Cliquer sur un tournoi navigue vers `/tournament/{id}`.
- **État vide** (aucun tournoi) :
  - Icône 🏆 (couleur warning), texte « Pas encore de tournois », icône ⛹ (couleur success).
- **Séparateur** horizontal.
- **Bouton « Nouveau tournoi »** : déclenche l'affichage du formulaire de création.
- **Formulaire de création** :
  - Champ nom : label « Nom du tournois », placeholder « Playoff », longueur minimale 2, autofocus à l'ouverture.
  - Sélecteur de sport : label « Quel sport ? », placeholder « Basket, NBA, Foot, … », texte d'aide « (defaut: Foot ⚽️) ». Options : 🏀 NBA, 🏉 Rugby, 🏈 NFL, 🏀 Basket, ⚽ Foot. Défaut : Foot.
  - Boutons : « Annuler » (warning) et « Ajouter » (primaire). « Ajouter » désactivé tant que nom < 3 caractères.
  - Raccourcis clavier : Entrée valide, flèche bas déplace le focus vers le sélecteur de sport.
  - À la validation : ID unique généré, tournoi créé avec grille vide et matchs vides, persisté en localStorage, formulaire fermé.
  - À l'annulation : formulaire fermé, rien n'est créé.
- **Suppression de tournoi** :
  - Clic sur 🗑 ouvre le dialogue de confirmation : « Supprimer le tournoi: {name}? » avec icône 🚨.
  - Si confirmé : suppression définitive du tournoi et toutes ses données (grille, matchs, scores). Irréversible.
  - Si annulé : aucune action.

### Dépendances

T1 (routing, breadcrumb), T2 (persistance localStorage), T3 (dialogue de confirmation).

### Critères d'acceptation

- [ ] La liste des tournois affiche tous les tournois existants avec leurs informations complètes
- [ ] L'état vide s'affiche correctement quand aucun tournoi n'existe
- [ ] Le formulaire de création apparaît au clic sur « Nouveau tournoi » avec autofocus sur le champ nom
- [ ] La validation empêche la création avec un nom < 3 caractères (bouton « Ajouter » désactivé)
- [ ] Un tournoi créé avec le type NBA apparaît dans la liste avec le bon emoji et libellé
- [ ] La suppression demande confirmation et supprime définitivement le tournoi
- [ ] Les raccourcis clavier (Entrée, flèche bas) fonctionnent dans le formulaire
- [ ] Chaque action (création, suppression) persiste les données en localStorage
- [ ] La page est responsive mobile-first

### Rappel technique

SvelteKit routing · Svelte 5 runes (`$state()`, `$effect()`) · Skeleton UI (forms, lists, badges) · Paraglide JS (i18n) · localStorage

---

# Phase 3 — Grille & Équipes NBA

## T6 · Grille de tournoi — affichage et gestion

### Objectif

Permettre l'affichage et la gestion de la grille d'équipes d'un tournoi, avec le bon modèle de colonnes selon le type de sport. L'utilisateur peut ajuster la taille de la grille, éditer le nom du tournoi et naviguer vers les matchs.

### Portée

- **Page de détail du tournoi (`/tournament/[tournamentId]`)** :
  - Chargement du tournoi par l'ID du paramètre URL.
  - Si tournoi introuvable : message d'erreur « Tournois #{id} non trouvé. » avec breadcrumb de navigation.
  - Breadcrumb : 🏠 Home → 🏆 Tournaments → 📋 Tournament (courant).
- **Édition inline du nom** : Le titre du tournoi est cliquable → remplacement par un champ texte pré-rempli. Entrée, Échap ou perte de focus sauvegarde le nom tronqué des espaces.
- **Champ « Nombre d'équipes »** : Label « Nombre d'équipes (min:2, max:32) », placeholder 4, step 2. Contraintes : min 2, max 32, step 2, défaut 4.
- **Deux modèles de grille** :
  - **Grille Basket** (pour Basket, NBA, NFL, Rugby) : colonnes #, Équipes, %, J, G, P, +, −, 📅.
    - En-têtes complets sur desktop, abréviations sur mobile.
    - Légende mobile explicative : % (pourcentage victoire), J (joués), G (gagnés), P (perdus), + (marqués), − (encaissés), 📅 (programmés).
  - **Grille par défaut** (pour Foot) : colonnes #, Équipes, Points, Buts+, Buts−, Goal average, 📅.
  - Le dispatch entre les deux grilles se fait automatiquement selon le `type` du tournoi.
- **Affichage de la grille** :
  - Numérotation séquentielle à partir de 1, zéro-padded sur 2 chiffres (01, 02, …, 09, 10, 11, …).
  - Chaque ligne affiche les stats courantes et une zone de sélection d'équipe (placeholder « Équipe vide »).
  - La zone de sélection est cliquable et ouvrira le tiroir de recherche d'équipes (branché dans T7).
- **État grille vide** : Si le nombre d'équipes est 0 → message « Choisissez le nombre d'équipes pour commencer ! ».
- **Redimensionnement de grille** :
  - Augmenter : de nouveaux slots vides ajoutés à la fin.
  - Diminuer : les slots au-delà du nouveau compte sont supprimés définitivement. Les slots restants (0 à nouveau−1) préservent toutes leurs données.
  - Le champ nombre d'équipes se synchronise au compte réel de lignes au chargement d'un tournoi existant.
- **Actions en pied de page** :
  - « Effacer » : réinitialisation de la grille après confirmation (« Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ? »). Résultat : grille vidée, tous matchs supprimés, reset à 4 slots vides. Irréversible.
  - « Go Match » : navigation vers `/match/{tournamentId}`.
- **Design mobile-first** avec colonnes adaptées.

### Dépendances

T5 (les tournois doivent pouvoir être créés et listés au préalable).

### Critères d'acceptation

- [ ] La page charge un tournoi existant via son ID dans l'URL
- [ ] Un tournoi introuvable affiche le message d'erreur avec navigation
- [ ] Le nom du tournoi est éditable inline et se sauvegarde au blur/Entrée/Échap
- [ ] La grille Basket s'affiche avec les colonnes %, J, G, P, +, −, 📅 pour un tournoi NBA
- [ ] La grille par défaut s'affiche avec les colonnes Points, Buts+, Buts−, Goal avg, 📅 pour un tournoi Foot
- [ ] Le nombre d'équipes est ajustable (min 2, max 32, step 2) et la grille se redimensionne correctement
- [ ] L'augmentation de la taille préserve les équipes et stats existantes
- [ ] La diminution supprime les slots excédentaires et garde les premiers intacts
- [ ] Le bouton « Effacer » demande confirmation et réinitialise la grille à 4 slots vides
- [ ] Le bouton « Go Match » navigue vers la page match du tournoi
- [ ] La légende mobile est visible sur petit écran
- [ ] La page est responsive mobile-first

### Rappel technique

SvelteKit routing (paramètres dynamiques) · Svelte 5 runes · Skeleton UI (tables, inputs, buttons) · Tailwind CSS v4 · Paraglide JS (i18n)

---

## T7 · Recherche et sélection d'équipes

### Objectif

Permettre à l'utilisateur de rechercher et sélectionner des équipes professionnelles via des API externes pour peupler la grille de tournoi. Ce mécanisme est le pont entre la grille vide et les équipes réelles, essentiel pour rendre les tournois jouables.

### Portée

- **Tiroir de recherche (drawer)** :
  - Ouverture latérale gauche au clic sur la zone de sélection d'équipe d'un slot de grille.
  - Titre : « Recherche ton équipe. (3 lettres min) ».
  - Champ de recherche avec placeholder « nom d'équipe », autofocus à l'ouverture.
  - Debounce de 300ms après la dernière frappe avant le déclenchement de l'appel API.
  - Minimum 3 caractères requis. En dessous de 3 : résultats effacés, aucun appel API.
  - Seuls les résultats de la recherche la plus récente sont affichés (les résultats périmés sont ignorés).
  - État de chargement : spinner + « Chargement des équipes… ».
  - État « aucun résultat » : alerte warning avec emoji 😞 et texte « Aucun résultat » (uniquement si ≥ 3 caractères et API retourne vide).
  - Après chargement, défilement automatique vers la zone de résultats.
  - Fermeture automatique après sélection d'une équipe.
  - Bouton « Annuler » pour fermer sans sélection.
- **Sources de données par sport** :
  - Foot : API-Sports v3 (`football.api-sports.io`).
  - Basket : API-Sports v1 (`basketball.api-sports.io`).
  - NFL : API-Sports v1 (`americanfootball.api-sports.io`).
  - Rugby : API-Sports v1 (`rugby.api-sports.io`).
  - NBA : TheSportsDB (`thesportsdb.com`, filtrage côté client).
  - Le type de sport du tournoi détermine automatiquement l'API interrogée.
- **Mapping des réponses** :
  - API-Sports : deux structures (nested `{team: {...}}` et flat). Auto-détection via la propriété `team`.
  - TheSportsDB : récupération de toutes les équipes NBA, filtrage par sous-chaîne insensible à la casse. Logo via `strBadge` + `/small`.
  - Toutes les réponses mappées vers le type `GenericTeam`.
- **Système de cache** :
  - API-Sports : cache permanent jusqu'à vidange manuelle. Fallback : cache corrompu → nettoyé, traité comme vide.
  - TheSportsDB (NBA) : TTL de 7 jours. Fallback : API en échec mais cache existant → utilisation du cache périmé.
- **Gestion des erreurs** : 5 catégories (réseau, rate limit 429, not found 404, serveur 500+, client 4xx). Chaque erreur affichée en bannière rouge avec titre, message et bouton « Réessayer » si applicable.
- **Sélection d'équipe** :
  - Résultats affichés en liste sélectionnable (logo + nom + icône flèche).
  - L'équipe sélectionnée est assignée au slot de grille concerné.
  - La zone de sélection du slot se met à jour pour afficher l'équipe (logo + nom).
  - Remplacement d'une équipe : l'ancienne équipe est remplacée, les statistiques existantes sont préservées (pas de reset).
- **Rappel tech : Rappel technique
- **Rappel technique** : Le même composant de recherche sert pour tous les sports, le dispatch se fait par type de tournoi.
- **Constrainte mobile-first** : Le tiroir occupe une largeur adaptée au mobile, les résultats sont tactiles.

### Dépendances

T6 (la grille doit exister avec des slots de sélection d'équipe).

### Critères d'acceptation

- [ ] Le tiroir de recherche s'ouvre au clic sur un slot de grille et se ferme au clic sur « Annuler » ou après sélection
- [ ] La recherche ne déclenche un appel API qu'après 3 caractères minimum et 300ms de debounce
- [ ] Les résultats de la recherche NBA retournent des équipes avec logos depuis TheSportsDB
- [ ] Les résultats Foot/Basket/NFL/Rugby retournent des équipes depuis API-Sports
- [ ] Les équipes périmées d'une recherche précédente ne s'affichent pas
- [ ] L'état de chargement s'affiche pendant la requête
- [ ] L'état « aucun résultat » s'affiche correctement
- [ ] Sélectionner une équipe l'assigne au slot et ferme le tiroir
- [ ] Remplacer une équipe préserve les statistiques du slot
- [ ] Le cache fonctionne : une deuxième recherche identique n'appelle pas l'API
- [ ] Les erreurs API s'affichent avec la bonne catégorie et bouton « Réessayer » le cas échéant
- [ ] Le tiroir est utilisable sur mobile (taille, tactile, scroll)

### Rappel technique

TanStack Svelte Query (data fetching + cache) · Svelte 5 runes · Skeleton UI (drawer) · IntersectionObserver · Debounce · API-Sports · TheSportsDB

---

## T8 · Magic Fill-up NBA

### Objectif

Permettre le remplissage automatique et instantané de la grille avec les 30 équipes NBA officielles en un seul clic. Cette fonctionnalité transforme une grille vide en un tournoi NBA prêt à jouer, ce qui est le flux de travail principal pour ce sport.

### Portée

- **Bouton « 🔮 Magic fill-up »** (visible uniquement pour les tournois de type NBA) :
  - Affiché parmi les actions en pied de page du détail du tournoi.
  - Au clic, déclenche le processus de remplissage automatique.
- **Processus de Magic Fill-up** :
  1. **Récupération** : Toutes les équipes NBA depuis l'API externe (TheSportsDB), mises en cache pendant 7 jours.
  2. **Déduplication** : Suppression des doublons d'ID d'équipe déjà présents dans la grille existante (première occurrence conservée).
  3. **Identification des manquantes** : Équipes NBA pas encore dans la grille.
  4. **Mélange aléatoire** : Les équipes manquantes sont mélangées avec l'algorithme Fisher-Yates.
  5. **Remplissage des slots vides** : Les équipes mélangées sont assignées aux lignes sans équipe.
  6. **Extension de la grille** : S'il reste des équipes après remplissage, de nouvelles lignes sont créées automatiquement.
  7. **Résultat** : Les 30 équipes NBA sont dans la grille. Les équipes existantes ne sont jamais retirées ni remplacées.
- **Gestion des erreurs** :
  - Échec API + cache périmé existant → utilisation du cache périmé.
  - Échec API + aucun cache → affichage du message « Failed to load NBA teams ».
- **Persistance** : La grille remplie est sauvegardée en localStorage.

### Dépendances

T7 (besoin de la capacité de récupération des équipes NBA via TheSportsDB et du système de cache).

### Critères d'acceptation

- [ ] Le bouton « 🔮 Magic fill-up » est visible uniquement pour les tournois NBA
- [ ] Au clic, la grille est peuplée avec les 30 équipes NBA (nom + logo)
- [ ] Les équipes existantes dans la grille sont conservées (pas de remplacement)
- [ ] Les équipes manquantes sont mélangées aléatoirement avant assignation
- [ ] La grille s'étend automatiquement s'il y a plus de 30 équipes à placer que de slots disponibles
- [ ] En cas d'erreur API avec cache existant, le cache est utilisé comme fallback
- [ ] En cas d'erreur API sans cache, un message d'erreur clair s'affiche
- [ ] Le résultat est persisté en localStorage

### Rappel technique

TanStack Svelte Query · Fisher-Yates shuffle · TheSportsDB API · localStorage · Svelte 5 runes

---

# Phase 4 — Système de Matchs

## T9 · Page Match — création et cycle de vie des matchs

### Objectif

Permettre la création de matchs entre les équipes de la grille (manuellement ou automatiquement) et la gestion de leur cycle de vie (statuts PENDING → DOING → DONE). C'est le cœur fonctionnel de l'application : sans match, il n'y a pas de compétition.

### Portée

- **Page Match (`/match/[tournamentId]`)** :
  - Chargement du tournoi par l'ID du paramètre URL.
  - Si tournoi introuvable : message d'erreur « Tournois #{id} non trouvé. »
  - Breadcrumb : 🏠 Home → 🏆 Tournaments → 📋 Tournament (cliquable → `/tournament/{id}`) → 🎮 Match (courant).
- **En-tête de compteur** : « Match(s) {count} »
- **En-tête de liste** : trois colonnes — Locaux (3/11), type de sport (5/11), Visiteurs (3/11).
- **État vide** : « Aucun match en cours » (couleur amber/warning).
- **Création manuelle de match** :
  - Bouton « Nouveau match » → ouvre un panneau de sélection d'équipes.
  - Tableau de sélection : chaque ligne affiche checkbox, tuile d'équipe (logo + nom), total matchs, matchs joués, matchs programmés.
  - Tri des équipes : matchs complétés ASC, puis matchs programmés DESC.
  - Premier clic = **hôte**, deuxième clic = **visiteur**.
  - Bouton « Valider » désactivé tant que les deux équipes ne sont pas sélectionnées.
  - Bouton « Annuler » pour annuler la création.
  - À la validation : match créé en statut PENDING, score 0–0.
- **Création automatique (Auto-Match)** :
  - Bouton « Auto-Match » → création d'un match automatique selon l'algorithme :
    - **Équipe 1** (hôte) : équipe avec le moins de matchs au total. Égalité : première dans l'ordre de la grille.
    - **Équipe 2** (visiteur) : parmi toutes les autres équipes, celle ayant le moins de confrontations précédentes contre l'équipe 1. Égalité : moins de matchs totaux, puis dernière dans l'ordre de la grille.
    - Match créé en statut PENDING, 0–0.
  - Requiert ≥ 2 équipes dans la grille.
- **Cycle de vie des matchs** :
  - PENDING → DOING : clic sur le bouton « Play ». Les contrôles de scoring deviennent actifs.
  - DOING → DONE : clic sur le bouton « Stop ». Scores finalisés, classement recalculé.
  - DONE → DOING : clic sur le bouton « Play » pour **ré-ouvrir** un match terminé. Permet la correction de score et la consultation temporaire du classement. Le match peut être « stoppé » à nouveau pour refinaliser.
- **Suppression de match** : Disponible quel que soit le statut. Demande confirmation : « Supprimer le match ? ». Suppression définitive + recalcul complet des scores.
- **Désactivation conditionnelle** : Les boutons « Nouveau match » et « Auto-Match » sont désactivés quand le calendrier NBA est complet (82 matchs/équipe). Le bouton « Generate All Missing » apparaît pour les tournois NBA (branché dans T13).

### Dépendances

T6 (la grille doit exister avec des équipes assignées pour créer des matchs).

### Critères d'acceptation

- [ ] La page match charge le tournoi via l'ID URL et affiche le breadcrumb correct
- [ ] Un tournoi introuvable affiche le message d'erreur avec navigation
- [ ] L'état vide s'affiche quand aucun match n'existe
- [ ] La création manuelle permet de sélectionner hôte + visiteur et crée un match PENDING 0–0
- [ ] L'Auto-Match crée un match selon l'algorithme (moins de matchs, moins de confrontations)
- [ ] Le cycle PENDING → DOING → DONE fonctionne avec les boutons Play/Stop
- [ ] Un match DONE peut être ré-ouvert (→ DOING) puis re-stoppé (→ DONE)
- [ ] La suppression d'un match demande confirmation, supprime le match et déclenche un recalcul
- [ ] Les boutons de création sont désactivés si moins de 2 équipes dans la grille
- [ ] Toute action persiste les données en localStorage
- [ ] La page est responsive mobile-first

### Rappel technique

SvelteKit routing (paramètres dynamiques) · Svelte 5 runes (`$state()`, `$derived()`) · Skeleton UI · Paraglide JS (i18n)

---

## T10 · Page Match — scoring sport-specific et propagation

### Objectif

Implémenter le système de scoring complet avec les contrôles spécifiques à chaque sport et la propagation des scores vers les statistiques des équipes. C'est le moteur de calcul qui alimente les classements.

### Portée

- **Scorers spécifiques par sport** :
  - **Football ( scorer commun)** : deux boutons −1 et +1. Pas de score négatif (minimum 0). Désactivé hors statut DOING.
  - **Basket / NBA (scorer basket)** : trois boutons +1, +2, +3. Toggle Ajouter/Supprimer : mode Ajout par défaut (icône +, bleu), mode Retrait (icône −, amber). En mode Ajout : +N ajoute N au score. En mode Retrait : +N soustrait N. Score borné (pas de négatif). Label : « Ajouter/Supprimer des points ».
  - **NFL / Rugby (scorer rugby)** : trois boutons +2, +3, +5. Même toggle Ajouter/Supprimer que le scorer basket. Valeurs : 2 (conversion), 3 (pénalité/drop), 5 (essai).
  - Le dispatch du scorer se fait automatiquement selon le type du tournoi.
- **Propagation des scores** :
  - Chaque clic sur un scorer met à jour immédiatement le score du match.
  - Déclenche la persistance du tournoi en localStorage.
  - La tuile de match se met à jour de manière incrémentale.
- **Processus de recalcul complet** (reset-and-replay) déclenché à **chaque** modification du tournoi (création, suppression, changement de statut, modification de score) :
  1. **Reset** de toutes les statistiques de toutes les équipes à zéro.
  2. **Itération** sur tous les matchs :
     - Incrément de `scheduledMatchs` pour les deux équipes (tous statuts).
     - Pour les matchs DONE uniquement : accumulation des buts/points marqués et encaissés, attribution des points (3/1/0).
  3. Recalcul du `goalAverage = scoredGoals − concededGoals` par équipe.
- **Contrôles de scoring actifs uniquement en statut DOING**.

### Dépendances

T9 (les matchs doivent exister avec leur cycle de vie).

### Critères d'acceptation

- [ ] Le scorer Football affiche les boutons −1/+1 et fonctionne correctement
- [ ] Le scorer Basket/NBA affiche les boutons +1/+2/+3 avec le toggle Ajouter/Supprimer
- [ ] Le scorer NFL/Rugby affiche les boutons +2/+3/+5 avec le toggle Ajouter/Supprimer
- [ ] Le bon scorer s'affiche automatiquement selon le type de tournoi
- [ ] Les contrôles de scoring sont désactivés quand le match n'est pas en statut DOING
- [ ] Chaque clic met à jour le score immédiatement et persiste le tournoi
- [ ] Le score ne peut pas descendre en dessous de 0
- [ ] Le recalcul complet (reset-and-replay) met à jour correctement les stats de toutes les équipes après chaque action
- [ ] Le système de points 3/1/0 est appliqué correctement (victoire = 3, nul = 1, défaite = 0)

### Rappel technique

Svelte 5 runes (`$state()`, `$effect()`) · Skeleton UI (toggle, buttons) · Paraglide JS (i18n)

---

## T11 · Page Match — affichage, défilement virtuel et navigation

### Objectif

Livrer une expérience d'affichage des matchs performante et fluide même avec des centaines de matchs, grâce au défilement virtuel et à la navigation ciblée. L'utilisateur peut suivre l'évolution du tournoi en temps réel.

### Portée

- **Tuile de match (Match Tile)** :
  - Affichage : tuile d'équipe hôte (gauche) + scores centre + tuile d'équipe visiteur (droite).
  - Scores : score hôte et score visiteur séparés par « VS ».
  - Badge de statut :
    - PENDING : bleu (primaire), icône calendrier, label « Match programmé ».
    - DOING : vert (success), icône spinner animée, label « Match en cours ».
    - DONE : amber (warning), icône check, label « Match terminé ».
  - Boutons d'action : Play/Stop (selon le statut) et Delete.
  - Placeholder « Sélection… » quand un slot d'équipe est vide.
  - Intégration des badges de rang sur les tuiles d'équipe (positionnés à droite pour l'hôte, à gauche pour le visiteur).
- **Défilement virtuel** :
  - Application de TanStack Virtual sur la liste des matchs.
  - Seules les tuiles visibles dans le viewport sont rendues dans le DOM.
  - Performance constante même avec 1 000+ matchs.
- **Défilement automatique au chargement** :
  - Priorité 1 : dernier match en statut DOING.
  - Priorité 2 : dernier match en statut DONE.
  - Pas de défilement si tous les matchs sont PENDING.
  - Animation de défilement fluide (smooth scroll).
- **Dock de navigation de scroll** (fixé en bas à droite) :
  - Bouton « Top » (raccourci Alt+T) : défilement vers le haut de la page.
  - Bouton « Match courant » (raccourci Alt+M) : défilement vers le match cible (DOING ou DONE le plus récent).
  - Bouton « Bottom » (raccourci Alt+B) : défilement vers le bas de la page.
  - Visible uniquement quand l'utilisateur a défilé ET qu'un match cible existe (ou qu'on est à >75% du viewport).
  - « Match courant » désactivé quand aucun match cible n'existe.
- **Responsive mobile-first** : les tuiles de match s'adaptent aux écrans étroits.

### Dépendances

T10 (les matchs avec scores et cycle de vie doivent fonctionner).

### Critères d'acceptation

- [ ] Les tuiles de match affichent correctement hôte, visiteur, scores et badge de statut
- [ ] Le badge de statut affiche la bonne couleur, icône et label selon PENDING/DOING/DONE
- [ ] Les badges de rang apparaissent sur les tuiles d'équipe dans les matchs
- [ ] Le placeholder « Sélection… » s'affiche pour les slots vides
- [ ] Le défilement virtuel fonctionne : 500+ matchs ne causent pas de ralentissement
- [ ] L'auto-scroll cible le bon match au chargement (DOING priorité, puis DONE)
- [ ] Le dock de navigation apparaît au défilement et les trois boutons fonctionnent
- [ ] Les raccourcis clavier Alt+T, Alt+M, Alt+B fonctionnent
- [ ] Le bouton « Match courant » est désactivé quand il n'y a pas de cible
- [ ] L'ensemble est responsive et utilisable sur mobile

### Rappel technique

TanStack Svelte Virtual · Svelte 5 runes · Skeleton UI · Paraglide JS (i18n) · Keyboard events · Smooth scroll API

---

# Phase 5 — Classement & NBA Avancé

## T12 · Algorithmes de classement et badges de rang

### Objectif

Implémenter les deux modèles de classement indépendants (Foot et Basket) avec les badges de rang visuels. C'est la fonctionnalité qui donne du sens aux scores : sans classement, les matchs sont sans enjeu.

### Portée

- **Modèle Foot — classement manuel (tri à 2 niveaux)** :
  - Critère principal : points DESC (le plus de points en premier).
  - Critère secondaire : goal average DESC (la meilleure différence en premier).
  - Égalités : ordre de grille préservé (tri stable).
  - Déclenché manuellement par le bouton « Classement ! » (visible uniquement pour les tournois Foot).
  - Le résultat du tri est persisté (le tableau de grille est réordonné).
- **Modèle Basket — classement automatique (tri à 5 niveaux)** :
  - Appliqué automatiquement à chaque rendu de la grille (non persisté).
  - Pour Basket, NBA, NFL, Rugby.
  - Priorités : win% DESC → wins DESC → losses ASC → scored DESC → conceded ASC.
- **Agrégation des données Basket** (indépendante du TeamRow, recalculée à chaque rendu) :
  - `winGames` : nombre de matchs DONE où l'équipe a marqué plus que l'adversaire.
  - `looseGames` : nombre de matchs DONE où l'équipe a marqué moins que l'adversaire.
  - `winGamesPercent` : `Math.round(winGames / (winGames + looseGames) × 100)`. **Si 0 matchs complétés : afficher 0, pas NaN** (correction du bug connu).
  - `scoredPoints` : somme des scores de l'équipe dans tous les matchs DONE.
  - `concededPoints` : somme des scores adverses dans tous les matchs DONE.
  - `scheduledMatchs` : depuis TeamRow (tous matchs, tous statuts).
- **Gestion des matchs nuls (Basket/NBA/NFL/Rugby)** :
  - En cas d'égalité de score : le visiteur est crédité d'une victoire, l'hôte d'une défaite.
- **Badges de rang** :
  - Calculés selon le tri TeamRow à 2 niveaux (points, goal average), quel que soit le sport.
  - Position : côté droit pour l'hôte, côté gauche pour le visiteur (layout inversé).
  - Design :
    - 1er : dégradé or (#FFD700 → #B8860B), bordure Light Goldenrod.
    - 2e : dégradé argent (#E8E8E8 → #A0A0A0), bordure blanche.
    - 3e : dégradé bronze (#CD7F32 → #8B4513), bordure Light Goldenrod.
    - 4e+ : bleu clair (#E0F2FE → #7DD3FC), bordure blanche.
  - Taille : 28×28px, circulars.
  - Pas de gestion des égalités : rangs séquentiels basés sur la position dans le tableau.
- **Bouton « Classement ! »** : Visible uniquement sur la page de détail du tournoi de type Foot. Trie la grille et persiste le nouvel ordre.

### Dépendances

T10 (les scores des matchs doivent exister pour calculer les classements).

### Critères d'acceptation

- [ ] Le bouton « Classement ! » apparaît uniquement pour les tournois Foot et trie la grille par points puis goal average
- [ ] Le tri Foot persiste le nouvel ordre dans la grille
- [ ] La grille Basket/NBA/NFL/Rugby se trie automatiquement par les 5 critères
- [ ] Les données Basket (winGames, looseGames, winGamesPercent, scoredPoints, concededPoints) sont calculées correctement
- [ ] Le pourcentage de victoire affiche 0 (et non NaN) quand aucune équipe n'a de match complété
- [ ] En cas de score égal pour Basket/NBA/NFL/Rugby, le visiteur est crédité gagnant
- [ ] Les badges de rang s'affichent sur les tuiles d'équipe des matchs avec le bon dégradé (or, argent, bronze, bleu)
- [ ] Les badges sont positionnés correctement (droite hôte, gauche visiteur)
- [ ] Les rangs sont calculés selon le modèle TeamRow (points + goal average)
- [ ] Tous les labels sont internationalisés (FR/EN)

### Rappel technique

Svelte 5 runes (`$derived()`, `$effect()`) · TypeScript strict · Skeleton UI · Paraglide JS (i18n)

---

## T13 · Génération de calendrier NBA — 82 matchs

### Objectif

Permettre la génération automatique de l'ensemble des matchs manquants pour une saison NBA complète de 82 matchs par équipe. C'est la fonctionnalité signature du mode NBA qui différencie ce sport des autres.

### Portée

- **Bouton « Generate All Missing ({count}) »** :
  - Visible uniquement pour les tournois de type NBA sur la page Match.
  - Affiche le nombre de matchs restants à générer.
  - Au clic : dialogue de confirmation « Generate {count} matches to complete the season? ».
  - Si confirmé : exécution de l'algorithme de génération.
  - Si annulé : aucune action.
- **Détection de saison complète** :
  - Quand toutes les équipes ont atteint 82 matchs : affichage de « Season Complete (82 games) ».
  - Les boutons « Nouveau match », « Auto-Match » et « Generate All Missing » sont désactivés.
- **Algorithme de génération — Greedy Rest-Based (Minimax)** :
  - **Constantes** : `NBA_MAX_GAMES_PER_TEAM = 82`, `NBA_MIN_TEAMS = 2`, `NBA_HOME_AWAY_BALANCE = 41`.
  - **Phase 1 — Initialisation** :
    - Fusion de la configuration avec les valeurs par défaut.
    - Calcul des statistiques d'équipe depuis les matchs existants : totalGames, homeGames, awayGames, remainingGames (= 82 − totalGames), gamesByOpponent.
    - Carte du dernier index de match par équipe (−1 si jamais apparu).
    - Alerte si une équipe dépasse déjà 82 matchs.
  - **Phase 2 — Boucle itérative** (plafond de sécurité : 82 × nombre d'équipes itérations) :
    - **Sélection de l'équipe primaire** : parmi les équipes avec remainingGames > 0, celle ayant le plus de matchs restants. Égalité : repos le plus élevé (repos = index courant − dernier index, ou ∞ si jamais apparu). Substitution si repos = 1 : chercher une alternative avec même remainingGames et repos > 1.
    - **Sélection de l'adversaire** :
      - Passe préférentielle : opposants avec remainingGames > 0, pas l'équipe primaire, repos ≠ 1.
      - Score : `10000 − (totalGamesBetween × 1000) + (remainingGames × 10) + restBonus`.
      - restBonus : −50000 si repos = 1 ; sinon +min(repos, 100).
      - Passe de fallback si aucun préférentiel : tous les opposants restants avec pénalité massive.
      - Aucun opposant → sortie de boucle.
    - **Assignation domicile/extérieur** : équipe avec le moins de matchs domicile = hôte. Égalité → équipe primaire = hôte.
    - **Création du match** : statut PENDING, score 0–0. Mise à jour des statistiques des deux équipes.
  - **Phase 3 — Résultat** : tableau des matchs générés, statistiques finales, avertissements accumulés (journalisés, pas affichés).
- **Validation pré-génération** :
  - Minimum 2 équipes requis.
  - Aucune équipe ne dépasse 82 matchs.
  - Au moins 2 équipes ont des matchs restants.
  - Si échec : dialogue d'alerte listant tous les avertissements, pas de génération.
- **Calcul du nombre de matchs manquants** : `Math.floor(somme(max(0, remainingGames)) / 2)`.
- **Propriétés d'équité** :
  - Équité de charge : équipe la plus chargée sélectionnée en premier.
  - Équité de repos : pénalité de −50 000 pour les apparitions consécutives.
  - Diversité des adversaires : −1 000 par confrontation antérieure.
  - Équilibre domicile/extérieur : assignation gloutonne basée sur les comptes courants.

### Dépendances

T9 (l'infrastructure de création de matchs doit exister).

### Critères d'acceptation

- [ ] Le bouton « Generate All Missing ({count}) » affiche le nombre correct de matchs manquants pour un tournoi NBA
- [ ] La confirmation est demandée avant la génération
- [ ] Après génération, les matchs sont créés en statut PENDING avec score 0–0
- [ ] Chaque équipe atteint exactement 82 matchs (ou le maximum possible)
- [ ] L'équilibre domicile/extérieur est respecté (proche de 41/41 par équipe)
- [ ] Les apparitions consécutives d'une même équipe sont évitées (pénalité repos)
- [ ] Les confrontations sont diversifiées (pas toujours les mêmes adversaires)
- [ ] La validation empêche la génération avec < 2 équipes ou équipes > 82 matchs
- [ ] Quand la saison est complète, « Season Complete (82 games) » s'affiche et les boutons de création sont désactivés
- [ ] Le compteur de matchs manquants se met à jour après chaque génération
- [ ] Tous les labels sont internationalisés

### Rappel technique

TypeScript strict · Svelte 5 runes · Skeleton UI (dialogs) · Paraglide JS (i18n)

---

# Phase 6 — Configuration & Multi-Sport

## T14 · Page Configuration

### Objectif

Livrer la page de paramètres de l'application permettant à l'utilisateur de contrôler le thème visuel et de gérer le cache des équipes. Cette page complète l'expérience utilisateur en offrant le contrôle sur les préférences.

### Portée

- **Page Configuration (`/config`)** :
  - Breadcrumb : ⚙ Config (courant, non cliquable).
  - Titre de page : « Configuration ».
- **Section Mode sombre** :
  - Label : « Mode sombre » avec icône 💡.
  - Interrupteur (toggle) reflétant l'état courant du thème.
  - Le basculement applique immédiatement le thème (déjà fonctionnel via T1, cette page en est l'interface utilisateur).
- **Séparateur** horizontal.
- **Section Cache des équipes** :
  - Titre : « Cache des équipes ».
  - Description : « Vide le cache des équipes si vous rencontrez des problèmes de recherche. »
  - Bouton « Vider le cache » (variante warning, icône poubelle).
  - **Pas de dialogue de confirmation** — vidange immédiate au clic.
  - Retour de succès : alerte verte « Le cache des équipes a été vidé. » auto-dismiss après 3 secondes.
- **Navigation en pied de page** :
  - 🏠 « Accueil » → `/home`
  - 🏆 « Tournois » → `/tournaments`
- **Design mobile-first**.

### Dépendances

T1 (le système de thème doit être en place, le routing fonctionnel).

### Critères d'acceptation

- [ ] La page affiche le toggle de mode sombre reflétant l'état courant
- [ ] Le basculement du toggle change immédiatement le thème de l'application
- [ ] Le bouton « Vider le cache » supprime le cache sans confirmation
- [ ] Après vidange du cache, l'alerte de succès s'affiche et disparaît après 3 secondes
- [ ] Les boutons de navigation redirigent correctement vers `/home` et `/tournaments`
- [ ] La page est responsive mobile-first
- [ ] Tous les labels sont internationalisés (FR/EN)

### Rappel technique

SvelteKit routing · Skeleton UI (toggle, alert, buttons) · Svelte 5 runes · Paraglide JS (i18n)

---

## T15 · Extensions multi-sport — Foot, Basket, NFL, Rugby

### Objectif

Étendre et valider le fonctionnement complet des 4 autres sports (Foot, Basket, NFL, Rugby) au-delà du NBA déjà opérationnel. Chaque sport doit fonctionner de bout en bout : création de tournoi, grille spécifique, scorer adapté, classement, matchs.

### Portée

Cette tâche s'assure que le moteur multi-sport (construit dès les fondations) fonctionne correctement pour chaque sport spécifique :

- **Football (Foot)** :
  - Grille par défaut avec colonnes : Points, Buts+, Buts−, Goal average, 📅.
  - Scorer commun : boutons +1/−1.
  - Bouton « Classement ! » visible et fonctionnel (tri manuel 2 niveaux).
  - Gestion des matchs nuls : chaque équipe reçoit 1 point (système 3/1/0).
  - Foot est le sport par défaut à la création de tournoi.
- **Basket** :
  - Grille Basket (même modèle que NBA) : %, J, G, P, +, −, 📅.
  - Scorer basket : +1/+2/+3 avec toggle Ajouter/Supprimer.
  - Pas de nul : en cas d'égalité, visiteur crédité gagnant.
  - Classement automatique 5 niveaux.
- **NFL** :
  - Grille Basket (même modèle que NBA).
  - Scorer rugby : +2/+3/+5 avec toggle Ajouter/Supprimer.
  - Pas de nul, même logique que Basket.
  - Classement automatique 5 niveaux.
- **Rugby** :
  - Grille Basket (même modèle que NBA).
  - Scorer rugby : +2/+3/+5 avec toggle Ajouter/Supprimer.
  - Pas de nul, même logique que Basket.
  - Classement automatique 5 niveaux.
- **Validation croisée par sport** :
  - Vérification que chaque sport fonctionne de bout en bout : création → grille → recherche d'équipes → matchs → scoring → classement.
  - Vérification que le dispatch des grilles, scorers et classements se fait correctement selon le type.
  - Vérification que les recherches d'équipes interrogent la bonne API par sport.
  - Vérification que les raccourcis et comportements spécifiques sont respectés (ex : bouton « Classement ! » Foot uniquement).
- **Ajustements et corrections** : tout comportement incorrect détecté lors de la validation croisée est corrigé dans cette tâche.

### Dépendances

T12 (les algorithmes de classement pour tous les sports doivent être implémentés).

### Critères d'acceptation

- [ ] Un tournoi Foot se crée avec le sport par défaut, affiche la grille avec colonnes Points/Buts+/Buts−/Goal avg
- [ ] Le scorer Foot (+1/−1) fonctionne et les nuls attribuent 1 point à chaque équipe
- [ ] Le bouton « Classement ! » est visible uniquement en Foot et trie la grille
- [ ] Un tournoi Basket affiche la grille Basket avec colonnes %/J/G/P/+/- et le scorer +1/+2/+3
- [ ] Un tournoi NFL affiche la grille Basket et le scorer +2/+3/+5
- [ ] Un tournoi Rugby affiche la grille Basket et le scorer +2/+3/+5
- [ ] La recherche d'équipes interroge la bonne API pour chaque sport
- [ ] Les classements automatiques (5 niveaux) fonctionnent pour Basket, NFL, Rugby
- [ ] Les 5 sports sont validés de bout en bout sans erreur
- [ ] Tous les labels sont internationalisés (FR/EN)

### Rappel technique

Svelte 5 runes · TypeScript strict · Paraglide JS (i18n) · API-Sports (multi-endpoints)

---

# Phase 7 — Synchronisation & Qualité

## T16 · Synchronisation API REST backend

### Objectif

Ajouter la synchronisation des données de tournois avec un serveur backend via l'API REST, avec un algorithme de fusion basé sur les timestamps. L'application continue de fonctionner entièrement en localStorage, le backend agit comme sauvegarde et source de synchronisation multi-appareil.

### Portée

- **Client API backend** :
  - Chargement : `GET /api/index.php/list/tournaments`.
  - Sauvegarde : `POST /api/index.php/store/tournaments` (collection complète envoyée en JSON body).
  - Le proxy de développement (`scripts/proxy.js`) redirige les appels `/api/*` vers `marius.click`.
- **Algorithme de fusion au démarrage** :
  1. Chargement concurrentiel depuis localStorage ET backend (les deux peuvent échouer).
  2. Comparaison des timestamps de collection — la **source la plus récente est primaire**.
  3. Fusion individuelle des tournois :
     - Pour chaque tournoi de la liste primaire, recherche d'une correspondance par `id` dans la liste secondaire.
     - Conservation de la version avec le **timestamp le plus élevé**.
     - Les tournois présents uniquement dans la liste secondaire sont **ignorés** (la suppression dans la source la plus récente est honorée).
  4. Le résultat est écrit dans les deux emplacements (localStorage + backend).
- **Cas de figure gérés** :
  - Les deux sources, localStorage plus récent → fusion avec localStorage primaire.
  - Les deux sources, backend plus récent → fusion avec backend primaire.
  - Backend uniquement → utilisation des données backend.
  - localStorage uniquement → utilisation des données locales.
  - Aucun des deux → liste de tournois vide.
- **Sauvegarde en fire-and-forget** :
  - Après chaque modification locale, sauvegarde en localStorage (synchrone) puis envoi au backend (asynchrone, fire-and-forget).
  - Un échec de sauvegarde backend est journalisé en console mais ne bloque pas l'utilisateur.
- **Séquence d'initialisation** :
  1. Au démarrage de l'application, chargement concurrentiel des données locales et backend.
  2. Application de l'algorithme de fusion.
  3. Persistance du résultat dans les deux emplacements.
  4. L'application attend la fin de l'initialisation avant d'accepter les interactions utilisateur.
- **Gestion des réponses backend** : Format « Procedure Pattern » (champs `procedure`, `data`, `error`, `debug`). `OK` = succès, toute autre valeur = erreur.

### Dépendances

T5 (le CRUD de tournois en localStorage doit être opérationnel).

### Critères d'acceptation

- [ ] Au démarrage, l'application charge les données depuis localStorage et backend en parallèle
- [ ] L'algorithme de fusion sélectionne correctement la source primaire (timestamp le plus récent)
- [ ] Les tournois individuels sont fusionnés en conservant la version avec le timestamp le plus élevé
- [ ] Les suppressions sont honorées (un tournoi absent de la source primaire n'est pas restauré)
- [ ] Le résultat de la fusion est persisté dans les deux emplacements
- [ ] Les sauvegardes backend s'exécutent en fire-and-forget sans bloquer l'UI
- [ ] Un échec backend est journalisé mais ne provoque pas d'erreur visible pour l'utilisateur
- [ ] L'application fonctionne correctement même si le backend est indisponible (localStorage seul)
- [ ] Tous les cas de figure (les deux sources, un seul, aucun) sont gérés correctement

### Rappel technique

TanStack Svelte Query (data fetching) · Svelte 5 runes · fetch API · localStorage · TypeScript strict

---

## T17 · Corrections de bugs et robustesse

### Objectif

Corriger les anomalies connues documentées dans les spécifications et renforcer la robustesse de l'application en traitant les cas limites identifiés. Cette tâche amène l'application à un niveau de qualité production-ready.

### Portée

- **Correction du bug NaN (C.1)** :
  - Quand une équipe a zéro match complété, `winGamesPercent = 0/0` produit NaN.
  - Correction : afficher 0 au lieu de NaN dans la grille et partout où le pourcentage est utilisé.
- **Amélioration — Modèles de classement duals (C.2)** :
  - Pour Basket/NBA/NFL/Rugby, deux systèmes de scoring coexistent (TeamRow 3-1-0 + Basket data W/L).
  - S'assurer que la documentation interne (code) est claire sur cette dualité.
  - Si pertinent, uniformiser l'affichage pour éviter la confusion utilisateur.
- **Nom de tournoi vide (C.5)** :
  - Actuellement, un nom vide peut être sauvé. Ajouter une validation minimale après création (au moins lors de l'édition inline) ou documenter ce comportement comme intentionnel.
- **Équipes dupliquées dans la grille (C.6)** :
  - Actuellement, la même équipe peut être assignée à plusieurs slots. Décision : soit ajouter un avertissement visuel, soit documenter ce comportement comme acceptable.
- **Statistiques préservées au changement d'équipe (C.7)** :
  - Quand une équipe est remplacée dans un slot, les stats existantes sont héritées par la nouvelle. Documenter ce comportement et, si pertinent, ajouter une option de reset.
- **Score par défaut 0 (C.8)** :
  - Les buts default à 0 si null/undefined. S'assurer que 0 et « pas de score » sont correctement distingués dans l'affichage.
- **Dérive domicile/extérieur NBA (C.9)** :
  - L'équilibre est heuristique, pas une contrainte stricte. Documenter cette limitation.
- **Collision d'UUID (C.10)** :
  - Pas de vérification de collision. Probabilité négligeable. Documenter.
- **Onglets multiples (C.11)** :
  - Chaque onglet maintient son état en mémoire. Les conflits sont résolus au prochain démarrage via le merge timestamp. Documenter ce comportement.
- **Correction typo (C.12)** :
  - S'assurer que « Accueil » est correctement orthographié partout (pas « Acceuil »).
- **Validation et accessibilité** :
  - Vérifier les navigations clavier sur tous les formulaires.
  - Ajouter les labels ARIA nécessaires sur les composants interactifs.
  - Vérifier les contrastes de couleurs en mode sombre et clair.

### Dépendances

T15 (toutes les fonctionnalités des 5 sports doivent être implémentées pour corriger les bugs liés).

### Critères d'acceptation

- [ ] Le pourcentage de victoire affiche toujours un nombre (0 minimum), jamais NaN
- [ ] La dualité des modèles de classement est documentée et claire dans le code
- [ ] Le comportement face aux noms vides est soit validé, soit documenté comme intentionnel
- [ ] La duplication d'équipes est soit signalée, soit documentée comme acceptable
- [ ] L'héritage de stats au changement d'équipe est documenté
- [ ] La typo « Accueil » est correcte partout
- [ ] Les navigations clavier fonctionnent sur tous les formulaires et dialogues
- [ ] Les contrastes de couleurs sont lisibles en mode sombre et clair
- [ ] Les comportements liés aux onglets multiples et à la dérive NBA sont documentés

### Rappel technique

TypeScript strict · Svelte 5 · Accessibility (ARIA) · Paraglide JS (i18n)

---

## T18 · Suite de tests unitaires

### Objectif

Couvrir par des tests unitaires les couches métier critiques de l'application : modèles de domaine, algorithmes de classement, calculs de scoring, génération de calendrier NBA et persistance. Cette suite garantit la non-régression lors des évolutions futures.

### Portée

- **Tests des modèles de domaine** :
  - Création de tournoi avec tous les types de sport.
  - Génération d'ID (unicité, plage de valeurs).
  - Structure de TeamRow et Match (valeurs par défaut, invariants).
- **Tests de la couche de persistance** :
  - CRUD localStorage : créer, lire, mettre à jour, supprimer des tournois.
  - Gestion du timestamp (mise à jour à chaque opération).
  - Gestion des données corrompues ou manquantes.
  - Gestion des paramètres applicatifs (thème, locale).
- **Tests des algorithmes de classement** :
  - Foot : tri à 2 niveaux (points DESC, goal avg DESC), stabilité sur égalités.
  - Basket : tri à 5 niveaux (win%, wins, losses, scored, conceded).
  - Calcul du pourcentage de victoire (cas NaN → 0).
  - Gestion des nuls (visiteur gagnant pour Basket/NBA/NFL/Rugby).
- **Tests du système de scoring** :
  - Scorers : Foot (+1/−1), Basket (+1/+2/+3), Rugby (+2/+3/+5).
  - Toggle Ajouter/Supprimer pour Basket et Rugby.
  - Bornes (pas de score négatif).
  - Système de points 3/1/0 (victoire, nul, défaite).
- **Tests du processus de recalcul complet** :
  - Reset de toutes les stats.
  - Rejeu de tous les matchs DONE.
  - Accumulation correcte des buts/points marqués et encaissés.
  - Calcul du goal average.
- **Tests de l'algorithme Auto-Match** :
  - Sélection de l'équipe avec le moins de matchs.
  - Sélection de l'adversaire avec le moins de confrontations.
  - Tiebreakers (ordre de grille).
  - Comportement avec < 2 équipes.
- **Tests de la génération de calendrier NBA** :
  - Validation pré-génération (min équipes, max 82 matchs).
  - Génération complète : chaque équipe atteint 82 matchs.
  - Équilibre domicile/extérieur (proche de 41/41).
  - Diversité des adversaires (pas toujours les mêmes).
  - Pénalité de repos (pas d'apparitions consécutives excessives).
  - Compteur de matchs manquants.
  - Comportement quand la saison est déjà complète.
- **Tests de la gestion de grille** :
  - Redimensionnement (augmentation, diminution, préservation des données).
  - Contraintes (min 2, max 32, step 2).
  - Réinitialisation complète.
- **Tests du Magic Fill-up NBA** :
  - Déduplication des équipes existantes.
  - Mélange aléatoire (Fisher-Yates).
  - Extension automatique de la grille.

### Dépendances

T17 (toutes les corrections et fonctionnalités doivent être finalisées pour des tests stables).

### Critères d'acceptation

- [ ] Tous les tests passent avec `vitest run`
- [ ] Les modèles de domaine sont couverts (création, validation, invariants)
- [ ] Le CRUD localStorage est couvert (y compris données corrompues)
- [ ] Les deux algorithmes de classement sont testés avec des scénarios variés (égalités, vide, scores extrêmes)
- [ ] Les 3 types de scorers sont testés (ajout, retrait, bornes)
- [ ] Le recalcul complet est testé (reset + rejeu)
- [ ] L'Auto-Match est testé avec ses tiebreakers
- [ ] La génération NBA est testée (validation, équilibre, diversité)
- [ ] La gestion de grille est testée (redimensionnement, contraintes)
- [ ] Le Magic Fill-up est testé (déduplication, mélange, extension)

### Rappel technique

Vitest · TypeScript strict · Svelte 5 (testable via Vitest)

---

# Chemin critique

Le chemin critique de l'application (séquence la plus longue déterminant la durée minimale) est le suivant :

```
T1 → T3 → T5 → T6 → T9 → T10 → T12 → T15 → T17 → T18
```

Ce chemin traverse la création du shell, les composants réutilisables, le CRUD tournoi, la grille, les matchs, le scoring, le classement, les extensions multi-sport, les corrections et les tests. Il représente **10 tâches séquentielles** sur 18 au total.

Les tâches hors chemin critique pouvant être parallélisées :
- **T2** peut être parallèle à T1 (pas de dépendance).
- **T4** peut être parallèle à T3 et T5 (dépend de T1 uniquement).
- **T7, T8** peuvent être parallélisées avec T9 (T9 dépend de T6, pas de T7/T8).
- **T11** peut être parallèle à T12 et T13.
- **T13** peut être parallèle à T10, T11, T12.
- **T14** peut être fait à tout moment après T1.
- **T16** peut être fait à tout moment après T5.

---

# Checklist globale de livraison

À l'issue des 18 tâches, l'application doit satisfaire les critères suivants :

| Critère | Validation |
|---------|-----------|
| Les 6 routes sont accessibles et fonctionnelles | `/home`, `/tournaments`, `/tournament/[id]`, `/match/[id]`, `/team-select/[teamId]/[teamType]`, `/config`, 404 |
| Les 5 sports sont entièrement jouables | Foot, Basket, NBA, NFL, Rugby — de bout en bout |
| Le NBA est complet | Magic fill-up, scoring +1/+2/+3, classement 5 niveaux, génération 82 matchs |
| La persistance fonctionne | localStorage + synchronisation backend avec merge timestamp |
| Le thème sombre/clair fonctionne | Détection OS, toggle manuel, persistance |
| L'i18n est complète | 66 clés FR/EN utilisées, aucun texte en dur |
| L'application est responsive | Mobile-first, testé smartphone, tablette, desktop |
| Le défilement virtuel fonctionne | Liste de 500+ matchs fluide |
| Les tests passent | Couverture des couches métier critiques |
| Les bugs connus sont corrigés | NaN win%, typo, edge cases documentés |

---

*Fin du Plan Macro d'Implémentation — ContestOrganizer*
