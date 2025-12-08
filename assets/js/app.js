const RATE = 1.95583;

const translations = {
  bg: {
    appTitle: "BGN ⇄ EUR Калкулатор",
    appSubtitle: "Сметка, плащане и баланс при фиксиран курс",
    themeToggle: "Тъмен режим",
    calcTitle: "Сметка, плащане и баланс",
    calcIntro: "Попълнете сума за сметка и плащане в евро или левове. Балансът се изчислява автоматично.",
    rateLabel: "Официален курс:",
    colOperation: "Операция",
    rowBill: "Сметка",
    rowBillSub: "Сума по фактура / дължима сума",
    rowPayment: "Плащане",
    rowPaymentSub: "Реално платена сума",
    rowBalance: "Баланс",
    rowBalanceSub: "Плащане − Сметка (рестото / оставащо за плащане)",
    errorText: "Моля, въведете валидни числа.",
    hintTitle: "<strong>Забележка:</strong> превалутирането използва пълния курс 1.95583.",
    hint1: "Сумите се закръгляват до 2 знака.",
    hint2: "Третият знак < 5 → вторият остава същият.",
    hint3: "Третият знак ≥ 5 → вторият се увеличава с 1."
  },
  en: {
    appTitle: "BGN ⇄ EUR Calculator",
    appSubtitle: "Bill, payment and balance at the fixed rate",
    themeToggle: "Dark mode",
    calcTitle: "Bill, Payment and Balance",
    calcIntro: "Enter bill and payment amounts in EUR or BGN. The balance is calculated automatically.",
    rateLabel: "Official rate:",
    colOperation: "Operation",
    rowBill: "Bill",
    rowBillSub: "Invoice amount / amount due",
    rowPayment: "Payment",
    rowPaymentSub: "Amount effectively paid",
    rowBalance: "Balance",
    rowBalanceSub: "Payment − Bill (change / remaining to pay)",
    errorText: "Please enter valid numbers.",
    hintTitle: "<strong>Note:</strong> conversion uses the full rate 1.95583.",
    hint1: "Amounts are rounded to 2 decimals.",
    hint2: "Third decimal < 5 → second remains the same.",
    hint3: "Third decimal ≥ 5 → second increases by 1."
  }
};

let currentLang = "bg";
let lastEdited = { bill: null, payment: null };

// Rounding
function roundHalfUp(v, d = 2) {
  const f = Math.pow(10, d);
  return Math.round((v + Number.EPSILON) * f) / f;
}

// Translation
function updateLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = dict[key];
    if (!val) return;

    if (val.includes("<")) el.innerHTML = val;
    else el.textContent = val;
  });

  document.querySelectorAll(".btn-lang").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.lang === lang)
  );
}

// Helpers
function getNumber(v) {
  if (v === "" || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Calculator logic
function recalc() {
  const billEurEl = document.getElementById("billEur");
  const billBgnEl = document.getElementById("billBgn");
  const payEurEl = document.getElementById("payEur");
  const payBgnEl = document.getElementById("payBgn");
  const balEurEl = document.getElementById("balEur");
  const balBgnEl = document.getElementById("balBgn");
  const errorEl = document.getElementById("errorText");

  errorEl.style.display = "none";

  let billEur = getNumber(billEurEl.value);
  let billBgn = getNumber(billBgnEl.value);
  let payEur = getNumber(payEurEl.value);
  let payBgn = getNumber(payBgnEl.value);

  // Sync Bill
  if (lastEdited.bill === "eur" && billEur !== null) {
    billBgn = roundHalfUp(billEur * RATE);
    billBgnEl.value = billBgn.toFixed(2);
  }
  if (lastEdited.bill === "bgn" && billBgn !== null) {
    billEur = roundHalfUp(billBgn / RATE);
    billEurEl.value = billEur.toFixed(2);
  }

  // Sync Payment
  if (lastEdited.payment === "eur" && payEur !== null) {
    payBgn = roundHalfUp(payEur * RATE);
    payBgnEl.value = payBgn.toFixed(2);
  }
  if (lastEdited.payment === "bgn" && payBgn !== null) {
    payEur = roundHalfUp(payBgn / RATE);
    payEurEl.value = payEur.toFixed(2);
  }

  // Recalculate balance
  billEur = getNumber(billEurEl.value);
  payEur = getNumber(payEurEl.value);

  if (billEur === null || payEur === null) {
    balEurEl.value = "";
    balBgnEl.value = "";
    return;
  }

  const balEur = roundHalfUp(payEur - billEur);
  const balBgn = roundHalfUp(balEur * RATE);

  balEurEl.value = balEur.toFixed(2);
  balBgnEl.value = balBgn.toFixed(2);
}

// Bind inputs
document.querySelectorAll("input[data-row]").forEach(input =>
  input.addEventListener("input", e => {
    lastEdited[e.target.dataset.row] = e.target.dataset.currency;
    recalc();
  })
);

// Language switch
document.querySelectorAll(".btn-lang").forEach(btn =>
  btn.addEventListener("click", () => updateLanguage(btn.dataset.lang))
);

// Theme switch
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

applyTheme(localStorage.getItem("theme") || "light");

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

// Init
updateLanguage("bg");
