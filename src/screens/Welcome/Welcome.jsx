import { useState, useEffect, useMemo } from 'react'
import {
  getInvitados,
  marcarInvitadoAsignado,
  getTracksDePlaylist,
  registrarSobrante,
  normalizar,
  getNombreEvento,
} from '../../utils/supabase.js'
import { getCartonGuardado } from '../../utils/storage.js'
import styles from './Welcome.module.css'

export default function Welcome({ playlistId, onCartonListo }) {
  const [nombreEvento, setNombreEvento] = useState('')
  const [invitados, setInvitados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [query, setQuery] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [seleccionandoId, setSeleccionandoId] = useState(null)
  const [errorSobrante, setErrorSobrante] = useState('')
  const [bloqueado, setBloqueado] = useState(null)
  const [mostrarFormSobrante, setMostrarFormSobrante] = useState(false)
  const [formSobrante, setFormSobrante] = useState({ nombre: '', apellido: '' })

  useEffect(() => {
    async function init() {
      try {
        const [lista, nombre] = await Promise.all([
          getInvitados(playlistId),
          getNombreEvento(playlistId),
        ])
        setInvitados(lista)
        setNombreEvento(nombre)
      } catch {
        setErrorMsg('Error de conexión. Verificá el WiFi e intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    init()
  }, [playlistId])

  const filtrados = useMemo(() => {
    if (!query.trim()) return invitados
    const q = normalizar(query)
    return invitados.filter((inv) =>
      normalizar(`${inv.nombre} ${inv.apellido}`).includes(q)
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

  async function handleRegistrarSobrante() {
    const { nombre, apellido } = formSobrante
    if (!nombre.trim() || !apellido.trim()) {
      setErrorSobrante('Completá tu nombre y apellido.')
      return
    }
    if (seleccionandoId) return
    setSeleccionandoId('sobrante')
    setErrorSobrante('')
    try {
      const result = await registrarSobrante(playlistId, nombre.trim(), apellido.trim())
      const todosLosTracks = await getTracksDePlaylist(playlistId)
      const tracks = result.track_ids
        .map((id) => todosLosTracks.find((t) => t.id === id))
        .filter(Boolean)
      onCartonListo({
        invitadoId: result.invitado_id,
        cartonId: result.carton_id,
        playlistId,
        nombre: `${nombre.trim()} ${apellido.trim()}`,
        numero: result.numero,
        trackIds: result.track_ids,
        tracks,
      })
    } catch (err) {
      setErrorSobrante(
        err.message === 'SIN_CARTONES'
          ? 'No hay cartones disponibles. Consultá al organizador.'
          : 'Error de conexión. Intentá de nuevo.'
      )
      setSeleccionandoId(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>BINGO MUSICAL</h1>
        {nombreEvento && <p className={styles.subtitleEvento}>{nombreEvento}</p>}
      </div>

      <div className={styles.inner}>
        {cargando ? (
          <p className={styles.hint}>Cargando lista...</p>
        ) : errorMsg && !invitados.length ? (
          <p className={styles.errorMsg}>{errorMsg}</p>
        ) : (
          <>
            <p className={styles.instruccion}>Buscá tu nombre</p>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Escribí tu nombre..."
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
              onClick={() => { setMostrarFormSobrante(true); setErrorSobrante('') }}
              disabled={!!seleccionandoId}
            >
              ¿No encontrás tu nombre? →
            </button>
          </>
        )}
      </div>

      {/* Modal: cartón ya abierto */}
      {bloqueado && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.bloqueadoIcon}>⚠️</p>
            <p className={styles.bloqueadoTitulo}>Este cartón ya fue abierto.</p>
            <p className={styles.bloqueadoTexto}>
              Si sos {bloqueado.nombre} {bloqueado.apellido}, consultá al organizador.
            </p>
            <button className={styles.modalCancelar} onClick={() => setBloqueado(null)}>
              ← Volver a la lista
            </button>
          </div>
        </div>
      )}

      {/* Modal: sobrante */}
      {mostrarFormSobrante && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.modalPregunta}>Ingresá tu nombre y apellido</p>
            <div className={styles.sobraForm}>
              <input
                className={styles.input}
                placeholder="Nombre"
                value={formSobrante.nombre}
                onChange={(e) => setFormSobrante((f) => ({ ...f, nombre: e.target.value }))}
                autoComplete="off"
                disabled={!!seleccionandoId}
              />
              <input
                className={styles.input}
                placeholder="Apellido"
                value={formSobrante.apellido}
                onChange={(e) => setFormSobrante((f) => ({ ...f, apellido: e.target.value }))}
                autoComplete="off"
                disabled={!!seleccionandoId}
              />
              {errorSobrante && <p className={styles.errorMsg}>{errorSobrante}</p>}
            </div>
            <div className={styles.modalBtns}>
              <button
                className={styles.modalCancelar}
                onClick={() => { setMostrarFormSobrante(false); setErrorSobrante(''); setFormSobrante({ nombre: '', apellido: '' }) }}
                disabled={!!seleccionandoId}
              >
                Cancelar
              </button>
              <button
                className={styles.modalContinuar}
                onClick={handleRegistrarSobrante}
                disabled={!!seleccionandoId}
              >
                {seleccionandoId ? <span className={styles.dotLoader} /> : 'Obtener cartón →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar selección */}
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
