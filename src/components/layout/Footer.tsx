import { CakeIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="h-14 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CakeIcon className="w-5 h-5 text-primary" />
        <span className="font-medium text-gray-700">Pastelería Flora</span>
        <span className="text-gray-400">•</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="hidden md:inline">Sistema de Gestión v1.0.0</span>
        <a 
          href="mailto:soporte@pasteleriaflora.com"
          className="text-primary hover:text-primaryDark transition-colors hover:underline"
        >
          Soporte
        </a>
      </div>
    </footer>
  )
}