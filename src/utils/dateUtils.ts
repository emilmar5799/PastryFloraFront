// src/utils/dateUtils.ts

// Bolivia está en GMT-4 (UTC-4) todo el año
const BOLIVIA_UTC_OFFSET = -4 * 60 // en minutos

/**
 * Convierte una fecha UTC a hora de Bolivia manualmente
 */
export function utcToBoliviaTime(dateString: string): Date {
  // Crear fecha desde string UTC
  const date = new Date(dateString)
  
  // Si la fecha ya es válida y estamos en cliente
  if (!isNaN(date.getTime())) {
    // Aplicar offset de Bolivia manualmente
    const boliviaTime = new Date(date.getTime() + (BOLIVIA_UTC_OFFSET * 60 * 1000))
    return boliviaTime
  }
  
  // Fallback: intentar parsear de diferentes formas
  const tryParse = (str: string) => {
    // Si tiene formato ISO pero sin Z
    if (str && !str.endsWith('Z')) {
      return new Date(`${str}Z`)
    }
    return new Date(str)
  }
  
  const parsedDate = tryParse(dateString)
  if (!isNaN(parsedDate.getTime())) {
    return new Date(parsedDate.getTime() + (BOLIVIA_UTC_OFFSET * 60 * 1000))
  }
  
  // Si todo falla, devolver fecha actual
  console.warn('No se pudo parsear la fecha:', dateString)
  return new Date()
}

/**
 * Formatea fecha y hora para mostrar en UI con hora Bolivia
 */
export function formatDateTimeForDisplay(date: Date): string {
  // Formato manual para evitar problemas de timezone
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Formatea solo la hora para mostrar en UI
 */
export function formatTimeForDisplay(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  
  return `${displayHours}:${minutes} ${ampm}`
}

/**
 * Formatea fecha y hora de manera más completa
 */
export function formatFullDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
  
  // Intentar con Intl primero
  try {
    return date.toLocaleString('es-BO', options)
  } catch {
    // Fallback manual
    const day = date.getDate()
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    const weekdayNames = [
      'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ]
    const month = monthNames[date.getMonth()]
    const weekday = weekdayNames[date.getDay()]
    const year = date.getFullYear()
    const time = formatTimeForDisplay(date)
    
    return `${weekday} ${day} de ${month} de ${year}, ${time}`
  }
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 */
export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'hace unos segundos'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `hace ${days} día${days !== 1 ? 's' : ''}`
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `hace ${months} mes${months !== 1 ? 'es' : ''}`
  }
  const years = Math.floor(diffInSeconds / 31536000)
  return `hace ${years} año${years !== 1 ? 's' : ''}`
}

/**
 * Debug: Muestra información de la fecha
 */
export function debugDateInfo(dateString: string) {
  console.log('=== DEBUG FECHA ===')
  console.log('Fecha original:', dateString)
  console.log('Parseada directa:', new Date(dateString))
  console.log('Parseada con Z:', new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`))
  console.log('UTC String:', new Date(dateString).toUTCString())
  console.log('ISO String:', new Date(dateString).toISOString())
  console.log('Local String:', new Date(dateString).toLocaleString())
  console.log('========================')
}