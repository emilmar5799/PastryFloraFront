import { 
  CakeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ClockIcon, 
  StarIcon,
  HeartIcon,
  GiftIcon,
  CalendarDaysIcon,
  UsersIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const specialties = [
    { icon: HeartIcon, title: 'Matrimonios', desc: 'Tortas elegantes para tu día especial' },
    { icon: GiftIcon, title: 'Bautizos', desc: 'Celebra el inicio de una vida' },
    { icon: CalendarDaysIcon, title: '15 Años', desc: 'Tortas únicas para quinceañeras' },
    { icon: UsersIcon, title: 'Cumpleaños', desc: 'Para todas las edades' },
    { icon: SparklesIcon, title: 'Eventos Especiales', desc: 'Aniversarios, graduaciones, más' },
    { icon: TrophyIcon, title: 'Logros', desc: 'Celebra éxitos y triunfos' }
  ]

  const flavors = [
    'Selva Negra',
    '3 Leches',
    'Vainilla',
    'Chocolate',
    'Red Velvet',
    'Zanahoria',
    'Coco',
    'Limonada',
    'Fresa',
    'Durazno',
    'Moka',
    'Maracuyá'
  ]

  const stats = [
    { label: 'Años de Experiencia', value: '29+' },
    { label: 'Clientes Satisfechos', value: '10,000+' },
    { label: 'Eventos Especiales', value: '5,000+' },
    { label: 'Sucursales', value: '2' }
  ]

  const contactInfo = [
    { icon: PhoneIcon, label: 'Sucursal 13', number: '73732920' },
    { icon: PhoneIcon, label: 'Sucursal 8', number: '73840556' },
    { icon: PhoneIcon, label: 'Soporte', number: '73359567' }
  ]

  const branchInfo = [
    {
      title: 'Pastelería Flora 13',
      address: 'Calle Oruro entre Babtista y Bolivar N°13',
      details: 'Nuestra sucursal principal'
    },
    {
      title: 'Pastelería Flora 8',
      address: 'Calle Oruro entre Babtista y Bolivar N°8',
      details: 'Sucursal de ampliación'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-pink-100 p-8 md:p-12">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl flex items-center justify-center">
              <CakeIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-primaryDark bg-white/80 px-3 py-1 rounded-full">
                Desde 1995
              </span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bienvenido a{' '}
            <span className="bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
              Pastelería Flora
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
            Endulzando momentos especiales en Llallagua, Potosí desde 1995. 
            Fundada por <span className="font-semibold text-primaryDark">Flora Yucra Gutierrez</span>, 
            especialistas en tortas para eventos inolvidables.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {['💍 Matrimonios', '👶 Bautizos', '🎂 15 Años', '🎉 Cumpleaños'].map((item) => (
              <span key={item} className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
                {item}
              </span>
            ))}
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-16 -translate-y-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-pink-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Specialties Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Especialidades</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Nos especializamos exclusivamente en <span className="font-semibold text-primary">tortas (pasteles)</span> 
            para eventos especiales. No trabajamos con masitas ni otros productos de panadería.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon
              return (
                <div key={index} className="group p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{specialty.title}</h3>
                      <p className="text-sm text-gray-600">{specialty.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact & Locations */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <PhoneIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contacto</h2>
            </div>
            
            <div className="space-y-4">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-800">{contact.label}</div>
                        <div className="text-sm text-gray-500">Llallagua, Potosí</div>
                      </div>
                    </div>
                    <a 
                      href={`tel:${contact.number}`}
                      className="font-bold text-primary hover:text-primaryDark transition-colors"
                    >
                      {contact.number}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nuestras Sucursales</h2>
            </div>
            
            <div className="space-y-4">
              {branchInfo.map((branch, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors">
                  <h3 className="font-bold text-lg text-primaryDark mb-2">{branch.title}</h3>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{branch.address}</p>
                  </div>
                  <p className="text-sm text-gray-500">{branch.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flavors Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
            <CakeIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuestros Sabores</h2>
            <p className="text-gray-600">Variedad de sabores para todos los gustos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {flavors.map((flavor, index) => (
            <div 
              key={index} 
              className="group p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CakeIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                  {flavor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hours & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary to-primaryDark rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Horario de Atención</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { day: 'Lunes a Viernes', hours: '8:00 AM - 8:00 PM' },
              { day: 'Sábados', hours: '9:00 AM - 7:00 PM' },
              { day: 'Domingos', hours: '10:00 AM - 2:00 PM' }
            ].map((schedule, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="font-medium">{schedule.day}</span>
                <span className="font-bold">{schedule.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <HeartIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Nuestra Filosofía</h2>
          </div>
          
          <div className="space-y-4">
            <p className="leading-relaxed">
              Cada torta es una obra de arte creada con pasión y dedicación. 
              Nos enfocamos en hacer de tu evento especial un momento verdaderamente inolvidable.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CakeIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold">Calidad y tradición desde 1995</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Nueva Venta', desc: 'Registrar venta', path: '/sales/new', color: 'from-primary to-primaryDark' },
            { title: 'Ver Ventas', desc: 'Historial completo', path: '/sales', color: 'from-blue-500 to-blue-600' },
            { title: 'Productos', desc: 'Gestión de catálogo', path: '/products', color: 'from-green-500 to-green-600' },
            { title: 'Usuarios', desc: 'Administrar usuarios', path: '/users', color: 'from-purple-500 to-purple-600' }
          ].map((action, index) => (
            <a
              key={index}
              href={action.path}
              className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] block`}
            >
              <h3 className="font-bold text-lg mb-2">{action.title}</h3>
              <p className="text-white/90 text-sm">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}