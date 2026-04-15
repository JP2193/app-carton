# CAMBIOS — App Admin · Gestión de invitados

## Sub-pestaña "Invitados" dentro del Tab Evento

---

## Sección 1 — Carga masiva

### Input
- Textarea donde se pega la lista en formato TSV:
  ```
  Laura	Desmaras Luzuriaga
  Garlo	Desmaras Luzuriaga
  Joan	Desmaras Luzuriaga
  ...
  ```
- Botón "Cargar lista"
- Si ya hay invitados cargados → confirmar antes de reemplazar:
  "Ya hay 120 invitados cargados. ¿Reemplazar la lista?"

### Al cargar
```js
function parsearLista(texto) {
  return texto
    .split('\n')
    .map(linea => linea.trim())
    .filter(Boolean)
    .map(linea => {
      const [nombre, apellido] = linea.split('\t')
      return {
        nombre: nombre?.trim(),
        apellido: apellido?.trim(),
        nombre_normalizado: normalizar(`${nombre} ${apellido}`)
      }
    })
    .filter(inv => inv.nombre && inv.apellido)
}

// INSERT batch en tabla invitados con playlist_id activa
// Mantener el orden original de la lista (para asignación ordenada)
// Guardar campo `orden` = índice en la lista (0, 1, 2...)
```

### Agregar campo `orden` a la tabla invitados
```sql
ALTER TABLE invitados ADD COLUMN orden INTEGER;
```

---

## Sección 2 — Pre-asignación masiva

- Botón "Pre-asignar cartones"
- Texto informativo: "Los cartones se asignan en el mismo orden que la lista"

### Lógica
```js
async function preasignarCartones() {
  // 1. Traer invitados ordenados por campo `orden` ASC
  const invitados = await supabase
    .from('invitados')
    .select('*')
    .eq('playlist_id', playlistId)
    .is('carton_id', null)
    .order('orden', { ascending: true })

  // 2. Traer cartones sin asignar ordenados por numero ASC
  //    (el primer invitado de la lista → primer cartón generado)
  const cartones = await supabase
    .from('cartones')
    .select('*')
    .eq('playlist_id', playlistId)
    .not('id', 'in', `(SELECT carton_id FROM invitados WHERE carton_id IS NOT NULL)`)
    .order('numero', { ascending: true })

  if (cartones.length < invitados.length) {
    throw new Error(`Faltan cartones: hay ${invitados.length} invitados y solo ${cartones.length} cartones disponibles`)
  }

  // 3. Asignar en orden: invitado[0] → carton[0], invitado[1] → carton[1]...
  for (let i = 0; i < invitados.length; i++) {
    await supabase.from('invitados')
      .update({ carton_id: cartones[i].id })
      .eq('id', invitados[i].id)

    await supabase.from('cartones')
      .update({
        entregado: false,           // NO marcar como entregado todavía
        nombre_invitado: `${invitados[i].nombre} ${invitados[i].apellido}`
      })
      .eq('id', cartones[i].id)
  }
}
// Nota: entregado=false hasta que el invitado escanee el QR y abra su cartón
// En ese momento se marca entregado=true via marcar_invitado_asignado()
```

- Mostrar progreso: "Asignando 45 de 120..."
- Al terminar: "✓ 120 invitados asignados · 20 cartones sobrantes disponibles"

---

## Sección 3 — Tabla de invitados (ver + gestión manual)

### Layout
Tabla con buscador arriba:

```
[🔍 buscar invitado...]

Nombre          Apellido              Cartón    Abrió    Acciones
──────────────────────────────────────────────────────────────────
Laura           Desmaras Luzuriaga    #001      ✓ Sí     [✏] [🗑]
Garlo           Desmaras Luzuriaga    #002      — No     [✏] [🗑]
Joan            Desmaras Luzuriaga    #003      — No     [✏] [🗑]
...
```

