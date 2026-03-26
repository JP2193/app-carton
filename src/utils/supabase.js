import { supabase } from '../lib/supabase.js'

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

export async function asignarCarton(playlistId, nombreInvitado) {
  const { data, error } = await supabase.rpc('asignar_carton', {
    p_playlist_id: playlistId,
    p_nombre: nombreInvitado,
  })

  if (error) throw error
  return data ?? null
}
