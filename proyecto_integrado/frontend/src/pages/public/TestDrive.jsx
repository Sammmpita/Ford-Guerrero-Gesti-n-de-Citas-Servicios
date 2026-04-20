import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DatePicker from '../../components/DatePicker';
import { useAuth } from '../../context/AuthContext';

// Convierte '09:00' → '9:00 AM', '13:00' → '1:00 PM'
function formatHour(h) {
  const [hh, mm] = h.split(':').map(Number);
  const suffix = hh < 12 ? 'AM' : 'PM';
  const h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export default function TestDrive() {
  const { user, getToken } = useAuth();

  // Vehicles from API
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Form state
  const [selectedCarId, setSelectedCarId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [date, setDate] = useState('');
  const [motivo, setMotivo] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const dropdownRef = useRef(null);

  // Available hours from API
  const [availableHours, setAvailableHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedCar = vehicles.find(v => v.id === selectedCarId);

  // Fetch vehicles from API
  useEffect(() => {
    fetch('/api/autos/vehiculos/')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setVehicles(list);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, []);

  // Fetch available hours when date changes
  useEffect(() => {
    if (!date) {
      setAvailableHours([]);
      setSelectedHour('');
      return;
    }
    setLoadingHours(true);
    setSelectedHour('');
    fetch(`/api/vendedores/horas-disponibles/?fecha=${date}`)
      .then(res => res.json())
      .then(data => setAvailableHours(data.horas || []))
      .catch(() => setAvailableHours([]))
      .finally(() => setLoadingHours(false));
  }, [date]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build display name for a vehicle
  const carDisplayName = (v) => `${v.marca} ${v.modelo} ${v.anio}${v.version ? ` ${v.version}` : ''}`;

  // Get the first image URL for a vehicle
  const carImage = (v) => {
    if (v.imagenes && v.imagenes.length > 0) return v.imagenes[0].imagen || v.imagenes[0].url;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !selectedHour) {
      setError('Selecciona una fecha y un horario.');
      return;
    }

    const fechaHora = `${date}T${selectedHour}:00`;

    setSubmitting(true);
    try {
      const res = await fetch('/api/citas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          vehiculo: selectedCarId || null,
          fecha_hora: fechaHora,
          motivo: motivo || 'Prueba de manejo',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const firstKey = Object.keys(data)[0];
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        throw new Error(msg || 'Error al agendar la cita.');
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Today's date string for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />

      {success ? (
        /* ── SUCCESS STATE ──────────────────────────────────────────── */
        <div className="max-w-2xl mx-auto px-8 pt-32 pb-20 text-center">
          <div className="w-16 h-16 bg-zinc-900 mx-auto mb-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-4">
            Cita registrada
          </p>
          <h1 className="font-black text-4xl md:text-5xl tracking-tight text-gray-900 leading-none mb-6">
            ¡Tu prueba de manejo<br />ha sido agendada!
          </h1>
          <p className="text-gray-500 font-light leading-relaxed max-w-md mx-auto mb-10">
            Un vendedor ha sido asignado automáticamente a tu cita.
            Recibirás la confirmación por correo a <span className="font-medium text-gray-900">{user?.email}</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-3.5 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none"
            >
              Volver al inicio
            </Link>
            {user?.rol === 'cliente' && (
              <Link
                to="/cliente/citas"
                className="px-8 py-3.5 bg-zinc-900 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-700 rounded-none"
              >
                Ver mis citas
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="max-w-7xl mx-auto px-8 pt-16 pb-12 border-b border-gray-100 mt-16">
            <h1 className="font-black text-5xl tracking-tight text-gray-900 leading-none">
              Maneja el Ford de tus sueños.
            </h1>
          </div>

          {/* Main Layout */}
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Left Column: Car Selection */}
              <div className="lg:col-span-4">
                <span className="uppercase text-xs tracking-widest text-gray-500 font-bold mb-6 block">
                  1. Selecciona tu Ford
                </span>

                {/* Image Area */}
                <div className="aspect-[4/3] bg-gray-50 border border-gray-100 mb-6 flex items-center justify-center p-4 relative overflow-hidden group">
                  {selectedCar && carImage(selectedCar) ? (
                    <img 
                      src={carImage(selectedCar)} 
                      alt={carDisplayName(selectedCar)} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 animate-[fadeIn_0.5s_ease-out]"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span className="text-sm font-medium tracking-wide uppercase">
                        {loadingVehicles ? 'Cargando modelos...' : 'Selecciona un modelo'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loadingVehicles}
                    className="w-full flex items-center justify-between border border-zinc-900 bg-white px-4 py-3 text-sm font-medium tracking-wide text-zinc-900 transition-all focus:outline-none focus:ring-1 focus:ring-zinc-900 rounded-none uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{selectedCar ? carDisplayName(selectedCar) : 'Seleccionar modelo...'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-none max-h-64 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
                      <ul className="py-1">
                        {vehicles.length === 0 && (
                          <li className="px-4 py-3 text-sm text-gray-400 font-light">Sin vehículos disponibles</li>
                        )}
                        {vehicles.map((car) => (
                          <li key={car.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCarId(car.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm tracking-wide uppercase transition-colors hover:bg-zinc-50 ${selectedCarId === car.id ? 'font-bold text-zinc-900 bg-zinc-50' : 'font-medium text-gray-600'}`}
                            >
                              {carDisplayName(car)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedCar && (
                  <p className="mt-3 text-xs text-gray-400 font-light tracking-wide">
                    {selectedCar.color && <span>{selectedCar.color} — </span>}
                    ${Number(selectedCar.precio).toLocaleString('es-MX')} MXN
                  </p>
                )}
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-8">
                <form className="flex flex-col gap-16" onSubmit={handleSubmit}>
                  
                  {/* Contact Info — pre-filled from auth */}
                  <section>
                    <span className="uppercase text-xs tracking-widest text-gray-500 font-bold mb-6 block">
                      2. Información de Contacto
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                      <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                          Nombre(s)
                        </label>
                        <div className="border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-gray-900">
                          {user?.first_name || '—'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                          Apellido
                        </label>
                        <div className="border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-gray-900">
                          {user?.last_name || '—'}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                          Correo electrónico
                        </label>
                        <div className="border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-gray-900">
                          {user?.email || '—'}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                          Teléfono
                        </label>
                        <div className="border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-gray-900 font-mono">
                          {user?.telefono || '—'}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-400 font-light">
                      Estos datos se toman de tu cuenta.{' '}
                      <Link to="/mi-cuenta" className="underline hover:text-zinc-900 transition-colors">Editar perfil</Link>
                    </p>
                  </section>

                  {/* Schedule */}
                  <section>
                    <span className="uppercase text-xs tracking-widest text-gray-500 font-bold mb-6 block">
                      3. Agenda tu Cita
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="flex flex-col">
                        <label htmlFor="date" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                          Fecha sugerida *
                        </label>
                        <DatePicker
                          id="date"
                          value={date}
                          onChange={setDate}
                          min={today}
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4 block">
                          Horario disponible: *
                        </label>

                        {/* Sin fecha seleccionada */}
                        {!date && (
                          <p className="text-sm text-gray-400 font-light">Selecciona primero una fecha.</p>
                        )}

                        {/* Cargando */}
                        {date && loadingHours && (
                          <div className="grid grid-cols-3 gap-2">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-none" />
                            ))}
                          </div>
                        )}

                        {/* Sin horarios */}
                        {date && !loadingHours && availableHours.length === 0 && (
                          <p className="text-sm text-red-600 font-light">No hay vendedores disponibles para el horario seleccionado.</p>
                        )}

                        {/* Grilla de horas */}
                        {date && !loadingHours && availableHours.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableHours.map(hora => (
                              <button
                                key={hora}
                                type="button"
                                onClick={() => setSelectedHour(hora)}
                                className={`border px-3 py-2.5 text-xs font-medium tracking-wide uppercase transition-all duration-200 ease-out rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-1
                                  ${selectedHour === hora
                                    ? 'bg-zinc-900 border-zinc-900 text-white'
                                    : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'
                                  }`}
                              >
                                {formatHour(hora)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col mb-8">
                      <label htmlFor="motivo" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                        Comentarios (opcional)
                      </label>
                      <input
                        type="text"
                        id="motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Me interesa la versión Raptor en negro"
                        className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                      />
                    </div>

                    <div className="flex items-start gap-4 mb-10">
                      <div className="flex h-6 items-center">
                        <input
                          id="privacy"
                          name="privacy"
                          type="checkbox"
                          checked={privacy}
                          onChange={(e) => setPrivacy(e.target.checked)}
                          className="h-4 w-4 rounded-none border-gray-300 text-zinc-900 focus:ring-zinc-900 bg-white"
                          required
                        />
                      </div>
                      <div className="text-xs font-light text-gray-500 leading-relaxed">
                        <label htmlFor="privacy">
                          He leído y acepto el <a href="#" className="underline font-medium hover:text-zinc-900 transition-colors">Aviso de Privacidad</a> de Ford Motor Company. Autorizo el uso de mis datos personales para ser contactado por un distribuidor autorizado respecto a mi solicitud de prueba de manejo.
                        </label>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-600 text-sm tracking-wide mb-6">{error}</p>
                    )}

                    <div className="flex justify-end pt-8 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={submitting || !privacy}
                        className="px-8 py-4 bg-zinc-900 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] rounded-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                      >
                        {submitting ? 'Agendando...' : 'Confirmar Cita'}
                      </button>
                    </div>

                  </section>

                </form>
              </div>

            </div>
          </div>
        </>
      )}
      <Footer />
      {/* Required for the fade in animation defined in classes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
