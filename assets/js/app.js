const RATE = 1.95583;

/* ========================
   TRANSLATIONS
======================== */
const translations = {
  bg: {
    appTitle: "EUR ⇄ BGN Калкулатор",
    appSubtitle: "Официален курс: 1 EUR = 1.95583 BGN",

    themeToggle: "Тъмен режим",

    calcTitle: "Сметка, плащане и ресто",
    calcIntro: "Попълнете сума за сметка и плащане. Рестото се изчислява автоматично.",

    rowBill: "Сметка",
    rowBillSub: "(Дължима сума)",
    decimalExample: "Напр. 12.34",
    commaError: "Използвайте точка (.) вместо запетая.",

    rowPayment: "Плащане",
    rowPaymentSub: "(Реално платена сума)",

    rowBalance: "Ресто",
    rowBalanceSub: "(Плащане − Сметка = Ресто)",

    rulesTitle: "Правила за закръгляване и фиксиран курс",
    rulesBody:
      "Официалният курс не се закръглява. Всички суми се преобразуват по пълния курс 1 EUR = 1.95583 BGN. Резултатите се закръгляват до два знака след десетичната запетая.",
    rulesNote:
      "<strong>Забележка:</strong> превалутирането използва пълния курс 1.95583.",
    rule1: "Сумите се закръгляват до 2 знака.",
    rule2: "Третият знак < 5 → вторият остава същият.",
    rule3: "Третият знак ≥ 5 → вторият се увеличава с 1.",
    rule4: "Възможна е разлика от 0.01 лв. поради закръгляване.",

    footerCombined:
      "MoeToResto · EUR ⇄ BGN помощ за преходния период · Не заменя официални разяснения.",

    negativeChange: "Ресто е отрицателно. Платената сума не покрива сметката."
  },

  en: {
    appTitle: "EUR ⇄ BGN Calculator",
    appSubtitle: "Official rate: 1 EUR = 1.95583 BGN",

    themeToggle: "Dark mode",

    calcTitle: "Bill, Payment and Change",
    calcIntro: "Enter bill and payment amounts. Change is calculated automatically.",

    rowBill: "Bill",
    rowBillSub: "(Amount due)",
    decimalExample: "e.g. 12.34",
    commaError: "Please use dot (.) instead of comma.",

    rowPayment: "Payment",
    rowPaymentSub: "(Amount paid)",

    rowBalance: "Change",
    rowBalanceSub: "(Payment − Bill = Change)",

    rulesTitle: "Rounding rules and fixed conversion rate",
    rulesBody:
      "The official conversion rate must not be rounded. All amounts are converted using the full rate 1 EUR = 1.95583 BGN. Results are rounded to two decimal places.",
    rulesNote:
      "<strong>Note:</strong> conversion uses the full rate 1.95583.",
    rule1: "Amounts are rounded to 2 decimals.",
    rule2: "Third decimal < 5 → second stays the same.",
    rule3: "Third decimal ≥ 5 → second increases by 1.",
    rule4: "BGN amounts may differ by 0.01 лв. due to rounding.",

    footerCombined:
      "MoeToResto · EUR ⇄ BGN helper website · Does not replace official explanations.",

    negativeChange: "Change is negative. Payment does not cover the bill."
  }
};

let currentLang = "bg";
let lastEdited = { bill: null, payment: null };

/* ========================
   INPUT SANITIZATION
======================== */
function cleanInputValue(raw) {
  if (!raw) return "";

  // remove minus
  raw = raw.replace(/-/g, "");

  // allow only one dot
  const parts = raw.split(".");
  if (parts.length > 2) {
    raw = parts[0] + "." + parts.slice(1).join("");
  }

  // max 2 decimals
  const p = raw.split(".");
  if (p[1] && p[1].length > 2) {
    raw = p[0] + "." + p[1].slice(0, 2);
  }

  return raw;
}

function roundHalfUp(v, digits = 2) {
  const f = Math.pow(10, digits);
  return Math.round((v + Number.EPSILON) * f) / f;
}

