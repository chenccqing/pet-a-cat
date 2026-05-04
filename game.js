const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const SAVE_KEY = "before-cat-life-v4";
const LANG_KEY = "before-cat-life-lang";
const TOTAL_MONTHS = 180;
const MONTHS_PER_TURN = 12;
const YEARS_PER_DAY = TOTAL_MONTHS / 12;
const YEAR_TIME_BUDGET = 240;
const ABANDON_HOURS = 36;

function defaultLifeEndMonth(startAgeMonths = 0) {
  return startAgeMonths >= 36 ? startAgeMonths + 120 : TOTAL_MONTHS;
}

function lifeEndMonth() {
  return state?.lifeEndMonth || defaultLifeEndMonth(state?.startAgeMonths || 0);
}

function playableMonths() {
  return Math.max(1, lifeEndMonth() - (state?.startAgeMonths || 0));
}

function playableYears() {
  return Math.ceil(playableMonths() / 12);
}

function playYearIndex() {
  return Math.min(playableYears(), Math.max(1, Math.floor((state.month - state.startAgeMonths - 1) / 12) + 1));
}

function playDayTotal() {
  return 1;
}

const money = new Intl.NumberFormat("en-HK", {
  style: "currency",
  currency: "HKD",
  maximumFractionDigits: 0,
});

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
let currentLang = localStorage.getItem(LANG_KEY) || "zh";

const uiCopy = {
  zh: {
    docTitle: "養之前：15年養貓責任模擬",
    langLabel: "語言",
    heroEyebrow: "香港首個 15 年養貓責任模擬",
    heroTitle: "養之前",
    heroLead: "一隻電子貓，陪你先走完一次「責任」。",
    setupTitle: "開始前，設定領養條件",
    setupNote: "貓咪最終性格不是固定答案，會隨你的餵食、陪伴、清潔、醫療、訓練和忽略方式慢慢改變。",
    startAge: "領養起點",
    sex: "貓性別",
    coat: "貓咪外觀",
    catName: "貓名",
    fund: "起始養貓基金",
    startButton: "開始年度責任體驗",
    perTurn: "每次一年",
    progressButton: "本次進度",
    summaryButton: "看結算",
    resetButton: "重新開始",
    nextYear: "進入下一年",
    fundLeft: "剩餘基金",
    spentTotal: "累積支出",
    yearSpent: "今年支出",
    noBill: "還沒有帳單",
    annualNeeds: "今年要做",
    sudden: "突發情況",
    shop: "商店",
    shopShelf: "道具貨架",
    inventory: "背包",
    durability: "用品壽命",
    achievements: "親密成就",
    history: "生命履歷",
    log: "本次紀錄",
    effortTitle: "投入程度判斷",
    lifeProgress: "貓生進度",
    evolutionTable: "3×3 Adult 進化表",
    summaryEyebrow: "貓生模擬完成",
    summaryDone: "走完一生。",
    summaryLabels: ["總支出", "推算一生", "陪伴次數", "忽略天數", "醫療事件", "醫療總支出", "最大單次帳單", "拖延代價", "重大選擇", "最終成長", "埋雷總數", "年度回顧"],
    reviewRecord: "年度回顧留下的紀錄",
    finalQuestion: "如果這不是電子貓，而是真實生命，你還會開始嗎？",
    readyButton: "我準備好",
    notReadyButton: "我未準備好",
    playAgain: "再體驗一次",
    medeciEyebrow: "現實照顧下一步",
    medeciText: "如果這不是電子貓，而是真實貓咪，主人需要記錄飲食、疫苗、絕育、覆診、慢性病、老年照護和最後的陪伴。MedeciPets 是協助主人管理貓咪生老病死全週期的照顧網站。",
    medeciLink: "前往 MedeciPets",
  },
  en: {
    docTitle: "Before You Adopt: 15-Year Cat Care Simulator",
    langLabel: "Language",
    heroEyebrow: "A 15-year cat care responsibility simulator",
    heroTitle: "Before You Adopt",
    heroLead: "A digital cat that lets you experience responsibility before real adoption.",
    setupTitle: "Set up the adoption scenario",
    setupNote: "Your cat's final personality is not fixed. It changes through feeding, play, hygiene, medical care, training, and neglect.",
    startAge: "Adoption starting point",
    sex: "Cat sex",
    coat: "Cat appearance",
    catName: "Cat name",
    fund: "Starting care fund",
    startButton: "Start yearly care simulation",
    perTurn: "One click = one year",
    progressButton: "Progress",
    summaryButton: "Summary",
    resetButton: "Restart",
    nextYear: "Go to next year",
    fundLeft: "Remaining fund",
    spentTotal: "Total spent",
    yearSpent: "This year spent",
    noBill: "No bill yet",
    annualNeeds: "This year",
    sudden: "Event",
    shop: "Shop",
    shopShelf: "Supplies shelf",
    inventory: "Inventory",
    durability: "Item lifespan",
    achievements: "Bonding milestones",
    history: "Life record",
    log: "Session log",
    effortTitle: "Care workload",
    lifeProgress: "Life progress",
    evolutionTable: "3×3 Adult evolution map",
    summaryEyebrow: "Cat life simulation complete",
    summaryDone: "Life completed.",
    summaryLabels: ["Total spent", "Projected lifetime", "Play sessions", "Neglect days", "Medical events", "Medical spending", "Largest bill", "Cost of delay", "Major choices", "Final growth", "Buried risks", "Annual reviews"],
    reviewRecord: "Records left by annual reviews",
    finalQuestion: "If this were not a digital cat but a real life, would you still start?",
    readyButton: "I'm ready",
    notReadyButton: "I'm not ready",
    playAgain: "Try again",
    medeciEyebrow: "Next step in real care",
    medeciText: "If this were a real cat, the owner would need to manage diet, vaccines, neutering, follow-ups, chronic illness, senior care, and end-of-life companionship. MedeciPets helps owners manage the full life cycle of cat care.",
    medeciLink: "Visit MedeciPets",
  },
};

const actionTitleEn = {
  nutrition: "Food",
  supplies: "Supplies",
  hygiene: "Hygiene",
  enrichment: "Play",
  training: "Training",
  sleep: "Night routine",
  vet: "Medical",
  lifestyle: "Safety / travel",
};

const sceneTitleEn = {
  living: "Living room",
  balcony: "Balcony",
  bedroom: "Bedroom",
  garden: "Yard",
  shop: "Shop",
  park: "Park",
  friend: "Friend's home",
};

function copy(key) {
  return uiCopy[currentLang]?.[key] || uiCopy.zh[key] || key;
}

function actionTitle(key) {
  return currentLang === "en" ? actionTitleEn[key] || actionMeta[key]?.title || key : actionMeta[key]?.title || key;
}

function sceneTitle(key) {
  return currentLang === "en" ? sceneTitleEn[key] || sceneMeta[key]?.title || key : sceneMeta[key]?.title || key;
}

const itemNamesEn = {
  dryFood: "Dry food",
  freezeDry: "Freeze-dried treats",
  freshFood: "Fresh food",
  wetFood: "Wet food",
  treats: "Treat sticks",
  litter: "Cat litter",
  litterBox: "Litter box",
  foodBowl: "Food/water bowls",
  filter: "Water fountain filter",
  wandToy: "Wand toy",
  mouseToy: "Mouse toy",
  puzzleToy: "Puzzle toy",
  scratcher: "Scratcher",
  catBed: "Cat bed",
  catTree: "Cat tree",
  outfit: "Cat outfit",
  cleaner: "Cleaning supplies",
  medicine: "Basic medicine",
  carrier: "Carrier",
  sitterTicket: "Pet sitter voucher",
  windowNet: "Window net",
};

const shopCopyEn = {
  dryFood: ["Dry food bag", "Affordable and stable, but moisture must be managed."],
  wetFood: ["Wet food case", "Better hydration, useful for low appetite or senior cats."],
  freezeDry: ["Freeze-dried treats", "High happiness, but too much can cause weight gain."],
  treats: ["Treat sticks", "Good for reward or comfort, not a meal replacement."],
  litter: ["Cat litter bag", "A consumable that hygiene care uses up."],
  litterBox: ["Litter box", "A basic living item, not a decoration."],
  foodBowl: ["Food/water bowls", "Affects daily feeding and drinking."],
  filter: ["Water fountain filter", "A consumable; not changing it affects water quality."],
  scratcher: ["Cat scratcher", "Lowers sofa-scratching risk."],
  wandToy: ["Wand toy", "Basic item for play interactions."],
  mouseToy: ["Mouse toy", "Supports chase-style play."],
  puzzleToy: ["Puzzle toy", "Reduces boredom, especially for high-need cats."],
  windowNet: ["Window net installation", "Not a cute accessory. This is a safety baseline."],
  carrier: ["Carrier", "Needed for vet visits, moving, travel, and emergencies."],
  vaccine: ["First vaccine", "A core early-life medical cost."],
  neuter: ["Neutering surgery", "Male and female cats face different real-life risks if skipped."],
  catBed: ["Cat bed", "Makes the bedroom feel more like a cat home."],
  catTree: ["Cat tree", "Supports activity needs and room decoration."],
  outfit: ["Cat outfit", "Included as a dressing item; not every cat enjoys it."],
};

const evolutionCopyEn = {
  "low-lazy": ["Distant Street Cat", "Low bonding, low activity. The cat learns to expect less from humans.", "Keeps more distance and rarely initiates contact."],
  "mid-lazy": ["Sofa Cat", "Basic safety exists, but activity and weight management are weak.", "Often lounges around and reacts faster to food than toys."],
  "high-lazy": ["Cuddly Lap Cat", "Trusts you deeply, but stimulation is low and weight risk rises.", "Moves closer to the screen as if asking for a cuddle."],
  "low-balanced": ["Cool Model Cat", "Care is passable, but emotional distance remains.", "Sits neatly, grooms often, and keeps some distance."],
  "mid-balanced": ["Everyday House Cat", "Bonding and activity are both steady.", "Walks around normally and occasionally asks for attention."],
  "high-balanced": ["Gentle Guardian Cat", "High bonding and stable routine. The cat quietly stays with you.", "Slow blinks more often and sits beside you calmly."],
  "low-active": ["Hunter Cat", "Active but not close, like an independent indoor explorer.", "Patrols the room and watches windows and toys."],
  "mid-active": ["Playful Athlete Cat", "Energy has an outlet, but companionship still needs work.", "Jumps around, knocks things over, and may run at night."],
  "high-active": ["Adventure Hero Cat", "High bonding and high activity. The cat trusts you and explores bravely.", "Explores actively and handles new scenes better."],
};

const effortCopyEn = {
  basic: ["Basic maintenance", "Roughly feeding, litter work, and a few urgent tasks. It keeps the cat alive, but companionship, prevention, and enrichment are still thin."],
  steady: ["Responsible care", "Includes daily food, hygiene, basic play, supplies, or health checks. This is closer to realistic responsible care."],
  heavy: ["High workload", "Usually means illness, deep cleaning, travel care, behavior work, or several big tasks stacked together. It eats into rest and emotional capacity."],
};

const stageCopyEn = {
  kitten: ["Kitten stage", "Vaccines, neutering, window safety, and litter habits all start here."],
  teen: ["Teen stage", "High energy. Damage, window climbing, stress, and escape risks show up more."],
  adult: ["Adult stage", "Looks stable, but fixed costs, companionship, and weight management continue."],
  mature: ["Mature stage", "Chronic illness risk starts rising. Checkups cannot keep being delayed."],
  senior: ["Senior stage", "Kidneys, joints, appetite, follow-ups, and quality of life become central."],
};

const profileCopyEn = {
  worker: ["Sharp realist", "Blunt and practical; stress can make damage risk rise."],
  innocent: ["Innocent truth-teller", "Needs more companionship and shows illness clues earlier."],
  wise: ["Gentle mentor", "More stable, but keeps reminding you of long-term responsibility."],
  philosopher: ["Lazy philosopher", "More prone to laziness and weight gain, so diet and toy management matter."],
};

function itemName(key) {
  return currentLang === "en" ? itemNamesEn[key] || itemNames[key] || key : itemNames[key] || key;
}

function shopLabel(item) {
  return currentLang === "en" ? shopCopyEn[item.id]?.[0] || item.label : item.label;
}

function shopDetail(item) {
  return currentLang === "en" ? shopCopyEn[item.id]?.[1] || item.detail : item.detail;
}

function evolutionText(key, field) {
  if (currentLang !== "en") return evolutionVisualMeta[key]?.[field];
  const index = field === "title" ? 0 : field === "detail" ? 1 : 2;
  return evolutionCopyEn[key]?.[index] || evolutionVisualMeta[key]?.[field];
}

function effortText(range, field = "label") {
  if (currentLang !== "en") return range[field];
  const item = effortCopyEn[range.id];
  return field === "label" ? item?.[0] || range.label : item?.[1] || range.detail;
}

function stageText(st, field = "name") {
  if (currentLang !== "en") return st[field];
  const item = stageCopyEn[st.id];
  return field === "name" ? item?.[0] || st.name : item?.[1] || st.label;
}

function profileText(field = "name") {
  if (currentLang !== "en") return profile()[field];
  const item = profileCopyEn[state.personality];
  return field === "name" ? item?.[0] || profile().name : item?.[1] || profile().trait;
}

function energyText(value) {
  return currentLang === "en" ? `Effort ${value}` : `精力${value}`;
}

function deathReasonText(reason = "") {
  if (currentLang !== "en") return reason;
  const offlineMatch = reason.match(/離開了\s*(\d+)\s*小時/);
  if (offlineMatch) return `You were away for ${offlineMatch[1]} hours, beyond the care limit. The cat passed away without care.`;
  if (/窗|跌|墜/.test(reason)) return "A preventable window or fall accident happened.";
  if (/病|健康|風險/.test(reason)) return "Health risk became too high and the cat passed away.";
  return reason;
}

const catPalettes = {
  orange: { fur: "#d98a34", dark: "#7c461d", light: "#ffe0ad", chest: "#fff2dc", stripe: "#a96a31", eye: "#d8b34d" },
  blue: { fur: "#87919b", dark: "#49535c", light: "#dfe5eb", chest: "#f4f7f8", stripe: "#67727c", eye: "#c6d66b" },
  tuxedo: { fur: "#3e4248", dark: "#20242a", light: "#ffffff", chest: "#ffffff", stripe: "#2d3137", eye: "#d9b853" },
  silver: { fur: "#d8d1c6", dark: "#77736c", light: "#fff8ee", chest: "#fffaf3", stripe: "#9c968d", eye: "#b7cf65" },
  cream: { fur: "#e9d1b0", dark: "#7d6550", light: "#fff3df", chest: "#fffaf2", stripe: "#c8a178", eye: "#cfad57" },
  siamese: { fur: "#d9c7aa", dark: "#2e2927", light: "#efe1cc", chest: "#eadcc6", stripe: "#6d5a4a", eye: "#7fc4dc" },
};

const catImageCache = new Map();

