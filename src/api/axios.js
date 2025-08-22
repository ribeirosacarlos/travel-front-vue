import axios from 'axios';

// Criar instância do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de request - adiciona token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response - trata erros globalmente
api.interceptors.response.use(
  (response) => {
    // Log para desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log para desenvolvimento
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    }
    
    // Token expirado - tenta renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newToken = refreshResponse.data.token;
        
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token também expirado - redirecionar para login
        localStorage.removeItem('token');
        
        // Só redireciona se estivermos no browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Trata outros erros
    const errorMessage = error.response?.data?.message || error.message;
    
    // Cria um erro mais amigável
    const enhancedError = {
      ...error,
      friendlyMessage: getFriendlyErrorMessage(error.response?.status, errorMessage)
    };
    
    return Promise.reject(enhancedError);
  }
);

// Função para mensagens de erro mais amigáveis
function getFriendlyErrorMessage(status, message) {
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    case 401:
      return 'Acesso não autorizado. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 422:
      return 'Dados de entrada inválidos.';
    case 429:
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 500:
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    case 502:
      return 'Serviço temporariamente indisponível.';
    case 503:
      return 'Serviço em manutenção. Tente novamente mais tarde.';
    default:
      return message || 'Erro desconhecido. Tente novamente.';
  }
}

// Funções de conveniência para diferentes tipos de requisições
export const apiService = {
  // GET
  async get(url, config = {}) {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST
  async post(url, data = {}, config = {}) {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT
  async put(url, data = {}, config = {}) {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH
  async patch(url, data = {}, config = {}) {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // DELETE
  async delete(url, config = {}) {
    const response = await api.delete(url, config);
    return response.data;
  },

  // Upload de arquivo
  async uploadFile(url, file, onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    const response = await api.post(url, formData, config);
    return response.data;
  },

  // Download de arquivo
  async downloadFile(url, filename) {
    const response = await api.get(url, {
      responseType: 'blob'
    });

    // Cria um link temporário para download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};

export default api;