import { TIMER_MIN, TIMER_SEC } from "./config.js";

const containerApp = document.querySelector(".app");
const timerEl = document.querySelector(".logout--timer");
const labelDate = document.querySelector(".balance__date");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelBalance = document.querySelector(".label--balance");
const labelWelcome = document.querySelector(".welcome");

// Display Welcome
export const displayWelcome = function (msg) {
  labelWelcome.textContent = msg;
};

// Timer
const logoutAccount = function () {
  containerApp.style.opacity = 0;
  displayWelcome("Log in to get started");
};

export const startTimer = function (min = 0, sec = 0) {
  const timeout = min * 60 + sec + 1; // (+1) is to display 00:00
  return setTimeout(() => logoutAccount(), timeout * 1000);
};

const addTimerLabel = function (min, sec) {
  timerEl.textContent = `${min}`.padStart(2, 0) + ":" + `${sec}`.padStart(2, 0);
};

export const displayTimer = function () {
  let min = TIMER_MIN;
  let sec = TIMER_SEC;
  addTimerLabel(min, sec);

  return setInterval(() => {
    if (min === 0 && sec === 0) return;
    sec--;

    if (sec === -1) {
      sec = 59;
      min--;
    }
    addTimerLabel(min, sec);
  }, 1000);
};

// Header Date
let now = new Date();
const option = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  year: "numeric",
  month: "numeric",
  weekday: "long",
};

export const displayHeaderDate = function (locale) {
  return setInterval(
    () => (
      (now = new Date()),
      (labelDate.textContent = Intl.DateTimeFormat(locale, option).format(now))
    ),
    1000
  );
};

// Format Date and Currency
export const formatCur = function (acc, display) {
  return new Intl.NumberFormat(acc.locale, {
    style: "currency",
    currency: acc.currency,
  }).format(display);
};

export const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// Balance
export const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, el) => acc + el, 0);

  labelBalance.textContent = formatCur(acc, acc.balance);
};

// Display Summary
export const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(acc, incomes);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(acc, Math.abs(out));

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(acc, interest);
};
