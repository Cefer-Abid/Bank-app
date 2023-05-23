import { TIMER_MIN, TIMER_SEC } from "./config.js";

const containerApp = document.querySelector(".app");
const timerEl = document.querySelector(".logout--timer");

const logout = function () {
  containerApp.style.opacity = 0;
};

// Developed setTimeout
export const startTimer = function (min = 0, sec = 0) {
  const timeout = min * 60 + sec + 1; // (+1) for can display 00:00
  console.log(timeout);
  return setTimeout(() => logout(), timeout * 1000);
};

// Display timer Label
const addTimerLabel = function (min, sec) {
  timerEl.textContent = `${min}`.padStart(2, 0) + ":" + `${sec}`.padStart(2, 0);
};

export const displayTimer = function () {
  let min = TIMER_MIN;
  let sec = TIMER_SEC;
  return setInterval(() => {
    if (min === 0 && sec === -1) return addTimerLabel(min, sec);
    if (min === -1) sec = 59;
    if (sec === -1) {
      sec = 59;
      min--;
    }

    addTimerLabel(min, sec);
    sec--;
  }, 1000);
};