Columnas:
- **Nombre** + **Apellido**
- **Cartón** → número asignado (#001, #002...)
- **Abrió** → si `asignado_at` tiene valor → "✓ Sí" en verde / "— No" en gris
- **Acciones** → botón editar + botón eliminar

---

## Operación: Cambiar cartón asignado

Al hacer clic en ✏ de un invitado:
- Se abre un modal inline (expandible en la misma fila)
- Muestra: "Cartón actual: #047"
- Dropdown con todos los cartones sobrantes disponibles: `#121, #122...`
- Botón "Guardar cambio"

```js
async function cambiarCarton(invitadoId, nuevoCartonId) {
  // 1. Liberar el cartón anterior
  const { data: inv } = await supabase
    .from('invitados')
    .select('carton_id')
    .eq('id', invitadoId)
    .single()

  if (inv.carton_id) {
    await supabase.from('cartones')
      .update({ nombre_invitado: null })
      .eq('id', inv.carton_id)
  }

  // 2. Asignar el nuevo cartón
  await supabase.from('invitados')
    .update({ carton_id: nuevoCartonId })
    .eq('id', invitadoId)

  await supabase.from('cartones')
    .update({ nombre_invitado: `${inv.nombre} ${inv.apellido}` })
    .eq('id', nuevoCartonId)
}
```

---

## Operación: Agregar invitado manualmente

Botón "+ Agregar invitado" arriba de la tabla.

Formulario inline:
- Input: Nombre
- Input: Apellido
- Dropdown: Cartón sobrante (opcional — puede dejarse sin asignar)
- Botón "Agregar"

```js
async function agregarInvitado(nombre, apellido, cartonId = null) {
  const orden = await getMaxOrden(playlistId) + 1

  await supabase.from('invitados').insert({
    nombre,
    apellido,
    nombre_normalizado: normalizar(`${nombre} ${apellido}`),
    playlist_id: playlistId,
    carton_id: cartonId,
    orden
  })

  if (cartonId) {
    await supabase.from('cartones')
      .update({ nombre_invitado: `${nombre} ${apellido}` })
      .eq('id', cartonId)
  }
}
```

---

## Operación: Eliminar invitado

Al hacer clic en 🗑:
- Confirmar: "¿Eliminar a {nombre} {apellido}? Su cartón quedará disponible."
- Al confirmar:
  1. Liberar el cartón (nombre_invitado = null)
  2. DELETE del invitado

```js
async function eliminarInvitado(invitadoId) {
  const { data: inv } = await supabase
    .from('invitados')
    .select('carton_id, nombre, apellido')
    .eq('id', invitadoId)
    .single()

  if (inv.carton_id) {
    await supabase.from('cartones')
      .update({ nombre_invitado: null })
      .eq('id', inv.carton_id)
  }

  await supabase.from('invitados')
    .delete()
    .eq('id', invitadoId)
}
```

---

## Funciones en utils/supabaseEvento.js

```js
getInvitados(playlistId)
// SELECT * FROM invitados WHERE playlist_id = ? ORDER BY orden ASC

getCartonesSobrantes(playlistId)
// SELECT id, numero FROM cartones
// WHERE playlist_id = ?
// AND id NOT IN (SELECT carton_id FROM invitados WHERE carton_id IS NOT NULL AND playlist_id = ?)
// ORDER BY numero ASC

getMaxOrden(playlistId)
// SELECT MAX(orden) FROM invitados WHERE playlist_id = ?

insertInvitadosBatch(lista, playlistId)
// INSERT batch con orden preservado

preasignarCartones(playlistId)
// Ver lógica arriba

cambiarCarton(invitadoId, nuevoCartonId)
agregarInvitado(nombre, apellido, playlistId, cartonId)
eliminarInvitado(invitadoId)
```

---

## Resumen del estado de un invitado

| Estado | Condición | Badge |
|---|---|---|
| Sin cartón | `carton_id = null` | ⚪ Sin asignar |
| Asignado | `carton_id != null` y `asignado_at = null` | 🟡 Asignado |
| Abrió la app | `asignado_at != null` | 🟢 Activo |
