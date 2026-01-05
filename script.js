/* ---------- CONFIG ---------- */
const exercises=[
  "Push-ups","Sit-ups","Pull-ups","Squats","Calf Raises",
  "Grip Strength Left (sec)","Grip Strength Right (sec)",
  "Plank (sec)","Butterfly Kicks"
];

const dailyGoals={
  "Push-ups":100,
  "Sit-ups":50,
  "Pull-ups":50,
  "Squats":50,
  "Calf Raises":50,
  "Grip Strength Left (sec)":90,
  "Grip Strength Right (sec)":90,
  "Plank (sec)":60,
  "Butterfly Kicks":30
};

/* ---------- BADGES ---------- */
const badgeList=[
  {id:"first","name":"First Step",check:d=>d.completed>=1},
  {id:"streak7","name":"Consistent (7 days)",check:d=>d.streak>=7},
  {id:"streak30","name":"Locked In (30 days)",check:d=>d.streak>=30},
  {id:"streak100","name":"Iron Will (100 days)",check:d=>d.streak>=100},
  {id:"plank60","name":"Iron Core (Plank 60s)",check:d=>d["Plank (sec)"]>=60},
  {id:"pushups50","name":"Push-Up Pro (50+)",check:d=>d["Push-ups"]>=50},
  {id:"situps50","name":"Sit-Up Star (50+)",check:d=>d["Sit-ups"]>=50},
  {id:"pullups20","name":"Pull-Up Champ (20+)",check:d=>d["Pull-ups"]>=20},
  {id:"squats50","name":"Leg Day Hero (50+)",check:d=>d["Squats"]>=50},
  {id:"calf50","name":"Calf Crusher (50+)",check:d=>d["Calf Raises"]>=50},
  {id:"gripLeft90","name":"Left-Hand Grip Master (90s)",check:d=>d["Grip Strength Left (sec)"]>=90},
  {id:"gripRight90","name":"Right-Hand Grip Master (90s)",check:d=>d["Grip Strength Right (sec)"]>=90},
  {id:"butterfly30","name":"Flutter Kicks (30s)",check:d=>d["Butterfly Kicks"]>=30},
  {id:"plankDaily","name":"Plank Daily",check:d=>d["Plank (sec)"]>=60}
];

/* ---------- STORAGE ---------- */
let data = JSON.parse(localStorage.getItem("growthArc")) || {
  streak:{count:0,last:null},
  progress:{}, badges:[], totalTime:0, todayVictoryShown:false,
  xp:0, xpGoal:100
};
function saveData(){localStorage.setItem("growthArc", JSON.stringify(data));}

/* ---------- INIT ---------- */
const exerciseSelect=document.getElementById("exercise");
exercises.forEach(e=>{
  let opt=document.createElement("option"); 
  opt.value=e; opt.textContent=e; 
  exerciseSelect.appendChild(opt);
});

/* ---------- HELPERS ---------- */
const today=()=>new Date().toISOString().split("T")[0];

/* ---------- WORKOUT ---------- */
function logWorkout(){
  const val=Number(document.getElementById("value").value);
  const ex=document.getElementById("exercise").value;
  if(!val) return;

  data.progress[today()] ??= {};
  data.progress[today()][ex] = (data.progress[today()][ex]||0) + val;
  data.totalTime += ex.includes("sec")? val : 0;

  // XP: proportional to daily goal
  const goal = dailyGoals[ex];
  const xpEarned = Math.min(val / goal * 10, 10); // max 10 XP per exercise log
  data.xp += xpEarned;
  if(data.xp > data.xpGoal) data.xp = data.xpGoal; // cap at daily XP goal

  updateStreak(true);
  saveData();
  document.getElementById("value").value="";
  updateUI();
}

/* ---------- UPDATE UI ---------- */
function updateUI(){
  document.getElementById("streak").textContent=data.streak.count||0;
  document.getElementById("totalTime").textContent=data.totalTime;

  // XP Bar
  const xpPercent = Math.min((data.xp / data.xpGoal)*100, 100);
  document.getElementById("xpBar").style.width = xpPercent + "%";
  document.getElementById("xpText").textContent = `XP: ${Math.floor(data.xp)} / ${data.xpGoal}`;

  // Exercise Progress Bars
  const progList=document.getElementById("progressList");
  progList.innerHTML="";
  let allDone = true;
  for(let ex of exercises){
    const cur=data.progress[today()]?.[ex]||0;
    const goal=dailyGoals[ex];
    const percent=Math.min((cur/goal)*100,100);
    if(cur<goal) allDone=false;

    const li=document.createElement("li");
    const text=document.createElement("div");
    text.textContent=`${ex}: ${cur} / ${goal}`;
    li.appendChild(text);

    const barContainer=document.createElement("div");
    barContainer.style.width="100%";
    barContainer.style.height="12px";
    barContainer.style.background="#ccc";
    barContainer.style.borderRadius="6px";
    barContainer.style.overflow="hidden";

    const bar=document.createElement("div");
    bar.style.width=`${percent}%`;
    bar.style.height="100%";
    bar.style.background = percent>=100?"#27ae60":"#4a90e2";
    barContainer.appendChild(bar);
    li.appendChild(barContainer);
    progList.appendChild(li);
  }

  // Badges
  updateBadges();
  const badgeElem=document.getElementById("badgeList");
  badgeElem.innerHTML="";
  for(let b of badgeList){
    const li=document.createElement("li");
    li.textContent=data.badges.includes(b.id)?`🏆 ${b.name}`:`⬜ ${b.name}`;
    badgeElem.appendChild(li);
  }

  // Full daily completion
  if(allDone && !data.todayVictoryShown){
    launchConfetti();
    data.todayVictoryShown=true;
    saveData();
    showDailySummary();
  }
}

/* ---------- DARK MODE ---------- */
function toggleDarkMode(){document.body.classList.toggle("dark-mode");}

/* ---------- REMAINING FUNCTIONS ---------- */
// launchConfetti(), showDailySummary(), updateStreak(), showStreakCheer(), updateBadges()
// ...can remain the same as before
