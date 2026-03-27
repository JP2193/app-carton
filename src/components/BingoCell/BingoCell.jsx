import styles from './BingoCell.module.css'

export default function BingoCell({ track, activa, activando }) {
  return (
    <div className={`${styles.celda} ${activa ? styles.activa : ''} ${activando ? styles.activando : ''}`}>
      <span className={styles.cname}>{track?.name ?? '—'}</span>
      <span className={styles.cartist}>{track?.artist ?? ''}</span>
    </div>
  )
}
