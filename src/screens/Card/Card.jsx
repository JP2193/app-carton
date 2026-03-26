import BingoGrid from '../../components/BingoGrid/BingoGrid.jsx'
import styles from './Card.module.css'

export default function Card({ data }) {
  const { cartonId, nombre, numero, tracks } = data

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>🎵 Bingo Musical</span>
        <h1 className={styles.greeting}>¡Hola, {nombre}!</h1>
        <p className={styles.numero}>Cartón #{numero}</p>
      </header>

      <main className={styles.main}>
        <BingoGrid tracks={tracks} cartonId={cartonId} />
      </main>

      <footer className={styles.footer}>
        <span>Tocá para tachar&nbsp;•&nbsp;Gritá BINGO 🎤</span>
      </footer>
    </div>
  )
}
