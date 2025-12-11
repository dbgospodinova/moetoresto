const RATE = 1.95583;

const translations = {
  bg: {
    appTitle: "BGN ⇄ EUR Калкулатор",
    appSubtitle: "Официален курс: 1 EUR = 1.95583 BGN",

    themeToggle: "Тъмен режим",

    calcTitle: "Сметка, плащане и ресто",
    calcIntro: "Попълнете сума за сметка и плащане. Рестото се изчислява автоматично.",

    rowBill: "Сметка",
    rowBillSub: "(Дължима сума)",

    rowPayment: "Плащане",
    rowPaymentSub: "(Реално платена сума)",

    rowBalance: "Ресто",
    rowBalanceSub: "(Плащане − Сметка = Ресто)",

    errorText: "Моля, въведете валидни числа.",

    rulesTitle: "Правила за закръгляване и фиксиран курс",
    rulesBody:
      "Официалният курс не се закръглява. Всички суми се преобразуват по пълния курс 1 EUR = 1.95583 BGN. Резултатите се закръгляват до два знака след десетичната запетая.",
    rulesNote:
      "<strong>Забележка:</strong> превалутирането използва пълния курс 1.95583.",
    rule1: "Сумите се закръгляват до 2 знака.",
    rule2: "Третият знак &lt; 5 → вторият остава същият.",
    rule3: "Третият знак ≥ 5 → вторият се увеличава с 1.",
    rule4: "При суми в лева е възможна разлика от 0.01 ст. поради закръгляване.",

    footerLeft: "MoeToResto · BGN ⇄ EUR помощ за преходния период",
    footerRight: "Сайт за взаимопомощ – не заменя официални разяснения.",

    negativeChange: "Ресто е отрицателно. Платената сума не покрива сметката."
  },

  en: {
    appTitle: "BGN ⇄ EUR Calculator",
    appSubtitle: "Official rate: 1 EUR = 1.95583 BGN",

    themeToggle: "Dark mode",

    calcTitle: "Bill, Payment and Change",
    calcIntro: "Enter bill and payment amounts. Change is calculated automatically.",

    rowBill: "Bill",
    rowBillSub: "(Amount due)",

    rowPayment: "Payment",
    rowPaymentSub: "(Amount paid)",

    rowBalance: "Change",
    rowBalanceSub: "(Payment − Bill = Change)",

    errorText: "Please enter valid numbers.",

    rulesTitle: "Rounding rules and fixed conversion rate",
    rulesBody:
      "The official conversion rate must not be rounded. All amounts are converted using the full rate 1 EUR = 1.95583 BGN. Results are rounded to two decimal places.",
    rulesNote:
      "<strong>Note:</strong> conversion uses the full rate 1.95583.",
    rule1: "Amounts are rounded to 2 decimals.",
    rule2: "Third decimal &lt; 5 → second stays the same.",
    rule3: "Third decimal ≥ 5 → second increases by 1.",
    rule4: "BGN amounts may differ by 0.01 stotinki due to rounding.",

    footerLeft: "MoeToResto · Helper website for the transition period",
    footerRight: "Support site – does not replace official explanations.",

    negativeChange: "Change is negative. Payment does not cover the bill."
  }
};

let currentLang = "bg";
let lastEdited = { bill: null, payment: null };

/* ------------------------
   SAFE NUMBER CLEANING
------------------------- */
function cleanInputValue(raw) {
  if (!raw) return "";

  // remove any minus
  raw = raw.replace(/-/g, "");

  // allow only ONE decimal point
  const parts = raw.split(".");
  if (parts.length > 2) {
    raw = parts[0] + "." + parts.slice(1).join("");
  }

  // recompute parts after potential join
  const p = raw.split(".");
  if (p[1] && p[1].length > 2) {
    p[1] = p[1].slice(0, 2);
    raw = p.join(".");
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

/* ------------------------
   FULL RECALCULATION
------------------------- */
function recalc() {
  const billEurEl = document.getElementById("billEur");
  const billBgnEl = document.getElementById("billBgn");
  const payEurEl = document.getElementById("payEur");
  const payBgnEl = document.getElementById("payBgn");
  const balEurEl = document.getElementById("balEur");
  const balBgnEl = document.getElementById("balBgn");
  const warningEl = document.getElementById("changeWarning");

  // Reset warning + negative styling
  warningEl.style.display = "none";
  balEurEl.parentElement.classList.remove("negative");
  balBgnEl.parentElement.classList.remove("negative");

  // Clean values BEFORE reading numbers
  billEurEl.value = cleanInputValue(billEurEl.value);
  billBgnEl.value = cleanInputValue(billBgnEl.value);
  payEurEl.value  = cleanInputValue(payEurEl.value);
  payBgnEl.value  = cleanInputValue(payBgnEl.value);

  let billEur = getNumber(billEurEl.value);
  let billBgn = getNumber(billBgnEl.value);
  let payEur  = getNumber(payEurEl.value);
  let payBgn  = getNumber(payBgnEl.value);

  // Sync Bill
  if (lastEdited.bill === "eur" && billEur !== null) {
    billBgnEl.value = roundHalfUp(billEur * RATE).toFixed(2);
  }
  if (lastEdited.bill === "bgn" && billBgn !== null) {
    billEurEl.value = roundHalfUp(billBgn / RATE).toFixed(2);
  }

  // Sync Payment
  if (lastEdited.payment === "eur" && payEur !== null) {
    payBgnEl.value = roundHalfUp(payEur * RATE).toFixed(2);
  }
  if (lastEdited.payment === "bgn" && payBgn !== null) {
    payEurEl.value = roundHalfUp(payBgn / RATE).toFixed(2);
  }

  // Re-read after sync
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

/* ------------------------
   THEME
------------------------- */
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
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next    = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

/* ------------------------
   TRANSLATIONS & LANGUAGE
------------------------- */
function applyTranslations() {
  const dict = translations[currentLang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = dict[key];
    if (!val) return;

    if (val.includes("<")) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  // Highlight active language button
  document.querySelectorAll(".btn-lang").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  // Refresh theme label text according to current language
  const theme = document.documentElement.getAttribute("data-theme") || "light";
  updateThemeLabel(theme);
}

// Language switch buttons
document.querySelectorAll(".btn-lang").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    applyTranslations();
    recalc();
  });
});

/* ------------------------
   INPUT BINDINGS
------------------------- */
document.querySelectorAll("input[data-row]").forEach(input => {
  input.addEventListener("input", e => {
    input.value = cleanInputValue(input.value);
    lastEdited[e.target.dataset.row] = e.target.dataset.currency;
    recalc();
  });
});

/* ------------------------
   INIT
------------------------- */
applyTheme(localStorage.getItem("theme") || "light");
applyTranslations();
recalc();
