import dayjs from "dayjs";

import { scheduleNew } from "../../services/schedule-new.js";
import { schedulesDay } from "../schedules/load.js";
import { openingHours } from "../../utils/opening-hours.js";

// ── Elementos do modal ────────────────────────────────────────
const modalOverlay = document.getElementById("modal-overlay");
const btnNewAppt = document.getElementById("btn-new-appt");
const btnCloseModal = document.getElementById("btn-close-modal");
const modalForm = document.getElementById("modal-form");

// ── Campos do formulário ───────────────────────────────────────
const fieldTutor = document.getElementById("tutor-name");
const fieldPet = document.getElementById("pet-name");
const fieldPhone = document.getElementById("phone");
const fieldService = document.getElementById("service-desc");
const fieldDate = document.getElementById("appt-date");
const fieldTime = document.getElementById("appt-time");

// ── Elementos de erro por campo ────────────────────────────────
const errorTutor = document.getElementById("tutor-error");
const errorPet = document.getElementById("pet-error");
const errorPhone = document.getElementById("phone-error");
const errorService = document.getElementById("service-error");
const errorDate = document.getElementById("appt-date-error");
const errorTime = document.getElementById("appt-time-error");

// ── Data do filtro principal (para sincronizar o modal) ────────
const filterDate = document.getElementById("filter-date");

// ── Regras de validação ────────────────────────────────────────
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
      const digits = v.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11)
        return "Telefone inválido. Ex: (11) 9 1234-5678";
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
      if (!openingHours.includes(v))
        return "Horário fora das janelas válidas (09h-12h, 13h-18h, 19h-21h).";
      return "";
    },
  },
];

// ── Helpers de validação ───────────────────────────────────────
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

// ── Máscara de telefone brasileiro ───────────────────────────
function applyPhoneMask(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (!d.length) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

fieldPhone.addEventListener("input", (e) => {
  const cursor = e.target.selectionStart;
  const raw = e.target.value;
  const masked = applyPhoneMask(raw);
  e.target.value = masked;
  // Restaura posição do cursor aproximadamente
  const diff = masked.length - raw.length;
  e.target.setSelectionRange(cursor + diff, cursor + diff);
});

// Validação em tempo real (ao sair do campo e ao digitar)
validations.forEach(({ field, error, validate }) => {
  field.addEventListener("blur", () => {
    showError(error, validate(field.value));
  });
  field.addEventListener("input", () => {
    if (!error.classList.contains("hidden")) {
      showError(error, validate(field.value));
    }
  });
});

// ── Abrir / fechar modal ───────────────────────────────────────
function openModal() {
  // Sincroniza a data do modal com a data do filtro
  fieldDate.value = filterDate.value;
  modalOverlay.classList.remove("hidden");
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

// Fechar ao clicar fora do modal
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

// Fechar com Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
    closeModal();
  }
});

// ── Submit ─────────────────────────────────────────────────────
modalForm.onsubmit = async (event) => {
  event.preventDefault();

  if (!validateAll()) return;

  const date = fieldDate.value;
  const timeVal = fieldTime.value;
  const tutor = fieldTutor.value.trim();
  const pet = fieldPet.value.trim();
  const phone = fieldPhone.value.trim();
  const service = fieldService.value.trim();

  try {
    // Monta o datetime combinando data e hora
    const [hour, minute] = timeVal.split(":");
    const when = dayjs(date).hour(Number(hour)).minute(Number(minute)).second(0).toISOString();

    // Verifica conflito: busca agendamentos do dia e compara hora
    const { scheduleFetchByDay } = await import("../../services/schedule-fetch-by-day.js");
    const existing = await scheduleFetchByDay({ date });
    const conflict = existing.find(
      (s) => dayjs(s.when).format("HH:mm") === timeVal
    );

    if (conflict) {
      showError(errorTime, `Horário ${timeVal} já está ocupado nesta data.`);
      fieldTime.focus();
      return;
    }

    const id = String(Date.now());

    await scheduleNew({ id, tutor, pet, phone, service, when });

    // Recarrega a agenda se a data agendada for a exibida
    if (date === filterDate.value) {
      await schedulesDay();
    }

    closeModal();
  } catch (error) {
    alert("Não foi possível realizar o agendamento.");
    console.log(error);
  }
};
