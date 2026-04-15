# PROMPT — Web del Invitado (repo nuevo)

## Contexto

Mini aplicación web **mobile-first** para los invitados de una boda.
El invitado escanea un QR → escribe su nombre → recibe su cartón de bingo musical único → tacha las celdas cuando el DJ pone el tema.

**Sin autenticación. Sin backend propio. Supabase + Vercel. Costo $0.**

---

## Stack

- **React + Vite** (JS puro, sin TypeScript)
- **@supabase/supabase-js** → única dependencia de datos
- **CSS Modules** por componente
- **Google Fonts**
- Sin librerías de UI externas
- Sin backend

---

## Variables de entorno (.env)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Estructura de archivos

```
/bingo-invitado/
├── index.html
├── vite.config.js
├── .env
├── src/
│   ├── main.jsx
│   ├── App.jsx                   → manejo de pantallas
│   ├── App.module.css
│   │
│   ├── lib/
│   │   └── supabase.js           → cliente Supabase con anon key
│   │
│   ├── screens/
│   │   ├── Welcome/
│   │   │   ├── Welcome.jsx       → bienvenida + input nombre
│   │   │   └── Welcome.module.css
│   │   ├── Loading/
│   │   │   ├── Loading.jsx       → cargando mientras asigna cartón
│   │   │   └── Loading.module.css
│   │   ├── Card/
│   │   │   ├── Card.jsx          → cartón interactivo
│   │   │   └── Card.module.css
│   │   └── Error/
│   │       ├── ErrorScreen.jsx   → pantalla de error con retry
│   │       └── ErrorScreen.module.css
│   │
│   ├── components/
│   │   ├── BingoGrid/
│   │   │   ├── BingoGrid.jsx
│   │   │   └── BingoGrid.module.css
│   │   └── BingoCell/
│   │       ├── BingoCell.jsx
│   │       └── BingoCell.module.css
│   │
│   └── utils/
│       ├── storage.js            → helpers de localStorage
│       └── supabase.js           → funciones de consulta
```

---

## Tablas de Supabase (solo lectura excepto update de cartones)

```
config     → key: 'playlist_activa', value: uuid de la playlist
playlists  → id (uuid), name (text), tracks (jsonb: [{id, name, artist, thumbnail}])
cartones   → id, numero, playlist_id, track_ids (jsonb: array de spotify IDs),
             nombre_invitado, entregado (bool), entregado_at
```

---

## Flujo de pantallas

### App.jsx — lógica de pantallas

```jsx
// Estados posibles: 'welcome' | 'loading' | 'card' | 'error'
// Al montar: checkLocalStorage()
//   → Si hay cartón guardado en localStorage → ir directo a 'card'
//   → Si no → mostrar 'welcome'
```

---

### Pantalla 1 — Welcome

- Logo o título: "🎵 Bingo Musical" en tipografía elegante
- Subtítulo: "¡Escaneaste tu cartón para la fiesta!"
- Input text: placeholder "¿Cómo te llamás?"
  - Mínimo 2 caracteres
  - Al presionar Enter o tocar el botón → continuar
- Botón "Obtener mi cartón →"
- Al hacer clic → setScreen('loading') → llamar asignarCarton(nombre)

---

### Pantalla 2 — Loading

- Animación simple (tres puntos pulsando o spinner)
- Texto: "Preparando tu cartón..."
- Se ejecuta asignarCarton() en background

---

### Pantalla 3 — Card

**Header:**
- "🎵 Bingo Musical" pequeño arriba
- "¡Hola, {nombre}!" en tipografía display
- "Cartón #{numero}" en texto muted

**Grid 4×4:**
- `<BingoGrid>` con 16 celdas
- Cada celda: nombre del tema (bold) + artista (muted)
- Al tocar → se tacha con animación
- Estado de tachadas en localStorage

**Footer fijo:**
- "Tocá para tachar • Gritá BINGO 🎤"

---

### Pantalla 4 — Error

