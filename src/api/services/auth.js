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


/**
 * Encerra a sessão no servidor: o token é apagado e o cookie, limpo.
 *
 * A rota fica sob /social-media (grupo do cookie_auth) — apontava para
 * /user/logout, que não existe, e o corpo repetia `email` e `password` do
 * login, variáveis que nem existem aqui. Nada disso chegava a acontecer: o
 * botão "Sair" era só um link para /login e nunca chamava esta função.
 */
export async function logout() {
  try {
    const response = await api.post("/social-media/user/logout", null, {
      // o cookie HttpOnly precisa viajar: é ele que identifica a sessão
      withCredentials: true,
    });

    return response.data;

  } catch (error) {
    console.error("Erro no logout:", error.response?.data || error.message);
    throw error;
  }
}
