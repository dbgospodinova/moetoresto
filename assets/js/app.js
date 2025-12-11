const RATE = 1.95583;

const translations = {
  bg: {
    appTitle: "BGN ⇄ EUR Калкулатор",
    appSubtitle: "Официален курс: 1 EUR = 1.95583 BGN",

    themeToggle: "Тъмен режим",

    calcTitle: "Сметка, плащане и ресто",
    calcIntro: "Попълнете сума за сметка и плащане. Рестото се изчислява автоматично.",

    colOperation: "Операция",

    rowBill: "Сметка",
    rowBillSub: "Дължима сума",

    rowPayment: "Плащане",
    rowPaymentSub: "Реално платена сума",

    rowBalance: "Ресто",
    rowBalanceSub: "Плащане − Сметка = Ресто",

    errorText: "Моля, въведете валидни числа.",

    hintTitle: "<strong>Забележка:</strong> превалутирането използва пълния курс 1.95583.",
    hint1: "Сумите се закръгляват до 2 знака.",
    hint2: "Третият знак < 5 → вторият остава същият.",
    hint3: "Третият знак ≥ 5 → вторият се увеличава с 1.",

    footerLeft: "MoeToResto · BGN ⇄ EUR помощ за преходния период",
    footerRight: "Сайт за взаимопомощ – не заменя официални разяснения."
  },

  en: {
    appTitle: "BGN ⇄ EUR Calculator",
    appSubtitle: "Official rate: 1 EUR = 1.95583 BGN",

    themeToggle: "Dark mode",

    calcTitle: "Bill, Payment and Change",
    calcIntro: "Enter bill and payment amounts. Change is calculated automatically.",

    colOperation: "Operation",

    rowBill: "Bill",
    rowBillSub: "Amount due",

    rowPayment: "Payment",
    rowPaymentSub: "Amount paid",

    rowBalance: "Change",
    rowBalanceSub: "Payment − Bill = Change",

    errorText: "Please enter valid numbers.",

    hintTitle: "<strong>Note:</strong> conversion uses the full rate 1.95583.",
    hint1: "Amounts round to 2 decimals.",
    hint2: "Third decimal < 5 → second unchanged.",
    hint3: "Third decimal ≥ 5 → second increases by 1.",

    footerLeft: "MoeToResto · Helper website for the transition period",
    footerRight: "Support site – does not replace official explanations."
  }
};

let currentLang = "bg";
let lastEdited = { bill: null, payment: null };

/* -------------------------
      ROUNDING
-------------------------- */
function roundHalfUp(v, d = 2) {
  const f = Math.pow(10, d);
  return Math.round((v + Number.EPSILON) * f) / f;
}

/* -------------------------
      LANGUAGE SWITCH
-------------------------- */
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

  applyTheme(document.documentElement.getAttribute("data-theme") || "light");

  document.querySelectorAll(".btn-lang").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.lang === lang)
  );
}

/* -------------------------
      NUMBER PARSE
-------------------------- */
function getNumber(v) {
  if (v === "" || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* -------------------------
      CALCULATOR LOGIC
-------------------------- */
function recalc() {
  const billEurEl = document.getElementById("billEur");
  const billBgnEl = document.getElementById("billBgn");
  const payEurEl = document.getElementById("payEur");
  const payBgnEl = document.getElementById("payBgn");
  const balEurEl = document.getElementById("balEur");
  const balBgnEl = document.getElementById("balBgn");

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

/* -------------------------
      INPUT BINDINGS
-------------------------- */
document.querySelectorAll("input[data-row]").forEach(input =>
  input.addEventListener("input", e => {
    lastEdited[e.target.dataset.row] = e.target.dataset.currency;
    recalc();
  })
);

/* -------------------------
   HARD LIMIT: MAX 2 DECIMALS
-------------------------- */
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener("beforeinput", e => {
    const text = input.value;
    const incoming = e.data;

    if (e.inputType && e.inputType.startsWith("delete")) return;

    if (incoming === "." && !text.includes(".")) return;

    if (!text.includes(".")) return;

    const decimals = text.split(".")[1] ?? "";

    if (decimals.length >= 2) {
      e.preventDefault();
      return;
    }
  });
});

/* -------------------------
      THEME SWITCH
-------------------------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const icon = document.getElementById("themeIcon");
  const label = document.querySelector('#themeToggle span[data-i18n="themeToggle"]');

  if (theme === "dark") {
    icon.textContent = "☀️";
    label.textContent = currentLang === "bg" ? "Светъл режим" : "Light mode";
  } else {
    icon.textContent = "🌙";
    label.textContent = currentLang === "bg" ? "Тъмен режим" : "Dark mode";
  }
}

applyTheme(localStorage.getItem("theme") || "light");

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

/* -------------------------
      LANGUAGE BUTTONS
-------------------------- */
document.querySelectorAll(".btn-lang").forEach(btn =>
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    updateLanguage(lang);
  })
);

/* -------------------------
      INIT LANGUAGE
-------------------------- */
updateLanguage("bg");
