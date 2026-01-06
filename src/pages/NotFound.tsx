import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '15vh' }}>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <Link to="/login">Volver al login</Link>
    </div>
  )
}
