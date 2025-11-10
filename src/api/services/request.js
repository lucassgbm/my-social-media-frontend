import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 🔑 cookies sempre incluídos
});

// Interceptor para incluir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = '/login'; // Redireciona para login se não houver token 
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (response.status === 401) {
    window.location.href = '/login'; // Redireciona para login se não autorizado
  }
  return response;
});

export const get = (url) => {
  return api.get(url)
    .then((res) =>
      res.data
    )
    .catch(error =>

      console.log(error.status)

    );
}
export const postFormData = async (url, formData) => {

  try {
    const response = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;

  } catch (error) {
    if (error.response && error.response.status === 422) {

      return { errors: error.response.data.errors };
    }
    console.error(error);
    throw error;
  }

}

export const post = (url, data) => {

  return api.post(url, data)
    .then((res) =>

      res.data
    )
    .catch(error =>

      console.log(error)

    );
}

export const update = (url, data) => api.put(url, data).then((res) => res.data);
export const remove = (url) => api.delete(url).then((res) => res.data);

export default api;
