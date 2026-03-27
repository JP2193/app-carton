import BingoGrid from '../../components/BingoGrid/BingoGrid.jsx'
import floralImg from '../../../img/1.png'
import styles from './Card.module.css'

export default function Card({ data }) {
  const { cartonId, nombre, numero, tracks } = data

  return (
    <div className={styles.container}>
      <img src={floralImg} className={styles.floralTop} alt="" aria-hidden="true" />

      <header className={styles.header}>
        <span className={styles.logo}>♪ Bingo Musical · Clara &amp; Javier</span>
        <p className={styles.fecha}>11 de Abril de 2026</p>
        <h1 className={styles.greeting}>¡Hola, {nombre}!</h1>
        <p className={styles.numero}>Cartón #{numero}</p>
      </header>

      <main className={styles.main}>
        <BingoGrid tracks={tracks} cartonId={cartonId} />
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerText}>Tocá para tachar&nbsp;•&nbsp;Gritá BINGO 🎤</span>
      </footer>
    </div>
  )
}
