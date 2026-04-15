# CAMBIOS — Web del Invitado · Pantalla de búsqueda

## Reemplazar pantalla Welcome actual

La pantalla actual (nombre + apellido en inputs) se reemplaza por
una pantalla de búsqueda en lista.

---

## Nueva pantalla: Welcome con buscador

### Layout

```
┌─────────────────────────────┐
│  [flores acuarela arriba]   │
│                             │
│  ♪ Bingo Musical            │
│  Clara & Javier             │
│  11 de Abril de 2026        │
│                             │
│  Buscá tu nombre:           │
│  [🔍 escribí tu nombre...] │
│                             │
│  > Laura Desmaras Luzuriaga │
│  > Garlo Desmaras Luzuriaga │
│  > Joan Desmaras Luzuriaga  │
│  ...                        │
│                             │
│  ¿No encontrás tu nombre?   │
│  Consultá al organizador  → │
│                             │
│  [flores acuarela abajo]    │
└─────────────────────────────┘
```

---

## Comportamiento del buscador

```js
// Filtrado en tiempo real mientras escribe
// Busca en nombre O apellido (cualquier campo)
// Normaliza el input para ignorar tildes

function filtrarInvitados(query, lista) {
  const q = normalizar(query)
  if (!q) return lista
  return lista.filter(inv =>
    normalizar(inv.nombre).includes(q) ||
    normalizar(inv.apellido).includes(q)
  )
}

function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
```

- Lista completa visible al entrar (sin filtro)
- Al escribir → se filtra en tiempo real
- Máximo 8 resultados visibles → scroll interno si hay más
- Si no hay resultados → mostrar mensaje + botón sobrante

---

## Al tocar un nombre de la lista

```js
async function seleccionarInvitado(invitado) {
  // 1. Verificar que no esté ya asignado en localStorage
  //    Si hay localStorage con mismo carton_id → ir directo al cartón
  const guardado = getCartonGuardado()
  if (guardado && guardado.invitadoId === invitado.id) {
    irAlCarton(guardado)
    return
  }

  // 2. Buscar en Supabase el cartón pre-asignado
  const { data } = await supabase
    .from('invitados')
    .select('id, nombre, apellido, carton_id, cartones(id, numero, track_ids)')
    .eq('id', invitado.id)
    .single()

  // 3. Marcar como asignado (registrar que abrió la app)
  await supabase.rpc('marcar_invitado_asignado', { p_invitado_id: invitado.id })

  // 4. Cargar tracks del cartón
  const playlist = await getPlaylistActiva()
  const tracks = await getTracksDePlaylist(playlist.id)
  const tracksDelCarton = data.cartones.track_ids.map(id =>
    tracks.find(t => t.id === id)
  ).filter(Boolean)

  // 5. Guardar en localStorage
  guardarCarton({
    invitadoId: invitado.id,
    cartonId: data.carton_id,
    numero: data.cartones.numero,
    trackIds: data.cartones.track_ids,
    tracks: tracksDelCarton
  })

  // 6. Ir a pantalla de espera → cartón
  irAlCarton()
}
```

---

## Botón "¿No encontrás tu nombre? →"

Siempre visible al final de la lista (fuera del área de scroll).

```js
async function asignarSobrante() {
  const playlistId = await getPlaylistActiva()

  // Llamar RPC que asigna un cartón no usado
  const { data } = await supabase.rpc('asignar_carton_sobrante', {
    p_playlist_id: playlistId
  })

  if (!data || data.length === 0) {
    mostrarError('No hay cartones disponibles. Consultá al organizador.')
    return
  }

  const carton = data[0]
  const tracks = await getTracksDePlaylist(playlistId)
  const tracksDelCarton = carton.track_ids.map(id =>
    tracks.find(t => t.id === id)
  ).filter(Boolean)

  guardarCarton({
    invitadoId: null,    // no está en la lista
    cartonId: carton.id,
    numero: carton.numero,
    trackIds: carton.track_ids,
    tracks: tracksDelCarton
  })

  irAlCarton()
}
```

Estilo del botón: discreto, texto pequeño, flecha → al lado.
No llamativo — es la opción de último recurso.

---

## Carga inicial de la lista

Al montar Welcome:
```js
// Traer todos los invitados de la playlist activa
// Ordenar alfabéticamente por apellido
const { data } = await supabase
  .from('invitados')
  .select('id, nombre, apellido')
  .eq('playlist_id', playlistId)
  .order('apellido', { ascending: true })
```

La lista completa se carga una sola vez al montar → se filtra localmente.
Sin requests adicionales mientras el usuario escribe.

---

## CSS — Lista de invitados

```css
.lista-wrap {
  max-height: 45vh;
  overflow-y: auto;
  border: 0.5px solid var(--border);
  border-radius: 4px;
  margin: 8px 0;
}

.invitado-item {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text);
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.invitado-item:last-child { border-bottom: none; }
.invitado-item:hover { background: var(--accent-light); }
.invitado-item:active { background: var(--accent-light); transform: scale(0.99); }

.invitado-nombre { font-weight: 500; }
.invitado-apellido { color: var(--muted); font-weight: 300; }

.btn-sobrante {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 12px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn-sobrante:hover { color: var(--text); }
```

---

## localStorage — nuevo campo

Agregar `invitadoId` al objeto guardado:

```js
// storage.js
guardarCarton({ invitadoId, cartonId, numero, trackIds, tracks })
// invitadoId puede ser null si usó el botón sobrante
```

Al montar la app:
```js
const guardado = getCartonGuardado()
if (guardado) {
  // Ya se identificó antes → ir directo al cartón
  // Sin pasar por Welcome
  setScreen('waiting') // pantalla de espera → luego cartón
}
```

---

## Manejo de casos especiales

| Situación | Comportamiento |
|---|---|
| Invitado ya se seleccionó antes | localStorage → va directo al cartón |
| Invitado no está en la lista | Botón sobrante discreto al final |
| No hay cartones sobrantes | "Consultá al organizador" sin botón |
| Error de conexión al seleccionar | Mensaje de error + botón reintentar |
| Lista vacía (no se cargaron invitados) | "El evento no está configurado. Consultá al organizador." |