function catImageData(coat = "orange") {
  const key = catPalettes[coat] ? coat : "orange";
  if (catImageCache.has(key)) return catImageCache.get(key);
  const p = catPalettes[key];
  const isSiamese = key === "siamese";
  const isTuxedo = key === "tuxedo";
  const tailColor = isSiamese ? p.dark : p.fur;
  const earColor = isSiamese ? p.dark : p.fur;
  const faceMask = isSiamese
    ? `<ellipse cx="110" cy="74" rx="29" ry="24" fill="${p.dark}" opacity="0.92"/>`
    : "";
  const tuxedoFace = isTuxedo
    ? `<path d="M84 76 C92 104 128 104 136 76 C126 91 94 91 84 76Z" fill="${p.light}" opacity="0.96"/>`
    : "";
  const stripes = isTuxedo
    ? ""
    : `<path d="M91 44 C97 51 102 54 109 54" fill="none" stroke="${p.stripe}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
       <path d="M129 44 C123 51 118 54 111 54" fill="none" stroke="${p.stripe}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
       <path d="M110 38 L110 56" fill="none" stroke="${p.stripe}" stroke-width="4" stroke-linecap="round" opacity="0.36"/>
       <path d="M75 120 C88 126 96 128 105 127" fill="none" stroke="${p.stripe}" stroke-width="5" stroke-linecap="round" opacity="0.33"/>
       <path d="M145 120 C132 126 124 128 115 127" fill="none" stroke="${p.stripe}" stroke-width="5" stroke-linecap="round" opacity="0.33"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 250" role="img" aria-label="cat">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#3d2a1a" flood-opacity="0.18"/>
      </filter>
      <linearGradient id="bodyShade" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.13"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.08"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow)">
      <path d="M151 157 C198 148 195 95 161 107 C142 114 145 147 171 151" fill="none" stroke="${tailColor}" stroke-width="24" stroke-linecap="round"/>
      <ellipse cx="110" cy="151" rx="57" ry="70" fill="${p.fur}"/>
      <ellipse cx="110" cy="151" rx="57" ry="70" fill="url(#bodyShade)"/>
      <path d="M81 137 C89 187 99 216 110 216 C121 216 131 187 139 137 C129 151 91 151 81 137Z" fill="${p.chest}"/>
      <ellipse cx="87" cy="207" rx="21" ry="15" fill="${p.light}"/>
      <ellipse cx="133" cy="207" rx="21" ry="15" fill="${p.light}"/>
      ${stripes}
      <path d="M75 66 L89 21 L111 58 Z" fill="${earColor}"/>
      <path d="M145 66 L131 21 L109 58 Z" fill="${earColor}"/>
      <path d="M86 57 L92 36 L104 57 Z" fill="#f0bbb2" opacity="0.72"/>
      <path d="M134 57 L128 36 L116 57 Z" fill="#f0bbb2" opacity="0.72"/>
      <ellipse cx="110" cy="78" rx="49" ry="43" fill="${p.fur}"/>
      ${faceMask}
      ${tuxedoFace}
      <ellipse cx="91" cy="88" rx="17" ry="12" fill="${p.light}" opacity="0.78"/>
      <ellipse cx="129" cy="88" rx="17" ry="12" fill="${p.light}" opacity="0.78"/>
      <path d="M80 75 C88 66 100 67 106 76 C98 82 88 82 80 75Z" fill="${p.eye}" stroke="${p.dark}" stroke-width="2"/>
      <path d="M140 75 C132 66 120 67 114 76 C122 82 132 82 140 75Z" fill="${p.eye}" stroke="${p.dark}" stroke-width="2"/>
      <path d="M93 68 L93 82" stroke="#1f272b" stroke-width="3" stroke-linecap="round"/>
      <path d="M127 68 L127 82" stroke="#1f272b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="98" cy="70" r="2.1" fill="#fff7da"/>
      <circle cx="132" cy="70" r="2.1" fill="#fff7da"/>
      <path d="M102 94 C105 91 115 91 118 94 C116 99 104 99 102 94Z" fill="#d77982"/>
      <path d="M110 99 C107 106 101 108 96 104" fill="none" stroke="${p.dark}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M110 99 C113 106 119 108 124 104" fill="none" stroke="${p.dark}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M75 95 C58 91 46 91 34 95" fill="none" stroke="${p.dark}" stroke-width="2" stroke-linecap="round" opacity="0.58"/>
      <path d="M76 103 C58 104 47 108 36 116" fill="none" stroke="${p.dark}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
      <path d="M145 95 C162 91 174 91 186 95" fill="none" stroke="${p.dark}" stroke-width="2" stroke-linecap="round" opacity="0.58"/>
      <path d="M144 103 C162 104 173 108 184 116" fill="none" stroke="${p.dark}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
    </g>
  </svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  catImageCache.set(key, src);
  return src;
}

function setCatImage(selector, coat = "orange") {
  const img = $(selector);
  if (img) img.src = catImageData(coat);
}

function updateStartCatImage() {
  setCatImage("#hero-cat-image", $("#cat-coat-input")?.value || "orange");
}

function setLabelText(inputSelector, text) {
  const label = $(inputSelector)?.parentElement;
  if (label?.childNodes?.[0]) label.childNodes[0].textContent = text;
}

function setOptions(selectSelector, options) {
  const select = $(selectSelector);
  if (!select) return;
  options.forEach(([value, label]) => {
    const option = select.querySelector(`option[value="${value}"]`);
    if (option) option.textContent = label;
  });
}

function applyLanguage() {
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-Hant";
  document.title = copy("docTitle");
  $("#language-input").value = currentLang;
  $("#language-input-game").value = currentLang;
  $("#language-input-summary").value = currentLang;
  const languageSwitch = $(".language-switch");
  if (languageSwitch?.childNodes?.[0]) languageSwitch.childNodes[0].textContent = copy("langLabel");
  $(".hero-copy .eyebrow").textContent = copy("heroEyebrow");
  $(".hero-copy h1").textContent = copy("heroTitle");
  $(".hero-copy .lead").textContent = copy("heroLead");
  $(".setup-panel h2").textContent = copy("setupTitle");
  $(".setup-note").textContent = copy("setupNote");
  setLabelText("#start-age-input", copy("startAge"));
  setLabelText("#cat-sex-input", copy("sex"));
  setLabelText("#cat-coat-input", copy("coat"));
  setLabelText("#cat-name-input", copy("catName"));
  setLabelText("#fund-input", copy("fund"));
  setOptions("#start-age-input", currentLang === "en"
    ? [["0", "Kitten: unknown personality"], ["12", "1-year-old cat: known personality"], ["36", "3+ year adult cat: 10 years remaining"]]
    : [["0", "幼貓：性格未知，從頭養起"], ["12", "1歲貓：已知性格，走到15歲"], ["36", "3歲以上成貓：已知性格，只剩10年"]]);
  setOptions("#cat-sex-input", currentLang === "en" ? [["female", "Female"], ["male", "Male"]] : [["female", "女貓"], ["male", "男貓"]]);
  setOptions("#cat-coat-input", currentLang === "en"
    ? [["orange", "Orange"], ["blue", "Blue"], ["tuxedo", "Tuxedo"], ["silver", "Silver shaded"], ["cream", "Cream / ragdoll"], ["siamese", "Siamese point"]]
    : [["orange", "橘貓"], ["blue", "藍貓"], ["tuxedo", "藍白/黑白"], ["silver", "銀漸層"], ["cream", "布偶/奶油色"], ["siamese", "暹羅重點色"]]);
  const personalityCopy = currentLang === "en"
    ? {
        worker: ["Sharp realist", "Practical, blunt, and painfully honest"],
        innocent: ["Innocent truth-teller", "Simple words, honest consequences"],
        wise: ["Gentle mentor", "Warm, mature, and quietly direct"],
        philosopher: ["Lazy philosopher", "Relaxed, funny, and pointed"],
      }
    : {
        worker: ["毒舌社畜型", "現實、尖銳、港式挖苦"],
        innocent: ["天真殘酷型", "單純地講出最真實的事"],
        wise: ["可愛老練型", "溫柔、成熟、像一位小老師"],
        philosopher: ["廢柴哲學型", "懶洋洋，但句句入肉"],
      };
  $$(".personality-card").forEach((card) => {
    const item = personalityCopy[card.dataset.personality];
    if (item) {
      card.querySelector("strong").textContent = item[0];
      card.querySelector("span").textContent = item[1];
    }
  });
  $("#start-button").textContent = copy("startButton");
  $(".topbar .eyebrow").textContent = copy("perTurn");
  $("#fast-forward-button").textContent = copy("progressButton");
  $("#summary-button").textContent = copy("summaryButton");
  $("#reset-button").textContent = copy("resetButton");
  $("#next-day-button").textContent = copy("nextYear");
  $$(".scene-button").forEach((button) => {
    button.textContent = sceneTitle(button.dataset.scene);
  });
  $$(".pet-menu [data-action]").forEach((button) => {
    button.querySelector("strong").textContent = actionTitle(button.dataset.action);
  });
  const moneyLabels = currentLang === "en" ? ["Remaining fund"] : [copy("fundLeft")];
  $(".money-card > span").textContent = moneyLabels[0];
  const statLabels = currentLang === "en"
    ? ["Hunger", "Mood", "Cleanliness", "Hydration", "Stress", "Bonding", "Activity", "Night disturbance", "Litter dirt", "Behavior stability", "Health risk", "Responsibility level", "Time used this year", "Effort spent"]
    : ["飽肚", "心情", "清潔", "水分", "壓力", "親密", "活動量", "夜間干擾", "砂盆髒污", "行為穩定", "健康風險", "責任等級", "今年已用時間", "已付出精力"];
  $$(".stats-grid > div > span").forEach((node, index) => {
    const infoButton = node.querySelector(".info-button");
    node.textContent = statLabels[index] || node.textContent;
    if (infoButton) node.appendChild(infoButton);
  });
  $(".owner-effort-card h3").textContent = copy("effortTitle");
  $(".timeline-head span").textContent = copy("lifeProgress");
  const summaries = $$(".side-panel summary");
  [copy("inventory"), copy("durability"), copy("achievements"), copy("history"), copy("log")].forEach((label, index) => {
    if (summaries[index]) summaries[index].textContent = label;
  });
  $(".evolution-card summary").textContent = copy("evolutionTable");
  $(".daily-needs > div > span").textContent = copy("annualNeeds");
  $("#choice-panel .eyebrow").textContent = copy("sudden");
  $("#shop-panel .eyebrow").textContent = copy("shop");
  $("#shop-panel h3").textContent = copy("shopShelf");
  $(".summary-panel > .eyebrow").textContent = copy("summaryEyebrow");
  $(".summary-panel h2").textContent = copy("summaryDone");
  $$(".summary-grid span").forEach((node, index) => {
    node.textContent = copy("summaryLabels")?.[index] || node.textContent;
  });
  $(".reflection h3").textContent = copy("reviewRecord");
  const reflectionBlocks = $$(".summary-panel .reflection");
  if (reflectionBlocks[1]) reflectionBlocks[1].querySelector("h3").textContent = copy("finalQuestion");
  $("#ready-button").textContent = copy("readyButton");
  $("#not-ready-button").textContent = copy("notReadyButton");
  $("#play-again-button").textContent = copy("playAgain");
  $(".medeci-card .eyebrow").textContent = copy("medeciEyebrow");
  $(".medeci-card p:not(.eyebrow)").textContent = copy("medeciText");
  $(".medeci-link").textContent = copy("medeciLink");
  syncStartAgeUi();
}

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "zh";
  localStorage.setItem(LANG_KEY, currentLang);
  applyLanguage();
  if (state) {
    if (state.death || state.month > lifeEndMonth()) finishGame();
    else render();
  }
}

const profiles = {
  worker: {
    name: "毒舌社畜型",
    trait: "壓力高時會用尖銳對白提醒你，拆家風險較高。",
    stressGain: 1.18,
    boredomGain: 1.05,
    socialNeed: 1,
    vetSensitivity: 1,
    lines: {
      idle: ["你供樓，我供獸醫。大家都有理想。", "我唔係貴，我係長期負債。"],
      good: ["今日服務唔錯，可以考慮續約十五年。", "你終於明白我唔係裝飾品。"],
      bad: ["我唔係減肥，我係被遺忘。", "Google 唔會幫我打針。"],
    },
  },
  innocent: {
    name: "天真殘酷型",
    trait: "更需要陪伴，少陪玩會更快失落，但病痛提示較早出現。",
    stressGain: 1.05,
    boredomGain: 1.25,
    socialNeed: 1.3,
    vetSensitivity: 0.85,
    lines: {
      idle: ["醫生話要好多錢，咁你有冇？", "原來長大係咁貴。"],
      good: ["你今日有記得我，我有開心少少。", "你陪我玩，我就不去拆你的沙發。"],
      bad: ["我唔舒服，但我都會等你返嚟。", "我肚餓，但我不會自己叫外賣。"],
    },
  },
  wise: {
    name: "可愛老練型",
    trait: "比較穩定，但會用成熟對白讓你面對長期責任。",
    stressGain: 0.9,
    boredomGain: 0.95,
    socialNeed: 0.9,
    vetSensitivity: 0.95,
    lines: {
      idle: ["責任不是感覺，是選擇。", "愛不是開始那天，是之後每一天。"],
      good: ["你重複的小事，正在變成照顧。", "今天很普通，所以很珍貴。"],
      bad: ["一次忽略不會毀掉一切，但會留下痕跡。", "你可以忙，但生命不會因此暫停。"],
    },
  },
  philosopher: {
    name: "廢柴哲學型",
    trait: "較懶、較容易肥，飲食和玩具管理更重要。",
    stressGain: 0.98,
    boredomGain: 1.12,
    socialNeed: 0.85,
    vetSensitivity: 1.15,
    weightGain: 1.35,
    lines: {
      idle: ["人生本來就燒錢，加埋我啱啱好。", "你想輕鬆，我想生存。"],
      good: ["今日有飯有水，哲學暫停。", "你鏟砂，我沉思。分工合理。"],
      bad: ["砂盆好臭，人生更臭。", "我嘔咗，你 Google 咗，大家都盡力。"],
    },
  },
};

const actionMeta = {
  nutrition: { icon: "🍽", title: "飲食採購", money: 900, time: 2, energy: 6 },
  supplies: { icon: "🧾", title: "用品補給", money: 1600, time: 3, energy: 8 },
  hygiene: { icon: "🪣", title: "清潔整理", money: 350, time: 6, energy: 14 },
  enrichment: { icon: "🎾", title: "陪玩訓練", money: 450, time: 8, energy: 18 },
  training: { icon: "🧠", title: "行為引導", money: 260, time: 5, energy: 16 },
  sleep: { icon: "🌙", title: "夜間作息", money: 0, time: 2, energy: 6 },
  vet: { icon: "🩺", title: "健康檢查", money: 1800, time: 5, energy: 16 },
  lifestyle: { icon: "🧳", title: "外出/旅行安排", money: 1200, time: 4, energy: 12 },
};

const actionMiniMeta = {
  nutrition: { item: "🍚", target: "🥣", verb: "把食物放進碗", hint: "拖動食物到碗，或點一下食物。", reaction: "eating", done: "吃好了。" },
  supplies: { item: "📦", target: "🎒", verb: "補進背包", hint: "把補給放進背包。", reaction: "playing", done: "補好了。" },
  hygiene: { item: "🪣", target: "✨", verb: "清理砂盆", hint: "連點清理，直到乾淨。", reaction: "cleaning", done: "乾淨了。" },
  enrichment: { item: "🎣", target: "🐾", verb: "逗貓放電", hint: "按住逗貓棒，讓牠追一下。", reaction: "playing", done: "玩累了。" },
  training: { item: "👍", target: "🐱", verb: "即時獎勵", hint: "抓準時機點獎勵，不是責罵。", reaction: "playing", done: "牠懂了一點。" },
  sleep: { item: "💡", target: "🌙", verb: "調暗環境", hint: "把燈光節奏調慢。", reaction: "calm", done: "安靜下來了。" },
  vet: { item: "🧳", target: "🩺", verb: "帶去檢查", hint: "把外出籠帶到醫院。", reaction: "startled", done: "檢查完成。" },
  lifestyle: { item: "🗓", target: "🏠", verb: "安排照顧", hint: "把照顧安排放進行程。", reaction: "calm", done: "安排好了。" },
};

const actionMiniMetaEn = {
  nutrition: { verb: "Put food in the bowl", hint: "Drag the food to the bowl, or tap it.", done: "Fed." },
  supplies: { verb: "Pack supplies", hint: "Move the supply box into the inventory.", done: "Supplies packed." },
  hygiene: { verb: "Clean the litter area", hint: "Tap to clean until it is done.", done: "Cleaned." },
  enrichment: { verb: "Play and burn energy", hint: "Use the toy so the cat can chase.", done: "Played enough." },
  training: { verb: "Reward correctly", hint: "Reward the right moment instead of scolding.", done: "The cat learned a little." },
  sleep: { verb: "Dim the routine", hint: "Slow the night routine down.", done: "Calmed down." },
  vet: { verb: "Go to checkup", hint: "Bring the carrier to the clinic.", done: "Checkup finished." },
  lifestyle: { verb: "Arrange care", hint: "Put the care plan into the schedule.", done: "Care arranged." },
};

function miniMeta(action) {
  const meta = actionMiniMeta[action] || actionMiniMeta.enrichment;
  if (currentLang !== "en") return meta;
  const translated = actionMiniMetaEn[action] || actionMiniMetaEn.enrichment;
  return { ...meta, ...translated };
}

const evolutionVisualMeta = {
  "low-lazy": { icon: "…", title: "冷漠街貓", detail: "親密低、活動低，牠學會少期待人。", behavior: "離你遠一點，較少主動互動。", mark: "…", className: "cat-evo-low-lazy" },
  "mid-lazy": { icon: "🛋", title: "沙發肥貓", detail: "有基本安全感，但活動量和體重管理不足。", behavior: "常常懶躺，食物反應比玩具更快。", mark: "Z", className: "cat-evo-mid-lazy" },
  "high-lazy": { icon: "♡", title: "黏人抱抱貓", detail: "很信任你，但生活刺激偏少，容易依賴和發胖。", behavior: "會靠近畫面，像在討抱抱。", mark: "♡", className: "cat-evo-high-lazy" },
  "low-balanced": { icon: "✦", title: "高冷名模貓", detail: "照顧尚可，但關係距離感明顯。", behavior: "坐姿端正、愛舔毛，對你有一點距離。", mark: "✦", className: "cat-evo-low-balanced" },
  "mid-balanced": { icon: "●", title: "日常家貓", detail: "關係和活動都穩定，是最接近日常的分支。", behavior: "會普通走動、偶爾撒嬌。", mark: "●", className: "cat-evo-mid-balanced" },
  "high-balanced": { icon: "☘", title: "溫柔守護貓", detail: "親密高、節奏穩，牠願意安靜陪你。", behavior: "更常慢眨，像安靜坐在你旁邊。", mark: "☘", className: "cat-evo-high-balanced" },
  "low-active": { icon: "⌖", title: "狩獵野貓", detail: "活動足夠，但親密不足，牠更像室內的獨行者。", behavior: "在場景裡巡邏，常盯窗外和玩具。", mark: "⌖", className: "cat-evo-low-active" },
  "mid-active": { icon: "!", title: "調皮運動貓", detail: "精力有出口，但仍需要更穩定的陪伴。", behavior: "會跳上跳下，容易推東西和夜間跑酷。", mark: "!", className: "cat-evo-mid-active" },
  "high-active": { icon: "★", title: "英雄冒險貓", detail: "親密與活動都高，牠信你，也敢探索。", behavior: "主動探索，外出和新場景反應更勇敢。", mark: "★", className: "cat-evo-high-active" },
};

const itemNames = {
  dryFood: "乾糧",
  freezeDry: "凍乾",
  freshFood: "鮮食",
  wetFood: "濕糧",
  treats: "肉條零食",
  litter: "貓砂",
  litterBox: "貓砂盆",
  foodBowl: "食碗水碗",
  filter: "水機濾芯",
  wandToy: "逗貓棒",
  mouseToy: "小老鼠玩具",
  puzzleToy: "益智玩具",
  scratcher: "抓板",
  catBed: "貓窩",
  catTree: "貓爬架",
  outfit: "小衣服",
  cleaner: "清潔用品",
  medicine: "常備藥",
  carrier: "外出籠",
  sitterTicket: "上門照顧券",
};

const sceneMeta = {
  living: { title: "客廳", line: "日常照顧中心：餵食、陪玩、看狀態。" },
  balcony: { title: "陽台", line: "窗網和安全最重要，這裡會影響爬窗意外。" },
  bedroom: { title: "睡房", line: "睡眠和陪伴場景，適合安撫和休息。" },
  garden: { title: "庭院", line: "家中可控戶外：放電、曬太陽，但仍屬於你的責任範圍。" },
  shop: { title: "商店", line: "在這裡買食物、用品、玩具、裝飾和醫療準備。" },
  park: { title: "公園", line: "真正外出：刺激更多，也更需要外出籠、牽繩和風險判斷。" },
  friend: { title: "朋友屋企", line: "探訪和社交場景，適合未來做朋友貓屋系統。" },
};

const durableItemRules = {
  windowNet: { name: "窗網", lifespan: 60, essential: true, reason: "窗網老化，防墜安全失效。" },
  litterBox: { name: "貓砂盆", lifespan: 48, essential: true, reason: "砂盆刮花藏菌，臭味和泌尿風險上升。" },
  foodBowl: { name: "食碗水碗", lifespan: 36, essential: true, reason: "食碗水碗老化，清潔和飲水品質下降。" },
  scratcher: { name: "貓抓板", lifespan: 6, essential: false, reason: "抓板磨爛，牠開始把沙發當替代品。" },
  wandToy: { name: "逗貓棒", lifespan: 4, essential: false, reason: "逗貓棒損耗，陪玩效果下降。" },
  mouseToy: { name: "小老鼠玩具", lifespan: 6, essential: false, reason: "小老鼠玩具磨損，追逐刺激變少。" },
  puzzleToy: { name: "益智玩具", lifespan: 12, essential: false, reason: "益智玩具玩膩或損壞，無聊感回升。" },
  catBed: { name: "貓窩", lifespan: 24, essential: false, reason: "貓窩變舊變髒，休息品質下降。" },
  catTree: { name: "貓爬架", lifespan: 36, essential: true, reason: "貓爬架鬆動，跳上跳下會有摔傷風險。" },
  carrier: { name: "外出籠", lifespan: 72, essential: true, reason: "外出籠扣件老化，覆診和避難不安全。" },
};

const shopCatalog = [
  { id: "dryFood", category: "食物", label: "貓糧一包", price: 350, time: 1, energy: 2, add: { dryFood: 8 }, detail: "文件寫 $200-500；便宜穩定，但水分不足。" },
  { id: "wetFood", category: "食物", label: "濕糧一箱", price: 520, time: 1, energy: 3, add: { wetFood: 6 }, detail: "水分更好，適合食慾差或老年期。" },
  { id: "freezeDry", category: "食物", label: "凍乾零食", price: 680, time: 1, energy: 3, add: { freezeDry: 6 }, detail: "快樂值高，但吃太多會肥。" },
  { id: "treats", category: "食物", label: "肉條零食", price: 180, time: 1, energy: 2, add: { treats: 8 }, detail: "用來安撫或獎勵，不應取代正餐。" },
  { id: "litter", category: "用品", label: "貓砂一包", price: 160, time: 1, energy: 2, add: { litter: 1 }, detail: "文件寫 $80-200；清潔照顧會消耗。" },
  { id: "litterBox", category: "用品", label: "貓砂盆", price: 280, time: 1, energy: 3, add: { litterBox: 1 }, detail: "文件寫 $150-400；基本用品，不是裝飾。" },
  { id: "foodBowl", category: "用品", label: "食碗水碗", price: 120, time: 1, energy: 2, add: { foodBowl: 1 }, detail: "文件寫 $50-200；影響日常餵食體驗。" },
  { id: "filter", category: "用品", label: "水機濾芯", price: 220, time: 1, energy: 2, add: { filter: 1 }, detail: "耗材，長期不換會影響飲水與健康。" },
  { id: "scratcher", category: "玩具", label: "貓抓板", price: 180, time: 1, energy: 2, add: { scratcher: 1 }, flag: "scratchPost", detail: "文件寫 $80-300；降低抓沙發風險。" },
  { id: "wandToy", category: "玩具", label: "逗貓棒", price: 120, time: 1, energy: 2, add: { wandToy: 1 }, detail: "陪玩 mini game 的基本道具。" },
  { id: "mouseToy", category: "玩具", label: "小老鼠玩具", price: 90, time: 1, energy: 2, add: { mouseToy: 1 }, detail: "對應文件裡的追逐遊戲。" },
  { id: "puzzleToy", category: "玩具", label: "益智玩具", price: 420, time: 1, energy: 3, add: { puzzleToy: 1 }, detail: "降低無聊，尤其適合高需求性格。" },
  { id: "windowNet", category: "安全", label: "窗網安裝", price: 3200, time: 5, energy: 15, flag: "windowNet", accident: -35, detail: "文件寫 $1500-4000；不是可愛配件，是安全底線。" },
  { id: "carrier", category: "安全", label: "外出籠", price: 480, time: 1, energy: 4, add: { carrier: 1 }, accident: -5, detail: "覆診、搬家、旅行前都要有。" },
  { id: "vaccine", category: "醫療", label: "初次疫苗", price: 500, time: 3, energy: 12, health: -12, medical: true, detail: "文件寫 $300-600；幼貓期核心支出。" },
  { id: "neuter", category: "醫療", label: "絕育手術安排", price: 2200, time: 6, energy: 24, health: -16, stress: 6, medical: true, flag: "neutered", detail: "文件寫公貓 $800-1500 / 母貓 $1500-3000。" },
  { id: "catBed", category: "裝飾", label: "貓窩", price: 360, time: 1, energy: 3, add: { catBed: 1 }, happiness: 4, detail: "裝飾系統之一，讓睡房更像貓屋。" },
  { id: "catTree", category: "裝飾", label: "貓爬架", price: 980, time: 2, energy: 8, add: { catTree: 1 }, boredom: -10, accident: -4, detail: "對應裝飾系統和活動量需求。" },
  { id: "outfit", category: "裝飾", label: "小衣服", price: 260, time: 1, energy: 4, add: { outfit: 1 }, happiness: -2, bonding: 1, detail: "文件提到換衫；不是每隻貓都喜歡。" },
];

const intensityMeta = {
  light: {
    label: "省力照顧",
    detail: "少花時間和精力，但效果打折，長期容易留下風險。",
    time: 0.75,
    energy: 0.75,
    effect: 0.68,
    extra: { healthRisk: 3, stress: 2 },
  },
  normal: {
    label: "穩定照顧",
    detail: "成本和效果平衡，適合一般負責任照顧。",
    time: 1,
    energy: 1,
    effect: 1,
    extra: {},
  },
  devoted: {
    label: "高熱情照顧",
    detail: "更花時間和精力，牠得到更好照顧和更多安全感。",
    time: 1.35,
    energy: 1.35,
    effect: 1.18,
    extra: { healthRisk: -3, stress: -3, bonding: 4, happiness: 3 },
  },
};

const actionChoices = {
  nutrition: [
    { label: "買乾糧大包，全年餵乾糧", detail: "穩定、便宜，但水分不足要靠換水補足。", money: 380, time: 1, energy: 3, add: { dryFood: 10 }, use: { dryFood: 1 }, hunger: 18, hydration: -2, weight: 1, line: "乾糧解決了肚餓，但飲水仍然要看。" },
    { label: "買濕糧，全年混合餵養", detail: "可和乾糧、鮮食一起多選；水分更好，但花費和整理時間更高。", money: 520, time: 2, energy: 6, add: { wetFood: 6 }, use: { wetFood: 1 }, hunger: 14, hydration: 12, happiness: 4, line: "混合餵養比較貼近現實，也更花時間和錢。" },
    { label: "買凍乾，全年加餐", detail: "貓通常很喜歡，開心度高，但不能當主食亂餵。", money: 680, time: 1, energy: 4, add: { freezeDry: 6 }, use: { freezeDry: 1 }, hunger: 12, happiness: 12, weight: 2, line: "牠很開心，但你也看到零食不是免費魔法。" },
    { label: "準備鮮食", detail: "最花時間和精力，但水分、親密和健康回饋更好。", money: 520, time: 4, energy: 18, add: { freshFood: 3 }, use: { freshFood: 1 }, hunger: 16, hydration: 14, health: -6, bonding: 3, line: "你不是按一下餵食，你真的花了時間準備。" },
    { label: "用背包現有食物餵", detail: "消耗背包食物，不額外花錢，但如果背包空了會失敗。", money: 0, time: 1, energy: 4, consumeFood: true, hunger: 14, line: "你用掉了背包裡的一餐。" },
  ],
  supplies: [
    { label: "檢查現有用品，不買新的", detail: "查看貓砂盆、抓板、逗貓棒、外出籠是否仍可用；有壽命的東西沒壞就不用每年亂重買。", money: 0, time: 2, energy: 7, supplies: -8, cleanliness: 3, line: "你沒有亂買新東西，而是先確認現有用品還撐不撐得住。" },
    { label: "只補貓砂和濾芯耗材", detail: "貓砂、濾芯是會被用掉的耗材；補這些不等於每年重買抓板或逗貓棒。", money: 380, time: 2, energy: 6, add: { litter: 2, filter: 1 }, supplies: -22, cleanliness: 6, line: "背包多了貓砂和濾芯。這是耗材補給，不是重買耐用品。" },
    { label: "按缺口更換抓板/逗貓棒", detail: "系統只會為沒有、壞了或過期的抓板和逗貓棒計費；仍可用的不會重買。", money: 0, time: 1, energy: 4, replaceDurables: ["scratcher", "wandToy"], boredom: -12, accident: -3, flag: "scratchPost", line: "你只替換真正需要替換的玩具，沒有把每一年都變成購物年。" },
    { label: "按缺口準備外出籠/照顧券", detail: "外出籠仍可用就不重買；照顧券是服務券，用完才要再補。", money: 260, time: 1, energy: 4, replaceDurables: ["carrier"], add: { sitterTicket: 1 }, accident: -8, flag: "petSitter", line: "你為突發覆診和外出留了緩衝，但沒有重複買還能用的外出籠。" },
  ],
  hygiene: [
    { label: "鏟砂並補砂", detail: "消耗背包貓砂；如果背包沒有，系統會把購買一包貓砂的成本直接加進今年預覽。", money: 0, time: 4, energy: 12, use: { litter: 1 }, autoBuyMissing: true, cleanliness: 24, health: -5, stress: -6, line: "砂盆清爽，牠也比較願意使用。" },
    { label: "只鏟砂不補砂", detail: "不用耗材，但效果有限；短期能撐，長期會留下味道和衛生問題。", money: 0, time: 3, energy: 10, cleanliness: 10, health: -1, stress: -2, supplies: 8, line: "你清走了最髒的部分，但用品缺口還在。" },
    { label: "梳毛和擦身", detail: "不是每隻貓都喜歡，但能降低臭味和毛球問題。", money: 0, time: 3, energy: 10, cleanliness: 14, health: -4, bonding: 2, line: "牠一邊嫌棄，一邊慢慢習慣你碰牠。" },
    { label: "深層清潔環境", detail: "包含鏟砂、擦洗砂盆周邊、清潔地面和嘔吐物；不用另外再選普通鏟砂，但比日常清理更累。", money: 180, time: 7, energy: 22, add: { cleaner: 1 }, use: { cleaner: 1 }, cleanliness: 38, poop: -30, health: -9, stress: -10, habit: "cleaningRoutine", line: "這不是遊戲裡的按鈕，是一個下午，也已經包含砂盆周邊清潔。" },
  ],
  enrichment: [
    { label: "用逗貓棒陪玩", detail: "需要逗貓棒；沒有或已過期時，系統會把購買/更換成本直接加進預覽。", money: 0, time: 6, energy: 16, replaceDurables: ["wandToy"], happiness: 18, boredom: -24, stress: -10, bonding: 7, habit: "playRoutine", line: "牠開始主動靠近你，因為你不只是餵牠。" },
    { label: "買益智玩具並訓練", detail: "花錢也花精神，但能長期降低無聊。", money: 420, time: 5, energy: 14, add: { puzzleToy: 1 }, happiness: 12, boredom: -20, bonding: 4, line: "玩具不是寵壞，是讓牠有事可做。" },
    { label: "抱抱/摸摸/坐身邊陪伴", detail: "不花錢，但非常花時間。高親密時會解鎖成就。", money: 0, time: 8, energy: 16, happiness: 10, boredom: -14, stress: -12, bonding: 12, line: "牠沒有立刻回報你，但關係正在慢慢長出來。" },
    { label: "追逐小遊戲", detail: "需要小老鼠玩具；沒有或已過期時，系統會把購買/更換成本直接加進預覽。", money: 0, time: 5, energy: 18, replaceDurables: ["mouseToy"], happiness: 14, boredom: -22, stress: -6, bonding: 4, activity: 12, line: "牠追到喘氣，你也開始明白活動量不是數字。" },
  ],
  training: [
    { label: "用抓板轉移抓沙發", detail: "需要抓板；沒有或已過期時，系統會把購買/更換成本直接加進預覽。", money: 0, time: 4, energy: 14, replaceDurables: ["scratcher"], boredom: -12, stress: -8, bonding: 5, discipline: 10, activity: 4, habit: "scratchRoutine", line: "你把牠帶到可以抓的地方，牠慢慢學會家裡的規則。" },
    { label: "咬人時停止互動並給替代玩具", detail: "不打罵，讓牠知道界線；需要耐性，不會立刻神奇變乖。", money: 120, time: 5, energy: 18, add: { mouseToy: 1 }, boredom: -10, stress: -6, bonding: 4, discipline: 12, line: "你不是縱容，也不是恐嚇，是把界線教清楚。" },
    { label: "大聲罵牠讓牠停下", detail: "短期看似有效，長期會增加壓力和怕人，年度回顧會記錄為錯誤管教。", money: 0, time: 1, energy: 6, boredom: 6, stress: 18, bonding: -12, discipline: -10, mistake: "punishment", line: "牠停下來了，但也更不信任你了。" },
  ],
  sleep: [
    { label: "睡前收玩具、定時餵食並關燈", detail: "不是貓白天不能睡，而是幫牠建立夜間節奏，降低半夜跑酷影響主人。養成後成本很低。", money: 0, time: 0.5, energy: 2, stress: -6, sleepDebt: -18, bonding: 1, habit: "sleepRoutine", line: "你沒有花一整晚哄睡，只是把夜間節奏整理好。" },
    { label: "白天多消耗精力，晚上較安靜", detail: "用白天活動換晚上安靜，適合夜跑嚴重的貓。", money: 0, time: 3, energy: 10, stress: -10, happiness: 8, sleepDebt: -24, boredom: -12, bonding: 4, habit: "playRoutine", line: "牠晚上不是被迫睡，是白天真的有用掉精力。" },
    { label: "不管夜跑，讓牠自己玩", detail: "貓不一定睡眠不足，但主人會被吵醒；長期會增加人貓衝突和錯誤管教風險。", money: 0, time: 0, energy: 0, stress: 10, sleepDebt: 18, mistake: "sleep", line: "牠玩得很開心，你明天上班會不會也開心就難說。" },
  ],
  vet: [
    { label: "基本門診檢查", detail: "適合一般狀態；可降低一部分健康風險。", money: 1200, time: 3, energy: 12, health: -12, billItems: [{ label: "門診", amount: 680 }, { label: "基礎檢查", amount: 520 }], line: "至少你沒有讓擔心只停留在猜測。" },
    { label: "完整血檢尿檢", detail: "昂貴、耗時，但對中老年貓很重要。", money: 3800, time: 6, energy: 22, health: -26, add: { medicine: 1 }, billItems: [{ label: "血檢", amount: 1600 }, { label: "尿檢", amount: 900 }, { label: "醫生解讀/藥物", amount: 1300 }], line: "帳單很長，但資料也很有用。" },
    { label: "絕育/牙科/專項處理", detail: "大額醫療，會明顯消耗金錢和精力。", money: 6800, time: 8, energy: 26, health: -20, stress: 6, flag: "neutered", billItems: [{ label: "術前血檢", amount: 1200 }, { label: "手術/麻醉", amount: 4200 }, { label: "止痛藥與覆診", amount: 1400 }], line: "手術不是劇情，是請假、接送、觀察和帳單。" },
  ],
  lifestyle: [
    { label: "安裝窗網", detail: "一次性大額支出，能長期降低爬窗事故；之後約每60個月要更換。", money: 3800, time: 5, energy: 15, accident: -30, flag: "windowNet", install: "windowNet", line: "安全不是可愛配件，是底線。" },
    { label: "安排旅行上門照顧", detail: "直接預約/付款；如果背包有照顧券，之後可再做折扣邏輯，但不會卡住日常流程。", money: 900, time: 3, energy: 10, stress: -10, health: -5, flag: "petSitter", line: "你離開了，但責任沒有離開。" },
    { label: "用外出籠練習出門", detail: "需要外出籠；沒有或已過期時，系統會把購買/更換成本直接加進預覽。反覆練習後會養成較低壓外出習慣。", money: 0, time: 4, energy: 16, replaceDurables: ["carrier"], stress: -8, accident: -8, bonding: 3, flag: "carrierTrust", habit: "carrierRoutine", line: "牠還是不喜歡外出，但不再完全恐慌。" },
  ],
};

const actionChoiceCopyEn = {
  nutrition: [
    ["Buy a large dry food bag for the year", "Stable and cheaper, but hydration still needs work."],
    ["Buy wet food for mixed feeding", "Can be combined with dry or fresh food. Better hydration, higher cost and cleanup."],
    ["Buy freeze-dried food as yearly add-ons", "Cats often love it, but it should not become the main diet."],
    ["Prepare fresh food", "Costs the most time and effort, but improves hydration, bonding, and health."],
    ["Feed from inventory", "Uses stored food. No new spending, but fails if inventory is empty."],
  ],
  supplies: [
    ["Check existing items without buying new ones", "Items with lifespan do not need to be repurchased if still usable."],
    ["Refill litter and filters only", "These are consumables. This is not buying every durable again."],
    ["Replace scratcher/wand toy only if needed", "The system only charges for missing, broken, or expired items."],
    ["Prepare carrier/pet sitter buffer", "Reusable carrier is not repurchased if still valid; sitter vouchers are service buffers."],
  ],
  hygiene: [
    ["Scoop and refill litter", "Uses inventory litter. If missing, the yearly preview adds the purchase cost."],
    ["Scoop only, no refill", "No consumable cost, but limited effect and more long-term hygiene risk."],
    ["Brush and wipe the cat", "Not every cat enjoys it, but it reduces odor and hairball issues."],
    ["Deep-clean the environment", "Includes litter-area work, floors, and vomit cleanup. More tiring than daily cleaning."],
  ],
  enrichment: [
    ["Play with wand toy", "Needs a wand toy. Missing or expired toys are added to the preview cost."],
    ["Buy puzzle toy and train", "Costs money and attention, but reduces boredom over time."],
    ["Cuddle / pet / sit together", "No money, but lots of time. High bonding unlocks milestones."],
    ["Chase mini game", "Needs a mouse toy. Replacement is added only if missing or expired."],
  ],
  training: [
    ["Redirect sofa scratching to a scratcher", "Needs a scratcher. Correct guidance lowers damage and stress."],
    ["Stop biting and offer an alternative toy", "Sets boundaries without scolding. It takes patience."],
    ["Scold loudly to stop it", "May look effective short-term, but raises stress and lowers trust."],
  ],
  sleep: [
    ["Put toys away, feed on schedule, dim lights", "Builds a night rhythm and reduces night disruption. The habit gets cheaper over time."],
    ["Use daytime play for calmer nights", "Burns energy during the day instead of forcing the cat to sleep."],
    ["Ignore night running", "The cat may be fine, but the owner pays with sleep and conflict risk."],
  ],
  vet: [
    ["Basic clinic checkup", "Useful for ordinary status and lowers some health risk."],
    ["Full blood and urine tests", "Expensive and time-consuming, but important for middle-aged and senior cats."],
    ["Neutering / dental / targeted treatment", "Large medical cost with real time, transport, and recovery burden."],
  ],
  lifestyle: [
    ["Install window net", "One major safety cost that lowers fall risk. Replacement is needed roughly every 60 months."],
    ["Arrange travel pet sitter", "Pay for care while you are away. Responsibility does not pause."],
    ["Practice carrier training", "Needs a carrier. Repeated practice lowers vet-visit panic."],
  ],
};

function actionChoiceText(action, choice, index, field = "label") {
  if (currentLang !== "en") return choice[field] || "";
  const translated = actionChoiceCopyEn[action]?.[index];
  if (!translated) return choice[field] || "";
  return field === "label" ? translated[0] : translated[1];
}

const achievementRules = [
  {
    id: "lap",
    title: "願意坐上大腿",
    text: "因為你持續陪伴，牠開始把你的腿當成安全的位置。",
    unlocked: (s) => s.bonding >= 45,
  },
  {
    id: "hold",
    title: "願意被抱一下",
    text: "牠不再只是忍受你，而是短暫信任你的手臂。",
    unlocked: (s) => s.bonding >= 62 && s.playCount >= 2,
  },
  {
    id: "kiss",
    title: "願意被親額頭",
    text: "親密不是買回來的，是很多次沒有被忽略之後長出來的。",
    unlocked: (s) => s.bonding >= 78 && s.stress < 52,
  },
  {
    id: "carrierTrust",
    title: "外出時比較信你",
    text: "因為你練習過外出籠，覆診不再完全等於恐慌。",
    unlocked: (s) => s.flags.carrierTrust && s.bonding >= 42,
  },
  {
    id: "oldFriend",
    title: "老朋友",
    text: "牠老了，但仍然願意靠近你。這是長期照顧留下的關係。",
    unlocked: (s) => s.month >= 120 && s.bonding >= 70,
  },
];

const achievementCopyEn = {
  lap: ["Sits on your lap", "Because you kept showing up, the cat starts treating your lap as a safe place."],
  hold: ["Allows a short hold", "The cat is not merely tolerating you; it briefly trusts your arms."],
  kiss: ["Allows a forehead kiss", "Bonding is not bought. It grows after many moments of not being ignored."],
  carrierTrust: ["Trusts you more outside", "Because you practiced carrier training, vet visits no longer equal total panic."],
  oldFriend: ["Old friend", "The cat is older but still comes close. This is what long-term care leaves behind."],
};

function achievementText(rule, field = "title") {
  if (currentLang !== "en") return rule[field];
  const item = achievementCopyEn[rule.id];
  return field === "title" ? item?.[0] || rule.title : item?.[1] || rule.text;
}

const randomDrops = [
  {
    id: "vomit",
    title: "突然嘔吐",
    text: "牠嘔了一次，仍然肯走動。你要決定是觀察、檢查，還是假裝沒事。",
    condition: (s) => s.healthRisk > 35 || s.completedActions.nutrition !== true,
    choices: [
      { label: "即日看獸醫", money: 2800, time: 5, energy: 18, health: -20, stress: 4, billItems: [{ label: "門診", amount: 680 }, { label: "止吐/藥物", amount: 720 }, { label: "血檢或影像", amount: 1400 }], line: "你花了半天和一張帳單，換來安心。" },
      { label: "記錄症狀並密切觀察", money: 0, time: 2, energy: 8, health: 6, line: "觀察可以，但不是忘記。" },
      { label: "覺得牠會自己好", money: 0, time: 0, energy: 0, health: 20, stress: 8, line: "省下來的時間，變成更高風險。" },
    ],
  },
  {
    id: "window",
    title: "衝向窗邊",
    text: "牠看到窗外有雀，突然衝向窗邊。窗網不是裝飾，是風險邊界。",
    condition: (s) => !s.flags.windowNet || s.accidentRisk > 45,
    choices: [
      { label: "立即裝窗網", money: 7800, time: 8, energy: 20, accident: -35, flag: "windowNet", install: "windowNet", line: "你把一次大事故，擋在發生之前。" },
      { label: "先關窗處理", money: 0, time: 1, energy: 5, accident: 8, stress: 5, line: "今天避過了，但問題仍在窗邊。" },
      { label: "覺得牠不會跳", money: 0, time: 0, energy: 0, accident: 26, line: "現實最可怕的常常是『應該不會』。" },
    ],
  },
  {
    id: "sofa",
    title: "抓爛沙發",
    text: "牠抓沙發、半夜跑酷。這通常不是壞，是精力和壓力沒有出口。",
    condition: (s) => s.boredom > 45 || !s.completedActions.enrichment,
    choices: [
      { label: "買抓板和陪玩", money: 1800, time: 6, energy: 18, boredom: -28, stress: -14, flag: "scratchPost", line: "你處理了原因，而不是只罵結果。" },
      { label: "罵牠", money: 0, time: 1, energy: 8, boredom: 8, stress: 18, bonding: -12, line: "牠安靜了一下，但不是被理解。" },
      { label: "換家具", money: 9800, time: 3, energy: 12, boredom: 12, line: "沙發回來了，問題還在。" },
    ],
  },
  {
    id: "supply",
    title: "貓砂和濾芯耗盡",
    text: "砂、濾芯、抓板、玩具都有壽命。真實照顧是反覆補給。",
    condition: (s) => s.suppliesWear > 62 || !s.completedActions.supplies,
    choices: [
      { label: "一次補齊", money: 3600, time: 4, energy: 10, supplies: -45, cleanliness: 14, line: "你不是購物，是維持生活系統。" },
      { label: "只買最急的", money: 1200, time: 2, energy: 6, supplies: -15, cleanliness: 4, line: "可以撐，但很快又會回來。" },
      { label: "先省下來", money: 0, time: 0, energy: 0, supplies: 22, cleanliness: -16, health: 10, line: "省下的是錢，增加的是衛生風險。" },
    ],
  },
  {
    id: "travel",
    title: "主人要外出幾天",
    text: "你要旅行或出差。貓不能被當成自動待機的家電。",
    condition: (s) => !s.completedActions.lifestyle && s.month > 8,
    choices: [
      { label: "安排上門照顧", money: 2600, time: 4, energy: 10, stress: -12, health: -6, flag: "petSitter", line: "你離開了，但責任沒有離開。" },
      { label: "請朋友偶爾看看", money: 500, time: 1, energy: 4, stress: 8, health: 6, line: "比沒有好，但不等於穩定照顧。" },
      { label: "放足糧水就走", money: 0, time: 0, energy: 0, stress: 24, health: 18, line: "這就是很多意外的開頭。" },
    ],
  },
  {
    id: "senior",
    title: "老年慢性病警號",
    text: "牠喝水變多、活動變慢、體重下降。老不是診斷，老是提醒你要檢查。",
    condition: (s) => s.month >= 96 && (s.healthRisk > 38 || !s.completedActions.vet),
    choices: [
      { label: "血檢尿檢並覆診", money: 8800, time: 7, energy: 22, health: -28, stress: 6, billItems: [{ label: "血檢尿檢", amount: 3200 }, { label: "影像/血壓", amount: 2600 }, { label: "藥物與覆診", amount: 3000 }], line: "你花了錢，也買到時間。" },
      { label: "只換老年糧", money: 1600, time: 2, energy: 6, health: 10, line: "飲食有幫助，但不能代替檢查。" },
      { label: "覺得只是老了", money: 0, time: 0, energy: 0, health: 28, stress: 12, line: "老不是理由，老是更需要被看見。" },
    ],
  },
];

const diseaseEvents = [
  {
    id: "seasonal-respiratory",
    title: "季節性呼吸道感染",
    text: "換季時牠開始打噴嚏、流眼水、食慾下降。照顧好也可能遇到，但壓力高、清潔差會明顯提高機率。",
    months: [1, 2, 3, 10, 11, 12],
    base: 0.015,
    riskFactor: 0.0018,
    maxChance: 0.22,
    choices: [
      { label: "門診、藥物和複查", money: 4200, time: 5, energy: 16, health: -26, stress: 4, medical: true, billItems: [{ label: "門診", amount: 680 }, { label: "化驗/檢查", amount: 1200 }, { label: "藥物與複診", amount: 2320 }], line: "季節病不是大劇情，但拖延會變成大帳單。" },
    ],
  },
  {
    id: "urinary-blockage",
    title: "泌尿急症",
    text: "牠頻繁進砂盆但尿不出來。飲水不足、砂盆髒、壓力高都會增加風險，這是很花錢也很急的病。",
    condition: (s) => s.hydration < 58 || s.cleanliness < 55 || s.stress > 58 || s.neglectTurns > 0,
    base: 0.008,
    riskFactor: 0.0025,
    maxChance: 0.32,
    choices: [
      { label: "急診導尿、住院和複查", money: 23800, time: 10, energy: 34, health: -34, stress: 10, medical: true, billItems: [{ label: "急診", amount: 1800 }, { label: "導尿/麻醉", amount: 6200 }, { label: "住院輸液", amount: 9800 }, { label: "尿檢與覆診", amount: 2800 }, { label: "處方糧", amount: 3200 }], chronic: { id: "urinaryDiet", name: "泌尿處方糧/定期尿檢", monthlyCost: 950, healthDrift: -2 }, line: "牠救回來了，但之後每一年都要承擔飲水、飲食和尿檢成本。" },
    ],
  },
  {
    id: "foreign-body",
    title: "亂吃異物腸胃阻塞",
    text: "牠吞了不該吃的東西。無聊、缺陪伴、環境整理不足時，這種意外更容易發生。",
    condition: (s) => s.boredom > 60 || s.cleanliness < 52 || s.completedActions.enrichment !== true,
    base: 0.006,
    riskFactor: 0.0022,
    maxChance: 0.28,
    choices: [
      { label: "影像檢查、手術和住院", money: 38600, time: 12, energy: 38, health: -38, stress: 14, medical: true, billItems: [{ label: "急診與影像", amount: 6800 }, { label: "開腹手術", amount: 18500 }, { label: "住院與止痛", amount: 9200 }, { label: "覆診與藥物", amount: 4100 }], line: "這不是『貓很頑皮』，是環境和陪伴共同累積出來的事故。" },
    ],
  },
  {
    id: "dental-disease",
    title: "牙周病惡化",
    text: "牠開始口臭、流口水、吃飯變慢。這類病常常不是一天出現，而是長期沒有檢查慢慢累積。",
    condition: (s) => s.month >= 36 && (s.healthRisk > 35 || s.completedActions.vet !== true),
    base: 0.01,
    riskFactor: 0.0016,
    maxChance: 0.24,
    choices: [
      { label: "洗牙、拔牙和止痛治療", money: 14600, time: 7, energy: 24, health: -24, stress: 8, medical: true, billItems: [{ label: "術前血檢", amount: 1800 }, { label: "麻醉洗牙", amount: 5200 }, { label: "拔牙/止痛", amount: 5200 }, { label: "覆診", amount: 2400 }], chronic: { id: "dentalFollowup", name: "牙科覆診/口腔護理", monthlyCost: 520, healthDrift: -1 }, line: "牙齒不是小事。之後每一年都會多出口腔照顧成本。" },
    ],
  },
  {
    id: "kidney-chronic",
    title: "慢性腎病確診",
    text: "牠喝水變多、體重下降、精神變差。老年或長期飲水/檢查不足時，慢性病可能突然被確診。",
    condition: (s) => s.month >= 84 && (s.hydration < 62 || s.healthRisk > 45 || s.completedActions.vet !== true),
    base: 0.012,
    riskFactor: 0.002,
    maxChance: 0.35,
    once: "kidneyCare",
    choices: [
      { label: "血檢尿檢、住院穩定和長期治療", money: 32800, time: 11, energy: 36, health: -30, stress: 10, medical: true, billItems: [{ label: "血檢尿檢", amount: 3600 }, { label: "住院輸液", amount: 12800 }, { label: "超聲波/血壓", amount: 6200 }, { label: "藥物與處方糧", amount: 10200 }], chronic: { id: "kidneyCare", name: "慢性腎病長期治療", monthlyCost: 2400, healthDrift: -3 }, line: "不是治好一次就完。從今以後，長期治療會每一年出現在帳單裡。" },
    ],
  },
  {
    id: "pancreatitis",
    title: "急性胰臟炎",
    text: "牠突然劇烈嘔吐、腹痛、精神很差。肥胖、亂餵零食、壓力和年紀都會增加風險。",
    condition: (s) => s.weight > 62 || s.stress > 62 || s.month >= 72,
    base: 0.007,
    riskFactor: 0.002,
    maxChance: 0.26,
    choices: [
      { label: "急診、住院輸液和止痛", money: 26800, time: 9, energy: 32, health: -32, stress: 8, medical: true, billItems: [{ label: "急診", amount: 1800 }, { label: "血檢/胰臟指標", amount: 3600 }, { label: "住院輸液", amount: 12800 }, { label: "止痛藥物", amount: 4200 }, { label: "覆診", amount: 4400 }], line: "牠不是嬌氣。急性病會把你以為可以省下的錢一次拿走。" },
    ],
  },
];

let state;
let selectedPersonality = "worker";

function newState() {
  const initialFund = Number($("#fund-input").value);
  const startAgeMonths = Number($("#start-age-input")?.value || 0);
  const sex = $("#cat-sex-input")?.value || "female";
  const coat = $("#cat-coat-input")?.value || "orange";
  const personalityKeys = Object.keys(profiles);
  const personality = startAgeMonths === 0 ? personalityKeys[Math.floor(Math.random() * personalityKeys.length)] : selectedPersonality;
  const lifeEnd = defaultLifeEndMonth(startAgeMonths);
  return {
    catName: $("#cat-name-input").value.trim() || "阿按揭",
    sex,
    coat,
    startAgeMonths,
    lifeEndMonth: lifeEnd,
    personality,
    personalityKnown: startAgeMonths > 0,
    initialFund,
    fund: initialFund,
    spent: 0,
    month: startAgeMonths + 1,
    dayBlock: 1,
    turnInDay: 1,
    timeLeft: YEAR_TIME_BUDGET,
    energy: 100,
    timeSpent: 0,
    effortSpent: 0,
    hunger: 78,
    happiness: 74,
    cleanliness: 76,
    hydration: 74,
    stress: 24,
    bonding: 30,
    weight: 42,
    activity: 34,
    sleepDebt: 18,
    poopLevel: 18,
    discipline: 20,
    snackMeals: 0,
    totalMeals: 0,
    healthRisk: 14,
    boredom: 28,
    suppliesWear: 30,
    accidentRisk: 14,
    xp: 0,
    medicalCount: 0,
    majorDecisions: 0,
    neglectTurns: 0,
    expenses: {
      year: 0,
      byCategory: {},
      medical: 0,
      preventable: 0,
      biggestBill: null,
      lastBill: null,
      history: [],
    },
    playCount: 0,
    completedActions: {},
    actionPlans: {},
    actionDraft: null,
    habits: {},
    deferredEvents: {},
    heatCycles: 0,
    lastVetAt: 0,
    currentEvent: null,
    currentReview: null,
    reviewExpanded: false,
    evolutionSeen: startAgeMonths >= 36,
    evolutionModal: null,
    currentAction: null,
    currentScene: "living",
    durables: {},
    careMistakes: {},
    buriedRisks: {},
    annualReviews: [],
    medical: {
      vaccinated: false,
      vaccineAt: null,
      neuteredAt: null,
      sick: false,
      sicknessReason: "",
      chronic: {},
    },
    inventory: {
      dryFood: 0,
      freezeDry: 0,
      freshFood: 0,
      wetFood: 0,
      treats: 0,
      litter: 0,
      litterBox: 0,
      foodBowl: 0,
      filter: 0,
      wandToy: 0,
      mouseToy: 0,
      puzzleToy: 0,
      scratcher: 0,
      catBed: 0,
      catTree: 0,
      outfit: 0,
      cleaner: 0,
      medicine: 0,
      carrier: 0,
      sitterTicket: 0,
    },
    achievements: [],
    flags: {
      windowNet: false,
      neutered: false,
      scratchPost: false,
      waterFountain: false,
      petSitter: false,
    },
    death: null,
    logs: [],
    lastCareAt: Date.now(),
  };
}

function profile() {
  return profiles[state.personality];
}

function personalityVisible() {
  return state.personalityKnown || state.month - state.startAgeMonths >= 6;
}

function pick(type) {
  const pool = profile().lines[type] || profile().lines.idle;
  return pool[Math.floor(Math.random() * pool.length)];
}

function stage() {
  const m = state.month - 1;
  if (m < 12) return { id: "kitten", name: "幼貓期", label: "疫苗、絕育、窗網、砂盆習慣，所有基礎都在這裡建立。" };
  if (m < 36) return { id: "teen", name: "青春期", label: "精力高，拆家、爬窗、外出和壓力問題更常見。" };
  if (m < 84) return { id: "adult", name: "成年期", label: "看似穩定，但固定開支、陪伴和體重管理一直消耗你。" };
  if (m < 132) return { id: "mature", name: "中年期", label: "慢性病風險開始抬頭，檢查不能再拖。" };
  return { id: "senior", name: "老年期", label: "腎病、關節、食慾、覆診和生活質素成為核心。" };
}

function level() {
  return Math.max(1, Math.floor(state.xp / 45) + 1);
}

function expenseCategory(reason = "", medical = false, fallback = "用品") {
  if (medical) return "醫療";
  if (/糧|食|餵|凍乾|肉條|鮮食|濕糧|乾糧/.test(reason)) return "飲食";
  if (/砂|濾芯|用品|清潔|水碗|食碗/.test(reason)) return "清潔用品";
  if (/玩|抓板|貓爬架|逗貓|小老鼠|益智|陪玩/.test(reason)) return "玩具陪伴";
  if (/窗網|外出|旅行|照顧|安全|籠/.test(reason)) return "安全外出";
  return fallback;
}

function recordExpense(amount, reason, options = {}) {
  if (!amount) return;
  const medical = Boolean(options.medical);
  const category = options.category || expenseCategory(reason, medical);
  const billItems = (options.billItems || [{ label: reason, amount }]).filter((item) => item.amount);
  const bill = {
    reason,
    amount,
    category,
    medical,
    preventable: Boolean(options.preventable),
    items: billItems,
    month: state.month,
  };
  state.fund -= amount;
  state.spent += amount;
  state.expenses.year = (state.expenses.year || 0) + amount;
  state.expenses.byCategory[category] = (state.expenses.byCategory[category] || 0) + amount;
  if (medical) {
    state.medicalCount += 1;
    state.expenses.medical = (state.expenses.medical || 0) + amount;
  }
  if (bill.preventable) state.expenses.preventable = (state.expenses.preventable || 0) + amount;
  state.expenses.lastBill = bill;
  if (!state.expenses.biggestBill || amount > state.expenses.biggestBill.amount) state.expenses.biggestBill = bill;
  state.expenses.history.unshift(bill);
  state.expenses.history = state.expenses.history.slice(0, 12);
  const line = billItems.length > 1
    ? `${reason}帳單：${money.format(amount)}（${billItems.slice(0, 3).map((item) => `${item.label}${money.format(item.amount)}`).join(" / ")}）`
    : `${reason}：-${money.format(amount)}`;
  addLog(line);
}

function spend(amount, reason, medical = false, options = {}) {
  recordExpense(amount, reason, { ...options, medical });
}

function useTimeEnergy(time, energy, reason) {
  state.timeLeft = clamp(state.timeLeft - time, 0, YEAR_TIME_BUDGET);
  state.energy = clamp(state.energy - energy, 0, 100);
  state.timeSpent = (state.timeSpent || 0) + time;
  state.effortSpent = (state.effortSpent || 0) + energy;
  if (time || energy) addLog(`${reason}：-${time}h / 精力-${energy}`);
}

function addLog(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 10);
}

const mistakeText = {
  missedFood: "飲食照顧不足",
  dirtyLitter: "清潔/砂盆長期不足",
  loneliness: "陪伴和活動不足",
  missedVet: "健康檢查拖延",
  supplies: "耗材補給不足",
  unsafeHome: "安全安排不足",
  sleep: "睡眠和關燈不足",
  punishment: "錯誤管教",
  obesity: "零食或體重管理失衡",
  illnessDelay: "生病或風險拖延",
};

function recordMistake(key, detail, severity = 1) {
  state.careMistakes[key] ||= { count: 0, severity: 0, firstMonth: state.month, lastMonth: state.month, details: [] };
  const record = state.careMistakes[key];
  record.count += 1;
  record.severity += severity;
  record.lastMonth = state.month;
  record.details.unshift(detail || mistakeText[key] || key);
  record.details = record.details.slice(0, 4);
}

function unrecordMistake(key, severity = 1) {
  const record = state.careMistakes[key];
  if (!record) return;
  record.count = Math.max(0, record.count - 1);
  record.severity = Math.max(0, record.severity - severity);
  record.details.shift();
  if (record.count === 0 && record.severity === 0) delete state.careMistakes[key];
}

function monthInYear() {
  return ((state.month - 1) % 12) + 1;
}

function ensureStateShape() {
  state.inventory ||= {};
  state.flags ||= {};
  state.durables ||= {};
  state.actionPlans ||= {};
  state.habits ||= {};
  state.deferredEvents ||= {};
  state.sex ||= "female";
  state.coat ||= "orange";
  state.startAgeMonths ??= 0;
  state.lifeEndMonth ||= defaultLifeEndMonth(state.startAgeMonths);
  state.personalityKnown ??= state.startAgeMonths > 0;
  state.heatCycles ??= 0;
  state.lastVetAt ??= 0;
  if (state.actionDraft === undefined) state.actionDraft = null;
  if (state.timeLeft === undefined || state.timeLeft <= 30) state.timeLeft = YEAR_TIME_BUDGET;
  state.timeSpent ??= Math.max(0, YEAR_TIME_BUDGET - (state.timeLeft ?? YEAR_TIME_BUDGET));
  state.effortSpent ??= Math.max(0, 100 - (state.energy ?? 100));
  state.currentReview ||= null;
  state.reviewExpanded ||= false;
  state.evolutionSeen ??= state.startAgeMonths >= 36 || state.month >= 36;
  if (state.evolutionModal === undefined) state.evolutionModal = null;
  state.careMistakes ||= {};
  state.buriedRisks ||= {};
  state.annualReviews ||= [];
  state.expenses ||= {};
  state.expenses.year ??= 0;
  state.expenses.byCategory ||= {};
  state.expenses.medical ??= 0;
  state.expenses.preventable ??= 0;
  state.expenses.biggestBill ||= null;
  state.expenses.lastBill ||= null;
  state.expenses.history ||= [];
  state.activity ??= 34;
  state.sleepDebt ??= 18;
  state.poopLevel ??= 18;
  state.discipline ??= 20;
  const yearIndex = playYearIndex();
  if (!state.turnInDay || state.turnInDay > YEARS_PER_DAY) state.turnInDay = ((yearIndex - 1) % YEARS_PER_DAY) + 1;
  if (!state.dayBlock || state.dayBlock > playDayTotal()) state.dayBlock = Math.ceil(yearIndex / YEARS_PER_DAY);
  state.snackMeals ??= 0;
  state.totalMeals ??= 0;
  state.medical ||= { vaccinated: false, vaccineAt: null, neuteredAt: null, sick: false, sicknessReason: "" };
  state.medical.chronic ||= {};
  state.medical.sick ||= false;
  state.medical.sicknessReason ||= "";
  state.currentScene ||= "living";
  Object.keys(itemNames).forEach((key) => {
    if (state.inventory[key] === undefined) state.inventory[key] = 0;
  });
  state.logs = (state.logs || []).map((item) =>
    item
      .replaceAll("個30天", "個月")
      .replaceAll("30天", "一個月")
      .replaceAll("這一個月", "這個月"),
  );
}

function setScene(scene) {
  state.currentScene = scene;
  state.currentAction = null;
  $("#cat-line").textContent = currentLang === "en"
    ? {
        living: "Daily care hub: feeding, play, and status checks.",
        balcony: "Window safety matters here. This scene affects fall risk.",
        bedroom: "Sleep and bonding scene, useful for calming and rest.",
        garden: "A controlled outdoor space at home: more activity, still your responsibility.",
        shop: "Buy food, supplies, toys, decor, and medical preparation here.",
        park: "Real outdoor stimulation: more exciting, but also more risk.",
        friend: "A visit/social scene for future friend-home gameplay.",
      }[scene] || pick("idle")
    : sceneMeta[scene]?.line || pick("idle");
  saveGame();
  render();
}

function setScreen(id) {
  $$(".screen").forEach((screen) => screen.classList.remove("active"));
  $(id).classList.add("active");
}

function scrollChoicePanelIntoView() {
  window.requestAnimationFrame(() => {
    const panel = $("#choice-panel");
    if (!panel || panel.classList.contains("hidden")) return;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function miniProgress() {
  return clamp(state.actionDraft?.progress || 0);
}

function setMiniProgress(value) {
  if (!state.actionDraft) return;
  state.actionDraft.progress = clamp(value);
  const meta = actionMiniMeta[state.actionDraft.action] || actionMiniMeta.enrichment;
  animateCat(meta.reaction || "playing");
  render();
}

function advanceMiniProgress(amount = 25) {
  setMiniProgress(miniProgress() + amount);
}

function shortCareResult(action, effects) {
  const meta = miniMeta(action);
  const cost = [];
  if (effects.money) cost.push(money.format(effects.money));
  if (effects.time) cost.push(`${effects.time}h`);
  if (effects.energy) cost.push(energyText(effects.energy));
  return `${meta.done} ${cost.join(" · ")}`;
}

function currentNeeds() {
  const st = stage();
  const descriptions = currentLang === "en"
    ? {
        nutrition: st.id === "senior" ? "Senior wet food, medication, hydration, and appetite management" : "Food, wet food, treat limits, and hydration management",
        supplies: st.id === "kitten" ? "Starter items, window nets, fountain, scratcher, and carrier; special issues become forced reminders" : "Litter, filters, toys, scratchers, cleaning supplies, and expiry reminders",
        hygiene: "Litter, grooming, vomit, and home cleaning all cost time and energy",
        enrichment: profile().socialNeed > 1 ? "This personality needs more companionship; less play hurts mood faster" : "Play, toy rotation, and enrichment prevent stress and damage",
        training: "Scratching, biting, and jumping need guidance; harsh discipline creates stress and hidden risk",
        sleep: "Night rhythm and daytime activity management; the point is reducing night disruption",
        vet: st.id === "kitten" ? "Vaccines, neutering, and illness become strong reminders; adults need yearly checks, seniors every 6 months" : st.id === "senior" ? "Senior blood tests, urine tests, and follow-ups every 6 months; longer is delay" : "Adult checkups every 12 months; teeth, urine, and sudden illness tracking",
        lifestyle: "Travel, window nets, boarding, sitters, and home safety; expired window safety becomes forced",
      }
    : {
        nutrition: st.id === "senior" ? "老年濕糧、藥物、飲水與食慾管理" : "糧、濕糧、零食控制與飲水管理",
        supplies: st.id === "kitten" ? "起始用品、窗網、水機、抓板、外出籠；特殊情況會由系統強制提醒" : "貓砂、濾芯、玩具、抓板、清潔用品損耗；過期會由系統強制提醒",
        hygiene: "砂盆、毛髮、嘔吐物、環境清潔，會吃時間和精力",
        enrichment: profile().socialNeed > 1 ? "這種性格更需要陪伴，少玩會更失落" : "陪玩、玩具輪替、環境刺激，避免壓力和拆家",
        training: "抓沙發、咬人、亂跳不是壞，而是需要引導；錯誤管教會留下怕人和壓力埋雷",
        sleep: "夜間節奏、白天活動消耗、半夜跑酷管理；不是貓白天不能睡，而是避免主人被長期吵醒",
        vet: st.id === "kitten" ? "疫苗、絕育、生病會變成強提醒；一般成年每12個月檢查，老年每6個月" : st.id === "senior" ? "老年期每6個月血檢、尿檢、覆診；超過就算拖延" : "成年每12個月健康檢查；牙齒、尿液、突發病追蹤；超過就算拖延",
        lifestyle: "旅行、出差、窗網、寄養、上門照顧與安全安排；窗網過期會強制處理",
      };
  const required = ["nutrition", "hygiene", "enrichment"];
  if (((state.habits.sleepRoutine || 0) < 3 && state.boredom > 45) || state.sleepDebt > 45) required.push("sleep");
  const nearExpired = Object.keys(durableItemRules).some((id) => state.durables[id] && durableMonthsLeft(id) <= 2);
  if (state.suppliesWear > 58 || nearExpired || state.month === 1) required.push("supplies");
  if (state.boredom > 52 || state.discipline < 28 || (st.id === "teen" && state.month % 3 === 0)) required.push("training");
  const vetDueMonths = st.id === "senior" ? 6 : 12;
  if (!state.lastVetAt || state.month - state.lastVetAt >= vetDueMonths || state.healthRisk > 45) required.push("vet");
  if (!state.flags.windowNet || state.accidentRisk > 42 || state.month % 18 === 0) required.push("lifestyle");
  return {
    title: currentLang === "en"
      ? `${stageText(st)}: Year ${playYearIndex()}/${playableYears()}, ${personalityVisible() ? profileText("name") : "personality unknown"}`
      : `${st.name}：第 ${playYearIndex()}/${playableYears()} 年，${personalityVisible() ? profile().name : "性格未明"}`,
    descriptions,
    required,
  };
}

function yearlyRiskPreview() {
  const risks = [];
  const ageYears = Math.floor((state.month - 1) / 12);
  if (currentLang === "en") {
    if (!hasValidDurable("windowNet")) risks.push("No valid window net: fall/window accident risk");
    if (!state.flags.neutered && state.month >= 6) risks.push(state.sex === "male" ? "Unneutered male: spraying, aggression, night calls" : "Unneutered female: repeated heat and pyometra risk");
    const vetDue = stage().id === "senior" ? 6 : 12;
    if (!state.lastVetAt || state.month - state.lastVetAt >= vetDue) risks.push("Checkup due: small illness may become expensive");
    if (state.hydration < 60 || ageYears >= 7) risks.push("Hydration/age risk: kidney and urinary issues");
    if (state.cleanliness < 65 || state.poopLevel > 55) risks.push("Poor hygiene: urinary, skin, and odor problems");
    if (state.boredom > 55 || state.activity < 35) risks.push("Low enrichment: damage, obesity, night running");
    if (state.suppliesWear > 55) risks.push("Item wear: toys, scratchers, and filters need replacement");
    if (state.stress > 60) risks.push("High stress: appetite drop, aggression, or hiding");
    if (!risks.length) risks.push("Stable this year, but vaccines, hygiene, and play still matter");
    return risks.slice(0, 4);
  }
  if (!hasValidDurable("windowNet")) risks.push("窗網未處理：跌落/爬窗事故");
  if (!state.flags.neutered && state.month >= 6) risks.push(state.sex === "male" ? "未絕育男貓：亂尿、攻擊、夜叫" : "未絕育女貓：反覆發情與子宮蓄膿風險");
  const vetDue = stage().id === "senior" ? 6 : 12;
  if (!state.lastVetAt || state.month - state.lastVetAt >= vetDue) risks.push("健康檢查到期：小病可能拖成大病");
  if (state.hydration < 60 || ageYears >= 7) risks.push("飲水/年齡風險：腎病、尿道問題");
  if (state.cleanliness < 65 || state.poopLevel > 55) risks.push("清潔不足：泌尿、皮膚與臭味問題");
  if (state.boredom > 55 || state.activity < 35) risks.push("刺激不足：拆家、肥胖、夜間跑酷");
  if (state.suppliesWear > 55) risks.push("用品耗損：玩具、抓板、濾芯需要更換");
  if (state.stress > 60) risks.push("壓力偏高：食慾下降、攻擊或躲藏");
  if (!risks.length) risks.push("今年狀態穩定，但疫苗、清潔、陪玩仍不能停");
  return risks.slice(0, 4);
}

function applyAction(action) {
  if (state.currentEvent) {
    showBanner(currentLang === "en" ? "Respond to the current strong reminder first. You can handle it or delay it and accept future risk." : "先回應目前的強提醒；你可以處理，也可以選擇延後並承擔後續風險。");
    return;
  }
  state.currentAction = action;
  state.actionDraft = {
    action,
    selected: [...(state.actionPlans[action]?.selected || [])],
    intensity: "normal",
    progress: 0,
  };
  render();
  animateCat(action === "vet" || action === "lifestyle" ? "startled" : "playing");
  scrollChoicePanelIntoView();
}

function hasItems(items = {}) {
  return Object.entries(items).every(([key, amount]) => (state.inventory[key] || 0) >= amount);
}

function addItems(items = {}) {
  Object.entries(items).forEach(([key, amount]) => {
    state.inventory[key] = (state.inventory[key] || 0) + amount;
  });
}

function useItems(items = {}) {
  Object.entries(items).forEach(([key, amount]) => {
    state.inventory[key] = Math.max(0, (state.inventory[key] || 0) - amount);
  });
}

function installDurable(id) {
  const rule = durableItemRules[id];
  if (!rule) return;
  state.durables[id] = {
    installedAt: state.month,
    lifespan: rule.lifespan,
  };
}

function durableAge(id) {
  const durable = state.durables[id];
  if (!durable) return Infinity;
  return Math.max(0, state.month - durable.installedAt + (durable.wear || 0));
}

function durableMonthsLeft(id) {
  const durable = state.durables[id];
  const rule = durableItemRules[id];
  if (!durable || !rule) return 0;
  return durable.lifespan - durableAge(id);
}

function hasValidDurable(id) {
  return durableMonthsLeft(id) > 0;
}

function addDurableWear(id, amount) {
  if (!state.durables[id]) return;
  state.durables[id].wear = (state.durables[id].wear || 0) + amount;
}

function applyAutonomousDurableWear() {
  const active = state.activity > 60 ? 1.2 : state.boredom > 60 ? 1 : 0.5;
  addDurableWear("scratcher", active);
  addDurableWear("wandToy", state.boredom > 50 ? 0.7 : 0.3);
  addDurableWear("mouseToy", state.activity > 52 ? 0.7 : 0.25);
  addDurableWear("catTree", state.activity > 50 ? 0.8 : 0.35);
  addDurableWear("catBed", 0.25);
}

function consumeAnyFood() {
  const order = ["freshFood", "wetFood", "dryFood", "freezeDry", "treats"];
  const key = order.find((item) => state.inventory[item] > 0);
  if (!key) return false;
  state.inventory[key] -= 1;
  addLog(`使用背包食物：${itemNames[key]} -1`);
  return true;
}

function pickFoodFromInventory(inventory) {
  return ["freshFood", "wetFood", "dryFood", "freezeDry", "treats"].find((item) => inventory[item] > 0);
}

function addToRecord(record, key, amount) {
  if (!amount) return;
  record[key] = (record[key] || 0) + amount;
}

function scaledValue(value, intensity, field) {
  if (!value) return 0;
  const directFields = new Set(["weight"]);
  if (directFields.has(field)) return value;
  return Math.round(value * intensityMeta[intensity].effect);
}

function annualRepeatForChoice(action, choice = {}) {
  if (choice.annualRepeat) return choice.annualRepeat;
  if (choice.install || choice.medical || choice.flag === "windowNet" || choice.flag === "neutered") return 1;
  const label = choice.label || "";
  if (action === "nutrition") return 12;
  if (action === "hygiene") return label.includes("深層") ? 4 : 12;
  if (action === "supplies") {
    if (label.includes("檢查")) return 4;
    if (label.includes("耗材")) return 6;
    return 2;
  }
  if (action === "enrichment") {
    if (label.includes("益智玩具")) return 2;
    return 12;
  }
  if (action === "training") return label.includes("大聲罵") ? 1 : 4;
  if (action === "sleep") return label.includes("不管") ? 1 : 6;
  if (action === "lifestyle") return label.includes("旅行") ? 2 : 1;
  return 1;
}

function annualInventoryAmount(key, amount, repeat) {
  if (!amount) return 0;
  if (durableItemRules[key]) return amount;
  return amount * repeat;
}

function annualStatValue(choice, field, intensity, repeat) {
  const value = choice[field] || 0;
  if (!value) return 0;
  const multiplier = repeat > 1 ? 1.45 : 1;
  return Math.round(scaledValue(value, intensity, field) * multiplier);
}

const effortRanges = [
  { id: "basic", label: "基本維持", min: 0, max: 180, detail: "一年大致只做到餵食、鏟砂和少量必要處理，能維持生存，但陪伴、預防和環境刺激仍偏少。" },
  { id: "steady", label: "穩定照顧", min: 181, max: 520, detail: "一年包含日常餵食清潔、基本陪玩、用品補給或健康檢查，是比較接近真實負責任養貓的投入。" },
  { id: "heavy", label: "高負荷照顧", min: 521, max: Infinity, detail: "通常代表大病醫療、深層清潔、旅行安排、密集行為修正或多個大項目疊加，會明顯擠壓主人的休息和情緒容量。" },
];

const statInfo = {
  "stat-hunger": {
    title: "飽肚",
    text: "0-30代表長期吃不夠或飲食安排失敗，會提高亂吃、嘔吐和死亡風險；31-69代表勉強維持；70-100代表飲食穩定。太高不等於更好，若體重同時上升，可能是過量餵食。",
  },
  "stat-happiness": {
    title: "心情",
    text: "0-30代表長期無聊或壓力大，容易拆家、夜跑、對人疏離；31-69代表普通；70-100代表生活刺激和安全感較足。心情會受陪玩、環境、疾病和錯誤管教影響。",
  },
  "stat-cleanliness": {
    title: "清潔",
    text: "0-30代表家中和身體衛生很差，會增加皮膚、腸胃、泌尿和臭味問題；31-69代表有缺口；70-100代表砂盆、毛髮和環境大致乾淨。",
  },
  "stat-hydration": {
    title: "水分",
    text: "0-40代表飲水或濕食不足，泌尿風險會上升；41-69代表需要留意；70-100代表飲水和濕糧安排較好。乾糧多、壓力高或砂盆髒都可能讓水分管理變差。",
  },
  "stat-stress": {
    title: "壓力",
    text: "這是反向分數：越高越糟。0-30代表穩定；31-69代表有壓力源；70-100代表高壓，會增加生病、攻擊、亂尿、夜跑和親密下降。錯誤管教會直接推高壓力。",
  },
  "stat-bonding": {
    title: "親密",
    text: "0-30代表牠不太信任你；31-69代表普通關係；70-100代表高度信任，會解鎖坐腿、被抱、被親等成就。親密會影響成長分支，錯誤管教和忽略會降低親密。",
  },
  "stat-activity": {
    title: "活動量",
    text: "0-35代表偏懶或活動不足，容易肥胖和夜間爆發；36-70代表活動平衡；71-100代表很活躍。活動量會影響成年後成長成懶貓、均衡貓或活躍貓。",
  },
  "stat-sleep": {
    title: "夜間干擾",
    text: "這是反向分數：越高代表越影響主人。0-30代表夜間節奏穩定；31-69代表偶爾夜跑或叫喚；70-100代表半夜跑酷嚴重，會增加主人疲勞、錯誤管教和人貓衝突。",
  },
  "stat-poop": {
    title: "砂盆髒污",
    text: "這是反向分數：越高越髒。0-30代表砂盆乾淨；31-69代表需要清理；70-100代表臭味、拒用砂盆和泌尿風險上升。深層清潔已包含砂盆周邊處理。",
  },
  "stat-discipline": {
    title: "行為穩定",
    text: "0-30代表抓咬、亂尿、夜跑或怕人的行為問題明顯；31-69代表還在磨合；70-100代表牠理解環境規則且壓力較低。這不是服從度，而是主人是否用正確方式引導行為。",
  },
  "stat-risk": {
    title: "健康風險",
    text: "0-30代表暫時穩定；31-69代表已有累積風險；70以上會更容易觸發強提醒或疾病事件；接近100可能病逝。疫苗、絕育、飲水、清潔、壓力和年度檢查都會影響它。",
  },
  "stat-level": {
    title: "責任等級",
    text: "這是玩家進度，不是貓的健康分數，也不是道德評分。完成必要照顧、處理醫療、承擔重大決策會提高等級；等級高代表你經歷和處理過更多責任情境。",
  },
  "stat-time": {
    title: "今年已用時間",
    text: "今年你已經投入在照顧上的時間。餵食、清潔、陪玩、覆診、購物和外出安排都會疊加。這不是剩餘時間，而是讓你看到照顧如何吃掉現實生活時間。",
  },
  "stat-energy": {
    title: "已付出精力",
    text: "今年照顧消耗的精神和體力總量，可以超過100。0-180是基本維持，181-520是穩定照顧，521以上是高負荷照顧。它用來判斷主人投入程度，而不是限制你不能再做。",
  },
};

const statInfoEn = {
  "stat-hunger": ["Hunger", "0-30 means long-term poor feeding or failed diet setup; 70-100 means stable food. Very high is not always better if weight also rises."],
  "stat-happiness": ["Mood", "Low mood raises damage, night running, and distance from humans. It is affected by play, environment, illness, and harsh discipline."],
  "stat-cleanliness": ["Cleanliness", "Low cleanliness raises skin, gut, urinary, and odor problems. It covers litter, grooming, and home hygiene."],
  "stat-hydration": ["Hydration", "Low hydration increases urinary risk. Wet food, clean water, stress, and litter-box quality all matter."],
  "stat-stress": ["Stress", "Higher is worse. High stress raises illness, aggression, spraying, night running, and lower bonding."],
  "stat-bonding": ["Bonding", "Low bonding means the cat trusts you less. High bonding unlocks lap sitting, holding, and forehead-kiss milestones."],
  "stat-activity": ["Activity", "Low activity raises obesity and night-burst risk. Activity helps determine the adult evolution branch."],
  "stat-sleep": ["Night disturbance", "Higher means the owner is more affected by night running or calling. It raises fatigue and conflict risk."],
  "stat-poop": ["Litter dirt", "Higher is dirtier. Dirty litter raises odor, litter refusal, and urinary risk."],
  "stat-discipline": ["Behavior stability", "This is not obedience. It reflects whether the owner guides behavior correctly and reduces stress."],
  "stat-risk": ["Health risk", "Higher risk makes illness, forced reminders, and death more likely. Vaccines, neutering, hydration, hygiene, stress, and checkups affect it."],
  "stat-level": ["Responsibility level", "This is player progress, not a moral score. Handling necessary care and major decisions raises it."],
  "stat-time": ["Time used this year", "Care actions stack time: feeding, cleaning, play, appointments, shopping, and travel planning."],
  "stat-energy": ["Effort spent", "Care effort can exceed 100. It measures workload, not a spending limit."],
};

function statInfoText(id, field = "title") {
  if (currentLang !== "en") return statInfo[id]?.[field];
  const item = statInfoEn[id];
  return field === "title" ? item?.[0] || statInfo[id]?.title : item?.[1] || statInfo[id]?.text;
}

function effortLevel(value) {
  return effortRanges.find((range) => value >= range.min && value <= range.max) || effortRanges[0];
}

function buildActionPlan(action, selected, intensity) {
  const tempInventory = { ...state.inventory };
  const effects = {
    money: 0,
    time: 0,
    energy: 0,
    inventoryAdds: {},
    inventoryUses: {},
    inventoryBefore: {},
    stats: {},
    flagsBefore: {},
    durablesBefore: {},
    installDurables: [],
    setFlags: [],
    autoPurchases: [],
    billItems: [],
    habitGains: {},
    playCount: 0,
    snackMeals: 0,
    totalMeals: 0,
    mistakes: [],
    xp: currentNeeds().required.includes(action) ? 8 : 4,
  };
  const touchInventory = (key) => {
    if (effects.inventoryBefore[key] === undefined) effects.inventoryBefore[key] = state.inventory[key] || 0;
  };
  const buyMissingInventory = (key, amount) => {
    const item = shopItem(key);
    if (!item?.add?.[key]) return false;
    while ((tempInventory[key] || 0) < amount) {
      effects.money += item.price || 0;
      effects.time += item.time || 0;
      effects.energy += item.energy || 0;
      effects.autoPurchases.push(item.label);
      effects.billItems.push({ label: item.label, amount: item.price || 0 });
      Object.entries(item.add || {}).forEach(([itemKey, itemAmount]) => {
        touchInventory(itemKey);
        tempInventory[itemKey] = (tempInventory[itemKey] || 0) + itemAmount;
        addToRecord(effects.inventoryAdds, itemKey, itemAmount);
      });
    }
    return true;
  };

  for (const index of selected) {
    const choice = actionChoices[action]?.[index];
    if (!choice) continue;
    const repeat = annualRepeatForChoice(action, choice);
    if (repeat > 1) effects.annualized = true;
    const choiceMoney = (choice.money || 0) * repeat;
    effects.money += choiceMoney;
    if (choice.billItems?.length) {
      choice.billItems.forEach((item) => effects.billItems.push({ label: item.label, amount: item.amount * repeat }));
    } else if (choiceMoney) {
      effects.billItems.push({ label: choice.label.replace(/，.*$/, ""), amount: choiceMoney });
    }
    effects.time += (choice.time || 0) * repeat;
    effects.energy += (choice.energy || 0) * repeat;

    Object.entries(choice.add || {}).forEach(([key, amount]) => {
      const yearlyAmount = annualInventoryAmount(key, amount, repeat);
      touchInventory(key);
      tempInventory[key] = (tempInventory[key] || 0) + yearlyAmount;
      addToRecord(effects.inventoryAdds, key, yearlyAmount);
      if (durableItemRules[key] && effects.durablesBefore[key] === undefined) effects.durablesBefore[key] = state.durables[key] ? { ...state.durables[key] } : null;
    });

    if (choice.consumeFood) {
      for (let i = 0; i < repeat; i += 1) {
        const foodKey = pickFoodFromInventory(tempInventory);
        if (!foodKey) return { error: currentLang === "en" ? "Inventory does not contain enough food for a full year. Buy food in the shop or remove the inventory-feeding option." : "背包沒有足夠一整年可用食物。請先去商店買食物，或取消「用背包現有食物餵」。" };
        touchInventory(foodKey);
        tempInventory[foodKey] -= 1;
        addToRecord(effects.inventoryUses, foodKey, 1);
        effects.totalMeals += 1;
        if (["freezeDry", "treats"].includes(foodKey)) effects.snackMeals += 1;
      }
    }

    for (const [key, amount] of Object.entries(choice.use || {})) {
      const yearlyAmount = annualInventoryAmount(key, amount, repeat);
      touchInventory(key);
      if ((tempInventory[key] || 0) < yearlyAmount && choice.autoBuyMissing) buyMissingInventory(key, yearlyAmount);
      if ((tempInventory[key] || 0) < yearlyAmount) return { error: currentLang === "en" ? `Inventory lacks a full year's amount: ${itemName(key)}.` : `背包缺少一整年用量：${itemNames[key] || key}。` };
      tempInventory[key] -= yearlyAmount;
      addToRecord(effects.inventoryUses, key, yearlyAmount);
    }

    (choice.replaceDurables || []).forEach((key) => {
      if (hasValidDurable(key)) return;
      const item = shopItem(key);
      if (!item) return;
      effects.money += item.price || 0;
      effects.time += item.time || 0;
      effects.energy += item.energy || 0;
      effects.installDurables.push(key);
      effects.autoPurchases.push(item.label);
      effects.billItems.push({ label: item.label, amount: item.price || 0 });
      if (effects.durablesBefore[key] === undefined) effects.durablesBefore[key] = state.durables[key] ? { ...state.durables[key] } : null;
      Object.entries(item.add || {}).forEach(([itemKey, amount]) => {
        touchInventory(itemKey);
        tempInventory[itemKey] = (tempInventory[itemKey] || 0) + amount;
        addToRecord(effects.inventoryAdds, itemKey, amount);
      });
      if (item.flag && effects.flagsBefore[item.flag] === undefined) effects.flagsBefore[item.flag] = state.flags[item.flag];
      if (item.flag) effects.setFlags.push(item.flag);
    });

    ["hunger", "happiness", "cleanliness", "hydration", "health", "accident", "stress", "boredom", "bonding", "supplies", "weight", "activity", "sleepDebt", "poop", "discipline"].forEach((field) => {
      addToRecord(effects.stats, field, annualStatValue(choice, field, intensity, repeat));
    });

    if (choice.flag && effects.flagsBefore[choice.flag] === undefined) effects.flagsBefore[choice.flag] = state.flags[choice.flag];
    if (choice.install && effects.durablesBefore[choice.install] === undefined) effects.durablesBefore[choice.install] = state.durables[choice.install] ? { ...state.durables[choice.install] } : null;
    if (action === "enrichment") effects.playCount += 1;
    if (!choice.consumeFood && ["dryFood", "wetFood", "freshFood", "freezeDry", "treats"].some((key) => choice.add?.[key] || choice.use?.[key])) effects.totalMeals += repeat;
    if (choice.add?.freezeDry || choice.add?.treats || choice.use?.freezeDry || choice.use?.treats) effects.snackMeals += repeat;
    if (choice.mistake) effects.mistakes.push(choice.mistake);
    if (choice.habit) addToRecord(effects.habitGains, choice.habit, 1);
  }

  const habitDiscounts = {
    sleepRoutine: { action: "sleep", min: 3, time: 0.5, energy: 0.5, note: "睡眠習慣已養成，今年關燈睡眠成本降低。" },
    cleaningRoutine: { action: "hygiene", min: 3, time: 0.85, energy: 0.85, note: "清潔流程變熟練，今年清潔成本略降。" },
    playRoutine: { action: "enrichment", min: 4, time: 0.9, energy: 0.9, note: "陪玩節奏變穩定，今年互動更順手。" },
    scratchRoutine: { action: "training", min: 3, time: 0.85, energy: 0.85, note: "抓板引導已成習慣，今年行為引導成本降低。" },
    carrierRoutine: { action: "lifestyle", min: 3, time: 0.8, energy: 0.8, note: "外出籠練習已有基礎，今年外出訓練比較不崩潰。" },
  };
  Object.entries(habitDiscounts).forEach(([key, habit]) => {
    if (habit.action !== action || (state.habits[key] || 0) < habit.min) return;
    effects.time = Math.ceil(effects.time * habit.time);
    effects.energy = Math.ceil(effects.energy * habit.energy);
    effects.habitNote = habit.note;
  });
  effects.intensity = effortLevel(effects.energy);
  const sceneBonuses = {
    bedroom: { sleep: { sleepDebt: -6, stress: -3, bonding: 2, note: "睡房安排睡眠更有效。" } },
    garden: { enrichment: { activity: 6, boredom: -4, note: "庭院陪玩讓活動量更高。" } },
    park: { lifestyle: { activity: 8, happiness: 5, accident: 4, note: "公園提高快樂和活動，但也多一點意外風險。" } },
    balcony: { lifestyle: { accident: -6, note: "陽台處理安全安排會更直接降低爬窗風險。" } },
    friend: { enrichment: { happiness: 5, stress: -3, note: "朋友屋企增加社交刺激。" } },
  };
  const sceneBonus = sceneBonuses[state.currentScene]?.[action];
  if (sceneBonus) {
    effects.sceneNote = sceneBonus.note;
    Object.entries(sceneBonus).forEach(([key, amount]) => {
      if (key !== "note") addToRecord(effects.stats, key, amount);
    });
  }
  return { effects };
}

