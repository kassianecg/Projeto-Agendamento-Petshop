import { schedulesDay } from "./load.js";
import { scheduleCancel } from "../../services/schedule-cancel.js";

// Seleciona as 3 listas para delegação de eventos
const periods = document.querySelectorAll(".appointment-list");

periods.forEach((period) => {
  period.addEventListener("click", async (event) => {
    const btn = event.target.closest(".btn-remove");
    if (!btn) return;

    // Obtém o id a partir do dataset do botão
    const { id } = btn.dataset;

    if (id) {
      await scheduleCancel({ id });
      // Recarrega a agenda para refletir a remoção
      await schedulesDay();
    }
  });
});
