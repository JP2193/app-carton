import BingoGrid from '../../components/BingoGrid/BingoGrid.jsx'
import FloralDivider from '../../components/FloralDivider/FloralDivider.jsx'
import styles from './Card.module.css'

export default function Card({ data }) {
  const { cartonId, nombre, numero, tracks } = data

  return (
    <div className={styles.container}>
      <FloralDivider position="top" />

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
        <FloralDivider position="bottom" />
        <span className={styles.footerText}>Tocá para tachar&nbsp;•&nbsp;Gritá BINGO 🎤</span>
      </footer>
    </div>
  )
}
