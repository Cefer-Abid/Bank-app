import { account1, account2 } from "./src/data.js";
const accounts = [account1, account2];

const movementsContainer = document.querySelector(".movements");
const labelBalance = document.querySelector(".label--balance");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const btnLogin = document.querySelector(".btn-login");
const inputLoginUsername = document.querySelector(".login--user-name");
const inputLoginPin = document.querySelector(".login--user-pin");
const labelWelcome = document.querySelector(".header__title--user-name");
const containerApp = document.querySelector(".app");
const btnTransfer = document.querySelector(".form--transfer");
const inputTransferAmount = document.querySelector(".input__transfer--amount");
const inputTransferTo = document.querySelector(".input__transfer-to");
const btnClose = document.querySelector(".form--close");
const inputClosePin = document.querySelector(".input__close-pin");
const inputCloseUsername = document.querySelector(".input__close-user");
const btnLoan = document.querySelector(".form--loan");
const inputLoanAmount = document.querySelector(".input__loan-amount");
const btrSort = document.querySelector(".btn--sort");
const labelDate = document.querySelector(".balance__date");
const timerEl = document.querySelector(".logout--timer");

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
    `${minut}`.padStart(2, "0") + ":" + `${second}`.padStart(2, "0");
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
    `${minut}`.padStart(2, "0") + ":" + `${second}`.padStart(2, "0");
};
// Time Function
//////////////////////////////////////////////////

const formatCur = function (acc, display) {
  return new Intl.NumberFormat(acc.locale, {
    style: "currency",
    currency: acc.currency,
  }).format(display);
};

const formatMovementDate = function (date, locale) {
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

// DISPLAY MOVUMENT

const displayMovements = function (account, sort = false) {
  movementsContainer.innerHTML = "";

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    // Date
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const movumentStr = `
    <li class="movements__row">
      <div class="movement__type movements__type--${type}">
       ${i + 1} ${type}
      </div>
      <div class="movement__date">${displayDate}</div>
      <div class="movement__value">${formatCur(account, mov)}</div>
    </li>`;

    movementsContainer.insertAdjacentHTML("afterbegin", movumentStr);
  });
};

// Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, el) => acc + el, 0);

  labelBalance.textContent = formatCur(acc, acc.balance);
};

// Display Summary
const calcDisplaySummary = function (acc) {
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

/////////////////////////////////////////////////////////////////////////////////////////////

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
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

btnLogin.addEventListener("click", function (e) {
  console.log("ok");
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = currentAccount.owner.split(" ")[0];
    containerApp.style.opacity = 100;

    // Date and time
    let now = new Date();
    const option = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      year: "numeric",
      month: "numeric",
      weekday: "long",
    };

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
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Timer
    if (timerFinish) initTime();
    timer = setInterval(startTime, 1000);

    updateUI(currentAccount);
  }
});

// Transfer
btnTransfer.addEventListener("submit", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
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
    inputTransferAmount.value = inputTransferTo.value = "";
    inputTransferTo.blur();
  }
});

btnClose.addEventListener("submit", function (e) {
  e.preventDefault();

  if (
    +inputClosePin.value === currentAccount.pin &&
    inputCloseUsername.value === currentAccount.username
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;

    // Clear field
    inputCloseUsername.value = inputClosePin.value = "";
    inputClosePin.blur();
  }
});

btnLoan.addEventListener("submit", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    currentAccount.movements.some((mov) => mov >= amount * 0.1) &&
    amount > 0
  ) {
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
btrSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

labelBalance.addEventListener("click", function () {
  const movementsUI = Array.from(
    document.querySelectorAll(".movements__value"),
    (el) => el.textContent
  );
  console.log(movementsUI);
});
