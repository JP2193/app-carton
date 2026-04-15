import styles from './Card.module.css'

export default function Card({ data, onVerCarton }) {
  const { nombre, numero } = data

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.titulo}>BINGO MUSICAL</h1>

        <div className={styles.mensaje}>
          <p className={styles.hola}>¡Hola, {nombre}!</p>
          <p className={styles.info}>Tu cartón #{numero} está listo.</p>
          <p className={styles.espera}>
            El juego empieza cuando<br />el organizador lo indique 🎵
          </p>
        </div>

        <button className={styles.btn} onClick={onVerCarton}>
          Ver mi cartón →
        </button>
      </div>
    </div>
  )
}
