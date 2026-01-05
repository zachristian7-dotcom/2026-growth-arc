/* ---------- CONFIG ---------- */
const exercises=[
  "Push-ups","Sit-ups","Pull-ups","Squats","Calf Raises",
  "Grip Strength (sec)","Plank (sec)","Butterfly Kicks"
];
const dailyGoals={
  "Push-ups":100,
  "Sit-ups":50,
  "Pull-ups":50,
  "Squats":50,
  "Calf Raises":50,
  "Grip Strength (sec)":90,
  "Plank (sec)":60,
  "Butterfly Kicks":30
};

const badgeList=[
  {id:"first","name":"First Step",check:d=>d.completed>=1},
  {id:"streak7","name":"Consistent",check:d=>d.streak>=7},
  {id:"streak30","name":"Locked In",check:d=>d.streak>=30},
  {id:"plank60","name":"Iron Core",check:d=>d.plank>=60}
];

/* ---------- STORAGE ---------- */
let data = JSON.parse(localStorage.getItem("growthArc")) || {
  streak:{count:0,last:null}, progress:{}, badges:[], metrics:{}, totalTime:0
};
function saveData(){localStorage.setItem("growthArc", JSON.stringify(data));}

/* ---------- INIT ---------- */
const exerciseSelect=document.getElementById("exercise");
exercises.forEach(e=>{let opt=document.createElement("option"); opt.value=e; opt.textContent=e; exerciseSelect.appendChild(opt);})

/* ---------- HELPERS ---------- */
const today=()=>new Date().toISOString().split("T")[0];

/* ---------- WORKOUT ---------- */
function logWorkout(){
  const val=Number(document.getElementById("value").value);
  const ex=document.getElementById("exercise").value;
  if(!val) return;
  data.progress[today()]??={};
  data.progress[today()][ex]=(data.progress[today()][ex]||0)+val;
  data.totalTime+=ex.includes("sec")?val:0;

  updateStreak(true);
  saveData();
  document.getElementById("value").value="";
  updateUI();
}

/* ---------- STREAK ---------- */
function updateStreak(loggedToday=false){
  data.streak=data.streak||{count:0,last:null};
  const t=today();
  if(data.streak.last!==t){
    if(data.streak.last && new Date(t)-new Date(data.streak.last)===86400000) data.streak.count++;
    else data.streak.count=1;
    data.streak.last=t;
    if(loggedToday) alert(`🔥 Streak: ${data.streak.count} days!`);
  }
}

/* ---------- BADGES ---------- */
function updateBadges(){
  const earned=data.badges||[];
  let plankTime=data.progress[today()]?.["Plank (sec)"]||0;
  for(let b of badgeList){
    if(!earned.includes(b.id) && b.check({completed:1,streak:data.streak.count,plank:plankTime})) earned.push(b.id);
  }
  data.badges=earned;
}

/* ---------- METRICS ---------- */
function saveMetrics(){
  const h = height.value, w = weight.value;
  const armVal = arm.value, thighVal = thigh.value, calfVal = calf.value;
  if(!h || !w) return;
  const monthKey = `metrics-${new Date().toISOString().slice(0,7)}`;
  data.metrics[monthKey] = {height: h, weight: w, arm: armVal, thigh: thighVal, calf: calfVal};
  
  // ✅ Correct BMI calculation for inches/lbs
  const bmiVal = ((w * 703) / (h * h)).toFixed(1);
  document.getElementById("bmi").textContent = `BMI: ${bmiVal}`;
  
  saveData();
}

/* ---------- DASHBOARD ---------- */
const tooltip=document.getElementById("tooltip");

function drawGrowthDashboard(){
  const canvas=document.getElementById("growthDashboard");
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Streak bar
  const streakDates=Object.keys(data.progress).sort();
  streakDates.forEach((d,i)=>{
    const w=canvas.width/streakDates.length*0.8;
    const h=Math.min(data.streak.count*5,100);
    ctx.fillStyle="#f39c12";
    ctx.fillRect(i*(canvas.width/streakDates.length),50,w,h);
  });

  // Metrics lines
  const months=Object.keys(data.metrics).sort();
  if(months.length>0){
    const metrics=["weight","arm","thigh","calf","bmi"];
    const colors={weight:"#4a90e2",arm:"#f39c12",thigh:"#27ae60",calf:"#e74c3c",bmi:"#8e44ad"};
    const maxVal=Math.max(...months.map(m=>{
      const vals=data.metrics[m];
      return Math.max(vals.weight,vals.arm,vals.thigh,vals.calf,((vals.weight*703)/(vals.height*vals.height)).toFixed(1));
    }));
    metrics.forEach(metric=>{
      ctx.strokeStyle=colors[metric];
      ctx.beginPath();
      months.forEach((m,i)=>{
        let val=metric==="bmi"?((data.metrics[m].weight*703)/(data.metrics[m].height*data.metrics[m].height)):data.metrics[m][metric];
        const x=i*(canvas.width/months.length)+10;
        const y=canvas.height-(val/maxVal*100)-50;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();
    });
  }
}

/* ---------- UI ---------- */
function updateUI(){
  document.getElementById("streak").textContent=data.streak.count||0;
  document.getElementById("totalTime").textContent=data.totalTime;

  const progList=document.getElementById("progressList");
  progList.innerHTML="";
  for(let ex of exercises){
    const cur=data.progress[today()]?.[ex]||0;
    const li=document.createElement("li");
    li.textContent=`${ex}: ${cur} / ${dailyGoals[ex]}`;
    progList.appendChild(li);
  }

  updateBadges();
  const badgeElem=document.getElementById("badgeList");
  badgeElem.innerHTML="";
  for(let b of badgeList){
    const li=document.createElement("li");
    li.textContent=data.badges.includes(b.id)?`🏆 ${b.name}`:`⬜ ${b.name}`;
    badgeElem.appendChild(li);
  }

  drawGrowthDashboard();
}

/* ---------- DARK MODE ---------- */
function toggleDarkMode(){document.body.classList.toggle("dark-mode");}

/* ---------- DAILY REMINDER ---------- */
function dailyReminder(){
  if(!("Notification" in window)) return;
  if(Notification.permission!=="granted") Notification.requestPermission();
  const now=new Date(),target=new Date(); target.setHours(15,0,0,0);
  if(now>target) target.setDate(target.getDate()+1);
  const delay=target-now;
  setTimeout(function notifyAndRepeat(){
    if(Notification.permission==="granted") new Notification("Growth Arc Reminder",{body:"Time to complete your daily workout goals!"});
    setTimeout(notifyAndRepeat,24*60*60*1000);
  },delay);
}

dailyReminder();
updateUI();
