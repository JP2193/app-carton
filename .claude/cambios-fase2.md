# CAMBIOS FASE 2 — Control del juego en tiempo real

---

# PARTE A — App Admin (repo bingo-musical)

## Nueva sección en Tab "Evento": "Conducir el juego"

Agregar dos sub-pestañas dentro del tab Evento:
- **"Canciones"** → control de toggles (lo nuevo)
- **"Ranking"** → tabla de progreso (lo nuevo)
- **"Cartones"** → lo que ya existe (estado del evento)

---

### Sub-pestaña "Canciones"

Lista de todas las canciones de la playlist activa.
Cada fila tiene:
- Nombre del tema + artista
- Toggle ON/OFF a la derecha

**Al activar toggle (ON):**
```js
// INSERT en canciones_cantadas
await supabase
  .from('canciones_cantadas')
  .insert({ playlist_id, track_id })
```

**Al desactivar toggle (OFF):**
```js
// DELETE de canciones_cantadas
await supabase
  .from('canciones_cantadas')
  .delete()
  .eq('playlist_id', playlist_id)
  .eq('track_id', track_id)
```

**Al montar la pantalla:**
```js
// Cargar estado actual — cuáles ya están activas
const { data } = await supabase
  .from('canciones_cantadas')
  .select('track_id')
  .eq('playlist_id', playlist_id)
// Inicializar toggles según este estado
```

**Contador en el header de la sección:**
- Texto: `12 de 36 canciones sonaron`
- Se actualiza al cambiar cualquier toggle

**Botón "Resetear juego":**
- DELETE de todos los registros de `canciones_cantadas` para esa playlist
- Pide confirmación antes de ejecutar
- Todos los toggles vuelven a OFF

---

### Sub-pestaña "Ranking"

Tabla que se refresca cada 10 segundos (o botón "Actualizar"):

| Posición | Invitado | Canciones | Progreso |
|---|---|---|---|
| 🥇 1 | Juan Pérez | 13/15 | ████████░░ |
| 2 | María García | 11/15 | ███████░░░ |
| ... | ... | ... | ... |

**Query para calcular el ranking:**
```js
// 1. Traer canciones activas
const { data: cantadas } = await supabase
  .from('canciones_cantadas')
  .select('track_id')
  .eq('playlist_id', playlistId)

const trackIdsCantados = new Set(cantadas.map(c => c.track_id))

// 2. Traer todos los cartones entregados
const { data: cartones } = await supabase
  .from('cartones')
  .select('numero, nombre_invitado, track_ids')
  .eq('playlist_id', playlistId)
  .eq('entregado', true)

// 3. Calcular progreso de cada cartón en el frontend
const ranking = cartones.map(c => {
  const trackIds = c.track_ids // array de spotify IDs
  const tachadas = trackIds.filter(id => trackIdsCantados.has(id)).length
  return {
    numero: c.numero,
    nombre: c.nombre_invitado,
    tachadas,
    total: trackIds.length,
    pct: Math.round((tachadas / trackIds.length) * 100)
  }
}).sort((a, b) => b.tachadas - a.tachadas)
```

**Destacar ganadores:**
- Si `tachadas === total` → fila en verde + badge "BINGO 🎉"
- Mostrar hora en que completó (si se guarda — ver nota abajo)

---

# PARTE B — Web del Invitado (repo bingo-invitado)

## 1. Nuevo diseño del cartón — pantalla completa

### Card.jsx — cambios visuales

**Eliminar completamente:**
- Header con nombre del invitado
- Número de cartón
- Footer con instrucciones
- Decoración floral (FloralDivider)
- Cualquier padding/margin exterior

**El grid ocupa el 100% de la pantalla:**
```css
.card-screen {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.bingo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  width: 100vw;
  height: 100vh;
  gap: 0;
}
```

