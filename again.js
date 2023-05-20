'use strict';

import { account1, account2 } from './src/data.js';

const accounts = [account1, account2];

// Start
const movementsSection = document.querySelector('.movements');
const labelBalance = document.querySelector('.balance__value');
const summaryİn = document.querySelector('.summary__value--in');
const summaryOut = document.querySelector('.summary__value--out');
const summaryİnterest = document.querySelector('.summary__value--interest');
const btnSort = document.querySelector('.btn--sort');
const login = document.querySelector('.login');
const loginInputUser = document.querySelector('.login__input--user');
const loginInputPin = document.querySelector('.login__input--pin');
const welcome = document.querySelector('.welcome');
const closeInputUser = document.querySelector('.form__input--user');
const closeInputPin = document.querySelector('.form__input--pin');
const close = document.querySelector('.form--close');
const formTransfer = document.querySelector('.form--transfer');
const transferAmount = document.querySelector('.form__input--amount');
const transferReceiver = document.querySelector('.form__input--to');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const formLoan = document.querySelector('.form--loan');
const dateLabel = document.querySelector('.balance__date');
const timeLabel = document.querySelector('.logout-timer');

// Function

// 3.

//////////////////////////////////////////////////
// Time Function
let timer, timerFinish, minut, second;
const intiTiming = function () {
  timer;
  timerFinish = false;
  minut = 5;
  second = 0;
  timeLabel.textContent =
    `${minut}`.padStart(2, '0') + ':' + `${second}`.padStart(2, '0');
};
intiTiming();

const startTime = function () {
  setInterval(() => {
    if (second === 0 && minut === 0) {
      containerApp.style.opacity = 0;
      clearInterval(timer);
      return (timerFinish = true);
    } else if (second === 0) {
      minut--;
      second = 60;
    }

    second--;
    timeLabel.textContent =
      `${minut}`.padStart(2, '0') + ':' + `${second}`.padStart(2, '0');
  }, 1000);
};
// Time Function

/////////////////////////////////////////

// 2.
const updateUI = function (account) {
  displayMovements(account);
  displayBalance(account);
  displaySummary(account);
};

// 1.
const formatCurr = function (acc, display) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(display);
};

// 0.
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} ago days`;
  else {
    return new Intl.DateTimeFormat(currentAccount.locale).format(date);
  }
};

// Coding

const displayMovements = function (account, sort = false) {
  movementsSection.innerHTML = ``;

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Date
    const date = new Date(currentAccount.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const str = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatCurr(account, mov)}</div>
        </div>
    `;
    movementsSection.insertAdjacentHTML('afterbegin', str);
  });
};

const displayBalance = function (account) {
  account.balance = account.movements.reduce((acc, el) => acc + el);
  labelBalance.textContent = formatCurr(account, account.balance);
};

const displaySummary = function (account) {
  // In
  const inSummary = account.movements.reduce(
    (acc, el) => (el > 0 ? acc + el : acc),
    0
  );
  summaryİn.textContent = formatCurr(account, inSummary);

  // Out
  const outSummary = account.movements.reduce(
    (acc, el) => (el < 0 ? acc + el : acc),
    0
  );
  summaryOut.textContent = formatCurr(account, Math.abs(outSummary));

  // Interest
  const interestSummary = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  summaryİnterest.textContent = formatCurr(account, interestSummary);
};

// Sort
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(account1, !sorted);
  sorted = !sorted;
});

// loge -- in
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

let currentAccount;
login.addEventListener('submit', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username === loginInputUser.value);

  if (
    loginInputUser.value !== currentAccount?.username ||
    +loginInputPin.value !== currentAccount?.pin
  )
    return;
  document.querySelector('.app').style.opacity = '100';
  loginInputUser.value = loginInputPin.value = ``;
  updateUI(currentAccount);
  welcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;

  // DATE
  const option = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    weekday: 'long',
  };

  setInterval(() => {
    const now = new Date();
    dateLabel.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);
  }, 1000);

  // Timing
  startTime();
});

// log out

close.addEventListener('submit', function (e) {
  e.preventDefault();

  if (
    closeInputUser.value === currentAccount.username &&
    +closeInputPin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.pin === currentAccount.pin);
    accounts.splice(index, 1);
    document.querySelector('.app').style.opacity = '0';
    closeInputPin.value = closeInputUser.value = ``;
  }
});

// Transfer

formTransfer.addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = +transferAmount.value;
  const receiver = accounts.find(
    acc => acc?.username === transferReceiver.value
  );

  if (
    receiver &&
    amount > 0 &&
    receiver?.username !== currentAccount.username &&
    amount <= currentAccount.balance
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    const dateStr = new Date();
    currentAccount.movementsDates.push(dateStr.toISOString());
    receiver.movementsDates.push(dateStr.toISOString());

    transferReceiver.value = transferAmount.value = ``;
    transferReceiver.blur();
    updateUI(currentAccount);

    // Time
    intiTiming();
  }
});

// Loan

formLoan.addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;

  if (currentAccount.movements.some(mov => mov >= amount * 0.1) && amount > 0) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      const dateStr = new Date();
      currentAccount.movementsDates.push(dateStr.toISOString());
      updateUI(currentAccount);

      inputLoanAmount.value = ``;
      inputLoanAmount.blur();

    }, 2500);

    // Time
    intiTiming();
  }
});
