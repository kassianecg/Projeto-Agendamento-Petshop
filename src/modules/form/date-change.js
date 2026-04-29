import { schedulesDay } from "../schedules/load.js";

// Recarrega a agenda ao mudar a data do filtro
const filterDate = document.getElementById("filter-date");

filterDate.onchange = () => schedulesDay();
