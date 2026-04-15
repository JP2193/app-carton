import { useState, useEffect } from 'react'
import BingoCell from '../BingoCell/BingoCell.jsx'
import styles from './BingoGrid.module.css'

function colsFromTrackCount(count) {
  if (count === 9)  return 3  // 3×3
  if (count === 12) return 4  // 4×3
  if (count === 15) return 5  // 5×3
  if (count === 16) return 4  // 4×4
  if (count === 20) return 5  // 5×4
  return 3                    // fallback
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
