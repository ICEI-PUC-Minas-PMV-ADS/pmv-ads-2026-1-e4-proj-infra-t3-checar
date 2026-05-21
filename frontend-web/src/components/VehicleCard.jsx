import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const VehicleCard = ({ vehicle }) => {
  return (
    <Link to={`/veiculos/${vehicle._id}`} className="group block">
      <div className="group bg-gradient-to-r from-[#0052cc] to-[#0041a3] rounded-3xl p-4 md:p-5 flex items-center gap-4 border border-white/10 hover:border-[#00b7eb]/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg">
        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-inner border border-white/20">
          <Car className="text-[#00112b]/20 w-10 h-10" />
          <div className={`absolute top-0 left-0 w-1 h-full ${vehicle.status === 'OK' ? 'bg-green-400' : 'bg-red-500'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm md:text-base font-black leading-tight uppercase truncate group-hover:text-[#00b7eb] transition-colors">
            {vehicle.nome}
          </h2>
          <p className="text-xs md:text-sm font-mono font-bold text-[#00b7eb] tracking-tighter">
            {vehicle.placa}
          </p>
          <div className="flex flex-wrap gap-x-2 mt-1 opacity-60 text-[10px] md:text-xs">
            <span>{vehicle.ano}</span>
            <span>•</span>
            <span>{vehicle.quilometragem?.toLocaleString()} km</span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase ${
            vehicle.status === 'ALERTA'
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
              : 'bg-green-500/20 text-green-400 border border-green-500/50'
          }`}>
            {vehicle.status}
          </div>
          {vehicle.observacao && vehicle.status === 'ALERTA' && (
            <span className="text-[9px] text-red-300/70 mt-1 max-w-[80px] truncate text-right italic">
              {vehicle.observacao}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
