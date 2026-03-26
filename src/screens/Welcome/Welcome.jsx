import { useState } from 'react'
import styles from './Welcome.module.css'

export default function Welcome({ onSubmit }) {
  const [nombre, setNombre] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = nombre.trim()
    if (trimmed.length < 2) return
    onSubmit(trimmed)
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.icon}>🎵</div>
        <h1 className={styles.title}>Bingo Musical</h1>
        <p className={styles.subtitle}>¡Escaneaste tu cartón para la fiesta!</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="¿Cómo te llamás?"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            autoFocus
            autoComplete="off"
            maxLength={40}
          />
          <button
            className={styles.button}
            type="submit"
            disabled={nombre.trim().length < 2}
          >
            Obtener mi cartón →
          </button>
        </form>
      </div>
    </div>
  )
}
