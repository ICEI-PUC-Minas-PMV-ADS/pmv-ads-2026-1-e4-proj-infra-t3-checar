import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import VehicleForm from '../components/VehicleForm';

const emptyVehicle = {
  plate: '',
  model: '',
  year: new Date().getFullYear().toString(),
  mileage: 0,
  vehicleType: 'car',
  operationalStatus: 'active',
  observation: '',
};

const VehicleDetails = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const isNew = vehicleId === 'novo' || !vehicleId;

  const [formData, setFormData] = useState(emptyVehicle);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isNew) {
      setFormData(emptyVehicle);
      setFetching(false);
      return;
    }

    const loadVehicle = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`/api/vehicles/${vehicleId}`);
        const vehicle = response.data?.data;
        if (!vehicle) {
          setError('Veículo não encontrado.');
          return;
        }
        setFormData({
          plate: vehicle.plate || '',
          model: vehicle.model || '',
          year: vehicle.year?.toString() || '',
          mileage: vehicle.mileage ?? 0,
          vehicleType: vehicle.vehicleType || 'car',
          operationalStatus: vehicle.operationalStatus || 'active',
          observation: vehicle.observation || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar o veículo.');
      } finally {
        setFetching(false);
      }
    };

    loadVehicle();
  }, [isNew, vehicleId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'plate' ? value.toUpperCase() : value }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const payload = {
        plate: formData.plate.trim().toUpperCase(),
        model: formData.model.trim(),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        vehicleType: formData.vehicleType,
        operationalStatus: formData.operationalStatus,
        observation: formData.observation.trim() || null,
      };

      if (!payload.plate || !payload.model || !payload.year) {
        setError('Placa, modelo e ano são obrigatórios.');
        return;
      }

      if (isNew) {
        await axios.post('/api/vehicles', payload);
        setSuccess('Veículo criado com sucesso!');
        setTimeout(() => navigate('/veiculos'), 900);
        return;
      }

      await axios.put(`/api/vehicles/${vehicleId}`, payload);
      setSuccess('Dados atualizados com sucesso!');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message;
      setError(message || 'Erro ao salvar o veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/vehicles/${vehicleId}`);
      navigate('/veiculos');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir o veículo.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center text-white/70">
        Carregando veículo...
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] max-w-4xl">
      <button
        onClick={() => navigate('/veiculos')}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#002b45] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#003d5c]"
      >
        <ChevronLeft size={18} /> Voltar para veículos
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <VehicleForm
            values={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onDelete={!isNew ? handleDelete : undefined}
            loading={loading}
            isEditing={!isNew}
            error={error}
            success={success}
          />
        </div>

        <aside className="rounded-3xl border border-white/10 bg-[#00112b]/80 p-6 shadow-xl shadow-[#000000]/20">
          <p className="mb-3 uppercase tracking-[0.3em] text-[#00b7eb] text-xs">Resumo rápido</p>
          <div className="space-y-4 text-sm text-white/80">
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Placa</span>
              <p className="mt-1 font-bold text-white">{formData.plate || '---'}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Modelo</span>
              <p className="mt-1 font-bold text-white">{formData.model || '---'}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Ano</span>
              <p className="mt-1 font-bold text-white">{formData.year || '---'}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Status</span>
              <p className="mt-1 font-bold text-white">{formData.operationalStatus}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Tipo</span>
              <p className="mt-1 font-bold text-white">{formData.vehicleType}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-[#00b7eb]/80">Quilometragem</span>
              <p className="mt-1 font-bold text-white">{Number(formData.mileage).toLocaleString()} km</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default VehicleDetails;
