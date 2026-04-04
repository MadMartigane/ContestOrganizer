# Tailwind CSS v4 — Guide des bonnes pratiques & Création de thème

> **Ce document est une référence à destination d'un LLM** travaillant sur ce projet. Il décrit les bonnes pratiques, conventions et mécanismes de Thème/Tailwind CSS v4 applicables au codebase.

---

## Stack

- **Tailwind CSS v4** (pas de `tailwind.config.js`)
- Vanilla JS/TS
- **pnpm**
- Icônes : Phosphor Icons (`@phosphor-icons/webcomponents`)

---

## Principe fondamental de Tailwind v4

**En v4, tout est CSS-first.** Le fichier `tailwind.config.js` n'existe plus pour la configuration du thème. Tout se fait via la directive `@theme` dans un fichier CSS.

```
Avant (v3)                →  Maintenant (v4)
tailwind.config.js        →  @theme { ... } dans app.css
theme.extend.colors       →  --color-primary: oklch(...)
theme.extend.fontFamily   →  --font-sans: "Inter", sans-serif
```

---

## Structure du fichier CSS principal

```css
/* app.css — point d'entrée CSS */
@import "tailwindcss";
@import "./theme.css";          /* design tokens */
@import "./components.css";     /* composants custom (optionnel) */
```

```css
/* theme.css — tous les design tokens */
@theme {
  /* couleurs, polices, radius, ombres, animations... */
}
```

> **⚠️ `@theme` doit toujours être top-level.** Jamais imbriqué sous `:root`, `@media`, ou tout autre sélecteur.

---

## @theme — Les namespaces

Chaque namespace correspond à des utilitaires ou variantes disponibles dans le HTML :

