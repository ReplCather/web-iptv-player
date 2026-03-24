# Skills - Web IPTV Player

## Vue 3 & Composition API

### Composables
```javascript
// Structure d'un composable
export function useMyFeature() {
  const state = ref(initialValue);
  const computedValue = computed(() => /* ... */);
  
  function handleAction() {
    // logique
  }
  
  onMounted(() => { /* lifecycle */ });
  
  return { state, computedValue, handleAction };
}
```

### Composants
- Toujours utiliser `<script setup>`
- Définir props avec `defineProps`
- Emettre avec `defineEmits`

## IPTV & M3U

### Format M3U
```
#EXTM3U
#EXTINF:-1 tvg-name="Channel" tvg-logo="..." group-title="Group",Channel Name
http://stream.url/live.m3u8
```

### Parsing
- Module `tvlistsupport.js` gère le parsing
- Extraire: nom, logo, groupe, URL du flux
- Détecter TV vs Radio via keywords

## Video.js

### Configuration player
```javascript
player = videojs(videoEl, {
  controls: true,
  autoplay: false,
  fluid: true,
  responsive: true,
  sources: [{ src: url, type: 'application/x-mpegURL' }]
});
```

### Plugins
- `videojs-contrib-hls` pour HLS streaming
- Plugins customs dans `src/utils/videojsPlugins.js`

## Supabase Analytics

### Tables requises
```sql
-- user_sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  ip_address TEXT,
  device_fingerprint TEXT,
  os_name TEXT,
  browser_name TEXT,
  created_at TIMESTAMPTZ
);

-- user_page_views
CREATE TABLE user_page_views (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id),
  page_url TEXT,
  time_on_page INTEGER
);

-- user_events
CREATE TABLE user_events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id),
  event_name TEXT,
  event_data JSONB
);
```

### RLS Policies
```sql
-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: insert for authenticated or anon
CREATE POLICY "Allow insert" ON user_sessions
  FOR INSERT WITH CHECK (true);
```

## Performance

- Cache playlists en localStorage (1h expiration)
- Lazy loading des composants
- Debounce sur recherche
- Video.js fluid responsive

## Debugging

```javascript
// Activer logs tracking
localStorage.setItem('debug', 'tracking:*');

// Logs dans console
console.log('[v0] Message');
```
