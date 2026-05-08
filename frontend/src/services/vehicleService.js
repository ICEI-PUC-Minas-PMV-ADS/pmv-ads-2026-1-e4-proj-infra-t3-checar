import { API_BASE_URL } from '../config/apiConfig';

/**
 * Serviço para gerenciar chamadas à API de Veículos
 */

export const vehicleService = {
  /**
   * Listar todos os veículos
   * GET /vehicles
   */
  async listVehicles() {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      
      if (!response.ok) {
        throw new Error(`Erro ao listar veículos: ${response.status}`);
      }
      
      const data = await response.json();
      // A API retorna { status: 'success', count: X, data: [...] }
      return data.data || data;
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      throw error;
    }
  },

  /**
   * Buscar veículo por ID
   * GET /vehicles/:id
   */
  async getVehicleById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Veículo não encontrado');
        }
        throw new Error(`Erro ao buscar veículo: ${response.status}`);
      }
      
      const data = await response.json();
      // A API retorna { status: 'success', data: {...} }
      return data.data || data;
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      throw error;
    }
  },

  /**
   * Criar novo veículo
   * POST /vehicles
   */
  async createVehicle(vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || errorData.message || `Erro ao criar veículo: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      throw error;
    }
  },

  /**
   * Atualizar veículo
   * PUT /vehicles/:id
   */
  async updateVehicle(id, vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Veículo não encontrado');
        }
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || errorData.message || `Erro ao atualizar veículo: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }
  },

  /**
   * Deletar veículo
   * DELETE /vehicles/:id
   */
  async deleteVehicle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Veículo não encontrado');
        }
        throw new Error(`Erro ao deletar veículo: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      throw error;
    }
  },
};

export default vehicleService;
