import { useState, useEffect } from 'react'
import Welcome from './screens/Welcome/Welcome.jsx'
import Card from './screens/Card/Card.jsx'
import BingoGrid from './components/BingoGrid/BingoGrid.jsx'
import ErrorScreen from './screens/Error/ErrorScreen.jsx'
import { getCartonGuardado, guardarCarton } from './utils/storage.js'

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [cartonData, setCartonData] = useState(null)

  useEffect(() => {
    const guardado = getCartonGuardado()
    if (guardado) {
      setCartonData(guardado)
      setScreen('waiting')
    }
  }, [])

  function handleCartonListo(data) {
    guardarCarton(data)
    setCartonData(data)
    setScreen('waiting')
  }

  if (screen === 'waiting' && cartonData) return <Card data={cartonData} onVerCarton={() => setScreen('grid')} />
  if (screen === 'grid' && cartonData) return <BingoGrid data={cartonData} />
  if (screen === 'error') return <ErrorScreen mensaje="Hubo un error inesperado." onReintentar={() => setScreen('welcome')} />
  return <Welcome onCartonListo={handleCartonListo} />
}
