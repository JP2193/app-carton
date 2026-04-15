# CAMBIOS — Web del Invitado (sobre versión existente)

## 1. Grilla: de 4×4 a 3×5

- `grid-template-columns: repeat(3, 1fr)` en BingoGrid
- Cada cartón tiene 15 tracks (no 16)
- Actualizar validación mínima de tracks: `tracks.length >= 15`

---

## 2. Identificación: de solo nombre a nombre + apellido

### Welcome.jsx
- Reemplazar el input de nombre único por **dos inputs**:
  - `Nombre` (texto, mínimo 2 caracteres)
  - `Apellido` (texto, mínimo 2 caracteres)
- El identificador que se usa en todo el sistema es: `nombre + ' ' + apellido`

### Normalización obligatoria antes de comparar
```js
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .trim()
}
// "María García" === "maria garcia" → mismo cartón
```

### Lógica de asignación (utils/supabase.js)
Cambiar el flujo de `asignarCarton()`:

```js
async function asignarCarton(nombre, apellido) {
  const identificador = normalizar(`${nombre} ${apellido}`)

  // 1. Buscar en Supabase si ya existe un cartón para ese nombre
  const { data: existente } = await supabase
    .from('cartones')
    .select('id, numero, track_ids')
    .eq('nombre_normalizado', identificador)  // nuevo campo en la tabla
    .single()

  if (existente) {
    // Ya tiene cartón → devolver el mismo siempre
    return existente
  }

  // 2. Si no existe → asignar el siguiente disponible via RPC
  return await supabase.rpc('asignar_carton', {
    p_playlist_id: playlistId,
    p_nombre: `${nombre} ${apellido}`,
    p_nombre_normalizado: identificador
  })
}
```

### Cambio en Supabase — agregar campo a la tabla cartones
```sql
ALTER TABLE cartones ADD COLUMN nombre_normalizado TEXT;
CREATE INDEX idx_cartones_nombre ON cartones (nombre_normalizado);
```

### Actualizar función RPC asignar_carton
Agregar el campo `nombre_normalizado` al UPDATE:
```sql
UPDATE cartones SET
  entregado = TRUE,
  nombre_invitado = p_nombre,
  nombre_normalizado = p_nombre_normalizado,
  entregado_at = NOW()
WHERE id = v_carton_id;
```

### localStorage
- Guardar también `{ nombre, apellido }` junto al cartón
- Al volver a la app: si hay cartón en localStorage → ir directo al cartón sin pedir datos
- Si no hay localStorage → mostrar Welcome con los dos inputs

---

## 3. Celda tachada: cruz en vez de línea diagonal

Reemplazar el `::after` actual por **dos pseudo-elementos** que forman una cruz:

```css
.celda.tachada::before,
.celda.tachada::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* Diagonal \ */
.celda.tachada::before {
  background: linear-gradient(
    to bottom right,
    transparent calc(50% - 1.5px),
    var(--tachada-line) calc(50% - 1.5px),
    var(--tachada-line) calc(50% + 1.5px),
    transparent calc(50% + 1.5px)
  );
}

/* Diagonal / */
.celda.tachada::after {
  background: linear-gradient(
    to bottom left,
    transparent calc(50% - 1.5px),
    var(--tachada-line) calc(50% - 1.5px),
    var(--tachada-line) calc(50% + 1.5px),
    transparent calc(50% + 1.5px)
  );
}
```

---

## 4. Diseño — estética Clara & Javier

### Referencia visual
- Sitio de la boda: https://ldesmaras3.wixsite.com/clarayjavier
- Invitación: flores acuarela en tonos verde oliva, beige y arena. Tipografía serif espaciada. Fondo blanco roto. Dorado/arena como acento.

### Paleta de colores — actualizar variables CSS
```css
:root {
  --bg: #fdfaf5;                    /* blanco roto cálido */
  --surface: #ffffff;
  --border: #dfd0b9;
  --text: #3d2b1f;                  /* marrón oscuro */
  --muted: #9e8a72;                 /* beige grisáceo */
  --accent: #b8935a;                /* dorado arena */
  --accent-light: rgba(184,147,90,0.12);
  --tachada-bg: rgba(184,147,90,0.08);
  --tachada-line: #b8935a;          /* cruz dorada */
  --olive: #7a8c6e;                 /* verde oliva de las hojas */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Jost', sans-serif;
}
```

