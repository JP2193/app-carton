import BingoCell from '../BingoCell/BingoCell.jsx'
import { useCancionesCantadas } from '../../hooks/useCancionesCantadas.js'
import styles from './BingoGrid.module.css'

export default function BingoGrid({ data }) {
  const { tracks, playlistId } = data
  const { cantadas, recienActivadas } = useCancionesCantadas(playlistId)

  return (
    <div className={styles.grid}>
      {tracks.map((track) => (
        <BingoCell
          key={track.id}
          track={track}
          activa={cantadas.has(track.id)}
          activando={recienActivadas.has(track.id)}
        />
      ))}
    </div>
  )
}
