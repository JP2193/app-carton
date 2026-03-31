import styles from './BingoCell.module.css'

export default function BingoCell({ track, tachada, onToggle }) {
  return (
    <div
      className={`${styles.celda} ${tachada ? styles.tachada : ''}`}
      onClick={onToggle}
    >
      <span className={styles.cname}>{track?.name ?? '—'}</span>
      <span className={styles.cartist}>{track?.artist ?? ''}</span>
    </div>
  )
}
