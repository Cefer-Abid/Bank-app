'use strict';

import { account1, account2 } from './src/data.js';

const accounts = [account1, account2];

const movementsContainer = document.querySelector('.movements');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const btnLogin = document.querySelector('.login__btn');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const labelWelcome = document.querySelector('.welcome');
const containerApp = document.querySelector('.app');
const btnTransfer = document.querySelector('.form__btn--transfer');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputTransferTo = document.querySelector('.form__input--to');
const btnClose = document.querySelector('.form__btn--close');
const inputClosePin = document.querySelector('.form__input--pin');
const inputCloseUsername = document.querySelector('.form__input--user');
const btnLoan = document.querySelector('.form__btn--loan');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const btrSort = document.querySelector('.btn--sort');
const labelDate = document.querySelector('.balance__date');
const timerEl = document.querySelector('.timer');

// Function

//////////////////////////////////////////////////
// Time Function
let timer, timerFinish, minut, second;
const initTime = function () {
  timer;
  timerFinish = false;
  minut = 5;
  second = 0;
  timerEl.textContent =
    `${minut}`.padStart(2, '0') + ':' + `${second}`.padStart(2, '0');
};
initTime();

const startTime = function () {
  if (second === 0 && minut === 0) {
    containerApp.style.opacity = 0;
    clearInterval(timer);
    return (timerFinish = true);
  } else if (second === 0) {
    minut--;
    second = 60;
  }

  second--;
  timerEl.textContent =
    `${minut}`.padStart(2, '0') + ':' + `${second}`.padStart(2, '0');
};
// Time Function
//////////////////////////////////////////////////

const formatCur = function (acc, display) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(display);
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/ ${month}/ ${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// Coding..
// DISPLAY MOVUMENT

const displayMovements = function (account, sort = false) {
  movementsContainer.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Date
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const movumentStr = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}"> ${i + 1}${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCur(account, mov)}</div>
    </div>`;

    movementsContainer.insertAdjacentHTML('afterbegin', movumentStr);
  });
};

// Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, el) => acc + el, 0);

  labelBalance.textContent = formatCur(acc, acc.balance);
};

// calcDisplayBalance(account2.movements);
/////////////////////////////////

// EUR to USD
// const movement = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const eurToUsd = 1.1;

// const totalDepositUsd = movement
//   .filter(mov => mov > 0)
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

/////////////////////////////////

// Display Summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(acc, incomes);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(acc, Math.abs(out));

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(acc, interest);
};

/////////////////////////////////////////////////////////////////////////////////////////////

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

const updateUI = function (acc) {
  // Display movement
  displayMovements(acc);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

// Login
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    // Date and time
    let now = new Date();
    const option = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      year: 'numeric',
      month: 'numeric',
      weekday: 'long',
    };
    // Normalda:
    // const locale = navigator.language;
    // labelDate.textContent = Intl.DateTimeFormat(locale, option).format(now);

    // Account`lara uygun olaraq:
    const locale = currentAccount.locale;
    setInterval(
      () => (
        (now = new Date()),
        (labelDate.textContent = Intl.DateTimeFormat(locale, option).format(
          now
        ))
      ),
      1000
    );

    // Clear field
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timerFinish) initTime();
    timer = setInterval(startTime, 1000);

    updateUI(currentAccount);
  }
});

// Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer Date
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());

    // updateUI
    updateUI(currentAccount);

    // Reset timer
    initTime();

    // Clear field
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.blur();
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    +inputClosePin.value === currentAccount.pin &&
    inputCloseUsername.value === currentAccount.username
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;

    // Clear field
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (currentAccount.movements.some(mov => mov >= amount * 0.1) && amount > 0) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      // Add loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 2500);
  }

  // Reset timer
  initTime();

  inputLoanAmount.value = ``;
});

// Sort
let sorted = false;
btrSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// From()

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value')
//   );

//   console.log(movementsUI.map(el => el.textContent));
// });

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => el.textContent
  );
  console.log(movementsUI);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// DATE ////////////////////////////////////////////////////////////////////
// const date = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hours = `${now.getHours()}`.padStart(2, 0);
// const minut = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${date}/ ${month}/ ${year}, ${hours}:${minut}`;
////////////////////////////////////////////////////////////////////////////

// console.log('3');
// console.log(+'3');

// console.log(Number.parseInt('330px'));
// console.log(Number.isNaN('330px'));

// console.log(Math.trunc(Math.random() * 3));
// console.log(`                     `);
// console.log(`---------------------`);
// console.log(`                     `);
// console.log(Math.ceil(Math.random() * 3)); //      >>>>>>>>  Math.ceil()

// console.log(Math.ceil(-23.1));

// console.log(7 % 2);
// console.log(Number.parseFloat('2_5'));   // >>>> false

// const x = 10000n;

// console.log(10_000n + 10000n);
// console.log(BigInt(10_000) + 10000n);
////////////////////////////////////////////////////////////////////////////////////////////////////////

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2022, 6, 1), new Date(2022, 3, 1));
// console.log(days1);

// const now = new Date(2021, 2, 1);

// console.log(now.setFullYear(2023));
// const x = now.setFullYear(2023);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const num = 12345678.9;

// console.log('AZ:', new Intl.NumberFormat('az-AZ').format(num));
// console.log('US:', new Intl.NumberFormat('en-US').format(num));