| Namespace | Utilitaires générés | Exemple |
|---|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*` | `bg-primary`, `text-muted` |
| `--font-*` | `font-*` (famille) | `font-sans`, `font-heading` |
| `--text-*` | `text-*` (taille) | `text-sm`, `text-xl` |
| `--font-weight-*` | `font-*` (poids) | `font-bold` |
| `--tracking-*` | `tracking-*` (interlettrage) | `tracking-wide` |
| `--leading-*` | `leading-*` (hauteur de ligne) | `leading-tight` |
| `--breakpoint-*` | Variantes `sm:*`, `md:*`, etc. | `md:grid-cols-2` |
| `--container-*` | `max-w-*` + container queries `@sm:*` | `max-w-lg` |
| `--spacing-*` | Surcharge l'unité de base | `p-4`, `gap-2` |
| `--radius-*` | `rounded-*` | `rounded-xl` |
| `--shadow-*` | `shadow-*` | `shadow-lg`, `shadow-inner` |
| `--inset-shadow-*` | `inset-shadow-*` | `inset-shadow-sm` |
| `--drop-shadow-*` | `drop-shadow-*` | `drop-shadow-md` |
| `--blur-*` | `blur-*` | `blur-md` |
| `--perspective-*` | `perspective-*` | `perspective-near` |
| `--aspect-*` | `aspect-*` | `aspect-video` |
| `--ease-*` | `ease-*` (timing functions) | `ease-out` |
| `--animate-*` | `animate-*` | `animate-spin`, `animate-fade-in` |

---

## Couleurs — Format OKLCH

**Toujours utiliser OKLCH pour les couleurs custom.** C'est le format natif de Tailwind v4 et perceptuellement uniforme (les écarts de teinte sont visuellement cohérents).

```css
@theme {
  /* Mauvais — utilise le palette par défaut */
  --color-primary: #f97316;

  /* Bon — OKLCH */
  --color-primary: oklch(0.70 0.20 50);
}
```

### Palette sémantique recommandée

```css
@theme {
  /* === COULEURS DE MARQUE === */
  --color-primary: oklch(0.65 0.22 50);       /* Orange basket — couleur principale */
  --color-primary-foreground: oklch(0.98 0 0); /* Texte sur fond primary */
  --color-secondary: oklch(0.55 0.18 260);     /* Bleu complémentaire */

  /* === COULEURS SÉMANTIQUES === */
  --color-success: oklch(0.72 0.18 155);       /* Vert */
  --color-warning: oklch(0.78 0.18 85);        /* Jaune/ambre */
  --color-destructive: oklch(0.64 0.24 25);     /* Rouge erreurs */
  --color-info: oklch(0.72 0.14 230);          /* Bleu information */

  /* === SURFACES & TEXTES === */
  --color-background: oklch(0.98 0 0);         /* Fond de page */
  --color-surface: oklch(0.97 0 0);            /* Cartes, panels */
  --color-muted: oklch(0.92 0 0);              /* Éléments secondaires */
  --color-muted-foreground: oklch(0.45 0 0);   /* Texte secondaire */
  --color-border: oklch(0.87 0 0);             /* Bordures */

  /* === NEUTRES === */
  --color-accent: oklch(0.75 0.15 50);         /* Accents, highlights */
}
```

> **Règle :** chaque couleur principale doit avoir sa contrepartie `-foreground` (texte lisible dessus), `-muted` (version adoucie), ou `-foreground` selon le contexte.

### Palette à 11 niveaux (optionnel)

Pour des couleurs utilitaires type `orange-50` à `orange-950` :

```css
@theme {
  --color-orange-50: oklch(0.97 0.04 50);
  --color-orange-100: oklch(0.94 0.07 50);
  --color-orange-200: oklch(0.90 0.12 50);
  --color-orange-300: oklch(0.83 0.17 50);
  --color-orange-400: oklch(0.75 0.21 50);
  --color-orange-500: oklch(0.65 0.22 50);    /* base */
  --color-orange-600: oklch(0.57 0.22 50);
  --color-orange-700: oklch(0.49 0.20 50);
  --color-orange-800: oklch(0.44 0.17 50);
  --color-orange-900: oklch(0.39 0.13 50);
  --color-orange-950: oklch(0.27 0.09 50);
}
```

> **Utilise ces outils en ligne pour générer des palettes OKLCH :**
> - [richdevtools.com/generators/color-palette](https://richdevtools.com/generators/color-palette)
> - [oklch.com](https://oklch.com/)
> - [tailwindcolor.com](https://tailwindcolor.com/)

---

## Typographie

```css
@theme {
  /* Polices */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Si tu utilises des variables externes (ex: Google Fonts), utilise @theme inline */
  /* @theme inline {
    --font-sans: var(--font-inter);
  } */
}
```

### Échelle de tailles custom (optionnel)

```css
@theme {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
}
```

> **Note :** `--text-*--line-height` est généré automatiquement par Tailwind v4.

---

## Rayons, ombres, espacement

```css
@theme {
  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Ombres */
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-card-hover: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-elevated: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Espacement (défaut : 1 = 0.25rem = 4px) */
  /* --spacing: 4px;  ← décommenter pour changer l'unité de base */
}
```

> **⚠️ `--spacing` est l'unité qui définit la valeur de `1` dans les utilitaires.** Par défaut `1 = 0.25rem`. Si tu changes à `4px`, alors `p-4` = 16px (inchangé), mais `w-64` = 256px au lieu de 16rem. Sois prudent.

---

## Animations custom

Définir les keyframes et l'animation dans `@theme` :

```css
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-bounce-subtle: bounce-subtle 2s ease-in-out infinite;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(1rem); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(-2px); }
    50% { transform: translateY(2px); }
  }
}
```

> **⚠️** Les `@keyframes` définis dans `@theme` ne sont inclus dans le CSS final que si l'animation correspondante est utilisée. Pour des keyframes toujours présents, les définir **en dehors** de `@theme`.

---

## Remplacer vs étendre le thème par défaut

```css
/* ✅ EXTENDRE — ajoute tes variables, le thème par défaut reste */
@theme {
  --color-primary: oklch(0.65 0.22 50);
  --font-body: "Inter", sans-serif;
}

/* ⚠️ REMPLACER un namespace entier — supprime TOUTES les valeurs par défaut de ce namespace */
@theme {
  --color-*: initial;        /* supprime toute la palette Tailwind */
  --color-primary: oklch(0.65 0.22 50);
  --color-surface: oklch(0.98 0 0);
}

