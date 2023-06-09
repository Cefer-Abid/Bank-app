// prettier-ignore
import { startTimer, displayTimer, displayHeaderDate, formatCur, formatMovementDate, calcDisplayBalance, calcDisplaySummary, displayWelcome} from "./helperFunctions.js";
import { TIMER_MIN, TIMER_SEC } from "./config.js";
import accounts from "./data.js";

const movementsContainer = document.querySelector(".movements");
const btnLogin = document.querySelector(".btn-login");
const inputLoginUsername = document.querySelector(".login--user-name");
const inputLoginPin = document.querySelector(".login--user-pin");
const containerApp = document.querySelector(".app");
const formTransfer = document.querySelector(".form--transfer");
const inputTransferAmount = document.querySelector(".input__transfer--amount");
const inputTransferTo = document.querySelector(".input__transfer-to");
const formClose = document.querySelector(".form--close");
const inputClosePin = document.querySelector(".input__close-pin");
const inputCloseUsername = document.querySelector(".input__close-user");
const formLoan = document.querySelector(".form--loan");
const inputLoanAmount = document.querySelector(".input__loan-amount");
const btrSort = document.querySelector(".btn--sort");

const state = {
  currentAccount: {},
  logoutAfter: {},
  timerLabel: {},
  controlHeaderDate: {},
  sorted: false,
};

// Update Timer
const updateTimer = () => {
  if (state.logoutAfter && state.timerLabel) {
    clearTimeout(state.logoutAfter);
    clearInterval(state.timerLabel);
  }
  state.timerLabel = displayTimer();
  state.logoutAfter = startTimer(TIMER_MIN, TIMER_SEC);
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
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  state.currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );

  if (state.currentAccount?.pin !== +inputLoginPin.value) return;
  // Display UI and message
  displayWelcome(`Welcome back, ${state.currentAccount.owner.split(" ")[0]}`);

  containerApp.style.opacity = 100;

  // Date and time
  state.controlHeaderDate && clearInterval(state.controlHeaderDate);
  state.controlHeaderDate = displayHeaderDate(state.currentAccount.locale);

  // Clear field
  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginPin.blur();

  // Timer
  updateTimer();

  updateUI(state.currentAccount);
});

// Transfer
formTransfer.addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= state.currentAccount.balance &&
    receiverAcc?.username !== state.currentAccount.username
  ) {
    state.currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer Date
    receiverAcc.movementsDates.push(new Date().toISOString());
    state.currentAccount.movementsDates.push(new Date().toISOString());

    // updateUI
    updateUI(state.currentAccount);

    // Reset timer
    updateTimer();

    // Clear field
    inputTransferAmount.value = inputTransferTo.value = "";
    inputTransferTo.blur();
  }
});

formClose.addEventListener("submit", function (e) {
  e.preventDefault();

  if (
    +inputClosePin.value === state.currentAccount.pin &&
    inputCloseUsername.value === state.currentAccount.username
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === state.currentAccount.username
    );

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    displayWelcome("Log in to get started");

    // Clear field
    inputCloseUsername.value = inputClosePin.value = "";
    inputClosePin.blur();
  }
});

formLoan.addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (
    state.currentAccount.movements.some((mov) => mov >= amount * 0.1) &&
    amount > 0
  ) {
    setTimeout(function () {
      state.currentAccount.movements.push(amount);

      // Add loan Date
      state.currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(state.currentAccount);
    }, 2500);
  }

  // Reset timer
  updateTimer();

  inputLoanAmount.value = ``;
});

// Sort
btrSort.addEventListener("click", function () {
  state.sorted = !state.sorted;
  displayMovements(state.currentAccount, state.sorted);
});
