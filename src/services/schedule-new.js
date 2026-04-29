import { apiConfig } from "./api-config.js";

// Cria um novo agendamento na API
export async function scheduleNew({ id, tutor, pet, phone, service, when }) {
  try {
    await fetch(`${apiConfig.baseURL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, tutor, pet, phone, service, when }),
    });
  } catch (error) {
    console.log(error);
    throw new Error("Não foi possível criar o agendamento.");
  }
}