function applyActionPlanEffects(action, selected, intensity, effects) {
  if (effects.money) {
    recordExpense(effects.money, `${actionMeta[action].title}方案`, {
      medical: action === "vet",
      category: expenseCategory(actionMeta[action].title, action === "vet"),
      billItems: effects.billItems,
    });
  }
  state.timeLeft = clamp(state.timeLeft - effects.time, 0, YEAR_TIME_BUDGET);
  state.energy = clamp(state.energy - effects.energy, 0, 100);
  state.timeSpent = (state.timeSpent || 0) + effects.time;
  state.effortSpent = (state.effortSpent || 0) + effects.energy;
  if (effects.time || effects.energy) addLog(`${actionMeta[action].title}方案：-${effects.time}h / 精力-${effects.energy}`);
  Object.entries(effects.inventoryAdds).forEach(([key, amount]) => {
    state.inventory[key] = (state.inventory[key] || 0) + amount;
  });
  Object.entries(effects.inventoryUses).forEach(([key, amount]) => {
    state.inventory[key] = Math.max(0, (state.inventory[key] || 0) - amount);
  });

  state.hunger = clamp(state.hunger + (effects.stats.hunger || 0));
  state.happiness = clamp(state.happiness + (effects.stats.happiness || 0));
  state.cleanliness = clamp(state.cleanliness + (effects.stats.cleanliness || 0));
  state.hydration = clamp(state.hydration + (effects.stats.hydration || 0));
  state.healthRisk = clamp(state.healthRisk + (effects.stats.health || 0) + (effects.stats.healthRisk || 0));
  state.accidentRisk = clamp(state.accidentRisk + (effects.stats.accident || 0));
  state.stress = clamp(state.stress + (effects.stats.stress || 0));
  state.boredom = clamp(state.boredom + (effects.stats.boredom || 0));
  state.bonding = clamp(state.bonding + (effects.stats.bonding || 0));
  state.suppliesWear = clamp(state.suppliesWear + (effects.stats.supplies || 0));
  state.weight = clamp(state.weight + (effects.stats.weight || 0), 25, 95);
  state.activity = clamp(state.activity + (effects.stats.activity || 0));
  state.sleepDebt = clamp(state.sleepDebt + (effects.stats.sleepDebt || 0));
  state.poopLevel = clamp(state.poopLevel + (effects.stats.poop || 0));
  state.discipline = clamp(state.discipline + (effects.stats.discipline || 0));
  state.snackMeals += effects.snackMeals;
  state.totalMeals += effects.totalMeals;
  effects.mistakes.forEach((key) => recordMistake(key, `${actionMeta[action].title}選擇：${mistakeText[key] || key}`, 2));
  Object.entries(effects.habitGains || {}).forEach(([key, amount]) => {
    state.habits[key] = (state.habits[key] || 0) + amount;
  });
  if (action === "vet") state.lastVetAt = state.month;
  selected.forEach((index) => {
    const choice = actionChoices[action][index];
    if (choice.flag) state.flags[choice.flag] = true;
    if (choice.install) installDurable(choice.install);
    Object.keys(choice.add || {}).forEach((key) => {
      if (durableItemRules[key]) installDurable(key);
    });
  });
  effects.installDurables.forEach(installDurable);
  effects.setFlags.forEach((flag) => {
    state.flags[flag] = true;
  });
  state.playCount += effects.playCount;
  state.xp += effects.xp;
}

