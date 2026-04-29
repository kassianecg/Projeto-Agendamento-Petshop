"use strict";

// Configuração do dayjs (locale pt-br)
import "./src/libs/dayjs.js";

// CSS
import "./src/styles/index.css";

// JS — formulário
import "./src/modules/form/submit.js";
import "./src/modules/form/date-change.js";

// JS — agendamentos
import "./src/modules/schedules/cancel.js";

// JS — inicialização da página
import "./src/modules/page-load.js";


const OPENING_HOURS = {
  morning:   ["09:00", "10:00", "11:00", "12:00"],
  afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  night:     ["19:00", "20:00", "21:00"],
};

const ALL_HOURS = [
  ...OPENING_HOURS.morning,
  ...OPENING_HOURS.afternoon,
  ...OPENING_HOURS.night,
];

// ============================================================
// ARMAZENAMENTO — localStorage por data
// ============================================================

function storageKey(date) {
  return `petshop-schedules-${date}`;
}

function loadSchedules(date) {
  const raw = localStorage.getItem(storageKey(date));
  return raw ? JSON.parse(raw) : [];
}

function saveSchedules(date, schedules) {
  localStorage.setItem(storageKey(date), JSON.stringify(schedules));
}

// ============================================================
// SELEÇÃO DE ELEMENTOS
// ============================================================

const filterDate   = document.getElementById("filter-date");
const morningList  = document.getElementById("morning-list");
const afternoonList = document.getElementById("afternoon-list");
const nightList    = document.getElementById("night-list");

const btnNewAppt   = document.getElementById("btn-new-appt");
const modalOverlay = document.getElementById("modal-overlay");
const btnCloseModal = document.getElementById("btn-close-modal");
const modalForm    = document.getElementById("modal-form");

const fieldTutor   = document.getElementById("tutor-name");
const fieldPet     = document.getElementById("pet-name");
const fieldPhone   = document.getElementById("phone");
const fieldService = document.getElementById("service-desc");
const fieldDate    = document.getElementById("appt-date");
const fieldTime    = document.getElementById("appt-time");

const errorTutor   = document.getElementById("tutor-error");
const errorPet     = document.getElementById("pet-error");
const errorPhone   = document.getElementById("phone-error");
const errorService = document.getElementById("service-error");
const errorDate    = document.getElementById("appt-date-error");
const errorTime    = document.getElementById("appt-time-error");

// ============================================================
// DATA INICIAL — hoje
// ============================================================

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

filterDate.value = filterDate.value || todayISO();
filterDate.max   = "";        // sem limite máximo
filterDate.min   = "";        // permite datas passadas (visualização histórica)

// ============================================================
// RENDERIZAÇÃO DOS AGENDAMENTOS
// ============================================================

function getPeriod(time) {
  if (OPENING_HOURS.morning.includes(time))   return "morning";
  if (OPENING_HOURS.afternoon.includes(time)) return "afternoon";
  if (OPENING_HOURS.night.includes(time))     return "night";
  return null;
}

function listForPeriod(period) {
  if (period === "morning")   return morningList;
  if (period === "afternoon") return afternoonList;
  if (period === "night")     return nightList;
  return null;
}

function renderSchedules(date) {
  // Limpa listas
  morningList.innerHTML   = "";
  afternoonList.innerHTML = "";
  nightList.innerHTML     = "";

  const schedules = loadSchedules(date);

  // Ordena por horário
  schedules.sort((a, b) => a.time.localeCompare(b.time));

  schedules.forEach(schedule => {
    const list = listForPeriod(getPeriod(schedule.time));
    if (!list) return;

    const li = createAppointmentItem(schedule);
    list.appendChild(li);
  });
}

function createAppointmentItem(schedule) {
  const li = document.createElement("li");
  li.classList.add("appointment-item");
  li.dataset.id = schedule.id;

  li.innerHTML = `
    <span class="appt-time">${schedule.time}</span>
    <span class="appt-client">
      <strong class="appt-pet">${escapeHtml(schedule.pet)}</strong>
      <span class="appt-sep"> / </span>
      <span class="appt-tutor">${escapeHtml(schedule.tutor)}</span>
    </span>
    <span class="appt-service">${escapeHtml(schedule.service)}</span>
    <button class="btn-remove" type="button" data-id="${schedule.id}">Remover agendamento</button>
  `;

  return li;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// REMOVER AGENDAMENTO — delegação de eventos nas 3 listas
// ============================================================

[morningList, afternoonList, nightList].forEach(list => {
  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-remove");
    if (!btn) return;

    const id   = btn.dataset.id;
    const date = filterDate.value;

    const schedules = loadSchedules(date).filter(s => s.id !== id);
    saveSchedules(date, schedules);
    renderSchedules(date);
  });
});

