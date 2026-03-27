const STORAGE_KEY = 'bingo_carton'

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

export function limpiarCarton() {
  localStorage.removeItem(STORAGE_KEY)
}