/* 🚨 REMPLACER TOUT le thème — clean slate */
@theme {
  --*: initial;
  --spacing: 4px;
  --font-body: "Inter", sans-serif;
  --color-orange: oklch(0.65 0.22 50);
}
```

> **Règle :** dans 95% des cas, utilise l'approche **extend** (définition directe sans `initial`). Ne remplace un namespace que si tu veux un contrôle total.

---

## Dark mode

```css
/* theme.css — variables par défaut (light) */
@theme {
  --color-background: oklch(0.98 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-text: oklch(0.15 0 0);
  --color-primary: oklch(0.65 0.22 50);
  --color-border: oklch(0.87 0 0);
}

/* app.css — override pour dark mode */
:root {
  --color-background: oklch(0.98 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-text: oklch(0.15 0 0);
  --color-border: oklch(0.87 0 0);
}

.dark {
  --color-background: oklch(0.12 0 0);
  --color-surface: oklch(0.18 0 0);
  --color-text: oklch(0.95 0 0);
  --color-border: oklch(0.30 0 0);
}
```

> **Conseil :** en v4, active le dark mode via `@variant dark` dans `@theme` ou utilise la classe `.dark` sur `<html>`. Les variables CSS dans `.dark` override automatiquement.

---

## Trois modes de @theme

| Mode | Syntaxe | Usage |
|---|---|---|
| **Défaut** | `@theme { ... }` | CSS variable générée + référencée dans les utilitaires |
| **Inline** | `@theme inline { ... }` | La **valeur** est injectée directement (évite problèmes de cascade) — utilise pour les fontes via `var()` |
| **Static** | `@theme static { ... }` | **Toutes** les variables générées même non utilisées — utile pour JS qui lit les variables au runtime |

```css
/* Exemple inline — nécessaire quand tu references une variable externe */
@theme inline {
  --font-sans: var(--font-inter, ui-sans-serif, system-ui, sans-serif);
}
```

---

## Bonnes pratiques — Règles absolues (LLM)

### ✅ FAIRE

1. **Toujours utiliser `@theme` en CSS** — jamais `tailwind.config.js` pour le thème
2. **Utiliser OKLCH** pour toutes les couleurs custom
3. **Utiliser des noms sémantiques** : `--color-primary`, `--color-surface`, `--color-muted` plutôt que `--color-orange-500`
4. **Définir les counterparts** : chaque `primary` a un `primary-foreground` pour le texte
5. **Grouper par catégorie** dans `theme.css` : couleurs → typo → radius → ombres → animations
6. **Utiliser `@theme inline`** quand une variable référence une autre via `var()`
7. **Générer toutes les nuances** (50-950) si la couleur est utilisée comme utilitaire
8. **Séparer le thème du reste** : `theme.css` pour les tokens, pas de logique CSS mélangée
9. **Utiliser les utilitaires Tailwind** en priorité, `@layer components` uniquement pour des patterns répétitifs
10. **Tester dans Tailwind Playground** : [play.tailwindcss.com](https://play.tailwindcss.com/)

### ❌ NE PAS FAIRE

1. **Ne jamais créer de `tailwind.config.js`** pour la configuration du thème (v4)
2. **Ne pas imbriquer `@theme`** sous `:root`, `@media`, ou tout sélecteur
3. **Ne pas utiliser HSL/HEX** pour les couleurs custom — utiliser OKLCH
4. **Ne pas override `font-family`, `font-weight`, `::before`, `::after`** sur les éléments `<ph-*>` (Phosphor Icons)
5. **Ne pas mélanger tokens sémantiques et couleurs brutes** dans `@theme`
6. **Ne pas changer `--spacing`** sans tester l'impact sur tous les utilitaires numériques
7. **Ne pas définir `--color-*: initial`** sans être sûr de vouloir supprimer toute la palette par défaut
8. **Ne pas utiliser `@apply`** sauf dans `@layer components` pour des patterns répétitifs
9. **Ne pas réécrire des utilitaires Tailwind existants** en custom CSS
10. **Ne pas hardcoder des couleurs en inline** : toujours passer par les variables du thème

---

## Utiliser les variables du thème

### Dans le HTML (utilitaires Tailwind)

```html
<!-- Les variables @theme sont automatiquement disponibles comme utilitaires -->
<div class="bg-primary text-primary-foreground rounded-xl shadow-card p-6">
  <h2 class="text-xl font-heading font-bold">Titre</h2>
  <p class="text-muted-foreground mt-2">Description...</p>
</div>
```

### Dans CSS custom (`@layer components`)

```css
@layer components {
  .card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing, 0.25rem) * 6; /* 1.5rem */
  }
}
```

### En arbitrary values

```html
<!-- Soustraire 1px du radius pour un inset border -->
<div class="relative rounded-xl">
  <div class="absolute inset-px rounded-[calc(var(--radius-xl)-1px)]">
    Content
  </div>
