import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { getTracksDePlaylist } from '../../utils/supabase.js'
import styles from './CancionesTab.module.css'

export default function CancionesTab({ data }) {
  const { playlistId, trackIds } = data
  const enCartonSet = new Set(trackIds)

  const [ordenIds, setOrdenIds] = useState([])
  const [allTracks, setAllTracks] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getTracksDePlaylist(playlistId).then(setAllTracks).catch(() => {})
  }, [playlistId])

  useEffect(() => {
    async function fetchCantadas() {
      const { data: rows } = await supabase
        .from('canciones_cantadas')
        .select('track_id')
        .eq('playlist_id', playlistId)
      setOrdenIds(rows ? rows.map((r) => r.track_id) : [])
      setCargando(false)
    }
    fetchCantadas()
    const interval = setInterval(fetchCantadas, 5000)
    return () => clearInterval(interval)
  }, [playlistId])

  const canciones = ordenIds
    .map((id) => {
      const track = allTracks.find((t) => t.id === id)
      if (!track) return null
      return { ...track, enCarton: enCartonSet.has(id) }
    })
    .filter(Boolean)

  return (
    <div className={styles.container}>
      {cargando ? (
        <p className={styles.hint}>Esperando canciones...</p>
      ) : canciones.length === 0 ? (
        <p className={styles.hint}>Todavía no se cantó ninguna canción.</p>
      ) : (
        <ul className={styles.lista}>
          {canciones.map((c) => (
            <li key={c.id} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.nombre}>{c.name}</span>
                <span className={styles.artista}>{c.artist}</span>
              </div>
              {c.enCarton && <span className={styles.badge}>en cartón</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
