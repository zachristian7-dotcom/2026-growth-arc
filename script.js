/* ================= CONFIG ================= */

const exercises = [
  "Push-ups",
  "Sit-ups",
  "Pull-ups",
  "Squats",
  "Calf Raises",
  "Grip Strength Left (sec)",
  "Grip Strength Right (sec)",
  "Butterfly Kicks",
  "Plank (sec)"
];

const dailyGoals = {
  "Push-ups": 100,
  "Sit-ups": 50,
  "Pull-ups": 50,
  "Squats": 50,
  "Calf Raises": 50,
  "Grip Strength Left (sec)": 90,
  "Grip Strength Right (sec)": 90,
  "Butterfly Kicks": 30,
  "Plank (sec)": 60
};

const XP_GOAL = 100;

/* ================= STORAGE ================= */

let data = JSON.parse(localStorage.getItem("growthArc")) || {
  progress: {},
  streak: { count: 0, last: null },
  xp: 0,
  totalTime: 0,
  todayVictoryShown: false,
  badges: []
};

const saveData = () =>
  localStorage.setItem("growthArc", JSON.stringify(data));

const today = () =>
  new Date().toISOString().split("T")[0];

/* ================= INIT ================= */

const exerciseSelect = document.getElementById("exercise");
exercises.forEach(ex => {
  const o = document.createElement("option");
  o.value = ex;
  o.textContent = ex;
  exerciseSelect.appendChild(o);
});

/* ================= RESET ================= */

function resetToday() {
  const t = today();
  data.progress[t] = {};
  data.xp = 0;
  data.totalTime = 0;
  data.todayVictoryShown = false;
  saveData();
  updateUI();
}

/* ================= XP ================= */

function recalcXP() {
  const t = today();
  const prog = data.progress[t] || {};
  let xp = 0;

  exercises.forEach(ex => {
    const cur = prog[ex] || 0;
    const goal = dailyGoals[ex];
    const ratio = Math.min(cur / goal, 1);
    xp += ratio * (XP_GOAL / exercises.length);
  });

  data.xp = Math.round(xp);
}

function animateXPBar(percent) {
  const bar = document.getElementById("xpBar");
  let current = parseFloat(bar.style.width) || 0;

  function step() {
    if (current < percent) {
      current += 1;
      bar.style.width = current + "%";
      requestAnimationFrame(step);
    } else {
      bar.style.width = percent + "%";
    }
  }
  step();
}

/* ================= WORKOUT ================= */

function logWorkout() {
  const val = Number(document.getElementById("value").value);
  const ex = document.getElementById("exercise").value;
  if (!val || !dailyGoals[ex]) return;

  const t = today();
  data.progress[t] ??= {};
  data.progress[t][ex] = (data.progress[t][ex] || 0) + val;

  if (ex.includes("sec")) data.totalTime += val;

  recalcXP();
  updateStreak();
  saveData();
  document.getElementById("value").value = "";
  updateUI();
}

/* ================= STREAK ================= */

function updateStreak() {
  const t = today();
  const last = data.streak.last;

  if (last !== t) {
    if (last && new Date(t) - new Date(last) === 86400000) {
      data.streak.count++;
    } else {
      data.streak.count = 1;
    }
    data.streak.last = t;
  }
}

/* ================= UI ================= */

function updateUI() {
  document.getElementById("streak").textContent = data.streak.count;
  document.getElementById("totalTime").textContent = data.totalTime;

  const percent = Math.min((data.xp / XP_GOAL) * 100, 100);
  animateXPBar(percent);
  document.getElementById("xpText").textContent =
    `XP: ${data.xp} / ${XP_GOAL}`;

  const list = document.getElementById("progressList");
  list.innerHTML = "";

  let allDone = true;

  exercises.forEach(ex => {
    const cur = data.progress[today()]?.[ex] || 0;
    const goal = dailyGoals[ex];
    if (cur < goal) allDone = false;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>${ex}: ${cur} / ${goal}</div>
      <div style="background:#ccc;height:10px;border-radius:5px;overflow:hidden">
        <div style="
          width:${Math.min(cur / goal * 100, 100)}%;
          height:100%;
          background:${cur >= goal ? "#27ae60" : "#4a90e2"};
          transition:width .3s
        "></div>
      </div>
    `;
    list.appendChild(li);
  });

  if (allDone && !data.todayVictoryShown) {
    data.todayVictoryShown = true;
    saveData();
    alert("🎉 Daily goals completed!");
  }
}

/* ================= DARK MODE ================= */

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/* ================= START ================= */

updateUI();
