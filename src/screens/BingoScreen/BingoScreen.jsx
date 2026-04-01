import { useState } from 'react'
import BingoGrid from '../../components/BingoGrid/BingoGrid.jsx'
import CancionesTab from '../CancionesTab/CancionesTab.jsx'
import SalirTab from '../SalirTab/SalirTab.jsx'
import styles from './BingoScreen.module.css'

export default function BingoScreen({ data, onSalir }) {
  const [tab, setTab] = useState('carton')

  return (
    <div className={styles.container}>
      <nav className={styles.tabBar}>
        <button
          className={`${styles.tab} ${tab === 'carton' ? styles.active : ''}`}
          onClick={() => setTab('carton')}
        >
          Cartón
        </button>
        <button
          className={`${styles.tab} ${tab === 'canciones' ? styles.active : ''}`}
          onClick={() => setTab('canciones')}
        >
          Canciones
        </button>
        <button
          className={`${styles.tab} ${tab === 'salir' ? styles.active : ''}`}
          onClick={() => setTab('salir')}
        >
          Salir
        </button>
      </nav>
      <div className={styles.content}>
        {tab === 'carton' && <BingoGrid data={data} />}
        {tab === 'canciones' && <CancionesTab data={data} />}
        {tab === 'salir' && <SalirTab data={data} onSalir={onSalir} />}
      </div>
    </div>
  )
}
