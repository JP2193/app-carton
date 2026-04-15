import { useState, useEffect } from 'react'
import BingoCell from '../BingoCell/BingoCell.jsx'
import styles from './BingoGrid.module.css'

// Dado un track count, devuelve la cantidad de columnas más legible para mobile.
// Cubre todos los productos posibles con cols 2-4 y filas 2-5.
function colsFromTrackCount(count) {
  const map = {
    4:  2,  // 2×2
    6:  3,  // 3×2
    8:  4,  // 4×2
    9:  3,  // 3×3
    10: 2,  // 2×5
    12: 3,  // 3×4
    15: 3,  // 3×5
    16: 4,  // 4×4
    20: 4,  // 4×5
  }
  return map[count] ?? 3
}

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

  const cols = colsFromTrackCount(tracks.length)
  const rows = Math.ceil(tracks.length / cols)
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  }

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
