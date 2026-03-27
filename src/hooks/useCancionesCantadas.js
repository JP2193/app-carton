import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

export function useCancionesCantadas(playlistId) {
  const [cantadas, setCantadas] = useState(new Set())
  const [recienActivadas, setRecienActivadas] = useState(new Set())
  const prevRef = useRef(new Set())

  useEffect(() => {
    if (!playlistId) return

    async function fetchCantadas() {
      const { data } = await supabase
        .from('canciones_cantadas')
        .select('track_id')
        .eq('playlist_id', playlistId)
      if (!data) return

      const nuevas = new Set(data.map((c) => c.track_id))
      const recien = [...nuevas].filter((id) => !prevRef.current.has(id))

      if (recien.length > 0) {
        setRecienActivadas((prev) => new Set([...prev, ...recien]))
        recien.forEach((id) => {
          setTimeout(() => {
            setRecienActivadas((prev) => {
              const s = new Set(prev)
              s.delete(id)
              return s
            })
          }, 800)
        })
      }

      prevRef.current = nuevas
      setCantadas(nuevas)
    }

    fetchCantadas()
    const interval = setInterval(fetchCantadas, 5000)
    return () => clearInterval(interval)
  }, [playlistId])

  return { cantadas, recienActivadas }
}
