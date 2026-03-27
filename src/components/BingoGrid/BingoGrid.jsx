import BingoCell from '../BingoCell/BingoCell.jsx'
import { useCancionesCantadas } from '../../hooks/useCancionesCantadas.js'
import styles from './BingoGrid.module.css'

export default function BingoGrid({ data, onSesionInvalida }) {
  const { tracks, playlistId, invitadoId } = data
  const { cantadas, recienActivadas } = useCancionesCantadas(playlistId, { invitadoId, onSesionInvalida })

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
          activa={cantadas.has(track.id)}
          activando={recienActivadas.has(track.id)}
        />
      ))}
    </div>
  )
}
