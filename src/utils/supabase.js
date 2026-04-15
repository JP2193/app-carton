import { supabase } from '../lib/supabase.js'

export function normalizar(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export async function getNombreEvento(eventoId) {
  const { data, error } = await supabase.rpc('get_nombre_evento', {
    p_evento_id: eventoId,
  })
  if (error || !data) return ''
  return data
}

export async function validarCodigoEvento(codigo) {
  const { data, error } = await supabase.rpc('get_evento_por_codigo', {
    p_codigo: codigo.toLowerCase(),
  })
  if (error || !data || data.length === 0) return null
  const row = Array.isArray(data) ? data[0] : data
  return { eventoId: row.evento_id, playlistId: row.playlist_id }
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

export async function getInvitados(eventoId) {
  const { data, error } = await supabase
    .from('invitados')
    .select('id, nombre, apellido')
    .eq('evento_id', eventoId)
    .neq('oculto', true)
    .order('apellido', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function marcarInvitadoAsignado(invitadoId, eventoId, playlistId) {
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
    eventoId,
    cartonId: inv.carton_id,
    playlistId,
    nombre: `${inv.nombre} ${inv.apellido}`,
    numero: inv.cartones.numero,
    trackIds: inv.cartones.track_ids,
    tracks,
  }
}

export async function registrarSobrante(eventoId, playlistId, nombre, apellido) {
  const { data, error } = await supabase.rpc('registrar_sobrante', {
    p_evento_id: eventoId,
    p_nombre: nombre,
    p_apellido: apellido,
  })
  if (error) throw error
  const result = Array.isArray(data) ? data[0] : data
  if (!result) throw new Error('SIN_CARTONES')

  const todosLosTracks = await getTracksDePlaylist(playlistId)
  const tracks = result.track_ids
    .map((id) => todosLosTracks.find((t) => t.id === id))
    .filter(Boolean)

  return {
    invitadoId: result.invitado_id,
    eventoId,
    cartonId: result.carton_id,
    playlistId,
    nombre: `${nombre} ${apellido}`,
    tracks,
    trackIds: result.track_ids,
    numero: result.numero,
  }
}