function revertActionPlan(action) {
  const plan = state.actionPlans[action];
  if (!plan) return;
  const effects = plan.effects;
  state.fund += effects.money;
  state.spent = Math.max(0, state.spent - effects.money);
  const category = expenseCategory(actionMeta[action]?.title || action, action === "vet");
  state.expenses.year = Math.max(0, (state.expenses.year || 0) - effects.money);
  state.expenses.byCategory[category] = Math.max(0, (state.expenses.byCategory[category] || 0) - effects.money);
  if (action === "vet") state.expenses.medical = Math.max(0, (state.expenses.medical || 0) - effects.money);
  state.timeLeft = clamp(state.timeLeft + effects.time, 0, YEAR_TIME_BUDGET);
  state.energy = clamp(state.energy + effects.energy, 0, 100);
  state.timeSpent = Math.max(0, (state.timeSpent || 0) - effects.time);
  state.effortSpent = Math.max(0, (state.effortSpent || 0) - effects.energy);
  Object.entries(effects.inventoryBefore || {}).forEach(([key, amount]) => {
    state.inventory[key] = amount;
  });
  state.hunger = clamp(state.hunger - (effects.stats.hunger || 0));
  state.happiness = clamp(state.happiness - (effects.stats.happiness || 0));
  state.cleanliness = clamp(state.cleanliness - (effects.stats.cleanliness || 0));
  state.hydration = clamp(state.hydration - (effects.stats.hydration || 0));
  state.healthRisk = clamp(state.healthRisk - (effects.stats.health || 0) - (effects.stats.healthRisk || 0));
  state.accidentRisk = clamp(state.accidentRisk - (effects.stats.accident || 0));
  state.stress = clamp(state.stress - (effects.stats.stress || 0));
  state.boredom = clamp(state.boredom - (effects.stats.boredom || 0));
  state.bonding = clamp(state.bonding - (effects.stats.bonding || 0));
  state.suppliesWear = clamp(state.suppliesWear - (effects.stats.supplies || 0));
  state.weight = clamp(state.weight - (effects.stats.weight || 0), 25, 95);
  state.activity = clamp(state.activity - (effects.stats.activity || 0));
  state.sleepDebt = clamp(state.sleepDebt - (effects.stats.sleepDebt || 0));
  state.poopLevel = clamp(state.poopLevel - (effects.stats.poop || 0));
  state.discipline = clamp(state.discipline - (effects.stats.discipline || 0));
  state.snackMeals = Math.max(0, state.snackMeals - effects.snackMeals);
  state.totalMeals = Math.max(0, state.totalMeals - effects.totalMeals);
  effects.mistakes.forEach((key) => unrecordMistake(key, 2));
  Object.entries(effects.habitGains || {}).forEach(([key, amount]) => {
    state.habits[key] = Math.max(0, (state.habits[key] || 0) - amount);
  });
  Object.entries(effects.flagsBefore).forEach(([key, value]) => {
    state.flags[key] = value;
  });
  Object.entries(effects.durablesBefore).forEach(([key, value]) => {
    if (value) state.durables[key] = value;
    else delete state.durables[key];
  });
  state.playCount = Math.max(0, state.playCount - effects.playCount);
  state.xp = Math.max(0, state.xp - effects.xp);
  delete state.actionPlans[action];
}

