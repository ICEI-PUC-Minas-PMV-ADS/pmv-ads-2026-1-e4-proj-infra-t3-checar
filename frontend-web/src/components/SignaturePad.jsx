import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

/**
 * Modal de assinatura digital do motorista.
 * onConfirm recebe a assinatura como data URL PNG (Base64).
 */
export default function SignaturePad({ onConfirm, onCancel }) {
  const sigRef = useRef(null);
  const [empty, setEmpty] = useState(true);

  const handleEnd  = () => setEmpty(sigRef.current?.isEmpty() ?? true);
  const handleClear = () => { sigRef.current?.clear(); setEmpty(true); };
  const handleConfirm = () => {
    if (sigRef.current?.isEmpty()) return;
    onConfirm(sigRef.current.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/20 bg-[#001233] p-6">
        <h2 className="mb-1 text-xl font-bold text-white">
          Assinatura do <span className="text-[#00b4d8]">motorista</span>
        </h2>
        <p className="mb-4 text-sm text-white/60">
          Assine no espaço abaixo para concluir o checklist.
        </p>

        <div className="overflow-hidden rounded-lg border-2 border-[#00b4d8] bg-white">
          <SignatureCanvas
            ref={sigRef}
            onEnd={handleEnd}
            backgroundColor="white"
            penColor="#001233"
            canvasProps={{ style: { width: '100%', height: 200, display: 'block' } }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="min-h-11 rounded-lg bg-white/10 font-bold text-white transition hover:bg-white/20"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={empty}
            className="min-h-11 rounded-lg bg-[#00b4d8] font-extrabold text-[#001233] transition disabled:opacity-40"
          >
            Confirmar
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full text-sm text-white/50 transition hover:text-white/80"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
