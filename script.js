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
  progress:{}, badges:[], metrics:{}, totalTime:0, todayVictoryShown:false
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
  data.totalTime += ex.includes("sec") ? val : 0;

  updateStreak(true);
  saveData();
  document.getElementById("value").value="";
  updateUI();
}

/* ---------- STREAK ---------- */
function updateStreak(loggedToday=false){
  data.streak ??= {count:0,last:null};
  const t = today();
  if(data.streak.last !== t){
    if(data.streak.last && new Date(t) - new Date(data.streak.last) === 86400000) data.streak.count++;
    else data.streak.count = 1;
    data.streak.last = t;
    if(loggedToday) alert(`🔥 Streak: ${data.streak.count} days!`);
    if([7,30,100].includes(data.streak.count)) showStreakCheer(data.streak.count);
  }
}

/* ---------- STREAK CHEER ---------- */
function showStreakCheer(days){
  const cheer=document.createElement("div");
  cheer.textContent=`🎉 Streak ${days} days! 🎉`;
  cheer.style.position="fixed";
  cheer.style.top="20%";
  cheer.style.left="50%";
  cheer.style.transform="translateX(-50%)";
  cheer.style.background="#f39c12";
  cheer.style.color="white";
  cheer.style.padding="20px 40px";
  cheer.style.fontSize="1.5rem";
  cheer.style.borderRadius="12px";
  cheer.style.zIndex=1000;
  cheer.style.opacity=0;
  cheer.style.transition="opacity 0.5s ease, transform 0.5s ease";
  document.body.appendChild(cheer);
  setTimeout(()=>{ cheer.style.opacity=1; cheer.style.transform="translateX(-50%) translateY(-20px)"; },10);
  setTimeout(()=>{ cheer.style.opacity=0; cheer.style.transform="translateX(-50%) translateY(-50px)"; },2500);
  setTimeout(()=>document.body.removeChild(cheer),3000);
}

/* ---------- BADGES ---------- */
function updateBadges(){
  const earned=data.badges||[];
  const todayProgress = data.progress[today()] || {};
  for(let b of badgeList){
    if(!earned.includes(b.id) && b.check({...todayProgress, streak:data.streak.count})) {
      earned.push(b.id);
      animateBadge(b.id);
    }
  }
  data.badges = earned;
}

/* ---------- METRICS ---------- */
function saveMetrics(){
  const h = height.value, w = weight.value;
  const armVal = arm.value, thighVal = thigh.value, calfVal = calf.value;
  if(!h || !w) return;
  const monthKey = `metrics-${new Date().toISOString().slice(0,7)}`;
  data.metrics[monthKey] = {height:h, weight:w, arm:armVal, thigh:thighVal, calf:calfVal};
  const bmiVal = ((w*703)/(h*h)).toFixed(1);
  document.getElementById("bmi").textContent = `BMI: ${bmiVal}`;
  saveData();
}

/* ---------- DASHBOARD ---------- */
function drawGrowthDashboard(){
  const canvas=document.getElementById("growthDashboard");
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const streakDates=Object.keys(data.progress).sort();
  streakDates.forEach((d,i)=>{
    const w = canvas.width/streakDates.length*0.8;
    const h = Math.min(data.streak.count*5,100);
    ctx.fillStyle="#f39c12";
    ctx.fillRect(i*(canvas.width/streakDates.length),50,w,h);
  });

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

/* ---------- CONFETTI ---------- */
function launchConfetti(){ /* ...same as before... */ }

/* ---------- DAILY SUMMARY ---------- */
function showDailySummary(){ /* ...same as before... */ }

/* ---------- UPDATE UI ---------- */
function updateUI(){
  document.getElementById("streak").textContent=data.streak.count||0;
  document.getElementById("totalTime").textContent=data.totalTime;

  const progList=document.getElementById("progressList");
  progList.innerHTML="";
  let allDone = true;
  for(let ex of exercises){
    const cur=data.progress[today()]?.[ex]||0;
    const goal=dailyGoals[ex];
    const percent=Math.min((cur/goal)*100,100);
    if(cur<goal) allDone=false;

    const li=document.createElement("li");
    li.style.marginBottom="8px";

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
    bar.style.transition="width 0.3s ease";
    barContainer.appendChild(bar);

    li.appendChild(barContainer);
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

  if(allDone && !data.todayVictoryShown){
    launchConfetti();
    data.todayVictoryShown=true;
    saveData();
    showDailySummary();
  }

  drawGrowthDashboard();
}

/* ---------- DARK MODE ---------- */
function toggleDarkMode(){document.body.classList.toggle("dark-mode");}

/* ---------- DAILY REMINDER ---------- */
function dailyReminder(){ /* ...same as before... */ }

dailyReminder();
updateUI();