function confirmActionPlan() {
  const draft = state.actionDraft;
  if (!draft || !draft.selected.length) {
    showBanner("請至少選擇一個照顧項目。可以多選，例如乾糧 + 濕糧混合餵養。");
    return;
  }
  if (miniProgress() < 100) {
    showBanner("先完成上面的照顧動作，再確認。");
    return;
  }
  if (state.actionPlans[draft.action]) revertActionPlan(draft.action);
  draft.intensity = "normal";
  const built = buildActionPlan(draft.action, draft.selected, draft.intensity);
  if (built.error) {
    showBanner(built.error);
    return;
  }
  const { effects } = built;
  if (effects.time > state.timeLeft) {
    showBanner(`今年可安排時間不足：還剩 ${state.timeLeft}h，這些選項需要 ${effects.time}h。請取消部分選項。`);
    return;
  }
  applyActionPlanEffects(draft.action, draft.selected, draft.intensity, effects);
  state.actionPlans[draft.action] = {
    selected: [...draft.selected],
    intensity: draft.intensity,
    effects,
  };
  state.completedActions[draft.action] = true;
  state.currentAction = null;
  state.actionDraft = null;
  state.lastCareAt = Date.now();
  $("#cat-line").textContent = shortCareResult(draft.action, effects);
  checkAchievements();
  saveGame();
  render();
  animateCat(draft.action === "vet" || draft.action === "lifestyle" ? "startled" : "playing");
}

function buyShopItem(id) {
  const item = shopCatalog.find((entry) => entry.id === id);
  if (!item) return;
  spend(item.price, `商店購買：${item.label}`, Boolean(item.medical), { category: item.category === "醫療" ? "醫療" : item.category });
  useTimeEnergy(item.time || 0, item.energy || 0, `商店購買：${item.label}`);
  addItems(item.add);
  if (item.flag) state.flags[item.flag] = true;
  if (durableItemRules[id]) installDurable(id);
  if (id === "vaccine") {
    state.medical.vaccinated = true;
    state.medical.vaccineAt = state.month;
    state.lastVetAt = state.month;
  }
  if (id === "neuter") {
    state.flags.neutered = true;
    state.medical.neuteredAt = state.month;
    state.lastVetAt = state.month;
  }
  state.happiness = clamp(state.happiness + (item.happiness || 0));
  state.healthRisk = clamp(state.healthRisk + (item.health || 0));
  state.accidentRisk = clamp(state.accidentRisk + (item.accident || 0));
  state.stress = clamp(state.stress + (item.stress || 0));
  state.boredom = clamp(state.boredom + (item.boredom || 0));
  state.bonding = clamp(state.bonding + (item.bonding || 0));
  state.lastCareAt = Date.now();
  addLog(`放入背包/生效：${item.label}`);
  $("#cat-line").textContent = `${item.label} 已購買。${item.detail}`;
  if (state.currentEvent?.blocking && specialEventSatisfied(state.currentEvent)) {
    state.currentEvent = null;
    queueBlockingEvent();
  }
  saveGame();
  render();
}

function shopItem(id) {
  return shopCatalog.find((item) => item.id === id);
}

function durableEvent(id, initial = false) {
  const item = shopItem(id);
  const rule = durableItemRules[id];
  return {
    id: `${initial ? "setup" : "replace"}-${id}`,
    title: initial ? `必須準備：${rule.name}` : `必須更換：${rule.name}`,
    text: initial
      ? `${rule.name} 是開始照顧前的基本安全/生活條件。你可以暫時不處理，但風險會留到後面。`
      : `${rule.reason} 這是強提醒；你可以延後，但後續事故和疾病機率會上升。`,
    blocking: true,
    requireDurable: id,
    choices: [
      {
        label: initial ? `購買並安裝${rule.name}` : `立即更換${rule.name}`,
        money: item.price,
        time: item.time,
        energy: item.energy,
        add: item.add,
        flag: item.flag,
        install: id,
        accident: item.accident || 0,
        happiness: item.happiness || 0,
        boredom: item.boredom || 0,
        line: `${rule.name}已處理。照顧不是一次買齊，是壽命到了就要再處理。`,
      },
      {
        label: `暫時不處理${rule.name}`,
        money: 0,
        time: 0,
        energy: 0,
        accident: rule.essential ? 18 : 8,
        stress: rule.essential ? 8 : 3,
        deferKey: id,
        mistake: id === "windowNet" ? "unsafeHome" : "supplies",
        line: `${rule.name}被你延後了。遊戲會讓你繼續，但風險會留在後面，不是消失。`,
      },
    ],
  };
}

function vaccineEvent() {
  const item = shopItem("vaccine");
  return {
    id: "mandatory-vaccine",
    title: "必須處理：初次疫苗",
    text: "幼貓期到疫苗時間了。這不是普通健康檢查，而是強提醒；你可以延後，但傳染病風險會保留。",
    blocking: true,
    requireMedical: "vaccinated",
    choices: [
      {
        label: "帶去打初次疫苗",
        money: item.price,
        time: item.time,
        energy: item.energy,
        health: item.health,
        medical: true,
        vaccinate: true,
        line: "疫苗完成。牠不會因此開心，但風險下降了。",
      },
      {
        label: "暫時不打疫苗",
        money: 0,
        time: 0,
        energy: 0,
        health: 18,
        deferKey: "vaccine",
        mistake: "missedVet",
        line: "你延後了疫苗。不是立即死亡，但幼貓期傳染病風險會留在之後。",
      },
    ],
  };
}

function neuterEvent(overdue = false) {
  const item = shopItem("neuter");
  return {
    id: overdue ? "neuter-health-risk" : "mandatory-neuter",
    title: overdue ? "必須處理：未絕育引發健康風險" : "必須安排：絕育手術",
    text: overdue
      ? "絕育一直沒有安排，牠開始出現壓力、亂叫或生殖系統風險。你可以繼續拖，但代價會變成清潔、攻擊或疾病。"
      : "到了適合絕育的階段。這是特殊醫療強提醒，不應藏在普通檢查裡，也不能靠玩家猜時間。",
    blocking: true,
    requireMedical: "neutered",
    choices: [
      {
        label: overdue ? "醫治並安排絕育" : "安排絕育手術",
        money: item.price + (overdue ? 1600 : 0),
        time: item.time + (overdue ? 2 : 0),
        energy: item.energy + (overdue ? 8 : 0),
        health: overdue ? -26 : item.health,
        stress: item.stress,
        medical: true,
        neuter: true,
        flag: "neutered",
        line: overdue ? "你付出了更多成本，因為拖延本身也會變成帳單。" : "手術安排完成，接下來仍要觀察恢復。",
      },
      {
        label: "暫時不絕育",
        money: 0,
        time: 0,
        energy: 0,
        stress: state.sex === "male" ? 14 : 8,
        health: state.sex === "female" ? 10 : 4,
        deferKey: "neuter",
        mistake: "missedVet",
        line: state.sex === "male" ? "男貓未絕育，之後發情可能亂尿、攻擊、需要深層清潔。" : "女貓未絕育，反覆發情後會增加子宮蓄膿等嚴重疾病風險。",
      },
    ],
  };
}

function illnessEvent() {
  return {
    id: "mandatory-illness",
    title: "必須處理：生病",
    text: state.medical.sicknessReason || "牠出現生病狀態。生病不是日常需求，必須先醫治，不能繼續普通餵食和陪玩當作沒事。",
    blocking: true,
    requireHealthy: true,
    choices: [
      {
        label: "立即看獸醫並治療",
        money: 2600,
        time: 5,
        energy: 18,
        health: -42,
        stress: 4,
        medical: true,
        cure: true,
        line: "治療完成。你花掉的是錢和時間，換回的是牠不用硬撐。",
      },
    ],
  };
}

function nextBlockingEvent() {
  if (state.medical.sick) return illnessEvent();
  if (!hasValidDurable("windowNet") && shouldRemind("windowNet", 3)) return durableEvent("windowNet", !state.durables.windowNet);
  if (!hasValidDurable("litterBox") && shouldRemind("litterBox", 3)) return durableEvent("litterBox", !state.durables.litterBox);
  if (!hasValidDurable("foodBowl") && shouldRemind("foodBowl", 3)) return durableEvent("foodBowl", !state.durables.foodBowl);
  if (state.month <= 15 && !state.medical.vaccinated && shouldRemind("vaccine", 2)) return vaccineEvent();
  if (state.month >= 8 && !state.flags.neutered && shouldRemind("neuter", 2)) return neuterEvent(true);
  if (state.month >= 6 && !state.flags.neutered && shouldRemind("neuter", 2)) return neuterEvent(false);
  if (state.healthRisk >= 75) {
    state.medical.sick = true;
    state.medical.sicknessReason = "健康風險已經累積到危險水平，牠需要醫治。";
    return illnessEvent();
  }
  const expired = Object.keys(durableItemRules).find((id) => state.durables[id] && durableMonthsLeft(id) <= 0 && shouldRemind(id, 3));
  if (expired) return durableEvent(expired, false);
  return null;
}

function shouldRemind(key, interval = 3) {
  const last = state.deferredEvents?.[key];
  return !last || state.month - last >= interval;
}

function specialEventSatisfied(event) {
  if (!event?.blocking) return false;
  if (event.requireDurable) return hasValidDurable(event.requireDurable);
  if (event.requireMedical === "vaccinated") return state.medical.vaccinated;
  if (event.requireMedical === "neutered") return Boolean(state.flags.neutered);
  if (event.requireHealthy) return !state.medical.sick && state.healthRisk < 75;
  return false;
}

function queueBlockingEvent() {
  const next = nextBlockingEvent();
  if (next) {
    state.currentEvent = next;
    state.currentAction = null;
    $("#cat-line").textContent = next.text;
    return true;
  }
  return false;
}

