import { supabase } from '../lib/supabase.js'

function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export async function getPlaylistActiva() {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'playlist_activa')
    .single()

  if (error) throw error
  return data?.value ?? null
}

export async function getTracksDePlaylist(playlistId) {
  const { data, error } = await supabase
    .from('playlists')
    .select('tracks')
    .eq('id', playlistId)
    .single()

  if (error) throw error
  return data?.tracks ?? []
}

export async function asignarCarton(playlistId, nombre, apellido) {
  const identificador = normalizar(`${nombre} ${apellido}`)

  // Si ya tiene cartón asignado, devolver el mismo siempre
  const { data: existente } = await supabase
    .from('cartones')
    .select('id, numero, track_ids')
    .eq('nombre_normalizado', identificador)
    .maybeSingle()

  if (existente) return existente

  // Asignar el siguiente disponible via RPC
  const { data, error } = await supabase.rpc('asignar_carton', {
    p_playlist_id: playlistId,
    p_nombre: `${nombre} ${apellido}`,
    p_nombre_normalizado: identificador,
  })

  if (error) throw error
  const result = Array.isArray(data) ? data[0] : data
  return result ?? null
}
