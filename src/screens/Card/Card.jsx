import floralImg from '../../../img/1.png'
import styles from './Card.module.css'

export default function Card({ data, onVerCarton }) {
  const { nombre } = data

  return (
    <div className={styles.container}>
      <img src={floralImg} className={styles.floralTop} alt="" aria-hidden="true" />

      <div className={styles.content}>
        <h1 className={styles.titulo}>♪ Bingo Musical</h1>
        <p className={styles.subtitulo}>Clara &amp; Javier</p>

        <div className={styles.mensaje}>
          <p className={styles.hola}>¡Hola, {nombre}!</p>
          <p className={styles.info}>Tu cartón está listo.</p>
          <p className={styles.espera}>
            El juego empieza cuando<br />el DJ lo indique 🎵
          </p>
        </div>

        <button className={styles.btn} onClick={onVerCarton}>
          Ver mi cartón
        </button>
      </div>
    </div>
  )
}
