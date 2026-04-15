import { useState, useEffect } from 'react'
import Codigo from './screens/Codigo/Codigo.jsx'
import Welcome from './screens/Welcome/Welcome.jsx'
import Card from './screens/Card/Card.jsx'
import BingoScreen from './screens/BingoScreen/BingoScreen.jsx'
import ErrorScreen from './screens/Error/ErrorScreen.jsx'
import { getCartonGuardado, guardarCarton } from './utils/storage.js'

export default function App() {
  const [screen, setScreen] = useState('codigo')
  const [eventoId, setEventoId] = useState(null)
  const [playlistId, setPlaylistId] = useState(null)
  const [cartonData, setCartonData] = useState(null)

  // Código desde pathname: https://bingo-boda.vercel.app/1AEAA558
  const _raw = window.location.pathname.slice(1).trim().toUpperCase()
  const codigoDesdeUrl = /^[A-Z0-9]{4,16}$/.test(_raw) ? _raw : null

  useEffect(() => {
    const guardado = getCartonGuardado()
    // Solo restaurar si tiene eventoId (formato nuevo)
    if (guardado?.eventoId) {
      setCartonData(guardado)
      setEventoId(guardado.eventoId)
      setPlaylistId(guardado.playlistId)
      setScreen('waiting')
    }
  }, [])

  function handleCodigoValido({ eventoId: eid, playlistId: pid }) {
    setEventoId(eid)
    setPlaylistId(pid)
    setScreen('welcome')
  }

  function handleCartonListo(data) {
    guardarCarton(data)
    setCartonData(data)
    setScreen('waiting')
  }

  function handleSalir() {
    setCartonData(null)
    setScreen('welcome')
  }

  let content
  if (screen === 'waiting' && cartonData) {
    content = <Card data={cartonData} onVerCarton={() => setScreen('grid')} />
  } else if (screen === 'grid' && cartonData) {
    content = <BingoScreen data={cartonData} onSalir={handleSalir} />
  } else if (screen === 'error') {
    content = <ErrorScreen mensaje="Hubo un error inesperado." onReintentar={() => setScreen('codigo')} />
  } else if (screen === 'welcome' && eventoId) {
    content = (
      <Welcome
        eventoId={eventoId}
        playlistId={playlistId}
        onCartonListo={handleCartonListo}
      />
    )
  } else {
    content = <Codigo onCodigoValido={handleCodigoValido} codigoInicial={codigoDesdeUrl} />
  }

  return (
    <>
      <div className="landscape-warning">
        <span style={{ fontSize: '2rem' }}>↩️</span>
        <p style={{ fontSize: '1rem' }}>Girá tu celular para ver el cartón</p>
      </div>
      <div className="app-content">{content}</div>
    </>
  )
}
