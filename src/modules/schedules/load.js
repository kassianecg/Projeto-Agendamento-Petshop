import { scheduleFetchByDay } from "../../services/schedule-fetch-by-day.js";
import { schedulesShow } from "./show.js";

// Seleciona o input de data do filtro principal
const filterDate = document.getElementById("filter-date");

export async function schedulesDay() {
  const date = filterDate.value;

  // Busca os agendamentos do dia na API
  const dailySchedules = await scheduleFetchByDay({ date });

  // Renderiza os agendamentos
  schedulesShow({ dailySchedules });
}