function getNumber(v) {
  if (v === "" || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ========================
   COMMA BLOCKING
======================== */
function showCommaError() {
  const errorEl = document.getElementById("errorText");
  if (!errorEl) return;
  errorEl.textContent = translations[currentLang].commaError;
  errorEl.style.display = "block";
}

function blockCommaKey(e) {
  if (e.key === ",") {
    e.preventDefault();
    showCommaError();
  }
}

function blockCommaPaste(e) {
  const pasted = (e.clipboardData || window.clipboardData).getData("text");
  if (pasted && pasted.includes(",")) {
    e.preventDefault();
    showCommaError();
  }
}

/* ========================
   RECALCULATION
======================== */
function recalc() {
  const billEurEl = document.getElementById("billEur");
  const billBgnEl = document.getElementById("billBgn");
  const payEurEl  = document.getElementById("payEur");
  const payBgnEl  = document.getElementById("payBgn");
  const balEurEl  = document.getElementById("balEur");
  const balBgnEl  = document.getElementById("balBgn");
  const warningEl = document.getElementById("changeWarning");
  const errorEl   = document.getElementById("errorText");

  errorEl.style.display = "none";
  warningEl.style.display = "none";
  balEurEl.parentElement.classList.remove("negative");
  balBgnEl.parentElement.classList.remove("negative");

  billEurEl.value = cleanInputValue(billEurEl.value);
  billBgnEl.value = cleanInputValue(billBgnEl.value);
  payEurEl.value  = cleanInputValue(payEurEl.value);
  payBgnEl.value  = cleanInputValue(payBgnEl.value);

  let billEur = getNumber(billEurEl.value);
  let billBgn = getNumber(billBgnEl.value);
  let payEur  = getNumber(payEurEl.value);
  let payBgn  = getNumber(payBgnEl.value);

  // cleanup paired fields
  if (lastEdited.bill === "eur" && billEurEl.value === "") billBgnEl.value = "";
  if (lastEdited.bill === "bgn" && billBgnEl.value === "") billEurEl.value = "";
  if (lastEdited.payment === "eur" && payEurEl.value === "") payBgnEl.value = "";
  if (lastEdited.payment === "bgn" && payBgnEl.value === "") payEurEl.value = "";

  // sync
  if (lastEdited.bill === "eur" && billEur !== null)
    billBgnEl.value = roundHalfUp(billEur * RATE).toFixed(2);

  if (lastEdited.bill === "bgn" && billBgn !== null)
    billEurEl.value = roundHalfUp(billBgn / RATE).toFixed(2);

  if (lastEdited.payment === "eur" && payEur !== null)
    payBgnEl.value = roundHalfUp(payEur * RATE).toFixed(2);

  if (lastEdited.payment === "bgn" && payBgn !== null)
    payEurEl.value = roundHalfUp(payBgn / RATE).toFixed(2);

  billEur = getNumber(billEurEl.value);
  payEur  = getNumber(payEurEl.value);

  if (billEur === null || payEur === null) {
    balEurEl.value = "";
    balBgnEl.value = "";
    return;
  }

  const balEur = roundHalfUp(payEur - billEur);
  const balBgn = roundHalfUp(balEur * RATE);

  balEurEl.value = balEur.toFixed(2);
  balBgnEl.value = balBgn.toFixed(2);

  if (balEur < 0) {
    warningEl.textContent = translations[currentLang].negativeChange;
    warningEl.style.display = "block";
    balEurEl.parentElement.classList.add("negative");
    balBgnEl.parentElement.classList.add("negative");
  }
}

/* ========================
   INPUT LISTENERS
======================== */
document.querySelectorAll("input[data-row]").forEach(input => {
  input.addEventListener("keydown", blockCommaKey);
  input.addEventListener("paste", blockCommaPaste);

  input.addEventListener("input", e => {
    input.value = cleanInputValue(input.value);
    lastEdited[e.target.dataset.row] = e.target.dataset.currency;
    recalc();
  });
});

/* ========================
   THEME
======================== */
function updateThemeLabel(theme) {
  const label = document.querySelector('#themeToggle span[data-i18n="themeToggle"]');
  const icon  = document.getElementById("themeIcon");
  if (!label || !icon) return;

  if (theme === "dark") {
    icon.textContent = "☀️";
    label.textContent = currentLang === "bg" ? "Светъл режим" : "Light mode";
  } else {
    icon.textContent = "🌙";
    label.textContent = currentLang === "bg" ? "Тъмен режим" : "Dark mode";
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeLabel(theme);
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark"
    ? "light"
    : "dark";
  applyTheme(next);
});

/* ========================
   LANGUAGE
======================== */
function applyTranslations() {
  const dict = translations[currentLang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (!dict[key]) return;
    dict[key].includes("<") ? el.innerHTML = dict[key] : el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  document.querySelectorAll(".btn-lang").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.lang === currentLang)
  );

  updateThemeLabel(document.documentElement.getAttribute("data-theme") || "light");
}

document.querySelectorAll(".btn-lang").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    applyTranslations();
    recalc();
  });
});

/* ========================
   INIT
======================== */
applyTheme(localStorage.getItem("theme") || "light");
applyTranslations();
recalc();
