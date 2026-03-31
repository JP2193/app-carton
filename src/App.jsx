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

  let content
  if (screen === 'waiting' && cartonData) content = <Card data={cartonData} onVerCarton={() => setScreen('grid')} />
  else if (screen === 'grid' && cartonData) content = <BingoGrid data={cartonData} />
  else if (screen === 'error') content = <ErrorScreen mensaje="Hubo un error inesperado." onReintentar={() => setScreen('welcome')} />
  else content = <Welcome onCartonListo={handleCartonListo} />

  return (
    <>
      <div className="landscape-warning">
        <span style={{ fontSize: '2rem' }}>↩️</span>
        <p style={{ fontSize: '1rem', color: '#3d2b1f' }}>Girá tu celular para ver el cartón</p>
      </div>
      <div className="app-content">{content}</div>
    </>
  )
}