function resolveActionChoice(index) {
  const action = state.currentAction;
  const choice = actionChoices[action]?.[index];
  if (!action || !choice) return;

  if (choice.consumeFood && !consumeAnyFood()) {
    showBanner("背包沒有食物，請先購買乾糧、凍乾、濕糧或鮮食。");
    return;
  }
  if (choice.use) {
    const canUseAfterPurchase = Object.entries(choice.use).every(([key, amount]) => {
      const available = (state.inventory[key] || 0) + ((choice.add && choice.add[key]) || 0);
      return available >= amount;
    });
    if (!canUseAfterPurchase) {
      const missing = Object.entries(choice.use)
        .filter(([key, amount]) => {
          const available = (state.inventory[key] || 0) + ((choice.add && choice.add[key]) || 0);
          return available < amount;
        })
        .map(([key]) => itemNames[key])
        .join("、");
      showBanner(`背包缺少：${missing}。`);
      return;
    }
  }

  state.completedActions[action] = true;
  spend(choice.money || 0, choice.label, action === "vet", { category: expenseCategory(choice.label, action === "vet"), billItems: choice.billItems });
  useTimeEnergy(choice.time || 0, choice.energy || 0, choice.label);
  addItems(choice.add);
  useItems(choice.use);

  state.hunger = clamp(state.hunger + (choice.hunger || 0));
  state.happiness = clamp(state.happiness + (choice.happiness || 0));
  state.cleanliness = clamp(state.cleanliness + (choice.cleanliness || 0));
  state.hydration = clamp(state.hydration + (choice.hydration || 0));
  state.healthRisk = clamp(state.healthRisk + (choice.health || 0));
  state.accidentRisk = clamp(state.accidentRisk + (choice.accident || 0));
  state.stress = clamp(state.stress + (choice.stress || 0));
  state.boredom = clamp(state.boredom + (choice.boredom || 0));
  state.bonding = clamp(state.bonding + (choice.bonding || 0));
  state.suppliesWear = clamp(state.suppliesWear + (choice.supplies || 0));
  state.weight = clamp(state.weight + (choice.weight || 0), 25, 95);
  if (choice.install) installDurable(choice.install);
  if (choice.flag) state.flags[choice.flag] = true;
  if (action === "enrichment") {
    state.playCount += 1;
    animateCat("playing");
  }
  state.xp += currentNeeds().required.includes(action) ? 8 : 4;
  state.lastCareAt = Date.now();
  state.currentAction = null;
  $("#cat-line").textContent = choice.line || pick("good");
  checkAchievements();
  saveGame();
  render();
}

function checkAchievements() {
  const unlocked = new Set(state.achievements);
  achievementRules.forEach((rule) => {
    if (!unlocked.has(rule.id) && rule.unlocked(state)) {
      unlocked.add(rule.id);
      addLog(`親密成就：${rule.title}`);
      $("#cat-line").textContent = rule.text;
      animateCat("playing");
    }
  });
  state.achievements = Array.from(unlocked);
}

function activeChronicConditions() {
  return Object.values(state.medical.chronic || {});
}

function addChronicCondition(chronic) {
  if (!chronic?.id) return;
  state.medical.chronic[chronic.id] = {
    id: chronic.id,
    name: chronic.name,
    monthlyCost: chronic.monthlyCost || 0,
    healthDrift: chronic.healthDrift || 0,
    startedAt: state.month,
  };
}

function applyChronicCosts() {
  activeChronicConditions().forEach((condition) => {
    if (condition.monthlyCost) spend(condition.monthlyCost * 12, `年度長期治療：${condition.name}`, true, {
      category: "醫療",
      billItems: [
        { label: "處方/藥物", amount: Math.round(condition.monthlyCost * 8) },
        { label: "覆診/檢查", amount: Math.round(condition.monthlyCost * 4) },
      ],
    });
    if (condition.healthDrift) state.healthRisk = clamp(state.healthRisk + condition.healthDrift * 2);
    addLog(`${condition.name}：今年需要持續管理。`);
  });
}

function snackRatio() {
  if (!state.totalMeals) return 0;
  return state.snackMeals / state.totalMeals;
}

function buriedRiskPressure() {
  return Object.values(state.buriedRisks || {}).reduce((total, value) => total + value, 0) * 2.5;
}

function careRiskScore() {
  const needs = currentNeeds();
  const missing = needs.required.filter((key) => !state.completedActions[key]).length;
  const goodCareBonus =
    state.healthRisk < 30 &&
    state.stress < 35 &&
    state.boredom < 40 &&
    state.cleanliness > 72 &&
    state.hydration > 70 &&
    state.neglectTurns === 0
      ? 0.45
      : 1;
  const score =
    state.healthRisk * 0.5 +
    state.stress * 0.22 +
    state.boredom * 0.18 +
    (100 - state.cleanliness) * 0.16 +
    (100 - state.hydration) * 0.18 +
    state.neglectTurns * 12 +
    missing * 16 +
    activeChronicConditions().length * 10 +
    buriedRiskPressure();
  return clamp(score * goodCareBonus, 0, 160);
}

function diseaseChance(event) {
  let chance = event.base + careRiskScore() * event.riskFactor;
  if (event.months?.includes(monthInYear())) chance += 0.035;
  if (state.neglectTurns === 0 && state.healthRisk < 25 && state.cleanliness > 80 && state.hydration > 78) chance *= 0.35;
  return clamp(chance, 0.004, event.maxChance || 0.25);
}

function pickDiseaseEvent() {
  const candidates = diseaseEvents.filter((event) => {
    if (event.once && state.medical.chronic?.[event.once]) return false;
    return !event.condition || event.condition(state);
  });
  const hits = candidates.filter((event) => Math.random() < diseaseChance(event));
  if (!hits.length) return null;
  hits.sort((a, b) => diseaseChance(b) - diseaseChance(a));
  return hits[0];
}

function evolutionResult() {
  const bondingBand = state.bonding < 45 ? "low" : state.bonding < 70 ? "mid" : "high";
  const activityBand = state.activity < 38 ? "lazy" : state.activity < 66 ? "balanced" : "active";
  const key = `${bondingBand}-${activityBand}`;
  const meta = evolutionVisualMeta[key] || evolutionVisualMeta["mid-balanced"];
  const mistakeLoad = Object.values(state.careMistakes || {}).reduce((sum, item) => sum + item.severity, 0);
  const modifier = mistakeLoad > 18 ? "照顧錯誤偏多，最終分支會帶有更高病痛和疏離陰影。" : "照顧錯誤可控，牠的成長主要由陪伴和活動決定。";
  return { ...meta, key, modifier, bondingBand, activityBand };
}

function annualIssueSnapshot() {
  return Object.fromEntries(
    Object.entries(state.careMistakes || {}).map(([key, record]) => [key, { count: record.count, severity: record.severity }]),
  );
}

function generateAnnualReview() {
  const previous = state.annualReviews[state.annualReviews.length - 1];
  const previousSnapshot = previous?.snapshot || {};
  const issues = Object.entries(state.careMistakes || {})
    .map(([key, record]) => {
      const old = previousSnapshot[key] || { count: 0, severity: 0 };
      return {
        key,
        title: mistakeText[key] || key,
        count: record.count - old.count,
        severity: record.severity - old.severity,
        totalSeverity: record.severity,
        repeated: old.count > 0 && record.count > old.count,
        latest: record.details?.[0] || "",
      };
    })
    .filter((item) => item.count > 0 || item.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  issues.forEach((issue) => {
    if (issue.repeated || issue.severity >= 3) {
      state.buriedRisks[issue.key] = (state.buriedRisks[issue.key] || 0) + Math.max(1, Math.ceil(issue.severity / 3));
    }
  });

  const year = Math.max(1, Math.ceil((state.month - 1) / 12));
  const yearBills = state.expenses.history.filter((bill) => bill.month <= state.month && bill.month > (previous?.month || state.startAgeMonths || 0));
  const biggestYearBill = yearBills.sort((a, b) => b.amount - a.amount)[0] || null;
  const review = {
    id: `year-${year}`,
    year,
    month: state.month - 1,
    age: `${year}歲`,
    issues,
    buriedTotal: Object.values(state.buriedRisks || {}).reduce((sum, value) => sum + value, 0),
    financial: {
      yearSpend: state.expenses.year || 0,
      byCategory: { ...(state.expenses.byCategory || {}) },
      medicalSpend: state.expenses.byCategory?.["醫療"] || 0,
      biggestBill: biggestYearBill,
      lastBill: state.expenses.lastBill,
      fundLeft: state.fund,
    },
    stats: {
      healthRisk: Math.round(state.healthRisk),
      stress: Math.round(state.stress),
      bonding: Math.round(state.bonding),
      activity: Math.round(state.activity),
      cleanliness: Math.round(state.cleanliness),
      sleepDebt: Math.round(state.sleepDebt),
      poopLevel: Math.round(state.poopLevel),
      snackRatio: Math.round(snackRatio() * 100),
    },
    evolution: evolutionResult(),
    snapshot: annualIssueSnapshot(),
  };
  state.annualReviews.push(review);
  state.currentReview = review;
  state.reviewExpanded = false;
  state.expenses.year = 0;
  state.expenses.byCategory = {};
  addLog(`第${year}年回顧已生成：${issues.length ? "有風險被記錄" : "照顧穩定"}`);
}

function maybeQueueAnnualReview() {
  if (state.month <= 1 || (state.month - 1) % 12 !== 0) return false;
  const year = Math.ceil((state.month - 1) / 12);
  if (state.annualReviews.some((review) => review.year === year)) return false;
  generateAnnualReview();
  return true;
}

function closeAnnualReview() {
  state.currentReview = null;
  state.reviewExpanded = false;
  saveGame();
  render();
}

function monthPressure() {
  const needs = currentNeeds();
  const missing = needs.required.filter((key) => !state.completedActions[key]);
  const st = stage();
  const feedback = [];

  for (const key of missing) {
    if (key === "nutrition") {
      state.hunger = clamp(state.hunger - 22);
      state.healthRisk = clamp(state.healthRisk + 12);
      recordMistake("missedFood", "過去一年飲食管理不足，牠開始餓、亂吃或腸胃不穩。", 2);
      feedback.push("過去一年飲食管理不足，牠開始餓、亂吃或腸胃不穩。");
    }
    if (key === "hygiene") {
      state.cleanliness = clamp(state.cleanliness - 22);
      state.poopLevel = clamp(state.poopLevel + 24);
      state.healthRisk = clamp(state.healthRisk + 10);
      state.stress = clamp(state.stress + 10);
      recordMistake("dirtyLitter", "過去一年沒有好好清潔，砂盆和環境開始有味道。", 2);
      feedback.push("過去一年沒有好好清潔，牠和家裡都開始有味道。");
    }
    if (key === "enrichment") {
      state.boredom = clamp(state.boredom + 24 * profile().socialNeed);
      state.stress = clamp(state.stress + 12 * profile().stressGain);
      state.happiness = clamp(state.happiness - 16);
      state.activity = clamp(state.activity - 8);
      recordMistake("loneliness", "過去一年陪伴不足，牠開始悶、焦躁或拆家。", 2);
      feedback.push("過去一年陪伴不足，牠開始悶、焦躁或拆家。");
    }
    if (key === "training") {
      state.discipline = clamp(state.discipline - 12);
      state.boredom = clamp(state.boredom + 10);
      state.stress = clamp(state.stress + 8);
      recordMistake("punishment", "行為問題沒有被正確引導，抓咬和怕人的風險留下來。", 1);
      feedback.push("過去一年沒有引導行為，抓沙發、咬人或亂跳的問題更難處理。");
    }
    if (key === "sleep") {
      state.sleepDebt = clamp(state.sleepDebt + 22);
      state.stress = clamp(state.stress + 10);
      recordMistake("sleep", "過去一年沒有處理夜間作息，牠半夜跑酷或叫喚，主人休息被打斷。", 2);
      feedback.push("過去一年夜間作息沒有處理，問題不是牠不能睡，而是牠半夜消耗你。");
    }
    if (key === "vet") {
      state.healthRisk = clamp(state.healthRisk + (st.id === "senior" ? 24 : 15));
      recordMistake("missedVet", "健康檢查被拖延，小病可能被拖成大病。", 2);
      feedback.push("過去一年沒有做健康檢查，小病可能被拖成大問題。");
    }
    if (key === "supplies") {
      state.suppliesWear = clamp(state.suppliesWear + 28);
      state.cleanliness = clamp(state.cleanliness - 8);
      recordMistake("supplies", "耗材和玩具沒有補，清潔與壓力問題開始累積。", 1);
      feedback.push("過去一年沒有補用品，貓砂、濾芯或玩具開始不夠用。");
    }
    if (key === "lifestyle") {
      state.accidentRisk = clamp(state.accidentRisk + 22);
      recordMistake("unsafeHome", "安全/外出安排不足，事故風險上升。", 2);
      feedback.push("過去一年沒有處理外出/安全安排，意外風險上升。");
    }
  }

  state.suppliesWear = clamp(state.suppliesWear + 10);
  applyAutonomousDurableWear();
  applyUnneuteredRisks();
  state.poopLevel = clamp(state.poopLevel + 14);
  state.sleepDebt = clamp(state.sleepDebt + 6);
  state.activity = clamp(state.activity - 2);
  state.accidentRisk = clamp(state.accidentRisk + (!state.flags.windowNet ? 6 : 1));
  state.healthRisk = clamp(state.healthRisk + ageRisk());
  state.healthRisk = clamp(state.healthRisk + buriedRiskPressure() + (state.poopLevel > 72 ? 6 : 0) + (state.sleepDebt > 72 ? 7 : 0));
  applyChronicCosts();
  state.boredom = clamp(state.boredom + 6 * profile().boredomGain);
  state.stress = clamp(state.stress + Math.max(0, state.boredom - 65) / 4);
  if (state.weight > 70 || snackRatio() > 0.35) recordMistake("obesity", "零食或體重管理失衡，未來胰臟炎、糖尿病或關節問題風險提高。", 1);
  state.energy = clamp(state.energy + 18, 0, 100);
  state.timeLeft = YEAR_TIME_BUDGET;

  if (missing.length >= Math.ceil(needs.required.length / 2)) {
    state.neglectTurns += 1;
    addLog("這一年照顧不足，忽略紀錄 +1。");
    $("#cat-line").textContent = pick("bad");
  }
  feedback.slice(0, 3).forEach(addLog);
}

function yearPressure() {
  monthPressure();
  state.suppliesWear = clamp(state.suppliesWear + 18);
  state.poopLevel = clamp(state.poopLevel + 18);
  state.sleepDebt = clamp(state.sleepDebt + 8);
  state.boredom = clamp(state.boredom + 10 * profile().boredomGain);
  state.accidentRisk = clamp(state.accidentRisk + (!state.flags.windowNet ? 18 : 4));
  state.healthRisk = clamp(state.healthRisk + ageRisk() * 2 + (state.hydration < 60 ? 8 : 0));
  if (!state.completedActions.vet) {
    state.healthRisk = clamp(state.healthRisk + 10);
    recordMistake("missedVet", "這一年沒有健康檢查，小病被拖延的風險升高。", 2);
  }
  if (state.completedActions.enrichment && state.completedActions.nutrition && state.completedActions.hygiene) {
    state.stress = clamp(state.stress - 4);
    state.bonding = clamp(state.bonding + 2);
  }
}

function ageRisk() {
  const st = stage().id;
  return { kitten: 2, teen: 3, adult: 4, mature: 7, senior: 12 }[st];
}

function pickRandomEvent() {
  const fatal = pickDeferredFatalEvent();
  if (fatal) return fatal;
  const disease = pickDiseaseEvent();
  if (disease) return disease;
  const candidates = randomDrops.filter((event) => event.condition(state));
  const pressure = Math.max(state.healthRisk, state.accidentRisk, state.boredom, state.suppliesWear, state.stress);
  const baseChance = 0.12 + pressure / 220;
  if (!candidates.length || Math.random() > baseChance) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickDeferredFatalEvent() {
  if (!hasValidDurable("windowNet") && state.month >= 5 && Math.random() < 0.08 + state.accidentRisk / 600) {
    return {
      id: "fatal-window-fall",
      title: "墜窗事故",
      text: "之前你選擇暫時不處理窗網。這一次牠追逐窗外影子時跌落，遊戲結束。",
      choices: [
        { label: "查看結局", death: "未安裝窗網導致墜窗死亡。這不是恐嚇，是很多真實意外的結構。" },
      ],
    };
  }
  return null;
}

function applyUnneuteredRisks() {
  if (state.flags.neutered || state.month < 6) return;
  if (state.month % 2 !== 0) return;
  state.heatCycles += 1;
  if (state.sex === "male") {
    state.stress = clamp(state.stress + 10);
    state.cleanliness = clamp(state.cleanliness - 12);
    state.poopLevel = clamp(state.poopLevel + 12);
    state.discipline = clamp(state.discipline - 8);
    recordMistake("missedVet", "男貓未絕育，發情造成亂尿、攻擊或夜叫，深層清潔需求上升。", 1);
    addLog("未絕育男貓發情：亂尿/攻擊風險上升，清潔壓力增加。");
  } else {
    state.stress = clamp(state.stress + 8);
    state.healthRisk = clamp(state.healthRisk + 7);
    recordMistake("missedVet", "女貓反覆發情，子宮蓄膿等生殖系統疾病風險上升。", 1);
    addLog("未絕育女貓反覆發情：生殖系統疾病風險上升。");
    if (state.heatCycles >= 3 && Math.random() < 0.18) {
      state.medical.sick = true;
      state.medical.sicknessReason = "反覆未絕育發情後，牠出現疑似子宮蓄膿，需要立即醫治。";
    }
  }
}

function advanceMonth() {
  if (state.currentReview) {
    showBanner("先閱讀或關閉年度回顧。回顧裡被重複提醒的問題會變成未來風險。");
    return;
  }
  if (state.currentEvent) {
    showBanner("先回應目前的強提醒；可以處理，也可以延後。");
    scrollChoicePanelIntoView();
    return;
  }
  if (state.death) return finishGame();
  if (state.month > lifeEndMonth()) return finishGame();
  if (queueBlockingEvent()) {
    saveGame();
    render();
    scrollChoicePanelIntoView();
    return;
  }
  const missingCritical = ["nutrition", "hygiene"].filter((key) => !state.completedActions[key]);
  if (missingCritical.length) {
    const names = missingCritical.map((key) => actionMeta[key].title).join("、");
    showBanner(`${names}是生存底線。這一年必須先安排，否則不能進入下一年。`);
    return;
  }

  yearPressure();
  if (queueBlockingEvent()) {
    saveGame();
    render();
    scrollChoicePanelIntoView();
    return;
  }
  const event = pickRandomEvent();
  if (event) {
    state.currentEvent = event;
    saveGame();
    render();
    scrollChoicePanelIntoView();
    return;
  }

  closeMonth();
}

function closeMonth() {
  const oldMonth = state.month;
  state.month += MONTHS_PER_TURN;
  state.turnInDay += 1;
  if (state.turnInDay > YEARS_PER_DAY) {
    state.turnInDay = 1;
    state.dayBlock += 1;
  }
  state.completedActions = {};
  state.actionPlans = {};
  state.actionDraft = null;
  state.timeSpent = 0;
  state.effortSpent = 0;
  state.lastCareAt = Date.now();

  if (state.healthRisk >= 98 || state.stress >= 98 || state.hunger <= 0) {
    const topRisk = Object.entries(state.buriedRisks || {}).sort(([, a], [, b]) => b - a)[0];
    const buriedText = topRisk ? `年度回顧中反覆未改善的「${mistakeText[topRisk[0]] || topRisk[0]}」也成為原因之一。` : "";
    state.death = {
      reason: `長期忽略、壓力或疾病風險累積，牠在這一年內病逝了。${buriedText}`,
      month: state.month,
    };
    saveGame();
    finishGame();
    return;
  }

  maybeQueueAnnualReview();
  queueBlockingEvent();

  if (state.month > lifeEndMonth()) {
    saveGame();
    finishGame();
    return;
  }

  if (!state.currentEvent) $("#cat-line").textContent = pick("idle");
  if (!state.evolutionSeen && oldMonth < 36 && state.month >= 36) {
    const evolution = evolutionResult();
    state.evolutionSeen = true;
    state.evolutionModal = evolution;
    $("#cat-line").textContent = `${state.catName} 長大了，成為「${evolution.title}」。`;
    addLog(`成年進化：${evolution.title}`);
  }
  saveGame();
  render();
}

function resolveChoice(index) {
  const event = state.currentEvent;
  if (!event) return;
  const choice = event.choices[index];
  if (!choice) return;

  spend(choice.money || 0, event.title, Boolean(choice.medical) || event.id === "vomit" || event.id === "senior", {
    category: (Boolean(choice.medical) || event.id === "vomit" || event.id === "senior") ? "醫療" : expenseCategory(event.title),
    billItems: choice.billItems,
    preventable: Boolean(choice.medical) && (state.neglectTurns > 0 || state.healthRisk > 55 || state.cleanliness < 55 || state.hydration < 58 || state.stress > 58),
  });
  useTimeEnergy(choice.time || 0, choice.energy || 0, event.title);
  addItems(choice.add);
  useItems(choice.use);
  state.healthRisk = clamp(state.healthRisk + (choice.health || 0));
  state.accidentRisk = clamp(state.accidentRisk + (choice.accident || 0));
  state.stress = clamp(state.stress + (choice.stress || 0));
  state.boredom = clamp(state.boredom + (choice.boredom || 0));
  state.happiness = clamp(state.happiness + (choice.happiness || 0));
  state.cleanliness = clamp(state.cleanliness + (choice.cleanliness || 0));
  state.bonding = clamp(state.bonding + (choice.bonding || 0));
  state.suppliesWear = clamp(state.suppliesWear + (choice.supplies || 0));
  if (choice.install) installDurable(choice.install);
  if (choice.vaccinate) {
    state.medical.vaccinated = true;
    state.medical.vaccineAt = state.month;
    state.lastVetAt = state.month;
  }
  if (choice.neuter) {
    state.flags.neutered = true;
    state.medical.neuteredAt = state.month;
    state.lastVetAt = state.month;
  }
  if (choice.cure) {
    state.medical.sick = false;
    state.medical.sicknessReason = "";
  }
  if (choice.chronic) addChronicCondition(choice.chronic);
  if (choice.flag) state.flags[choice.flag] = true;
  if (choice.deferKey) state.deferredEvents[choice.deferKey] = state.month;
  if (choice.mistake) recordMistake(choice.mistake, `${event.title}：${choice.label}`, 2);
  if ((choice.health || 0) >= 15) recordMistake("illnessDelay", `${event.title}選擇「${choice.label}」讓健康風險上升。`, 2);
  if ((choice.accident || 0) >= 15) recordMistake("unsafeHome", `${event.title}選擇「${choice.label}」讓意外風險上升。`, 2);
  if ((choice.stress || 0) >= 15 || (choice.bonding || 0) <= -8) recordMistake("punishment", `${event.title}選擇「${choice.label}」傷害信任或增加壓力。`, 1);
  if ((choice.money || 0) >= 2500 || (choice.health || 0) >= 15 || (choice.accident || 0) >= 15) state.majorDecisions += 1;
  if (choice.death) {
    state.death = { reason: choice.death, month: state.month };
    state.currentEvent = null;
    saveGame();
    finishGame();
    return;
  }
  addLog(`${event.title}：${choice.label}`);
  $("#cat-line").textContent = choice.line;
  state.currentEvent = null;
  checkAchievements();
  if (choice.deferKey) {
    saveGame();
    render();
    return;
  }
  if (event.blocking) {
    queueBlockingEvent();
    saveGame();
    render();
    return;
  }
  closeMonth();
}

function completeToday() {
  const required = currentNeeds().required;
  const done = required.filter((key) => state.completedActions[key]).length;
  const total = required.length;
  showBanner(`本次進度第 ${playYearIndex()}/${playableYears()} 年，已完成 ${done}/${total} 項核心照顧。特殊情況和大病由系統強制提醒，年度回顧會記錄沒改善的問題。`);
}

function checkAbandonment() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.death || saved.month > (saved.lifeEndMonth || defaultLifeEndMonth(saved.startAgeMonths || 0))) return false;
    const hours = (Date.now() - saved.lastCareAt) / 36e5;
    if (hours < ABANDON_HOURS) return false;
    state = saved;
    state.death = {
      reason: `你離開了 ${Math.floor(hours)} 小時，超過照顧期限。牠在無人照顧的狀態下病逝了。`,
      month: state.month,
    };
    saveGame();
    finishGame();
    return true;
  } catch {
    return false;
  }
}

