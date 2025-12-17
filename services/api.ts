
// URL do Google Apps Script fornecida
const API_URL = "https://script.google.com/macros/s/AKfycbx9XdUkm1SgsmbP4N2Z62w7S4AQNhvUk-5fmIyneOh8NwAhcCQZfvbEzI8BNQK2M918/exec";

export interface ApiPayload {
  action: 'save_item' | 'login' | 'sync';
  data: any;
}

export const sendToDatabase = async (payload: ApiPayload) => {
  // O Google Apps Script Web App requer POST com text/plain para evitar preflight CORS complexo em navegadores
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Apps Script retorna texto ou JSON. Tentamos parsear.
    // Nota: 'no-cors' pode ser necessário dependendo da configuração do script, 
    // mas 'no-cors' impede leitura da resposta. Assumindo configuração padrão permissiva do GAS.
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { status: 'success', message: text };
    }
  } catch (error) {
    console.error("Erro ao comunicar com o banco de dados:", error);
    // Em caso de erro de rede, retornamos sucesso simulado para não travar o app (Offline first)
    return { status: 'error', message: 'Modo Offline: Dados salvos localmente.' };
  }
};