- Ícono y mensaje claro según el error
- Botón "Reintentar"

---

## utils/storage.js

```js
const STORAGE_KEY = 'bingo_carton'
const TACHADAS_PREFIX = 'bingo_tachadas_'

getCartonGuardado()
// Retorna { cartonId, nombre, numero, trackIds, tracks } o null
// tracks = array completo de objetos { id, name, artist }

guardarCarton(data)
// Guarda { cartonId, nombre, numero, trackIds, tracks } en localStorage

getTachadas(cartonId)
// Retorna array de índices tachados [0, 3, 7...] o []

toggleTachada(cartonId, index)
// Agrega o quita el índice del array de tachadas
// Guarda en localStorage key: `bingo_tachadas_{cartonId}`

limpiarCarton()
// Elimina el cartón guardado (para testing)
```

---

## utils/supabase.js

```js
getPlaylistActiva()
// SELECT value FROM config WHERE key = 'playlist_activa'
// Devuelve playlist_id (string uuid)

getTracksDePlaylist(playlistId)
// SELECT tracks FROM playlists WHERE id = playlistId
// Devuelve array de objetos { id, name, artist, thumbnail }

asignarCarton(playlistId, nombreInvitado)
// Llama a la función RPC de Supabase:
// supabase.rpc('asignar_carton', {
//   p_playlist_id: playlistId,
//   p_nombre: nombreInvitado
// })
// Devuelve { id, numero, track_ids } o null si no hay cartones disponibles
// El FOR UPDATE SKIP LOCKED en la función SQL garantiza
// que dos invitados simultáneos nunca reciban el mismo cartón
```

---

## Flujo completo de asignarCarton() en App.jsx

```js
async function asignarCarton(nombre) {
  try {
    // 1. Obtener playlist activa
    const playlistId = await getPlaylistActiva()
    if (!playlistId) throw new Error('NO_PLAYLIST')

    // 2. Obtener todos los tracks de esa playlist
    const todosLosTracks = await getTracksDePlaylist(playlistId)

    // 3. Asignar cartón via RPC (con bloqueo atómico)
    const carton = await asignarCarton(playlistId, nombre)
    if (!carton) throw new Error('SIN_CARTONES')

    // 4. Resolver los tracks del cartón en orden
    // track_ids es array de spotify IDs en el orden exacto del grid
    const tracksDelCarton = carton.track_ids.map(id =>
      todosLosTracks.find(t => t.id === id)
    ).filter(Boolean)

    // 5. Guardar en localStorage
    guardarCarton({
      cartonId: carton.id,
      nombre,
      numero: carton.numero,
      trackIds: carton.track_ids,
      tracks: tracksDelCarton
    })

    // 6. Ir a pantalla del cartón
    setScreen('card')

  } catch (err) {
    if (err.message === 'SIN_CARTONES') {
      setError('Se agotaron los cartones 😅 Pedile uno al organizador')
    } else if (err.message === 'NO_PLAYLIST') {
      setError('El evento no está configurado todavía. Avisale al organizador.')
    } else {
      setError('Hubo un problema de conexión. Verificá el WiFi e intentá de nuevo.')
    }
    setScreen('error')
  }
}
```

---

## Componente BingoGrid

```jsx
// Props: tracks (array de 16 objetos), cartonId
// CSS Grid: grid-template-columns: repeat(4, 1fr)
// Inicializa tachadas desde localStorage via getTachadas(cartonId)
// Al tocar celda: toggleTachada(cartonId, index) → re-render
```

---

## Componente BingoCell

```jsx
// Props: track { name, artist }, tachada (bool), onTocar (fn)
// Sin thumbnail — solo texto
// Layout:
//   - Nombre del tema: bold, centrado, max 2 líneas, font-size clamp
//   - Artista: muted, 1 línea, font-size más pequeño
// Estado tachada:
//   - Overlay semitransparente dorado encima
//   - Línea diagonal gruesa (CSS ::after, rotate 45deg, ancho 100%, color dorado)
//   - Texto con opacity 0.4
// Animación al tocar: scale 0.95 → 1 en 150ms
// touch-action: manipulation (evita delay de 300ms en mobile)
```

