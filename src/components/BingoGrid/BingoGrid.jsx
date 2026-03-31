import { useState, useEffect } from 'react'
import BingoCell from '../BingoCell/BingoCell.jsx'
import styles from './BingoGrid.module.css'

export default function BingoGrid({ data }) {
  const { tracks, cartonId } = data
  const storageKey = `tachadas_${cartonId}`

  const [tachadas, setTachadas] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...tachadas]))
  }, [tachadas, storageKey])

  function toggleTachada(trackId) {
    setTachadas((prev) => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  const is4x4 = tracks.length === 16
  const gridStyle = is4x4
    ? { gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }
    : { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(5, 1fr)' }

  return (
    <div className={styles.grid} style={gridStyle}>
      {tracks.map((track) => (
        <BingoCell
          key={track.id}
          track={track}
          tachada={tachadas.has(track.id)}
          onToggle={() => toggleTachada(track.id)}
        />
      ))}
    </div>
  )
}
