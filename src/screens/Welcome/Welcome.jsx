import { useState, useEffect, useMemo } from 'react'
import floralImg from '../../../img/1.png'
import {
  getPlaylistActiva,
  getInvitados,
  marcarInvitadoAsignado,
  getTracksDePlaylist,
  asignarCartonSobrante,
  normalizar,
} from '../../utils/supabase.js'
import { getCartonGuardado } from '../../utils/storage.js'
import styles from './Welcome.module.css'

export default function Welcome({ onCartonListo }) {
  const [playlistId, setPlaylistId] = useState(null)
  const [invitados, setInvitados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [query, setQuery] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [seleccionandoId, setSeleccionandoId] = useState(null)
  const [errorSobrante, setErrorSobrante] = useState('')
  const [bloqueado, setBloqueado] = useState(null) // { nombre, apellido }

  useEffect(() => {
    async function init() {
      try {
        const pid = await getPlaylistActiva()
        if (!pid) {
          setErrorMsg('El evento no está configurado todavía. Consultá al organizador.')
          return
        }
        setPlaylistId(pid)
        const lista = await getInvitados(pid)
        setInvitados(lista)
      } catch {
        setErrorMsg('Error de conexión. Verificá el WiFi e intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    init()
  }, [])

  const filtrados = useMemo(() => {
    if (!query.trim()) return invitados
    const q = normalizar(query)
    return invitados.filter(
      (inv) => normalizar(inv.nombre).includes(q) || normalizar(inv.apellido).includes(q)
    )
  }, [query, invitados])

  async function handleSeleccionar(invitado) {
    if (seleccionandoId) return

    const guardado = getCartonGuardado()
    if (guardado?.invitadoId === invitado.id) {
      onCartonListo(guardado)
      return
    }

    setSeleccionandoId(invitado.id)
    setErrorMsg('')
    try {
      const data = await marcarInvitadoAsignado(invitado.id, playlistId)
      onCartonListo(data)
    } catch (err) {
      if (err.message === 'YA_ABIERTO') {
        setBloqueado({ nombre: err.nombre, apellido: err.apellido })
      } else {
        setErrorMsg(
          err.message === 'SIN_CARTON'
            ? 'Este invitado no tiene cartón asignado. Consultá al organizador.'
            : 'Error de conexión. Intentá de nuevo.'
        )
      }
      setSeleccionandoId(null)
    }
  }

  async function handleSobrante() {
    if (!playlistId || seleccionandoId) return
    setSeleccionandoId('sobrante')
    setErrorSobrante('')
    try {
      const carton = await asignarCartonSobrante(playlistId)
      if (!carton) {
        setErrorSobrante('No hay cartones disponibles. Consultá al organizador.')
        setSeleccionandoId(null)
        return
      }
      const todosLosTracks = await getTracksDePlaylist(playlistId)
      const tracks = carton.track_ids
        .map((id) => todosLosTracks.find((t) => t.id === id))
        .filter(Boolean)
      onCartonListo({
        invitadoId: null,
        cartonId: carton.id,
        playlistId,
        numero: carton.numero,
        trackIds: carton.track_ids,
        tracks,
      })
    } catch {
      setErrorSobrante('Error de conexión. Intentá de nuevo.')
      setSeleccionandoId(null)
    }
  }

  return (
    <div className={styles.container}>
      <img src={floralImg} className={styles.floralTop} alt="" aria-hidden="true" />
      <div className={styles.inner}>
        <h1 className={styles.title}>♪ Bingo Musical</h1>
        <p className={styles.subtitle}>Clara &amp; Javier · 11 de Abril de 2026</p>

        {cargando ? (
          <p className={styles.hint}>Cargando lista...</p>
        ) : errorMsg && !invitados.length ? (
          <p className={styles.errorMsg}>{errorMsg}</p>
        ) : (
          <>
            <p className={styles.instruccion}>Buscá tu nombre:</p>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="escribí tu nombre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />

            <div className={styles.listaWrap}>
              {filtrados.length === 0 ? (
                <p className={styles.sinResultados}>Sin resultados para "{query}"</p>
              ) : (
                filtrados.map((inv) => (
                  <button
                    key={inv.id}
                    className={styles.invitadoItem}
                    onClick={() => setPendiente(inv)}
                    disabled={!!seleccionandoId}
                  >
                    <span className={styles.invNombre}>{inv.nombre}</span>
                    <span className={styles.invApellido}>{inv.apellido}</span>
                  </button>
                ))
              )}
            </div>

            {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
            {errorSobrante && <p className={styles.errorMsg}>{errorSobrante}</p>}

            <button
              className={styles.btnSobrante}
              onClick={handleSobrante}
              disabled={!!seleccionandoId}
            >
              ¿No encontrás tu nombre? →
            </button>
          </>
        )}
      </div>
      {bloqueado && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.bloqueadoIcon}>⚠️</p>
            <p className={styles.bloqueadoTitulo}>Este cartón ya fue abierto.</p>
            <p className={styles.bloqueadoTexto}>
              Si sos {bloqueado.nombre} {bloqueado.apellido}, consultá al organizador.
            </p>
            <button
              className={styles.modalCancelar}
              onClick={() => setBloqueado(null)}
            >
              ← Volver a la lista
            </button>
          </div>
        </div>
      )}

      {pendiente && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.modalPregunta}>¿Jugar como</p>
            <p className={styles.modalNombre}>{pendiente.nombre} {pendiente.apellido}?</p>
            <div className={styles.modalBtns}>
              <button
                className={styles.modalCancelar}
                onClick={() => setPendiente(null)}
                disabled={!!seleccionandoId}
              >
                Cancelar
              </button>
              <button
                className={styles.modalContinuar}
                onClick={() => { handleSeleccionar(pendiente); setPendiente(null) }}
                disabled={!!seleccionandoId}
              >
                {seleccionandoId ? <span className={styles.dotLoader} /> : 'Continuar →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
