import { useState } from 'react'
import floralImg from '../../../img/1.png'
import styles from './Welcome.module.css'

export default function Welcome({ onSubmit }) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const disabled = nombre.trim().length < 2 || apellido.trim().length < 2 || submitting

  function handleSubmit(e) {
    e.preventDefault()
    if (disabled) return
    setSubmitting(true)
    onSubmit({ nombre: nombre.trim(), apellido: apellido.trim() })
  }

  return (
    <div className={styles.container}>
      <img src={floralImg} className={styles.floralTop} alt="" aria-hidden="true" />
      <div className={styles.inner}>
        <h1 className={styles.title}>♪ Bingo Musical</h1>
        <p className={styles.subtitle}>Clara &amp; Javier · 11 de Abril de 2026</p>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <svg width="32" height="14" viewBox="0 0 32 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="6" cy="7" rx="5" ry="2.5" transform="rotate(-20 6 7)" fill="#7a8c6e" opacity="0.7"/>
            <ellipse cx="16" cy="5" rx="4" ry="2" fill="#b8935a" opacity="0.6"/>
            <ellipse cx="26" cy="7" rx="5" ry="2.5" transform="rotate(20 26 7)" fill="#7a8c6e" opacity="0.7"/>
          </svg>
          <span className={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ingresá tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              autoFocus
              autoComplete="given-name"
              maxLength={40}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellido</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ingresá tu apellido"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              autoComplete="family-name"
              maxLength={40}
            />
          </div>
          <button
            className={styles.button}
            type="submit"
            disabled={disabled}
          >
            Obtener mi cartón →
          </button>
        </form>
      </div>
    </div>
  )
}
