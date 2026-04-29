import dayjs from "dayjs";

// Seleciona as listas de cada período
const periodMorning   = document.getElementById("morning-list");
const periodAfternoon = document.getElementById("afternoon-list");
const periodNight     = document.getElementById("night-list");

export function schedulesShow({ dailySchedules }) {
  try {
    // Limpa as listas
    periodMorning.innerHTML   = "";
    periodAfternoon.innerHTML = "";
    periodNight.innerHTML     = "";

    // Ordena por horário crescente
    const sorted = [...dailySchedules].sort((a, b) =>
      dayjs(a.when).isBefore(dayjs(b.when)) ? -1 : 1
    );

    sorted.forEach((schedule) => {
      const time    = dayjs(schedule.when).format("HH:mm");
      const hour    = dayjs(schedule.when).hour();

      // Cria o item de agendamento
      const li = document.createElement("li");
      li.classList.add("appointment-item");
      li.dataset.id = schedule.id;

      li.innerHTML = `
        <span class="appt-time">${time}</span>
        <span class="appt-client">
          <strong class="appt-pet">${escapeHtml(schedule.pet)}</strong>
          <span class="appt-sep"> / </span>
          <span class="appt-tutor">${escapeHtml(schedule.tutor)}</span>
        </span>
        <span class="appt-service">${escapeHtml(schedule.service)}</span>
        <button class="btn-remove" type="button" data-id="${schedule.id}">
          Remover agendamento
        </button>
      `;

      // Insere na seção correta
      if (hour >= 9 && hour <= 12) {
        periodMorning.appendChild(li);
      } else if (hour >= 13 && hour <= 18) {
        periodAfternoon.appendChild(li);
      } else {
        periodNight.appendChild(li);
      }
    });
  } catch (error) {
    alert("Não foi possível exibir os agendamentos.");
    console.log(error);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
