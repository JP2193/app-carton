import { useState } from 'react'
import BingoCell from '../BingoCell/BingoCell.jsx'
import { getTachadas, toggleTachada } from '../../utils/storage.js'
import styles from './BingoGrid.module.css'

export default function BingoGrid({ tracks, cartonId }) {
  const [tachadas, setTachadas] = useState(() => getTachadas(cartonId))

  function handleTocar(index) {
    const nuevas = toggleTachada(cartonId, index)
    setTachadas([...nuevas])
  }

  return (
    <div className={styles.grid}>
      {tracks.map((track, i) => (
        <BingoCell
          key={i}
          track={track}
          tachada={tachadas.includes(i)}
          onTocar={() => handleTocar(i)}
        />
      ))}
    </div>
  )
}
