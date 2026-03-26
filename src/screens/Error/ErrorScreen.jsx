import styles from './ErrorScreen.module.css'

export default function ErrorScreen({ mensaje, onReintentar }) {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.icon}>😕</div>
        <h2 className={styles.title}>Algo salió mal</h2>
        <p className={styles.mensaje}>{mensaje}</p>
        <button className={styles.button} onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    </div>
  )
}
