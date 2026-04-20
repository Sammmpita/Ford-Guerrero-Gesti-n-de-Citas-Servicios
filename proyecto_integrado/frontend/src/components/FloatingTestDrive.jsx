import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export default function FloatingTestDrive() {
  return (
    <Link 
      to="/prueba-de-manejo"
      className="fixed bottom-8 right-8 z-50 group flex items-center justify-start bg-[#003478] text-white w-14 h-14 hover:w-64 shadow-lg shadow-blue-900/20 rounded-full transition-all duration-300 ease-out cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 hover:shadow-xl hover:shadow-blue-900/30"
    >
      <div className="flex-none w-14 h-14 flex items-center justify-center">
        <KeyRound size={22} strokeWidth={1.8} />
      </div>
      <span className="text-xs uppercase tracking-widest font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pr-6">
        Prueba de manejo
      </span>
    </Link>
  );
}
