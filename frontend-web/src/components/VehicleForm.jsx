import { Save, Trash2 } from 'lucide-react';

const vehicleTypes = [
  { value: 'car', label: 'Carro' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Caminhão' },
  { value: 'bus', label: 'Ônibus' },
  { value: 'van', label: 'Van' },
  { value: 'other', label: 'Outro' },
];

const operationalStatusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'decommissioned', label: 'Descomissionado' },
];

const VehicleForm = ({
  values,
  onChange,
  onSubmit,
  onDelete,
  loading,
  isEditing,
  error,
  success,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#002b45]/70 p-6 shadow-xl shadow-[#000000]/20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#00b7eb]">Dados do veículo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{isEditing ? 'Editar veículo' : 'Novo veículo'}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
            >
              <Trash2 size={16} /> Excluir
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#00b7eb] px-4 py-2 text-sm font-bold text-[#00112b] transition hover:bg-white disabled:opacity-60"
          >
            <Save size={16} /> {isEditing ? 'Salvar alterações' : 'Criar veículo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-2xl border border-green-500/40 bg-green-950/40 px-4 py-3 text-sm text-green-100">
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/80">
          Placa
          <input
            name="plate"
            value={values.plate}
            onChange={onChange}
            placeholder="ABC1234"
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          Modelo
          <input
            name="model"
            value={values.model}
            onChange={onChange}
            placeholder="Fiat Strada"
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          Ano
          <input
            name="year"
            type="number"
            value={values.year}
            onChange={onChange}
            placeholder="2025"
            min="1886"
            max={new Date().getFullYear() + 1}
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          Quilometragem
          <input
            name="mileage"
            type="number"
            value={values.mileage}
            onChange={onChange}
            placeholder="0"
            min="0"
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          Tipo
          <select
            name="vehicleType"
            value={values.vehicleType}
            onChange={onChange}
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          >
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-white/80">
          Status operacional
          <select
            name="operationalStatus"
            value={values.operationalStatus}
            onChange={onChange}
            className="w-full rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
          >
            {operationalStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block space-y-2 text-sm text-white/80">
        Observação
        <textarea
          name="observation"
          value={values.observation}
          onChange={onChange}
          rows="4"
          placeholder="Ex: Verificar nível de óleo ou farol traseiro"
          className="w-full resize-none rounded-2xl border border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none transition focus:border-[#00b7eb]"
        />
      </label>
    </div>
  );
};

export default VehicleForm;
