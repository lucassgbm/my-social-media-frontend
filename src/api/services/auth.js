import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Função para login
export async function auth(email, password) {
  try {
    const response = await api.post("/user/login", {
      email,
      password,
      },
      {
        withCredentials: true
      }
    );

    return response.data;
    
  } catch (error) {
    console.error("Erro no login:", error.response?.data || error.message);
    throw error;
  }
}


// Função para logout
export async function logout() {
  try {
    const response = await api.post("/user/logout", {
      email,
      password,
      },
      {
        withCredentials: true
      }
    );

    return response.data;
    
  } catch (error) {
    console.error("Erro no logout:", error.response?.data || error.message);
    throw error;
  }
}
