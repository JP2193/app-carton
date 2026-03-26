const STORAGE_KEY = 'bingo_carton'
const TACHADAS_PREFIX = 'bingo_tachadas_'

export function getCartonGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function guardarCarton(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getTachadas(cartonId) {
  try {
    const raw = localStorage.getItem(`${TACHADAS_PREFIX}${cartonId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleTachada(cartonId, index) {
  const tachadas = getTachadas(cartonId)
  const idx = tachadas.indexOf(index)
  if (idx === -1) {
    tachadas.push(index)
  } else {
    tachadas.splice(idx, 1)
  }
  localStorage.setItem(`${TACHADAS_PREFIX}${cartonId}`, JSON.stringify(tachadas))
  return tachadas
}

export function limpiarCarton() {
  const data = getCartonGuardado()
  if (data?.cartonId) {
    localStorage.removeItem(`${TACHADAS_PREFIX}${data.cartonId}`)
  }
  localStorage.removeItem(STORAGE_KEY)
}