function applyOfflineDrift() {
  if (!state.lastCareAt || state.death) return;
  const hours = (Date.now() - state.lastCareAt) / 36e5;
  if (hours < 3) return;
  const blocks = Math.min(10, Math.floor(hours / 6));
  state.hunger = clamp(state.hunger - blocks * 6);
  state.happiness = clamp(state.happiness - blocks * 4);
  state.cleanliness = clamp(state.cleanliness - blocks * 5);
  state.poopLevel = clamp(state.poopLevel + blocks * 7);
  state.sleepDebt = clamp(state.sleepDebt + blocks * 4);
  state.stress = clamp(state.stress + blocks * 4);
  state.healthRisk = clamp(state.healthRisk + blocks * 3);
  recordMistake("missedFood", `你離開了約${Math.floor(hours)}小時，牠的飽肚、清潔和壓力在真實時間中變差。`, Math.max(1, Math.floor(blocks / 2)));
  addLog(`離線時間流動：約${Math.floor(hours)}小時沒有照顧，狀態已下降。`);
  state.lastCareAt = Date.now();
}

function showBanner(text) {
  const banner = $("#event-banner");
  banner.textContent = text;
  banner.classList.remove("hidden");
  window.setTimeout(() => banner.classList.add("hidden"), 4500);
}

function setActionButtonLabels() {
  $$(".action-button").forEach((button) => {
    const key = button.dataset.action;
    button.querySelector("span").textContent = actionMeta[key].icon;
    button.querySelector("strong").textContent = actionMeta[key].title;
  });
}

function renderScene() {
  const scene = state.currentScene || "living";
  const meta = sceneMeta[scene] || sceneMeta.living;
  $(".room").dataset.scene = scene;
  $("#scene-label").textContent = sceneTitle(scene);
  $$(".scene-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.scene === scene);
  });
  $("#shop-panel").classList.toggle("hidden", scene !== "shop");
}

function renderShop() {
  const grouped = shopCatalog.reduce((groups, item) => {
    groups[item.category] = groups[item.category] || [];
    groups[item.category].push(item);
    return groups;
  }, {});
  $("#shop-items").innerHTML = Object.entries(grouped)
    .map(([category, items]) => `
      <section class="shop-category">
        <h4>${currentLang === "en" ? ({ "食物": "Food", "用品": "Supplies", "玩具": "Toys", "安全": "Safety", "醫療": "Medical", "裝飾": "Decor" }[category] || category) : category}</h4>
        <div class="shop-grid">
          ${items
            .map((item) => `
              <button class="shop-item" type="button" data-shop-item="${item.id}">
                <strong>${shopLabel(item)}</strong>
                <span>${money.format(item.price)} · ${item.time || 0}h · ${energyText(item.energy || 0)}</span>
                <small>${shopDetail(item)}</small>
              </button>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");
  $$("[data-shop-item]").forEach((button) => {
    button.addEventListener("click", () => buyShopItem(button.dataset.shopItem));
  });
}

function renderActionMini(action) {
  const actions = $("#choice-actions");
  const meta = miniMeta(action);
  const progress = miniProgress();
  const ready = progress >= 100;
  const mini = document.createElement("div");
  mini.className = `mini-game ${ready ? "done" : ""} ${state.actionDraft?.selected?.length ? "" : "empty"}`;
  mini.innerHTML = `
    <div class="mini-copy">
      <strong>${state.actionDraft?.selected?.length ? meta.verb : currentLang === "en" ? "Choose one first" : "先選一項"}</strong>
      <span>${state.actionDraft?.selected?.length ? meta.hint : currentLang === "en" ? "Choose one or more care items above before doing the action." : "上面選一個或多個照顧項目，才可以動手做。"}</span>
    </div>
    <div class="mini-stage" aria-label="${meta.verb}">
      <button class="mini-token" type="button" draggable="true" ${state.actionDraft?.selected?.length ? "" : "disabled"}>${meta.item}</button>
      <div class="mini-target" data-mini-target>${meta.target}</div>
    </div>
    <div class="mini-meter" aria-hidden="true"><span style="width:${progress}%"></span></div>
    <button class="ghost-button mini-action" type="button" ${state.actionDraft?.selected?.length && !ready ? "" : "disabled"}>${ready ? currentLang === "en" ? "Action complete" : "動作完成" : meta.verb}</button>
  `;
  actions.appendChild(mini);
  const token = mini.querySelector(".mini-token");
  const target = mini.querySelector("[data-mini-target]");
  const actionButton = mini.querySelector(".mini-action");
  if (!state.actionDraft?.selected?.length || ready) return;
  token.addEventListener("click", () => advanceMiniProgress(34));
  actionButton.addEventListener("click", () => advanceMiniProgress(action === "enrichment" ? 25 : 34));
  token.addEventListener("dragstart", (event) => {
    event.dataTransfer?.setData("text/plain", action);
  });
  target.addEventListener("dragover", (event) => {
    event.preventDefault();
    target.classList.add("hover");
  });
  target.addEventListener("dragleave", () => target.classList.remove("hover"));
  target.addEventListener("drop", (event) => {
    event.preventDefault();
    target.classList.remove("hover");
    advanceMiniProgress(50);
  });
}

function renderChoicePanel() {
  const panel = $("#choice-panel");
  if (!state.currentReview && !state.currentEvent && !state.currentAction) {
    panel.classList.add("hidden");
    $("#next-day-button").disabled = false;
    $("#fast-forward-button").disabled = false;
    return;
  }

  if (state.currentReview) {
    const review = state.currentReview;
    panel.classList.remove("hidden");
    $("#choice-title").textContent = `第${review.year}年回顧：${state.catName} 的一年`;
    const headline = review.issues.length
      ? `這一年有 ${review.issues.length} 類照顧問題被記錄。重複被提醒但沒有改善的項目，已埋入未來疾病、事故或死亡風險。`
      : "這一年照顧穩定，沒有新的重大照顧錯誤被記錄。";
    $("#choice-text").textContent = headline;
    $("#choice-actions").innerHTML = "";
    const summary = document.createElement("div");
    summary.className = "plan-summary annual-summary";
    const issueLines = review.issues.slice(0, state.reviewExpanded ? 8 : 3).map((issue) => {
      const buried = state.buriedRisks[issue.key] ? `；埋雷 +${state.buriedRisks[issue.key]}` : "";
      return `<li><strong>${issue.title}</strong><span>本年 ${issue.count} 次，嚴重度 ${issue.severity}${issue.repeated ? "，去年已提醒仍未改善" : ""}${buried}</span><small>${issue.latest}</small></li>`;
    });
    const categories = Object.entries(review.financial?.byCategory || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, value]) => `${name}${money.format(value)}`)
      .join(" · ");
    const biggestBill = review.financial?.biggestBill;
    summary.innerHTML = `
      <strong>${review.age}狀態回顧</strong>
      <span>今年帳單 ${money.format(review.financial?.yearSpend || 0)}${categories ? `：${categories}` : ""}</span>
      <span>最大單次帳單 ${biggestBill ? `${money.format(biggestBill.amount)}（${biggestBill.reason}）` : "無"} · 剩餘基金 ${money.format(review.financial?.fundLeft || state.fund)}</span>
      <span>健康風險 ${review.stats.healthRisk} · 壓力 ${review.stats.stress} · 親密 ${review.stats.bonding} · 活動 ${review.stats.activity}</span>
      <span>清潔 ${review.stats.cleanliness} · 睡眠債 ${review.stats.sleepDebt} · 砂盆髒污 ${review.stats.poopLevel} · 零食比例 ${review.stats.snackRatio}%</span>
      <small>成長傾向：${review.evolution.title}。${review.evolution.detail}</small>
      ${issueLines.length ? `<ul class="review-issues">${issueLines.join("")}</ul>` : "<small>沒有新增埋雷，牠今年被穩定地照顧到了。</small>"}
    `;
    $("#choice-actions").appendChild(summary);
    const read = document.createElement("button");
    read.type = "button";
    read.className = "ghost-button";
    read.textContent = state.reviewExpanded ? "收起回顧" : "閱讀詳細回顧";
    read.addEventListener("click", () => {
      state.reviewExpanded = !state.reviewExpanded;
      render();
    });
    const close = document.createElement("button");
    close.type = "button";
    close.className = "primary-button";
    close.textContent = "關掉，繼續下一年";
    close.addEventListener("click", closeAnnualReview);
    $("#choice-actions").append(read, close);
    $("#next-day-button").disabled = true;
    $("#fast-forward-button").disabled = true;
    return;
  }

  if (state.currentAction) {
    const action = state.currentAction;
    const compactIntro = currentLang === "en"
      ? {
          nutrition: "Choose how to feed this year. Mixed feeding is allowed, but money, time, and effort stack up.",
          supplies: "Only refill what is missing or close to breaking. You do not need to buy everything every time.",
          hygiene: "Litter work, deep cleaning, and grooming all cost time. The cat lives with what you choose.",
          enrichment: "Play is not decoration. It spends effort, builds bonding, and reduces damage.",
          training: "Guide correctly. Harsh handling lowers bonding and raises stress.",
          sleep: "Manage night running and rhythm. This is not about banning daytime sleep.",
          vet: "Checkups, vaccines, follow-ups, and treatment are handled here.",
          lifestyle: "Travel, outings, pet sitters, and home safety planning.",
        }
      : {
          nutrition: "選今個月點餵。可以混合，但錢、時間和精力會疊加。",
          supplies: "只補缺的和快壞的，不需要每次全買。",
          hygiene: "清砂、深清、梳毛都會吃時間。你選多少，牠就承受多少結果。",
          enrichment: "陪玩不是裝飾，是消耗精力、建立親密和減少拆家的方式。",
          training: "用正確方法引導。粗暴處理會影響親密和壓力。",
          sleep: "處理夜間跑酷和作息，不是禁止貓白天睡覺。",
          vet: "檢查、疫苗、覆診和治療都在這裡處理。",
          lifestyle: "旅行、外出、上門照顧和居家安全安排。",
        };
    const draft = state.actionDraft || {
      action,
      selected: [...(state.actionPlans[action]?.selected || [])],
      intensity: "normal",
      progress: 0,
    };
    draft.intensity = "normal";
    draft.progress ||= 0;
    state.actionDraft = draft;
    const preview = buildActionPlan(action, draft.selected, draft.intensity);
    panel.classList.remove("hidden");
    $("#choice-title").textContent = actionTitle(action);
    $("#choice-text").textContent = compactIntro[action] || currentNeeds().descriptions[action];
    $("#choice-actions").innerHTML = "";
    actionChoices[action].forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const selected = draft.selected.includes(index);
      button.className = `ghost-button plan-choice ${selected ? "selected" : ""}`;
      const repeat = annualRepeatForChoice(action, choice);
      const annualMoney = (choice.money || 0) * repeat;
      const annualTime = (choice.time || 0) * repeat;
      const annualEnergy = (choice.energy || 0) * repeat;
      const parts = [];
      if (annualMoney) parts.push(money.format(annualMoney));
      if (annualTime) parts.push(`${annualTime}h`);
      if (annualEnergy) parts.push(energyText(annualEnergy));
      const title = document.createElement("strong");
      title.textContent = actionChoiceText(action, choice, index, "label");
      const detail = document.createElement("small");
      detail.textContent = parts.length ? `${parts.join(" / ")}${repeat > 1 ? currentLang === "en" ? " · yearly total" : " · 年度換算" : ""}` : actionChoiceText(action, choice, index, "detail") || "";
      if (choice.detail) detail.title = repeat > 1
        ? `${actionChoiceText(action, choice, index, "detail")}（${currentLang === "en" ? "converted into yearly care" : "已按一年重複照顧換算"}）`
        : actionChoiceText(action, choice, index, "detail");
      button.append(title, detail);
      button.addEventListener("click", () => {
        const selectedSet = new Set(state.actionDraft.selected);
        if (selectedSet.has(index)) selectedSet.delete(index);
        else selectedSet.add(index);
        state.actionDraft.selected = Array.from(selectedSet).sort((a, b) => a - b);
        state.actionDraft.progress = 0;
        render();
      });
      $("#choice-actions").appendChild(button);
    });
    renderActionMini(action);
    const summary = document.createElement("div");
    summary.className = "plan-summary";
    if (preview.error) {
      summary.textContent = preview.error;
      summary.classList.add("warning");
    } else {
      const effects = preview.effects;
      const afterTime = (state.timeSpent || 0) + effects.time;
      const afterEnergy = (state.effortSpent || 0) + effects.energy;
      const afterLevel = effortLevel(afterEnergy);
      const autoText = effects.autoPurchases?.length
        ? currentLang === "en"
          ? ` Missing items have been added to the cost automatically.`
          : ` 已自動把缺少的${Array.from(new Set(effects.autoPurchases)).join("、")}加入成本。`
        : "";
      const habitText = effects.habitNote ? ` ${effects.habitNote}` : "";
      const yearText = effects.annualized ? currentLang === "en" ? " Converted into yearly repeated care." : " 已按一年重複照顧換算。" : "";
      const billText = effects.billItems?.length
        ? `<small>${currentLang === "en" ? "Bill" : "帳單"}：${effects.billItems.slice(0, 4).map((item) => `${item.label}${money.format(item.amount)}`).join(" / ")}</small>`
        : "";
      summary.innerHTML = `<strong>${money.format(effects.money)} · ${effects.time}h · ${energyText(effects.energy)}</strong><span>${currentLang === "en" ? "Year total" : "今年累積"}：${afterTime}h / ${energyText(afterEnergy)} · ${effortText(afterLevel)}</span>${billText}<small>${yearText}${autoText}${habitText}${effects.sceneNote ? ` ${effects.sceneNote}` : ""}${effects.time > state.timeLeft ? currentLang === "en" ? " Not enough time this year; adjust choices." : " 今年時間不足，請調整。" : ""}</small>`;
      if (effects.time > state.timeLeft) summary.classList.add("warning");
    }
    $("#choice-actions").appendChild(summary);
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "primary-button";
    const actionReady = draft.selected.length > 0 && miniProgress() >= 100;
    confirm.textContent = actionReady
      ? state.actionPlans[action]
        ? currentLang === "en" ? "Update this year's plan" : "更新今年安排"
        : currentLang === "en" ? "Finish care" : "完成照顧"
      : currentLang === "en" ? "Complete the action above first" : "先完成上面動作";
    confirm.disabled = !actionReady;
    confirm.addEventListener("click", confirmActionPlan);
    $("#choice-actions").appendChild(confirm);
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ghost-button";
    cancel.textContent = currentLang === "en" ? "Skip for now" : "先不做";
    cancel.addEventListener("click", () => {
      state.currentAction = null;
      state.actionDraft = null;
      render();
    });
    $("#choice-actions").appendChild(cancel);
    $("#next-day-button").disabled = false;
    $("#fast-forward-button").disabled = false;
    return;
  }

  const event = state.currentEvent;
  panel.classList.remove("hidden");
  $("#choice-title").textContent = event.title;
  $("#choice-text").textContent = event.text;
  $("#choice-actions").innerHTML = "";
  event.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === 0 ? "primary-button" : "ghost-button";
    const parts = [];
    if (choice.money) parts.push(money.format(choice.money));
    if (choice.time) parts.push(`${choice.time}h`);
    if (choice.energy) parts.push(`精力${choice.energy}`);
    button.textContent = parts.length ? `${choice.label}（${parts.join(" / ")}）` : choice.label;
    button.addEventListener("click", () => resolveChoice(index));
    $("#choice-actions").appendChild(button);
  });
  $("#next-day-button").disabled = true;
  $("#fast-forward-button").disabled = true;
}

function renderNeeds() {
  const needs = currentNeeds();
  $("#need-label").textContent = needs.title;
  const requiredSet = new Set(needs.required);
  const order = [...needs.required, ...Object.keys(actionMeta).filter((key) => !requiredSet.has(key))];
  const shortLines = currentLang === "en"
    ? {
        nutrition: "Food/water",
        supplies: "Refill/replace",
        hygiene: "Litter/cleaning",
        enrichment: "Play/activity",
        training: "Guide/correct",
        sleep: "Night rhythm",
        vet: "Check/treat",
        lifestyle: "Safety/travel",
      }
    : {
        nutrition: "餵食/飲水",
        supplies: "補貨/更換",
        hygiene: "砂盆/清潔",
        enrichment: "陪玩/放電",
        training: "引導/修正",
        sleep: "夜間節奏",
        vet: "檢查/治療",
        lifestyle: "安全/外出",
      };
  $("#need-list").innerHTML = order
    .map((key) => {
      const done = Boolean(state.completedActions[key]);
      const meta = actionMeta[key];
      const needed = requiredSet.has(key);
      const tag = currentLang === "en" ? done ? "Done" : needed ? "Need" : "Optional" : done ? "完成" : needed ? "要做" : "可選";
      return `<li class="${done ? "done" : ""} ${needed ? "needed" : "optional"}"><button type="button" class="need-choice" data-need="${key}">
        <span class="need-icon">${meta.icon}</span>
        <strong>${actionTitle(key)}</strong>
        <span class="need-tag">${tag} · ${shortLines[key]}</span>
        <span class="need-detail">${needs.descriptions[key]}</span>
      </button></li>`;
    })
    .join("");
  $$(".need-choice").forEach((button) => {
    button.addEventListener("click", () => applyAction(button.dataset.need));
  });
}

function renderInventory() {
  const entries = Object.entries(state.inventory || {}).filter(([, amount]) => amount > 0);
  const list = $("#inventory-list");
  if (!entries.length) {
    list.innerHTML = currentLang === "en"
      ? "<li><strong>Inventory is empty</strong><span>Open the Shop scene above to buy food, supplies, toys, safety, medical, and decor items.</span></li>"
      : '<li><strong>背包是空的</strong><span>點上方「商店」場景，購買食物、用品、玩具、安全、醫療和裝飾道具。</span></li>';
    return;
  }
  list.innerHTML = entries
    .map(([key, amount]) => `<li><strong>${itemName(key)}</strong><span>x ${amount}</span></li>`)
    .join("");
}

function renderDurability() {
  const list = $("#durability-list");
  const entries = Object.entries(durableItemRules).map(([id, rule]) => {
    const durable = state.durables[id];
    const name = currentLang === "en" ? itemName(id) : rule.name;
    if (!durable) return `<li><strong>${name}</strong><span>${currentLang === "en" ? "Not bought / not installed" : "未購買/未安裝"}</span></li>`;
    const left = durableMonthsLeft(id);
    const used = Math.round(durableAge(id));
    const status = currentLang === "en"
      ? left > 0 ? `Used ${used}/${durable.lifespan} months, ${Math.round(left)} left; includes the cat's own wear` : `Expired by ${Math.abs(Math.round(left))} months`
      : left > 0 ? `已用 ${used}/可用 ${durable.lifespan} 個月，剩 ${Math.round(left)}；含貓咪自行使用損耗` : `已過期 ${Math.abs(Math.round(left))} 個月`;
    return `<li class="${left <= 0 ? "expired" : ""}"><strong>${name}</strong><span>${status}</span></li>`;
  });
  list.innerHTML = entries.join("");
}

function renderAchievements() {
  const unlocked = new Set(state.achievements || []);
  const list = $("#achievement-list");
  const visible = achievementRules.filter((rule) => unlocked.has(rule.id));
  if (!visible.length) {
    list.innerHTML = currentLang === "en" ? "<li>None yet. Keep showing up before the cat slowly comes closer.</li>" : "<li>還沒有。多陪伴幾個月，牠才會慢慢靠近。</li>";
    return;
  }
  list.innerHTML = visible.map((rule) => `<li><strong>${achievementText(rule)}</strong><span>${achievementText(rule, "text")}</span></li>`).join("");
}

function showInfo(title, text) {
  let panel = $("#info-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "info-panel";
    panel.className = "info-panel hidden";
    panel.innerHTML = `
      <div class="info-dialog" role="dialog" aria-modal="true" aria-labelledby="info-title">
        <button id="info-close" class="icon-button info-close" type="button" aria-label="關閉">×</button>
        <h3 id="info-title"></h3>
        <p id="info-text"></p>
      </div>
    `;
    document.body.appendChild(panel);
    $("#info-close").addEventListener("click", () => panel.classList.add("hidden"));
    panel.addEventListener("click", (event) => {
      if (event.target === panel) panel.classList.add("hidden");
    });
  }
  $("#info-title").textContent = title;
  $("#info-text").textContent = text;
  panel.classList.remove("hidden");
}

function explainCatMark(type) {
  if (type === "warning") {
    const mark = $("#cat-mark")?.textContent?.trim();
    if (!mark) return;
    const eventText = currentLang === "en"
      ? state.currentEvent
        ? `Current forced event: "${state.currentEvent.title}". Handle it or delay it, and the cat's condition and future risk will change.`
        : state.healthRisk > 75
          ? `Current health risk is ${Math.round(state.healthRisk)}, which means illness or death risk is already high.`
          : state.stress > 70
            ? `Current stress is ${Math.round(state.stress)}. The cat may hide, spray, damage things, or get sick more easily.`
            : "This warning mark means a sudden issue, pain, or risk is happening."
      : state.currentEvent
        ? `現在觸發的是「${state.currentEvent.title}」。你需要先處理或選擇延後，牠的狀態和未來風險會跟著改變。`
        : state.healthRisk > 75
          ? `目前健康風險是 ${Math.round(state.healthRisk)}，代表疾病或病逝風險已經很高。`
          : state.stress > 70
            ? `目前壓力是 ${Math.round(state.stress)}，牠可能躲開、亂尿、拆家或更容易生病。`
            : "這是提醒標記，代表有突發狀況、痛苦或風險正在發生。";
    showInfo(mark === "痛" ? currentLang === "en" ? "Pain / medical warning" : "痛苦/醫療警示" : currentLang === "en" ? "Event / risk warning" : "突發/風險警示", eventText);
    return;
  }
  const evolution = evolutionResult();
  showInfo(
    currentLang === "en" ? "Adult personality mark" : "成年性格標記",
    currentLang === "en"
      ? `The white circle is the adult personality mark. Current branch: "${evolutionText(evolution.key, "title")}". ${evolutionText(evolution.key, "detail")} Care, activity, medical care, hygiene, and neglect move the cat between branches.`
      : `這個白色圓形是成年後的性格標記。目前是「${evolution.title}」：${evolution.detail} 牠會因你的陪伴、活動量、醫療、清潔和忽略方式，慢慢移向不同性格分支。`,
  );
}

function renderStatInfoButtons() {
  Object.entries(statInfo).forEach(([id, info]) => {
    const value = $(`#${id}`);
    const label = value?.parentElement?.querySelector("span");
    if (!label || label.querySelector(".info-button")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "info-button";
    button.setAttribute("aria-label", currentLang === "en" ? `Show ${statInfoText(id)} info` : `查看${info.title}說明`);
    button.textContent = "i";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      showInfo(statInfoText(id), statInfoText(id, "text"));
    });
    label.appendChild(button);
  });
}

function currentPlanPreview() {
  if (!state.actionDraft?.selected?.length) return null;
  const draft = { ...state.actionDraft, intensity: "normal" };
  const built = buildActionPlan(draft.action, draft.selected, draft.intensity);
  return built.error ? null : built.effects;
}

function renderYearBrief() {
  const ageYears = Math.floor((state.month - 1) / 12);
  const nextAge = ageYears + 1;
  const risks = yearlyRiskPreview();
  $("#year-brief").innerHTML = `
    <strong>${currentLang === "en" ? `This click jumps to age ${nextAge}: possible issues this year` : `今年會直接跳到 ${nextAge} 歲：可能發生這些事`}</strong>
    <div class="year-risk-list">${risks.map((risk) => `<span>${risk}</span>`).join("")}</div>
    <span>${currentLang === "en" ? "Each click is not one month. You carry a whole year of food, hygiene, companionship, safety, and medical consequences." : "你每次不是過一個月，而是替牠承擔一整年的飲食、清潔、陪伴、安全和醫療後果。"}</span>
  `;
}

