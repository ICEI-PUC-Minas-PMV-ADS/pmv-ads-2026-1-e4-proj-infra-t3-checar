/**
 * Configuração da API
 * Ajuste a URL conforme o ambiente
 */

const API_CONFIG = {
  // Desenvolvimento local
  DEVELOPMENT: 'http://localhost:4000',
  
  // Produção
  PRODUCTION: process.env.REACT_APP_API_URL || 'https://sua-api.com',
};

// Detectar ambiente
const environment = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT';

export const API_BASE_URL = API_CONFIG[environment];

/**
 * Função para validar se a API está acessível
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API não está acessível:', error);
    return false;
  }
};

export default API_CONFIG;