</div>
```

### En JavaScript

```ts
// Lire une variable CSS du thème
const style = getComputedStyle(document.documentElement);
const primaryColor = style.getPropertyValue('--color-primary').trim();

// Utiliser directement la variable CSS dans les styles
element.style.backgroundColor = 'var(--color-primary)';
```

---

## @theme inline — Quand et pourquoi

```css
/* ❌ SANS inline — le CSS output référence la variable */
@theme {
  --font-sans: var(--font-inter), sans-serif;
}
/* Résultat CSS : .font-sans { font-family: var(--font-sans); } */
/* Problème : si --font-sans n'est pas défini sur l'élément, ça peut ne pas cascader correctement */

/* ✅ AVEC inline — la valeur est injectée directement */
@theme inline {
  --font-sans: var(--font-inter), sans-serif;
}
/* Résultat CSS : .font-sans { font-family: var(--font-inter), sans-serif; } */
/* Correct : la valeur est directement résolue */
```

> **Règle d'or :** utilise `@theme inline` dès que tu références une variable CSS externe (Google Fonts, variable définie par JS, etc.).

---

## Structure recommandée du projet

```
src/
├── css/
│   ├── app.css          ← @import "tailwindcss" + imports
│   ├── theme.css        ← @theme { ... } (design tokens purs)
│   └── components.css   ← @layer components (patterns répétitifs)
├── js/
│   └── main.ts          ← Point d'entrée JS
└── ...
```

```css
/* app.css */
@import "tailwindcss";
@import "./theme.css";
@import "./components.css";
```

```css
/* theme.css */
@theme {
  /* === COULEURS DE MARQUE === */
  --color-primary: oklch(0.65 0.22 50);
  --color-primary-foreground: oklch(0.98 0 0);

  /* === TYPOGRAPHIE === */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* === RADIUS === */
  --radius-sm: 0.375rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* === OMBRES === */
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
}
```

---

## Phosphor Icons — Règles de style spécifiques

Les icônes Phosphor (`@phosphor-icons/webcomponents`) sont des Web Components qui utilisent `::before` et `::after` (pour duotone) pour injecter les glyphes.

```css
/* ✅ BON — utiliser Tailwind pour taille et couleur */
<ph-basketball class="w-6 h-6 text-primary"></ph-basketball>

/* ✅ BON — attributs natifs Phosphor */
<ph-heart weight="fill" color="crimson" size="32"></ph-heart>

/* ❌ MAUVAIS — override font-family qui casse le rendu */
.ph { font-family: "something-else"; }

/* ❌ MAUVAIS — override des pseudos éléments */
.ph::before { content: "x"; }
.ph-duotone::after { content: "y"; }
```

---

## Résumé des commandes

```bash
# Installer Tailwind CSS v4
pnpm add tailwindcss @tailwindcss/vite   # ou le plugin de ton bundler

# Vérifier la version
pnpm list tailwindcss
```

---

## Références

- Docs officielle Tailwind v4 — [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)
- Tailwind Playground — [play.tailwindcss.com](https://play.tailwindcss.com/)
- Générateur de palette OKLCH — [richdevtools.com/generators/color-palette](https://richdevtools.com/generators/color-palette)
- Explorateur de couleurs v4 — [tailwindcolor.com](https://tailwindcolor.com/)
- Phosphor Icons web — [github.com/phosphor-icons/web](https://github.com/phosphor-icons/web)
- Phosphor Icons webcomponents — [github.com/phosphor-icons/webcomponents](https://github.com/phosphor-icons/webcomponents)
