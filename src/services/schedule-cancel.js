import { apiConfig } from "./api-config.js";

// Remove um agendamento da API pelo id
export async function scheduleCancel({ id }) {
  try {
    await fetch(`${apiConfig.baseURL}/schedules/${String(id)}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.log(error);
    alert("Não foi possível remover o agendamento.");
  }
}
