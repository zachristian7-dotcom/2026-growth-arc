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

const DAILY_XP_BASE = 100;
const DAILY_XP_CAP = 150;

/* ================= STORAGE ================= */

let data = JSON.parse(localStorage.getItem("growthArc")) || {
  progress: {},
  streak: { count: 0, last: null },
  dailyXP: 0,
  lifetimeXP: 0,
  level: 1,
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
  const opt = document.createElement("option");
  opt.value = ex;
  opt.textContent = ex;
  exerciseSelect.appendChild(opt);
});

/* ================= LEVELS ================= */

function xpForNextLevel(level){
  return 100 * level;
}

function updateLevel(){
  let needed = xpForNextLevel(data.level);
  while(data.lifetimeXP >= needed){
    data.lifetimeXP -= needed;
    data.level++;
    needed = xpForNextLevel(data.level);
  }
}

/* ================= MULTIPLIER ================= */

function getMultiplier(current, goal){
  const r = current / goal;
  if(r >= 2) return 1.5;
  if(r >= 1.5) return 1.25;
  if(r >= 1) return 1.1;
  return 1;
}

/* ================= XP ================= */

function recalcXP(){
  const t = today();
  const prog = data.progress[t] || {};
  let xp = 0;

  exercises.forEach(ex => {
    const cur = prog[ex] || 0;
    const goal = dailyGoals[ex];

    const ratio = Math.min(cur / goal, 1);
    const baseXP = ratio * (DAILY_XP_BASE / exercises.length);
    const mult = getMultiplier(cur, goal);

    xp += baseXP * mult;
  });

  xp = Math.min(Math.round(xp), DAILY_XP_CAP);

  const diff = xp - data.dailyXP;
  if(diff > 0){
    data.lifetimeXP += diff;
    updateLevel();
  }

  data.dailyXP = xp;
}

/* ================= WORKOUT ================= */

function logWorkout(){
  const val = Number(document.getElementById("value").value);
  const ex = document.getElementById("exercise").value;
  if(!val || !dailyGoals[ex]) return;

  const t = today();
  data.progress[t] ??= {};
  data.progress[t][ex] = (data.progress[t][ex] || 0) + val;

  if(ex.includes("sec")) data.totalTime += val;

  recalcXP();
  updateStreak();
  saveData();
  document.getElementById("value").value = "";
  updateUI();
}

/* ================= STREAK ================= */

function updateStreak(){
  const t = today();
  const last = data.streak.last;

  if(last !== t){
    if(last && new Date(t) - new Date(last) === 86400000){
      data.streak.count++;
    } else {
      data.streak.count = 1;
    }
    data.streak.last = t;
  }
}

/* ================= RESET ================= */

function resetToday(){
  const t = today();
  data.progress[t] = {};
  data.dailyXP = 0;
  data.totalTime = 0;
  data.todayVictoryShown = false;
  saveData();
  updateUI();
}

/* ================= UI ================= */

function updateUI(){
  document.getElementById("streak").textContent = data.streak.count;
  document.getElementById("totalTime").textContent = data.totalTime;

  // Level UI
  const need = xpForNextLevel(data.level);
  document.getElementById("levelNum").textContent = data.level;
  document.getElementById("levelBar").style.width =
    Math.min((data.lifetimeXP / need) * 100, 100) + "%";
  document.getElementById("levelText").textContent =
    `${data.lifetimeXP} / ${need} XP`;

  // Daily XP UI
  document.getElementById("xpBar").style.width =
    Math.min((data.dailyXP / DAILY_XP_BASE) * 100, 100) + "%";
  document.getElementById("xpText").textContent =
    `XP: ${data.dailyXP} / ${DAILY_XP_BASE} (cap ${DAILY_XP_CAP})`;

  // Progress list
  const list = document.getElementById("progressList");
  list.innerHTML = "";

  let allDone = true;

  exercises.forEach(ex => {
    const cur = data.progress[today()]?.[ex] || 0;
    const goal = dailyGoals[ex];
    if(cur < goal) allDone = false;

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

  if(allDone && !data.todayVictoryShown){
    data.todayVictoryShown = true;
    saveData();
    alert("🎉 Daily goals completed!");
  }
}

/* ================= DARK MODE ================= */

function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
}

/* ================= START ================= */

updateUI();
