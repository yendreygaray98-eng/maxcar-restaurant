'use client';

interface Mesa {
  id: string;
  numero: number;
  tipo: string;
  capacidad: number;
  estado: string;
}

interface Props {
  mesa: Mesa;
  onEdit: (mesa: Mesa) => void;
}

export default function MesaCard({ mesa, onEdit }: Props) {
  const getEstadoColor = () => {
    const isVIP = mesa.tipo === 'VIP';
    
    switch (mesa.estado) {
      case 'LIBRE':
        return isVIP 
          ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 text-purple-900 shadow-purple-200' 
          : 'bg-green-100 border-green-300 text-green-700';
      case 'OCUPADA':
        return isVIP 
          ? 'bg-gradient-to-br from-purple-100 to-red-100 border-purple-500 text-purple-900 shadow-purple-300' 
          : 'bg-red-100 border-red-300 text-red-700';
      case 'RESERVADA':
        return isVIP 
          ? 'bg-gradient-to-br from-purple-50 to-yellow-100 border-purple-400 text-purple-900 shadow-purple-200' 
          : 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'MANTENIMIENTO':
        return isVIP 
          ? 'bg-gradient-to-br from-purple-50 to-gray-100 border-purple-400 text-purple-900 shadow-purple-200' 
          : 'bg-gray-100 border-gray-400 text-gray-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getTipoIcon = () => {
    if (mesa.tipo === 'VIP') {
      return (
        <div className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          VIP
        </div>
      );
    }
    return null;
  };

  return (
    <button
      onClick={() => onEdit(mesa)}
      className={`w-full border-2 rounded-lg p-4 transition-all hover:shadow-lg hover:scale-105 ${getEstadoColor()} ${
        mesa.tipo === 'VIP' ? 'shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-2xl font-bold ${mesa.tipo === 'VIP' ? 'text-purple-700' : ''}`}>
          #{mesa.numero}
        </span>
        {getTipoIcon()}
      </div>
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium">{mesa.capacidad} personas</span>
        </div>
        <div className="font-semibold text-xs uppercase tracking-wide">{mesa.estado}</div>
      </div>
    </button>
  );
}
