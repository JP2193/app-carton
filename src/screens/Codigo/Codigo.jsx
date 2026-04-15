import { useState, useEffect } from 'react'
import { validarCodigoEvento } from '../../utils/supabase.js'
import styles from './Codigo.module.css'

export default function Codigo({ onCodigoValido, codigoInicial }) {
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Auto-ingresar si viene un código desde la URL
  useEffect(() => {
    if (codigoInicial) {
      setCodigo(codigoInicial)
      handleIngresar(codigoInicial)
    }
  }, [])

  async function handleIngresar(valorOverride) {
    const id = (valorOverride ?? codigo).trim()
    if (!id) { setError('Ingresá el código del evento.'); return }
    setCargando(true)
    setError('')
    try {
      const resultado = await validarCodigoEvento(id)
      if (!resultado) {
        setError('Código no válido o evento no disponible. Verificá con el organizador.')
        return
      }
      onCodigoValido(resultado)
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
