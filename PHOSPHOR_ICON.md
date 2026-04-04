# Phosphor Icons — Guide d'intégration

## Stack

- Vanilla JS/TS
- Tailwind CSS v4
- **pnpm**
- Tree-shaking requis (uniquement les icônes utilisées dans le bundle final)

---

## Package à installer

```bash
pnpm add @phosphor-icons/webcomponents
```

**Pourquoi `webcomponents` et pas `web` ?**
- `@phosphor-icons/web` = webfont (charge TOUS les icônes d'un poids en CSS/font, pas de tree-shaking possible, ~3MB si tout importé).
- `@phosphor-icons/webcomponents` = Web Components ES modules (chaque icône est un module individuel, **tree-shakable** nativement par les bundlers modernes).

---

## Installation & enregistrement

### 1. Installer le package

```bash
pnpm add @phosphor-icons/webcomponents
```

### 2. Enregistrer les Web Components

**IMPORTANT :** Chaque Web Component doit être enregistré explicitement via `customElements.define()` AVANT son utilisation dans le DOM.

#### Option A — Import individuel (RECOMMANDÉ — tree-shaking optimal)

```ts
// src/main.ts — racine de l'app
import "@phosphor-icons/webcomponents/PhHorse";
import "@phosphor-icons/webcomponents/PhHeart";
import "@phosphor-icons/webcomponents/PhBasketball";
import "@phosphor-icons/webcomponents/PhTrophy";
import "@phosphor-icons/webcomponents/PhUsers";
// ... un import par icône utilisée uniquement
```

Chaque import enregistre automatiquement le custom element correspondant. Aucun code additionnel nécessaire.

#### Option B — Import global (à éviter — bundle lourd)

```ts
// Importe TOUS les icônes (~gros bundle)
import "@phosphor-icons/webcomponents";
```

---

## Utilisation dans le HTML

### Nommage des éléments

| Nom de l'icône (PascalCase) | Balise HTML (kebab-case, prefix `ph-`) |
|---|---|
| `PhBasketball` | `<ph-basketball>` |
| `PhTrophy` | `<ph-trophy>` |
| `PhUsers` | `<ph-users>` |
| `PhHeart` | `<ph-heart>` |

### Exemples

```html
<!-- Usage basique -->
<ph-basketball></ph-basketball>

<!-- Avec attributs -->
<ph-heart weight="fill" color="crimson"></ph-heart>

<!-- Taille personnalisée -->
<ph-trophy size="48"></ph-trophy>

<!-- Miroir (utile en RTL) -->
<ph-arrow-right mirrored></ph-arrow-right>

<!-- Combiné avec Tailwind CSS -->
<ph-basketball class="w-6 h-6 text-orange-500"></ph-basketball>
<ph-trophy weight="fill" class="w-8 h-8"></ph-trophy>
```

---

## Attributs de style

| Attribut | Type | Valeurs | Défaut |
|---|---|---|---|
| `weight` | `string` | `"thin"` \| `"light"` \| `"regular"` \| `"bold"` \| `"fill"` \| `"duotone"` | `"regular"` |
| `color` | `string` | Toute couleur CSS (`hex`, `rgb`, `hsl`, `currentColor`, nom) | `"currentColor"` |
| `size` | `number \| string` | `24`, `"32"`, `"2rem"`, `"100%"` | `24` (px implicites) |
| `mirrored` | `boolean` | Présent ou absent | `false` |

### Bonnes pratiques avec Tailwind v4

```html
<!-- Utiliser Tailwind pour la taille et la couleur -->
<ph-basketball weight="duotone" class="w-5 h-5 text-primary"></ph-basketball>

<!-- Couleur inline si besoin dynamique -->
<ph-heart weight="fill" style="color: var(--color-danger)"></ph-heart>
```

> **⚠️ Attention :** Ne pas override `font-family`, `font-weight`, `font-style`, `font-variant` ou `text-transform` sur les éléments Phosphor, cela peut casser le rendu. Les pseudos `::before` et `::after` (utilisés par duotone) ne doivent pas non plus être réécrits.

---

## Pattern recommandé : Module centralisé d'icônes

Créer un fichier dédié pour regrouser tous les imports d'icônes :

```ts
// src/icons.ts
// Liste centralisée de toutes les icônes Phosphor utilisées dans l'app
// Chaque import enregistre un Web Component automatiquement

// Navigation & UI
import "@phosphor-icons/webcomponents/PhHamburger";
import "@phosphor-icons/webcomponents/PhX";
import "@phosphor-icons/webcomponents/PhCaretDown";
import "@phosphor-icons/webcomponents/PhMagnifyingGlass";

// Basketball
import "@phosphor-icons/webcomponents/PhBasketball";
import "@phosphor-icons/webcomponents/PhTrophy";
import "@phosphor-icons/webcomponents/PhWhistle";

// Actions & Feedback
import "@phosphor-icons/webcomponents/PhHeart";
import "@phosphor-icons/webcomponents/PhShare";
import "@phosphor-icons/webcomponents/PhBookmarkSimple";
import "@phosphor-icons/webcomponents/PhInfo";
import "@phosphor-icons/webcomponents/PhWarning";
import "@phosphor-icons/webcomponents/PhCheckCircle";

// Import global une seule fois dans le point d'entrée
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _icons = true; // side-effect only imports above
```

```ts
// src/main.ts
import "./icons"; // Enregistre tous les custom elements au démarrage
```

---

## Comment trouver un icône

1. Aller sur **https://phosphoricons.com**
2. Rechercher par mot-clé (ex: "basketball", "trophy", "timer")
3. Noter le nom en **PascalCase** (ex: `PhBasketball`)
4. Convertir en balise : `PhBasketball` → `<ph-basketball>`

---

## Ajout rapide d'un nouvel icône

1. Trouver l'icône sur phosphoricons.com
2. Ajouter l'import dans `src/icons.ts` :
   ```ts
   import "@phosphor-icons/webcomponents/PhNewIcon";
   ```
3. Utiliser dans le HTML : `<ph-new-icon></ph-new-icon>`
4. C'est tout — le bundler ne gardera que cet icône dans le bundle final.

---

## Icônes basket populaires

| Icône | Tag | Usage |
|---|---|---|
| `PhBasketball` | `<ph-basketball>` | Thème principal |
| `PhTrophy` | `<ph-trophy>` | Victoires, récompenses |
| `PhWhistle` | `<ph-whistle>` | Arbitre, match |
| `PhMapPin` | `<ph-map-pin>` | Lieu, salle, terrain |
| `PhTimer` | `<ph-timer>` | Chrono, temps de jeu |
| `PhNumberCircleEight` | `<ph-number-circle-eight>` | Numéros de maillot |
| `PhMedal` | `<ph-medal>` | Podium, classement |
| `PhSneaker` | `<ph-sneaker>` | Chaussures, gear |

---

## Résumé des commandes

```bash
# Installation
pnpm add @phosphor-icons/webcomponents

# Version du package
pnpm list @phosphor-icons/webcomponents
```

## Références

- Docs webcomponents : https://github.com/phosphor-icons/webcomponents
- Catalogue : https://phosphoricons.com
- Package npm : https://www.npmjs.com/package/@phosphor-icons/webcomponents
