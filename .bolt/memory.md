# Project memory

## Product intent & audience

- Produit : **Dploy** — plateforme/lien avec le commerce de détail (« In store, Out Loud »).
- Logo déployé en deux endroits : en-tête (coin haut gauche) et cercle central (écran principal / préparation).

## Brand personality & voice

- Marque : **Dploy**, slogan « In store, Out Loud ».
- Ton : concis, orienté production, valeur perçue de qualité.

## Visual design & UX direction

- Stack visuelle : Tailwind CSS + React + Vite.
- Logo affiché dans : (1) en-tête haut gauche, (2) cercle central sur l'écran principal / écran de préparation.
- Problème résolu : le logo central était rendu via **masque CSS** (`mask-image`), qui en production laissait apparaître un **rectangle blanc** au lieu du logo.
- Solution appliquée : remplacer le masque CSS par le **fichier SVG directement** (`<img>` ou composant SVG inline) pour les deux emplacements.
- Préférence : utiliser lucide-react pour les icônes/logos selon `.bolt/prompt`.

## Decisions, constraints & rationale

- Ne pas utiliser de masque CSS pour afficher le logo — fragile en production, laisse un rectangle blanc visible sur capture.
- Toujours utiliser le SVG comme image directe pour garantir le rendu.
- Logo source : fichier SVG disponible dans le projet.
- Alias d'import `@/` → `src/` (voir `.bolt/prompt`).
- Pas de packages UI/icônes supplémentaires sauf demande explicite (voir `.bolt/prompt`).

## Open questions & assumptions

- Le SVG original contenait uniquement le slogan (« In store, Out Loud ») sans wordmark « Dploy » — confirmer si une version complète de la marque existe.
- Vérifier que tous les autres emplacements potentiels du logo utilisent aussi le SVG direct (pas de masque CSS résiduel).