function renderVisualStatus() {
  const chips = currentLang === "en"
    ? [
        { icon: state.hunger < 45 ? "🍚" : "🥣", label: state.hunger < 45 ? "Hungry" : "Fed", state: state.hunger < 45 ? "problem" : "good" },
        { icon: state.cleanliness < 50 || state.poopLevel > 65 ? "💩" : "✨", label: state.cleanliness < 50 || state.poopLevel > 65 ? "Dirty" : "Clean", state: state.cleanliness < 50 || state.poopLevel > 65 ? "problem" : "good" },
        { icon: state.boredom > 60 ? "🧶" : "🎾", label: state.boredom > 60 ? "Bored" : "Played", state: state.boredom > 60 ? "problem" : "good" },
        { icon: state.healthRisk > 55 ? "🤒" : "🩺", label: state.healthRisk > 55 ? "Health risk" : "Stable", state: state.healthRisk > 55 ? "problem" : "good" },
        { icon: state.sleepDebt > 55 ? "🌙" : "🛏", label: state.sleepDebt > 55 ? "Night run" : "Rested", state: state.sleepDebt > 55 ? "problem" : "good" },
        { icon: state.bonding > 70 ? "💚" : "🐾", label: state.bonding > 70 ? "Bonded" : "Watching", state: state.bonding > 70 ? "good" : "" },
      ]
    : [
        { icon: state.hunger < 45 ? "🍚" : "🥣", label: state.hunger < 45 ? "餓" : "飽", state: state.hunger < 45 ? "problem" : "good" },
        { icon: state.cleanliness < 50 || state.poopLevel > 65 ? "💩" : "✨", label: state.cleanliness < 50 || state.poopLevel > 65 ? "髒" : "乾淨", state: state.cleanliness < 50 || state.poopLevel > 65 ? "problem" : "good" },
        { icon: state.boredom > 60 ? "🧶" : "🎾", label: state.boredom > 60 ? "悶" : "有玩", state: state.boredom > 60 ? "problem" : "good" },
        { icon: state.healthRisk > 55 ? "🤒" : "🩺", label: state.healthRisk > 55 ? "病風險" : "健康", state: state.healthRisk > 55 ? "problem" : "good" },
        { icon: state.sleepDebt > 55 ? "🌙" : "🛏", label: state.sleepDebt > 55 ? "夜跑" : "安睡", state: state.sleepDebt > 55 ? "problem" : "good" },
        { icon: state.bonding > 70 ? "💚" : "🐾", label: state.bonding > 70 ? "親近" : "觀察", state: state.bonding > 70 ? "good" : "" },
      ];
  $("#visual-status").innerHTML = chips
    .map((chip) => `<div class="status-chip ${chip.state}"><strong>${chip.icon}</strong><span>${chip.label}</span></div>`)
    .join("");
}

function renderEvolutionGrid() {
  const current = evolutionResult();
  const rows = [
    ["high-lazy", "high-balanced", "high-active"],
    ["mid-lazy", "mid-balanced", "mid-active"],
    ["low-lazy", "low-balanced", "low-active"],
  ];
  $("#evolution-grid").innerHTML = rows
    .flat()
    .map((key) => {
      const meta = evolutionVisualMeta[key];
      return `<div class="evolution-cell ${key === current.key ? "current" : ""}">
        <span>${meta.icon}</span>
        <strong>${evolutionText(key, "title")}</strong>
        <small>${evolutionText(key, "behavior")}</small>
      </div>`;
    })
    .join("") + `
      <div class="axis-label axis-y">Y ${currentLang === "en" ? "Bonding" : "親密度"} ${Math.round(state.bonding)}</div>
      <div class="axis-label axis-x">X ${currentLang === "en" ? "Activity" : "活動量"} ${Math.round(state.activity)}</div>
      <div class="axis-scale y-high">100</div>
      <div class="axis-scale y-mid">50</div>
      <div class="axis-scale y-low">0</div>
      <div class="axis-scale x-low">0</div>
      <div class="axis-scale x-mid">50</div>
      <div class="axis-scale x-high">100</div>
      <div class="evolution-point" style="--x:${clamp(state.activity)}%; --y:${clamp(state.bonding)}%" title="${currentLang === "en" ? "Activity" : "活動量"} ${Math.round(state.activity)}，${currentLang === "en" ? "Bonding" : "親密度"} ${Math.round(state.bonding)}">
        <span>X${Math.round(state.activity)} / Y${Math.round(state.bonding)}</span>
      </div>
    `;
}

function renderEvolutionModal() {
  const modal = $("#evolution-modal");
  if (!modal) return;
  const evolution = state.evolutionModal;
  modal.classList.toggle("hidden", !evolution);
  modal.setAttribute("aria-hidden", evolution ? "false" : "true");
  if (!evolution) return;
  $("#evolution-name").textContent = evolution.title;
  $("#evolution-text").textContent = currentLang === "en"
    ? `${state.catName} became "${evolutionText(evolution.key, "title")}". ${evolutionText(evolution.key, "detail")} ${evolutionText(evolution.key, "behavior")}`
    : `${state.catName} 成為「${evolution.title}」。${evolution.detail} ${evolution.behavior}`;
  setCatImage("#evolution-cat-image", state.coat || "orange");
  const cat = $("#evolution-modal .cat");
  cat.className = `cat cat-coat-${state.coat || "orange"} idle ${evolution.className}`;
  $("#evolution-persona-mark").textContent = evolution.mark;
}

function closeEvolutionModal() {
  state.evolutionModal = null;
  saveGame();
  render();
}

function renderOwnerEffort() {
  const wrap = $("#owner-effort-options");
  wrap.innerHTML = "";
  const preview = currentPlanPreview();
  const total = (state.effortSpent || 0) + (preview?.energy || 0);
  const active = effortLevel(total);
  effortRanges.forEach((range) => {
    const item = document.createElement("div");
    item.className = `owner-effort-button ${active.id === range.id ? "selected" : ""}`;
    item.innerHTML = `<strong>${effortText(range)}</strong><span>${range.min}${Number.isFinite(range.max) ? `-${range.max}` : "+"} ${currentLang === "en" ? "effort" : "精力"}</span>`;
    wrap.appendChild(item);
  });
  $("#owner-effort-note").textContent = currentLang === "en"
    ? `Current yearly effort ${total}. The system reads this as "${effortText(active)}". ${effortText(active, "detail")}`
    : `目前今年累積精力 ${total}，系統判斷為「${active.label}」。${active.detail}`;
}

function renderHistory() {
  const evolution = evolutionResult();
  const latestReview = state.annualReviews[state.annualReviews.length - 1];
  const buriedTotal = Object.values(state.buriedRisks || {}).reduce((sum, value) => sum + value, 0);
  const topMistakes = Object.entries(state.careMistakes || {})
    .sort(([, a], [, b]) => b.severity - a.severity)
    .slice(0, 3);
  const items = [
    currentLang === "en"
      ? `<li><strong>Growth tendency: ${evolutionText(evolution.key, "title")}</strong><span>${evolutionText(evolution.key, "detail")}</span></li>`
      : `<li><strong>成長傾向：${evolution.title}</strong><span>${evolution.detail}</span></li>`,
    currentLang === "en"
      ? `<li><strong>Buried risks: ${buriedTotal}</strong><span>Repeated unresolved issues from annual reviews raise future illness, accident, or death risk.</span></li>`
      : `<li><strong>埋雷：${buriedTotal}</strong><span>年度回顧中反覆未改善的問題，會提高日後大病、事故或死亡風險。</span></li>`,
  ];
  if (latestReview) items.push(currentLang === "en"
    ? `<li><strong>Latest review: Year ${latestReview.year}</strong><span>${latestReview.issues.length ? `${latestReview.issues.length} issue types recorded` : "Care was stable with no major new mistakes"}</span></li>`
    : `<li><strong>最近回顧：第${latestReview.year}年</strong><span>${latestReview.issues.length ? `${latestReview.issues.length} 類問題被記錄` : "照顧穩定，沒有新增重大錯誤"}</span></li>`);
  topMistakes.forEach(([key, record]) => {
    items.push(`<li><strong>${mistakeText[key] || key}</strong><span>累積 ${record.count} 次，嚴重度 ${record.severity}</span></li>`);
  });
  $("#history-list").innerHTML = items.join("");
}

function updateCatVisual() {
  const cat = $("#cat");
  const st = stage().id;
  const ageMonths = Math.max(0, state.month - 1);
  const growth = ageMonths < 12 ? 0.56 + ageMonths * 0.035 : st === "senior" ? 0.96 : 1;
  const eventText = `${state.currentEvent?.id || ""} ${state.currentEvent?.title || ""} ${state.currentEvent?.text || ""}`;
  const painfulEvent = Boolean(state.currentEvent) && /(病|嘔|痛|腎|胰|牙|急診|住院|手術|子宮|醫)/.test(eventText);
  const dangerEvent = Boolean(state.currentEvent) && /(墜|窗|事故|跌|受傷|摔|危險)/.test(eventText);
  cat.style.setProperty("--growth", growth.toFixed(2));
  setCatImage("#cat-image", state.coat || "orange");
  cat.classList.remove("cat-coat-orange", "cat-coat-blue", "cat-coat-tuxedo", "cat-coat-silver", "cat-coat-cream", "cat-coat-siamese");
  Object.values(evolutionVisualMeta).forEach((meta) => cat.classList.remove(meta.className));
  cat.classList.add(`cat-coat-${state.coat || "orange"}`);
  const evolution = evolutionResult();
  const adultShape = ["adult", "mature", "senior"].includes(st);
  if (adultShape) cat.classList.add(evolution.className);
  cat.classList.toggle("sick", state.healthRisk > 68 || state.hydration < 25);
  cat.classList.toggle("stressed", state.stress > 70 || state.boredom > 75);
  cat.classList.toggle("cat-pain", painfulEvent || state.healthRisk > 82);
  cat.classList.toggle("cat-danger", dangerEvent);
  cat.classList.toggle("cat-fat", state.weight > 62);
  cat.classList.toggle("cat-old", st === "senior");
  cat.classList.toggle("cat-kitten", st === "kitten");
  cat.classList.toggle("cat-teen", st === "teen");
  cat.classList.toggle("cat-alert", Boolean(state.currentEvent));
  $("#cat-mark").textContent = painfulEvent ? "痛" : dangerEvent ? "!" : state.currentEvent ? "!" : state.healthRisk > 75 ? "!" : state.stress > 70 ? "…" : "";
  $("#cat-persona-mark").textContent = adultShape ? evolution.mark : "";
  $("#cat-mark").title = $("#cat-mark").textContent ? "點擊查看警示意思" : "";
  $("#cat-persona-mark").title = adultShape ? "點擊查看性格標記意思" : "";
  $("#room-window").classList.toggle("safe", state.flags.windowNet);
  $("#room-sofa").classList.toggle("scratched", !state.flags.scratchPost && state.boredom > 55);
  $("#room-cat-tree").classList.toggle("hidden", !hasValidDurable("catTree"));
  $("#room-cat-bed").classList.toggle("hidden", !hasValidDurable("catBed"));
  $("#room-scratcher").classList.toggle("hidden", !hasValidDurable("scratcher") && !state.flags.scratchPost);
  $("#room-litter").classList.toggle("hidden", !hasValidDurable("litterBox"));
  $("#room-litter").classList.toggle("dirty", state.poopLevel > 60 || state.cleanliness < 45);
  $("#room-light").classList.toggle("off", state.sleepDebt < 25 || state.completedActions.sleep);
}

function animateCat(className) {
  const cat = $("#cat");
  cat.classList.remove(className);
  void cat.offsetWidth;
  cat.classList.add(className);
  setTimeout(() => cat.classList.remove(className), 1200);
}

function render() {
  if (!state) return;
  ensureStateShape();
  const ageYears = Math.floor((state.month - 1) / 12);
  const ageMonth = (state.month - 1) % 12;
  const currentYear = playYearIndex();
  $("#day-title").textContent = currentLang === "en"
    ? `Year ${currentYear}/${playableYears()} · ${ageYears}y ${ageMonth}m`
    : `第 ${currentYear}/${playableYears()} 年 · ${ageYears}歲${ageMonth}個月`;
  $("#fund-left").textContent = money.format(Math.max(0, state.fund));
  $("#spent-total").textContent = `${copy("spentTotal")} ${money.format(state.spent)}`;
  $("#year-spent-total").textContent = `${copy("yearSpent")} ${money.format(state.expenses?.year || 0)}`;
  const lastBill = state.expenses?.lastBill;
  $("#last-bill").textContent = lastBill
    ? currentLang === "en"
      ? `Latest bill: ${money.format(lastBill.amount)}. ${lastBill.medical ? "Medical costs can hit suddenly." : "This is part of daily responsibility."}`
      : `最近帳單：${lastBill.reason} ${money.format(lastBill.amount)}。${lastBill.medical ? "醫療會突然吃掉現金。" : "這是日常責任的一部分。"}`
    : copy("noBill");
  $("#fund-meter").style.width = `${clamp((state.fund / state.initialFund) * 100)}%`;
  $("#stat-hunger").textContent = Math.round(state.hunger);
  $("#stat-happiness").textContent = Math.round(state.happiness);
  $("#stat-cleanliness").textContent = Math.round(state.cleanliness);
  $("#stat-hydration").textContent = Math.round(state.hydration);
  $("#stat-stress").textContent = Math.round(state.stress);
  $("#stat-bonding").textContent = Math.round(state.bonding);
  $("#stat-activity").textContent = Math.round(state.activity);
  $("#stat-sleep").textContent = Math.round(state.sleepDebt);
  $("#stat-poop").textContent = Math.round(state.poopLevel);
  $("#stat-discipline").textContent = Math.round(state.discipline);
  $("#stat-risk").textContent = Math.round(Math.max(state.healthRisk, state.accidentRisk));
  $("#hud-hunger").textContent = Math.round(state.hunger);
  $("#hud-hydration").textContent = Math.round(state.hydration);
  $("#hud-bonding").textContent = Math.round(state.bonding);
  $("#hud-risk").textContent = Math.round(Math.max(state.healthRisk, state.accidentRisk));
  $("#stat-level").textContent = level();
  $("#stat-time").textContent = `${Math.round(state.timeSpent || 0)}h`;
  $("#stat-energy").textContent = Math.round(state.effortSpent || 0);
  const preview = currentPlanPreview();
  $("#stat-time-preview").textContent = preview ? `${currentLang === "en" ? "After choice" : "選擇後"} ${Math.round((state.timeSpent || 0) + preview.time)}h` : "";
  $("#stat-energy-preview").textContent = preview ? `${currentLang === "en" ? "After choice" : "選擇後"} ${Math.round((state.effortSpent || 0) + preview.energy)}` : "";
  const lifeProgress = ((state.month - state.startAgeMonths - 1) / playableMonths()) * 100;
  $("#progress-percent").textContent = `${Math.round(lifeProgress)}%`;
  $("#year-meter").style.width = `${clamp(lifeProgress)}%`;
  const st = stage();
  $("#stage-label").textContent = currentLang === "en"
    ? `${stageText(st)}: ${stageText(st, "label")} Personality: ${personalityVisible() ? profileText("trait") : "unknown in kitten stage; it emerges through care."}`
    : `${st.name}：${st.label} 性格：${personalityVisible() ? profile().trait : "幼貓性格未明，照顧一段時間後才會顯現。"}`;
  $("#log-list").innerHTML = state.logs.map((item) => `<li>${item}</li>`).join("");
  renderScene();
  renderShop();
  renderNeeds();
  renderYearBrief();
  renderVisualStatus();
  renderInventory();
  renderDurability();
  renderAchievements();
  renderEvolutionGrid();
  renderStatInfoButtons();
  renderOwnerEffort();
  renderHistory();
  renderChoicePanel();
  updateCatVisual();
  renderEvolutionModal();
}

function finishGame() {
  const projected = Math.round(clamp(state.spent + state.healthRisk * 1200 + state.accidentRisk * 900, 250000, 900000));
  const ageYears = Math.floor((state.month - 1) / 12);
  const ageMonths = (state.month - 1) % 12;
  const ageText = currentLang === "en" ? `${ageYears}y ${ageMonths}m` : `${ageYears}歲${ageMonths}個月`;
  const evolution = evolutionResult();
  const buriedTotal = Object.values(state.buriedRisks || {}).reduce((sum, value) => sum + value, 0);
  $(".summary-panel h2").textContent = state.death ? currentLang === "en" ? "The cat has passed away." : "牠已經離開。" : copy("summaryDone");
  $("#summary-line").textContent = state.death
    ? currentLang === "en" ? `${state.catName} passed away at ${ageText}. ${deathReasonText(state.death.reason)}` : `${state.catName} 在 ${ageText} 時離開。${state.death.reason}`
    : state.month > lifeEndMonth()
      ? currentLang === "en" ? `${state.catName} completed a compressed life with you. This is not a score; it is a responsibility record.` : `${state.catName} 陪你走完了年度壓縮的一生。這不是評分，只是一份責任紀錄。`
      : currentLang === "en" ? `${state.catName} has reached ${ageText}. This is the current record and lifetime projection.` : `${state.catName} 目前走到 ${ageText}。這是目前紀錄與一生推算。`;
  $("#summary-spent").textContent = money.format(state.spent);
  $("#summary-fifteen").textContent = money.format(projected);
  $("#summary-play").textContent = state.playCount;
  $("#summary-neglect").textContent = state.neglectTurns;
  $("#summary-medical").textContent = state.medicalCount;
  $("#summary-medical-spent").textContent = money.format(state.expenses?.medical || 0);
  $("#summary-biggest-bill").textContent = money.format(state.expenses?.biggestBill?.amount || 0);
  $("#summary-preventable").textContent = money.format(state.expenses?.preventable || 0);
  $("#summary-decisions").textContent = state.majorDecisions;
  $("#summary-evolution").textContent = currentLang === "en" ? evolutionText(evolution.key, "title") : evolution.title;
  $("#summary-buried").textContent = buriedTotal;
  $("#summary-reviews").textContent = state.annualReviews.length;
  $("#summary-review-list").innerHTML = state.annualReviews.length
    ? state.annualReviews
        .slice(-6)
        .map((review) => currentLang === "en"
          ? `<li><strong>Year ${review.year}: ${review.issues.length ? `${review.issues.length} issue types` : "stable"}</strong><span>${evolutionText(review.evolution.key, "title")} tendency; buried risks ${review.buriedTotal}</span></li>`
          : `<li><strong>第${review.year}年：${review.issues.length ? `${review.issues.length}類問題` : "穩定"}</strong><span>${review.evolution.title}傾向；埋雷總數 ${review.buriedTotal}</span></li>`)
        .join("")
    : currentLang === "en"
      ? "<li><strong>No annual review yet</strong><span>The game has not reached 12 months, so there is no yearly record.</span></li>"
      : "<li><strong>還沒有年度回顧</strong><span>遊戲未走到12個月，暫無年度紀錄。</span></li>";
  $("#reflection-result").textContent = "";
  setScreen("#summary-screen");
}

function saveGame() {
  if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function startGame() {
  state = newState();
  const remaining = lifeEndMonth() - state.startAgeMonths;
  state.logs = [currentLang === "en"
    ? `Compressed cat life starts at ${state.startAgeMonths} months old, with about ${Math.ceil(remaining / 12)} years left. Each click is one year.`
    : `年度壓縮貓生開始：從${state.startAgeMonths}個月開始，剩約${Math.ceil(remaining / 12)}年；一次可以走完整個流程，每次點擊就是一年。`];
  if (!state.personalityKnown) addLog(currentLang === "en" ? "Kitten personality is unknown and will emerge through care." : "幼貓性格未知，會在照顧中慢慢顯現。");
  $("#cat-line").textContent = pick("idle");
  setScreen("#game-screen");
  queueBlockingEvent();
  saveGame();
  render();
}

function resetSetupForm() {
  $("#start-age-input").value = "0";
  $("#cat-sex-input").value = "female";
  $("#cat-coat-input").value = "orange";
  $("#fund-input").value = "250000";
  $("#cat-name-input").value = "阿按揭";
  selectedPersonality = "worker";
  $$(".personality-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.personality === selectedPersonality);
  });
  syncStartAgeUi();
  updateStartCatImage();
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state = null;
  resetSetupForm();
  setScreen("#start-screen");
}

function loadSavedGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    state = JSON.parse(raw);
    ensureStateShape();
    applyOfflineDrift();
    selectedPersonality = state.personality || selectedPersonality;
    saveGame();
    setScreen(state.death || state.month > lifeEndMonth() ? "#summary-screen" : "#game-screen");
    if (state.death || state.month > lifeEndMonth()) finishGame();
    else render();
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
}

$$(".personality-card").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".personality-card").forEach((card) => card.classList.remove("selected"));
    button.classList.add("selected");
    selectedPersonality = button.dataset.personality;
  });
});

function syncStartAgeUi() {
  const startAge = Number($("#start-age-input")?.value || 0);
  const kitten = startAge === 0;
  $(".personality-grid").classList.toggle("disabled", kitten);
  $("#personality-help").textContent = currentLang === "en"
    ? kitten
      ? "A kitten's personality is unknown. It will emerge through care."
      : startAge >= 36
        ? "A 3+ year adult cat already has a clearer personality. This simulation has 10 years remaining."
        : "A 1-year-old cat has a more visible personality and can be simulated until age 15."
    : kitten
      ? "幼貓性格未知，所以不能預先選性格；牠會在照顧中慢慢顯現。"
      : startAge >= 36
        ? "3歲以上成貓性格已經明顯，你可以先選性格；這次模擬只剩10年壽命。"
        : "1歲貓已經有較明顯性格，你可以先選牠的語氣與照顧傾向，走到15歲。";
}

$("#start-age-input")?.addEventListener("change", syncStartAgeUi);
$("#cat-coat-input")?.addEventListener("change", updateStartCatImage);
$("#language-input")?.addEventListener("change", (event) => setLanguage(event.target.value));
$("#language-input-game")?.addEventListener("change", (event) => setLanguage(event.target.value));
$("#language-input-summary")?.addEventListener("change", (event) => setLanguage(event.target.value));
applyLanguage();
syncStartAgeUi();
updateStartCatImage();

$$(".scene-button").forEach((button) => {
  button.addEventListener("click", () => setScene(button.dataset.scene));
});

$$("[data-room-action]").forEach((target) => {
  const openAction = () => {
    if (target.classList.contains("hidden")) return;
    applyAction(target.dataset.roomAction);
  };
  target.addEventListener("click", openAction);
  target.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openAction();
  });
});

$$(".pet-menu [data-action]").forEach((button) => {
  button.addEventListener("click", () => applyAction(button.dataset.action));
});

$("#cat-mark")?.addEventListener("click", () => explainCatMark("warning"));
$("#cat-persona-mark")?.addEventListener("click", () => explainCatMark("persona"));
$("#evolution-close")?.addEventListener("click", closeEvolutionModal);
$("#evolution-modal")?.addEventListener("click", (event) => {
  if (event.target?.id === "evolution-modal") closeEvolutionModal();
});

$("#start-button").addEventListener("click", startGame);
$("#next-day-button").addEventListener("click", advanceMonth);
$("#fast-forward-button").addEventListener("click", completeToday);
$("#summary-button").addEventListener("click", finishGame);
$("#reset-button").addEventListener("click", resetGame);
$("#play-again-button").addEventListener("click", resetGame);
$("#ready-button").addEventListener("click", () => {
  $("#reflection-result").textContent = "準備好不是不會出事，而是出事時你仍然在。";
});
$("#not-ready-button").addEventListener("click", () => {
  $("#reflection-result").textContent = "這就是這個遊戲的意義：電子貓可以陪你，真貓等一個準備好的人。";
});

function enablePageScrollRescue() {
  let lastY = 0;
  let lastX = 0;
  let tracking = false;
  const shouldIgnore = (target) => target?.closest?.("input, select, textarea, button, .info-panel");
  const canScrollPage = () => document.documentElement.scrollHeight > window.innerHeight + 4;

  window.addEventListener("touchstart", (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    tracking = true;
    lastY = touch.clientY;
    lastX = touch.clientX;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    if (!tracking || !canScrollPage() || shouldIgnore(event.target)) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const deltaY = lastY - touch.clientY;
    const deltaX = lastX - touch.clientX;
    lastY = touch.clientY;
    lastX = touch.clientX;
    if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) < 2) return;
    window.scrollBy(0, deltaY);
    event.preventDefault();
  }, { passive: false });

  window.addEventListener("touchend", () => {
    tracking = false;
  }, { passive: true });

  window.addEventListener("wheel", (event) => {
    if (!canScrollPage() || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const scrollTarget = event.target?.closest?.(".log-card ul, .inventory-card ul, .durability-card ul, .achievement-card ul, .history-card ul");
    if (scrollTarget && scrollTarget.scrollHeight > scrollTarget.clientHeight) return;
    window.scrollBy(0, event.deltaY);
    event.preventDefault();
  }, { passive: false });
}

enablePageScrollRescue();

if (!checkAbandonment()) loadSavedGame();
