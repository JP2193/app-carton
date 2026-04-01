import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { limpiarCarton } from '../../utils/storage.js'
import styles from './SalirTab.module.css'

export default function SalirTab({ data, onSalir }) {
  const [confirmando, setConfirmando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmar() {
    setCargando(true)
    setError('')
    try {
      await supabase
        .from('invitados')
        .update({ asignado_at: null, sesion_valida: false })
        .eq('id', data.invitadoId)

      localStorage.removeItem(`tachadas_${data.cartonId}`)
      limpiarCarton()
      onSalir()
    } catch {
      setError('Error al salir. Intentá de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className={styles.container}>
      {!confirmando ? (
        <div className={styles.content}>
          <p className={styles.nombre}>{data.nombre}</p>
          <p className={styles.subtexto}>Cartón #{data.numero}</p>
          <button className={styles.btnSalir} onClick={() => setConfirmando(true)}>
            Terminar juego
          </button>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.icono}>⚠️</p>
          <p className={styles.pregunta}>¿Estás seguro?</p>
          <p className={styles.descripcion}>
            Tu cartón quedará libre y perderás todo tu progreso. Tendrás que volver a asignarte un cartón desde el inicio.
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.btns}>
            <button
              className={styles.btnCancelar}
              onClick={() => setConfirmando(false)}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={cargando}
            >
              {cargando ? '...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
