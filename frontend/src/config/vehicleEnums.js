export const VEHICLE_TYPE_OPTIONS = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' },
  { label: 'Caminhão', value: 'truck' },
  { label: 'Ônibus', value: 'bus' },
  { label: 'Van', value: 'van' },
  { label: 'Outro', value: 'other' },
];

export const OPERATIONAL_STATUS_OPTIONS = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Em Manutenção', value: 'maintenance' },
  { label: 'Desativado', value: 'decommissioned' },
];

const toLabelMap = (options) =>
  options.reduce((acc, { label, value }) => ({ ...acc, [value]: label }), {});

export const VEHICLE_TYPE_LABELS = toLabelMap(VEHICLE_TYPE_OPTIONS);
export const OPERATIONAL_STATUS_LABELS = toLabelMap(OPERATIONAL_STATUS_OPTIONS);

export const getVehicleTypeLabel = (value) =>
  VEHICLE_TYPE_LABELS[value] || value || '';

export const getOperationalStatusLabel = (value) =>
  OPERATIONAL_STATUS_LABELS[value] || value || '';
