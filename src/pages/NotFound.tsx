import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>

      <p className="text-gray-500 mt-4 mb-6">
        Página no encontrada
      </p>

      <Link
        to="/login"
        className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-xl transition"
      >
        Volver al login
      </Link>
    </div>
  )
}
