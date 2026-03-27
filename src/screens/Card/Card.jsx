import BingoGrid from '../../components/BingoGrid/BingoGrid.jsx'
import floralImg from '../../../img/1.png'
import styles from './Card.module.css'

export default function Card({ data }) {
  const { cartonId, numero, tracks } = data

  return (
    <div className={styles.container}>
      <img src={floralImg} className={styles.floralTop} alt="" aria-hidden="true" />

      <header className={styles.header}>
        <span className={styles.numero}>#{numero}</span>
        <h1 className={styles.titulo}>♪ Bingo Musical</h1>
      </header>

      <main className={styles.main}>
        <BingoGrid tracks={tracks} cartonId={cartonId} />
      </main>
    </div>
  )
}
