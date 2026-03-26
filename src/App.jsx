import { useState, useEffect } from 'react'
import Welcome from './screens/Welcome/Welcome.jsx'
import Loading from './screens/Loading/Loading.jsx'
import Card from './screens/Card/Card.jsx'
import ErrorScreen from './screens/Error/ErrorScreen.jsx'
import { getCartonGuardado, guardarCarton } from './utils/storage.js'
import { getPlaylistActiva, getTracksDePlaylist, asignarCarton as asignarCartonRpc } from './utils/supabase.js'

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [cartonData, setCartonData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const guardado = getCartonGuardado()
    if (guardado) {
      setCartonData(guardado)
      setScreen('card')
    }
  }, [])

  async function handleObtenerCarton(nombre) {
    setScreen('loading')

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 10000)
    )

    try {
      await Promise.race([procesarCarton(nombre), timeout])
    } catch (err) {
      if (err.message === 'SIN_CARTONES') {
        setErrorMsg('Se agotaron los cartones 😅 Pedile uno al organizador.')
      } else if (err.message === 'NO_PLAYLIST') {
        setErrorMsg('El evento no está configurado todavía. Avisale al organizador.')
      } else {
        setErrorMsg('Hubo un problema de conexión. Verificá el WiFi e intentá de nuevo.')
      }
      setScreen('error')
    }
  }

  async function procesarCarton(nombre) {
    const playlistId = await getPlaylistActiva()
    if (!playlistId) throw new Error('NO_PLAYLIST')

    const todosLosTracks = await getTracksDePlaylist(playlistId)

    const carton = await asignarCartonRpc(playlistId, nombre)
    if (!carton) throw new Error('SIN_CARTONES')

    const tracksDelCarton = carton.track_ids
      .map(id => todosLosTracks.find(t => t.id === id))
      .filter(Boolean)

    const data = {
      cartonId: carton.id,
      nombre,
      numero: carton.numero,
      trackIds: carton.track_ids,
      tracks: tracksDelCarton,
    }

    guardarCarton(data)
    setCartonData(data)
    setScreen('card')
  }

  function handleReintentar() {
    setErrorMsg('')
    setScreen('welcome')
  }

  if (screen === 'loading') return <Loading />
  if (screen === 'card' && cartonData) return <Card data={cartonData} />
  if (screen === 'error') return <ErrorScreen mensaje={errorMsg} onReintentar={handleReintentar} />
  return <Welcome onSubmit={handleObtenerCarton} />
}
