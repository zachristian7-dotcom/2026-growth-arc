/* ---------- CONFIG ---------- */
const baseGoals={
  "Push-ups":40,"Sit-ups":40,"Pull-ups":10,"Squats":60,"Calf Raises":60,
  "Grip Strength (sec)":90,"Plank (sec)":90,"Butterfly Kicks":50
};
const badgeList=[
  {id:"first",name:"First Step",check:d=>d.completed>=1},
  {id:"streak7",name:"Consistent",check:d=>d.streak>=7},
  {id:"streak30",name:"Locked In",check:d=>d.streak>=30},
  {id:"plank120",name:"Iron Core",check:d=>d.plank>=120},
  {id:"level5",name:"Level Up",check:d=>d.level>=5}
];

/* ---------- STORAGE ---------- */
let data = JSON.parse(localStorage.getItem("growthArc")) || {
  xp:0, streak:{count:0,last:null}, progress:{}, badges:[], metrics:{}
};
function saveData(){localStorage.setItem("growthArc", JSON.stringify(data));}

/* ---------- HELPERS ---------- */
const today = ()=>new Date().toISOString().split("T")[0];
function levelFromXP(xp){let lvl=1;while(xp>=lvl*lvl*50) lvl++; return lvl-1;}
function scaledGoals(level){let mult=1;if(level>=10) mult=1.45; else if(level>=7) mult=1.3; else if(level>=4) mult=1.15; const g={}; for(let k in baseGoals) g[k]=Math.round(baseGoals[k]*mult); return g;}

/* ---------- WORKOUT ---------- */
function logWorkout(){
  const val=Number(document.getElementById("value").value);
  const ex=document.getElementById("exercise").value;
  if(!val) return;
  data.progress[today()]??={};
  data.progress[today()][ex]=(data.progress[today()][ex]||0)+val;

  const oldXP=data.xp;
  const lvl=levelFromXP(data.xp);
  const goals=scaledGoals(lvl);

  if(data.progress[today()][ex]>=goals[ex]) data.xp+=20;
  if(Object.keys(goals).every(e=>data.progress[today()][e]>=goals[e])) data.xp+=50;

  const newLevel=levelFromXP(data.xp);
  if(newLevel>lvl) alert(`🎮 Level up! You reached Level ${newLevel}`);

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
    if(loggedToday) alert(`🔥 You’re on a ${data.streak.count}-day streak!`);
  }
}

/* ---------- BADGES ---------- */
function updateBadges(){
  const earned=data.badges||[];
  let completed=0;
  let plankTime=data.progress[today()]?.["Plank (sec)"]||0;
  for(let b of badgeList){if(!earned.includes(b.id) && b.check({completed,streak:data.streak.count,plank:plankTime,level:levelFromXP(data.xp)})) earned.push(b.id);}
  data.badges=earned;
}

/* ---------- METRICS ---------- */
function saveMetrics(){
  const h=height.value/100,w=weight.value;
  const armVal=arm.value,thighVal=thigh.value,calfVal=calf.value;
  if(!h||!w) return;
  const monthKey=`metrics-${new Date().toISOString().slice(0,7)}`;
  data.metrics[monthKey]={height:h*100,weight:w,arm:armVal,thigh:thighVal,calf:calfVal};
  const bmiVal=(w/(h*h)).toFixed(1);
  document.getElementById("bmi").textContent=`BMI (info only): ${bmiVal}`;
  saveData();
}

/* ---------- GROWTH DASHBOARD ---------- */
const tooltip=document.getElementById("tooltip");

function drawGrowthDashboard(){
  const canvas=document.getElementById("growthDashboard");
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const mouse={x:0,y:0};
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;
    mouse.y=e.clientY-rect.top;
    updateTooltip(canvas,ctx,mouse);
  };
  canvas.onmouseleave=()=>tooltip.style.display="none";

  // XP Bar
  const lvl=levelFromXP(data.xp);
  const currentLevelXP=lvl*lvl*50;
  const nextLevelXP=(lvl+1)*(lvl+1)*50;
  const xpPercent=Math.min(((data.xp-currentLevelXP)/(nextLevelXP-currentLevelXP))*100,100);
  ctx.fillStyle="#4a90e2";
  ctx.fillRect(0,10,canvas.width*xpPercent/100,20);
  ctx.fillStyle="#000";
  ctx.fillText(`XP Progress: ${data.xp}`,5,25);

  // Streak Bars
  const streakDates=Object.keys(data.progress).sort();
  const barBase=50;
  streakDates.forEach((d,i)=>{
    const barWidth=canvas.width/streakDates.length*0.8;
    const h=Math.min(data.streak.count*5,100);
    ctx.fillStyle="#f39c12";
    ctx.fillRect(i*(canvas.width/streakDates.length),barBase,h,barWidth);
  });

  // Metrics Lines
  const months=Object.keys(data.metrics).sort();
  if(months.length>0){
    const metrics=["weight","arm","thigh","calf","bmi"];
    const colors={weight:"#4a90e2",arm:"#f39c12",thigh:"#27ae60",calf:"#e74c3c",bmi:"#8e44ad"};
    const maxVal=Math.max(...months.map(m=>{
      const vals=data.metrics[m];
      return Math.max(vals.weight,vals.arm,vals.thigh,vals.calf,(vals.weight/(vals.height/100)**2).toFixed(1));
    }));

    metrics.forEach(metric=>{
      ctx.strokeStyle=colors[metric];
      ctx.beginPath();
      months.forEach((m,i)=>{
        let val=metric==="bmi"?data.metrics[m].weight/(data.metrics[m].height/100)**2:data.metrics[m][metric];
        const x=i*(canvas.width/months.length)+10;
        const y=canvas.height-(val/maxVal*100)-50;
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      });
      ctx.stroke();
    });
  }
}

/* ---------- UI ---------- */
function updateUI(){
  document.getElementById("level").textContent=levelFromXP(data.xp);
  document.getElementById("xp").textContent=data.xp;
  document.getElementById("streak").textContent=data.streak.count||0;

  const lvl=levelFromXP(data.xp);
  const currentLevelXP=lvl*lvl*50;
  const nextLevelXP=(lvl+1)*(lvl+1)*50;
  const xpIntoLevel=data.xp-currentLevelXP;
  const xpForLevel=nextLevelXP-currentLevelXP;
  const percent=Math.min((xpIntoLevel/xpForLevel)*100,100);
  document.getElementById("xpGraph").style.width=percent+"%";
  document.getElementById("xpGraphText").textContent=`${xpIntoLevel} / ${xpForLevel} XP`;

  const goals=scaledGoals(lvl);
  const progList=document.getElementById("progressList");
  progList.innerHTML="";
  for(let ex in goals){
    const cur=data.progress[today()]?.[ex]||0;
    const li=document.createElement("li");
    li.textContent=`${ex}: ${cur} / ${goals[ex]}`;
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
    if(Notification.permission==="granted") new Notification("Growth Arc Reminder",{body:"Time to complete your daily quotas!"});
    setTimeout(notifyAndRepeat,24*60*60*1000);
  },delay);
}

dailyReminder();
updateUI();
