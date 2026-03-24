# Web IPTV Player - Instructions pour agents

## Stack technique
- **Framework**: Vue 3 (Composition API)
- **Build tool**: Vite 4.x
- **Styles**: CSS natif (pas de préprocesseur)
- **Player**: Video.js 8.x avec videojs-contrib-hls
- **HTTP Client**: Axios
- **Analytics**: Supabase (optionnel)

## Structure du projet
```
src/
├── api/           # Services API (translate)
├── assets/        # Assets statiques (logo SVG)
├── components/    # Composants Vue
│   ├── Nav.vue              # Navigation
│   ├── EPGModal.vue         # Guide programmes
│   ├── Settings.vue         # Paramètres
│   └── AnalyticsDashboard.vue # Dashboard analytics
├── composables/   # Composition API
│   ├── useCountry.js       # Gestion pays
│   ├── usePlaylist.js      # Chargement playlists
│   ├── useRouter.js        # Routage
│   └── useTracking.js      # Tracking analytics
├── config/
│   ├── constants.js        # Constantes (protocoles HTTP, keywords radio)
│   └── countries.js        # Configuration pays
├── i18n/
│   └── messages.js         # Traductions FR/EN
├── services/
│   ├── playlistService.js  # Parsing M3U
│   ├── epgService.js       # Chargement EPG
│   ├── cacheService.js     # Cache localStorage
│   └── trackingService.js  # Analytics Supabase
├── utils/
│   ├── geolocation.js      # Géolocalisation
│   ├── translateHelper.js  # Traduction
│   ├── tvlistsupport.js    # Parser playlists
│   └── videojsPlugins.js   # Plugins Video.js
├── views/
│   ├── Index.vue           # Page principale
│   └── NotFound.vue        # 404
├── App.vue
├── main.js
└── style.css
```

## Commandes npm
```bash
npm run dev      # Développement (port 5173)
npm run build    # Build production
npm run preview  # Prévisualisation build
```

## Règles de développement

### Patterns Vue 3
- **Toujours** utiliser Composition API (`<script setup>`)
- Preferer `ref()` et `reactive()` sur les options API
- Extraire la logique partagée dans `composables/`

### Services
- Placer la logique métier dans `src/services/`
- Chaque service = un fichier avec fonctions exportées
- Ne pas mixer services et composants

### Variables d'environnement
- Préfixer `VITE_` pour les variables exposées au client
- Ne jamais exposer de secrets (API keys privées)
- Utiliser `.env.example` comme template

### Sécurité
- Valider les URLs de playlists (protocoles HTTP/HTTPS uniquement)
- Ne pas logger d'informations sensibles
- Timeout sur les requêtes externes (15s)

## APIs externes

| Service | Usage | Configuration |
|---------|-------|---------------|
| Supabase | Analytics | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| ipapi.co | Géolocalisation | Aucune (gratuit, sans clé) |
| Youdao | Traduction | Proxy interne Vite |

## Tests

Pas de framework de test configuré actuellement.

## Déploiement

Compatible avec:
- Vercel
- Netlify
- GitHub Pages
- Tout hébergement statique (dist/)
