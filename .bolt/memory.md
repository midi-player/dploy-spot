# Project memory

## Product intent & audience

- Produit : **Dploy** — plateforme/lien avec le commerce de détail (« In store, Out Loud »).
- Logo déployé en en-tête (haut gauche) sur l'application.

## Brand personality & voice

- Marque : **Dploy**, slogan « In store, Out Loud ».
- Ton : concis, orienté production, valeur perçue de qualité.

## Visual design & UX direction

- Logo placé dans l'en-tête, coin haut gauche.
- Logo source : fichier SVG.
- Problème identifié : le fichier SVG actuel ne contient que le slogan « In store, Out Loud », pas le wordmark « Dploy » → impression de logo manquant en déploiement.
- Préférence : utiliser lucide-react pour les icônes/logos selon `.bolt/prompt`.
- Stack visuelle : Tailwind CSS + React + Vite.

## Decisions, constraints & rationale

- Le fichier logo est bien déployé (présent dans la version publiée) ; le problème vient du contenu du SVG, pas du chargement.
- Solution envisagée : remplacer le SVG par la version complète de la marque ou ajouter « Dploy » à côté du logo actuel.
- Alias d'import `@/` → `src/` (voir `.bolt/prompt`).
- Pas de packages UI/icônes supplémentaires sauf demande explicite (voir `.bolt/prompt`).

## Open questions & assumptions

- Faut-il créer un nouveau SVG incluant le wordmark « Dploy » + slogan, ou afficher le texte « Dploy » séparément à côté du logo existant ?
- Où placer le fichier SVG source exact dans `src/` ou `public/` ?
- Y a-t-il un fichier de marque officiel (version complète) à intégrer ?