### Google Fonts — agregar al index.html
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### Header de la app
- Texto: `♪ Bingo Musical · Clara & Javier`
- Fuente: Cormorant Garamond, italic, tamaño grande
- Color: `--text`
- Debajo: `11 de Abril de 2026` en Jost, tamaño pequeño, color `--muted`

### Decoración floral (CSS/SVG — sin imágenes externas)
Crear un componente `<FloralDivider />` que genere hojas acuarela con SVG inline.
Usar en:
- **Arriba del header** → ramo de hojas que cae desde arriba, tonos `--olive` y `--accent` con opacidad 0.6–0.8
- **Abajo del footer** → espejo del de arriba

```jsx
// FloralDivider.jsx
// SVG con ramas y hojas orgánicas en tonos:
// - Verde oliva: #7a8c6e / #9aab8a
// - Beige arena: #c4a882 / #b8935a
// - Marrón claro: #a08060
// Opacidades variadas (0.5 a 0.9) para efecto acuarela
// width: 100%, height: ~120px
// Variante: position="top" → hojas caen hacia abajo
//           position="bottom" → hojas suben hacia arriba (transform: scaleY(-1))
```

### Pantalla Welcome
- Fondo `--bg`
- FloralDivider arriba
- Título `♪ Bingo Musical` en Cormorant Garamond italic grande
- Subtítulo `Clara & Javier · 11 de Abril de 2026` en Jost 300
- Separador: línea fina dorada con hojitas SVG mínimas a los costados
- Inputs: borde fino `--border`, sin border-radius agresivo (4px máximo), foco en `--accent`
- Botón: fondo `--text`, texto `--bg`, sin border-radius, letra espaciada

### Pantalla Cartón
- Header compacto: nombre del invitado en Cormorant Garamond italic
- Número de cartón: Jost, pequeño, `--muted`
- Grid 3×5: celdas con borde `--border`, fondo blanco, sin border-radius agresivo
- Nombre del tema: Jost 500, tamaño `clamp(0.7rem, 3vw, 0.9rem)`
- Artista: Jost 300, `--muted`, tamaño `clamp(0.6rem, 2.5vw, 0.75rem)`
- Celda tachada: fondo `--tachada-bg` + cruz dorada + texto opacity 0.35
- Footer fijo: FloralDivider bottom + texto instrucciones en Jost pequeño

### Animación al tachar
```css
.celda {
  transition: background 0.2s ease;
}
/* Al tachar: scale rápido para feedback táctil */
.celda:active {
  transform: scale(0.96);
}
```

---

## 5. Responsive mobile

- Grid ocupa `min(96vw, 440px)` centrado
- Celdas: `aspect-ratio: 1 / 1`
- `touch-action: manipulation` en cada celda (elimina delay 300ms iOS/Android)
- Inputs en Welcome: `font-size: 16px` mínimo (evita zoom automático en iOS)
- Footer fijo con `padding-bottom: env(safe-area-inset-bottom)` para iPhone con notch

---

## 6. Bugs resueltos en esta versión

| Bug | Solución implementada |
|---|---|
| Doble toque genera dos cartones | Botón se deshabilita al primer toque, se rehabilita solo si hay error |
| Mismo celular, dos personas | Dos inputs nombre+apellido, cada uno busca su propio cartón en Supabase |
| Borró el caché / cambió de browser | Busca por `nombre_normalizado` en Supabase → siempre recupera el mismo cartón |
| Tildes en el nombre | `normalizar()` quita tildes y pasa a minúsculas antes de comparar |
| Race condition dos invitados simultáneos | `FOR UPDATE SKIP LOCKED` en la función RPC de Supabase |
| Sin cartones disponibles | ErrorScreen con mensaje claro |
