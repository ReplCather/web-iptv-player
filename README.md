# Web IPTV Player

Lecteur IPTV moderne et open-source basé sur Vue 3 et Video.js.

## Configuration

### Prérequis
- Node.js 18+
- npm 9+

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd web-iptv-player

# Installer les dépendances
npm install
```

### Variables d'environnement

Créer un fichier `.env` basé sur `.env.example`:

```bash
cp .env.example .env
```

Configurer Supabase pour l'analytics:

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer les valeurs dans Project Settings > API
3. Remplir les variables dans `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Scripts disponibles

```bash
# Développement (hot reload sur http://localhost:5173)
npm run dev

# Build production
npm run build

# Prévisualisation du build
npm run preview
```

## Fonctionnalités

- **Lecture IPTV**: Support M3U/HLS avec Video.js
- **EPG**: Guide des programmes interactif
- **Multi-pays**: Filtrage par région/géolocalisation
- **Analytics**: Tableau de bord avec tracking Supabase
- **Responsive**: Interface adaptative mobile/desktop

## Architecture

```
src/
├── api/           # Appels API (traduction)
├── assets/        # Images, icônes
├── components/    # Composants Vue réutilisables
├── composables/   # Logique partagée (Vue Composition API)
├── config/        # Constantes, configuration pays
├── i18n/          # Internationalisation
├── services/      # Services métier (playlist, epg, cache, tracking)
├── utils/         # Utilitaires (géolocalisation, plugins)
└── views/         # Pages principales
```

## Sécurité

- Variables d'environnement préfixées `VITE_` exposées au client (usage prévu)
- Aucune clé secrète côté client
- Proxy Vite pour les appels API

## Technologies

| Package | Version | Usage |
|---------|---------|-------|
| Vue | 3.2+ | Framework UI |
| Vite | 4.3+ | Build tool |
| Video.js | 8.3+ | Lecteur vidéo |
| Axios | 1.4+ | HTTP client |
| @supabase/supabase-js | - | Analytics (optionnel) |

## License

MIT