// ============================================================
// TROCAR DATA NO TOPO — recarrega agenda
// ============================================================

filterDate.addEventListener("change", () => {
  renderSchedules(filterDate.value);
});

// ============================================================
// MODAL — abrir / fechar
// ============================================================

function openModal() {
  modalOverlay.classList.remove("hidden");
  // Sincroniza a data do modal com a data do filtro
  fieldDate.value = filterDate.value;
  // Foco inicial no primeiro campo
  setTimeout(() => fieldTutor.focus(), 50);
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  clearErrors();
  modalForm.reset();
}

btnNewAppt.addEventListener("click", openModal);
btnCloseModal.addEventListener("click", closeModal);

// Fechar clicando fora do modal
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

// Fechar com Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
    closeModal();
  }
});

// ============================================================
// VALIDAÇÃO
// ============================================================

const validations = [
  {
    field: fieldTutor,
    error: errorTutor,
    validate: (v) => v.trim() ? "" : "Informe o nome do tutor.",
  },
  {
    field: fieldPet,
    error: errorPet,
    validate: (v) => v.trim() ? "" : "Informe o nome do pet.",
  },
  {
    field: fieldPhone,
    error: errorPhone,
    validate: (v) => {
      if (!v.trim()) return "Informe o telefone.";
      if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v.trim())) return "Telefone inválido. Ex: (11) 9 1234-5678";
      return "";
    },
  },
  {
    field: fieldService,
    error: errorService,
    validate: (v) => v.trim() ? "" : "Informe a descrição do serviço.",
  },
  {
    field: fieldDate,
    error: errorDate,
    validate: (v) => v ? "" : "Selecione uma data.",
  },
  {
    field: fieldTime,
    error: errorTime,
    validate: (v) => {
      if (!v) return "Selecione um horário.";
      if (!ALL_HOURS.includes(v)) return "Horário fora das janelas válidas (09h-12h, 13h-18h, 19h-21h).";
      return "";
    },
  },
];

function showError(errorEl, msg) {
  errorEl.textContent = msg;
  errorEl.classList.toggle("hidden", !msg);
}

function clearErrors() {
  validations.forEach(({ error }) => {
    error.textContent = "";
    error.classList.add("hidden");
  });
}

function validateAll() {
  let valid = true;
  validations.forEach(({ field, error, validate }) => {
    const msg = validate(field.value);
    showError(error, msg);
    if (msg) valid = false;
  });
  return valid;
}

// Validação em tempo real (ao sair do campo)
validations.forEach(({ field, error, validate }) => {
  field.addEventListener("blur", () => {
    const msg = validate(field.value);
    showError(error, msg);
  });
  field.addEventListener("input", () => {
    if (!error.classList.contains("hidden")) {
      const msg = validate(field.value);
      showError(error, msg);
    }
  });
});

// ============================================================
// SUBMIT — novo agendamento
// ============================================================

modalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateAll()) return;

  const date    = fieldDate.value;
  const time    = fieldTime.value;
  const tutor   = fieldTutor.value.trim();
  const pet     = fieldPet.value.trim();
  const phone   = fieldPhone.value.trim();
  const service = fieldService.value.trim();

  // Verificar conflito de horário
  const existing = loadSchedules(date);
  const conflict = existing.find(s => s.time === time);

  if (conflict) {
    showError(errorTime, `Horário ${time} já está ocupado nesta data.`);
    fieldTime.focus();
    return;
  }

  // Criar novo agendamento
  const newSchedule = {
    id: String(Date.now()),
    date,
    time,
    tutor,
    pet,
    phone,
    service,
  };

  existing.push(newSchedule);
  saveSchedules(date, existing);

  // Se a data do agendamento for a mesma que está sendo visualizada, atualiza
  if (date === filterDate.value) {
    renderSchedules(date);
  }

  closeModal();
});

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  renderSchedules(filterDate.value);
});
