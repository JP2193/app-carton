import styles from './BingoCell.module.css'

export default function BingoCell({ track, tachada, onTocar }) {
  return (
    <button
      className={`${styles.celda} ${tachada ? styles.tachada : ''}`}
      onClick={onTocar}
      type="button"
    >
      <span className={styles.nombre}>{track?.name ?? '—'}</span>
      <span className={styles.artista}>{track?.artist ?? ''}</span>
    </button>
  )
}
