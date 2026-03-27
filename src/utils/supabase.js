import { supabase } from '../lib/supabase.js'

export function normalizar(str = '') {
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

  const { data, error } = await supabase.rpc('asignar_carton', {
    p_playlist_id: playlistId,
    p_nombre: `${nombre} ${apellido}`,
    p_nombre_normalizado: identificador,
  })

  if (error) throw error
  const result = Array.isArray(data) ? data[0] : data
  return result ?? null
}

export async function getInvitados(playlistId) {
  const { data, error } = await supabase
    .from('invitados')
    .select('id, nombre, apellido')
    .eq('playlist_id', playlistId)
    .order('apellido', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function marcarInvitadoAsignado(invitadoId, playlistId) {
  const { data: inv, error } = await supabase
    .from('invitados')
    .select('id, nombre, apellido, carton_id, asignado_at, cartones(id, numero, track_ids)')
    .eq('id', invitadoId)
    .single()
  if (error) throw error
  if (!inv.carton_id) throw new Error('SIN_CARTON')
  if (inv.asignado_at) {
    const err = new Error('YA_ABIERTO')
    err.nombre = inv.nombre
    err.apellido = inv.apellido
    throw err
  }

  await supabase.rpc('marcar_invitado_asignado', { p_invitado_id: invitadoId })
  await supabase.from('invitados').update({ sesion_valida: true }).eq('id', invitadoId)

  const todosLosTracks = await getTracksDePlaylist(playlistId)
  const tracks = inv.cartones.track_ids
    .map((id) => todosLosTracks.find((t) => t.id === id))
    .filter(Boolean)

  return {
    invitadoId,
    cartonId: inv.carton_id,
    playlistId,
    nombre: `${inv.nombre} ${inv.apellido}`,
    numero: inv.cartones.numero,
    trackIds: inv.cartones.track_ids,
    tracks,
  }
}

export async function asignarCartonSobrante(playlistId) {
  const { data, error } = await supabase.rpc('asignar_carton_sobrante', {
    p_playlist_id: playlistId,
  })
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}