**Cada celda ocupa su porción exacta de pantalla:**
```css
.celda {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  background: #2a2a2a;        /* gris oscuro — estado inicial */
  border: 0.5px solid #1a1a1a; /* separador sutil entre celdas */
  transition: background 0.6s ease;
  overflow: hidden;
}

.celda.activa {
  background: #4a7c59;        /* verde suave */
}

.cname {
  font-family: 'Jost', sans-serif;
  font-weight: 500;
  font-size: clamp(0.7rem, 3vw, 1rem);
  color: #f0ece2;
  line-height: 1.2;
  margin-bottom: 4px;
}

.cartist {
  font-family: 'Jost', sans-serif;
  font-weight: 300;
  font-size: clamp(0.55rem, 2.2vw, 0.75rem);
  color: rgba(240, 236, 226, 0.6);
  line-height: 1.1;
}

.celda.activa .cname  { color: #ffffff; }
.celda.activa .cartist { color: rgba(255,255,255,0.75); }
```

---

## 2. Animación de pulso al activarse

```css
@keyframes pulso {
  0%   { background: #4a7c59; transform: scale(1); }
  25%  { background: #6aaa7a; transform: scale(1.04); }
  50%  { background: #4a7c59; transform: scale(1); }
  75%  { background: #6aaa7a; transform: scale(1.02); }
  100% { background: #4a7c59; transform: scale(1); }
}

.celda.activando {
  animation: pulso 0.8s ease forwards;
}
```

**En el componente — detectar cuándo una celda recién se activa:**
```js
// Guardar set de track_ids activos previos
// Al recibir nuevos datos: comparar
// Si un track_id pasó de inactivo a activo → agregar clase 'activando' por 800ms
useEffect(() => {
  const recienActivados = nuevosActivos.filter(id => !prevActivosRef.current.has(id))
  recienActivados.forEach(id => {
    setActivando(prev => new Set([...prev, id]))
    setTimeout(() => {
      setActivando(prev => { const s = new Set(prev); s.delete(id); return s })
    }, 800)
  })
  prevActivosRef.current = new Set(nuevosActivos)
}, [nuevosActivos])
```

---

## 3. Polling cada 5 segundos

```js
// hooks/useCancionesCantadas.js
export function useCancionesCantadas(playlistId) {
  const [cantadas, setCantadas] = useState(new Set())

  useEffect(() => {
    if (!playlistId) return

    const fetchCantadas = async () => {
      const { data } = await supabase
        .from('canciones_cantadas')
        .select('track_id')
        .eq('playlist_id', playlistId)
      if (data) setCantadas(new Set(data.map(c => c.track_id)))
    }

    fetchCantadas() // inmediato al montar
    const interval = setInterval(fetchCantadas, 5000)
    return () => clearInterval(interval)
  }, [playlistId])

  return cantadas
}
```

**Usar en Card.jsx:**
```js
const cantadas = useCancionesCantadas(playlistId)

// Cada celda recibe: activa = cantadas.has(track.id)
```

---

## 4. Eliminar lógica de tachado manual

**Borrar completamente:**
- `toggleTachada()` en storage.js
- `getTachadas()` / `guardarTachada()` en storage.js
- El estado `tachadas` en BingoGrid
- El `onClick` en BingoCell
- El `cursor: pointer` en celdas
- `touch-action: manipulation` (ya no se toca)

**En storage.js mantener solo:**
- `getCartonGuardado()`
- `guardarCarton()`
- `limpiarCarton()`

---

## 5. Pantalla de espera antes del juego

Agregar una pantalla intermedia entre la asignación del cartón y el juego:

```
┌─────────────────────────┐
│                         │
│   ♪ Bingo Musical       │
│   Clara & Javier        │
│                         │
│   Hola, Juan!           │
│   Tu cartón está listo  │
│                         │
│   El juego empieza      │
│   cuando el DJ          │
│   lo indique 🎵         │
│                         │
│   [Ver mi cartón]       │
│                         │
└─────────────────────────┘
```

- Con el diseño floral de la boda
- Botón "Ver mi cartón" → va al grid pantalla completa
- Una vez en el grid, no hay forma de volver (no hay botón atrás)

---

## Paleta de colores del grid

```css
:root {
  --celda-bg: #2a2a2a;           /* gris oscuro — inactiva */
  --celda-activa: #4a7c59;       /* verde suave — activa */
  --celda-activa-flash: #6aaa7a; /* verde brillante — destello */
  --celda-border: #1a1a1a;       /* separador entre celdas */
  --celda-text: #f0ece2;         /* texto principal */
  --celda-text-muted: rgba(240,236,226,0.6); /* artista */
}
```