---

## CSS — Diseño mobile-first

### Estética: elegante / boda

```css
:root {
  --bg: #fdfaf5;
  --surface: #ffffff;
  --border: #e8ddd0;
  --text: #3d2b1f;
  --muted: #9e8a72;
  --accent: #b8935a;
  --accent-light: rgba(184, 147, 90, 0.15);
  --tachada-line: #b8935a;
  --danger: #c0392b;
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Jost', sans-serif;
}
```

**Reglas:**
- **Cormorant Garamond** → "Bingo Musical", "¡Hola, {nombre}!", número de cartón
- **Jost** → nombres de temas, artistas, botones, footer
- Fondo cálido `#fdfaf5` — no blanco puro
- El grid ocupa 96vw máximo, centrado
- Celdas cuadradas: `aspect-ratio: 1 / 1`
- Border fino `1px solid var(--border)` en celdas
- Sin border-radius en celdas (máximo 2px)
- Touch targets mínimo 44px
- `font-size` de celdas: `clamp(0.65rem, 2.5vw, 0.85rem)` para nombre, `clamp(0.55rem, 2vw, 0.72rem)` para artista
- Footer fijo: `position: fixed; bottom: 0` con fondo `--bg` y borde superior
- `padding-bottom` del grid para que no quede tapado por el footer

**Animación de tachada:**
```css
.celda::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom right,
    transparent calc(50% - 1.5px),
    var(--tachada-line) calc(50% - 1.5px),
    var(--tachada-line) calc(50% + 1.5px),
    transparent calc(50% + 1.5px)
  );
}
```

---

## Manejo de casos especiales

| Situación | Comportamiento |
|---|---|
| Invitado vuelve a escanear | Detecta localStorage → va directo a su cartón sin pedir nombre |
| Sin cartones disponibles | ErrorScreen: "Se agotaron los cartones 😅" |
| Sin playlist activa | ErrorScreen: "El evento no está configurado todavía" |
| Error de red | ErrorScreen con botón Reintentar |
| Timeout Supabase (+10s) | ErrorScreen con botón Reintentar |

---

## Consideraciones técnicas críticas

- **FOR UPDATE SKIP LOCKED**: implementado en la función SQL `asignar_carton`. Garantiza asignación atómica aunque dos personas escaneen simultáneamente. La app llama `supabase.rpc('asignar_carton', {...})`.
- **localStorage como fuente de verdad del tachado**: nunca se guarda en Supabase. Si el invitado borra el caché, pierde las tachadas (aceptable para una boda).
- **Sin thumbnail**: las celdas muestran solo texto — más liviano, más rápido, sin problemas de CORS.
- **El orden de track_ids define el grid**: posición 0 = celda superior izquierda, posición 15 = celda inferior derecha.
- **anon key segura**: con RLS habilitado, la anon key solo puede leer config, playlists y cartones, y hacer update de cartones. No puede insertar ni eliminar.
- **touch-action: manipulation** en cada celda para eliminar el delay de 300ms en iOS/Android.

---

## Deploy en Vercel

1. Crear repo en GitHub: `bingo-invitado`
2. Conectar a Vercel
3. Agregar variables de entorno en Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → obtener URL final
5. Generar QR con esa URL (Google QR Generator, QR Code Monkey, etc.)

---

## Flujo completo del invitado

1. Escanea QR con el celular → se abre la web
2. Escribe su nombre → toca "Obtener mi cartón"
3. Pantalla de carga 1-2 segundos
4. Ve su cartón 4×4 con 16 temas personalizado con su nombre
5. El DJ pone un tema → toca la celda → línea dorada diagonal
6. Si cierra y vuelve a escanear → ve su mismo cartón con todo tachado
7. Completa una fila → grita BINGO 🎤
