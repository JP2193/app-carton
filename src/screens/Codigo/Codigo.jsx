import { useState, useEffect } from 'react'
import { validarCodigoEvento } from '../../utils/supabase.js'
import styles from './Codigo.module.css'

export default function Codigo({ onCodigoValido }) {
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Soporte para link directo: ?e=PLAYLIST_ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get('e')
    if (e) {
      setCodigo(e)
      handleIngresar(e)
    }
  }, [])

  async function handleIngresar(valorOverride) {
    const id = (valorOverride ?? codigo).trim()
    if (!id) { setError('Ingresá el código del evento.'); return }
    setCargando(true)
    setError('')
    try {
      const playlistId = await validarCodigoEvento(id)
      if (!playlistId) {
        setError('Código no válido o evento no disponible. Verificá con el organizador.')
        return
      }
      onCodigoValido(playlistId)
    } catch {
      setError('Error de conexión. Verificá el WiFi e intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>BINGO MUSICAL</h1>
        <p className={styles.label}>Código del evento</p>
        <input
          className={styles.input}
          type="text"
          placeholder="Pegá o escribí el código..."
          value={codigo}
          onChange={(e) => { setCodigo(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleIngresar()}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={cargando}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.btn}
          onClick={() => handleIngresar()}
          disabled={cargando || !codigo.trim()}
        >
          {cargando ? <span className={styles.spinner} /> : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}
