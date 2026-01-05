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
  {id:"streak7","name":"Consistent (7 days)",check:d=>d.streak>=7},
  {id:"streak30","name":"Locked In (30 days)",check:d=>d.streak>=30},
  {id:"streak100","name":"Iron Will (100 days)",check:d=>d.streak>=100},
  {id:"plank60","name":"Iron Core (Plank 60s)",check:d=>d.plank>=60},
  {id:"pushups50","name":"Push-Up Pro (50+)",check:d=>d["Push-ups"]>=50},
  {id:"situps50","name":"Sit-Up Star (50+)",check:d=>d["Sit-ups"]>=50},
  {id:"pullups20","name":"Pull-Up Champ (20+)",check:d=>d["Pull-ups"]>=20},
  {id:"squats50","name":"Leg Day Hero (50+)",check:d=>d["Squats"]>=50},
  {id:"calf50","name":"Calf Crusher (50+)",check:d=>d["Calf Raises"]>=50},
  {id:"grip90","name":"Grip Master (90s)",check:d=>d["Grip Strength (sec)"]>=90},
  {id:"butterfly30","name":"Flutter Kicks (30s)",check:d=>d["Butterfly Kicks"]>=30},
  {id:"plankDaily","name":"Plank Daily",check:d=>d["Plank (sec)"]>=60}
];

/* ---------- STORAGE ---------- */
let data = JSON.parse(localStorage.getItem("growthArc")) || {
  streak:{count:0,last:null}, progress:{}, badges:[], metrics:{}, totalTime:0, todayVictoryShown:false
};
function saveData(){localStorage.setItem("growthArc", JSON.stringify(data));}

/* ---------- INIT ---------- */
const exerciseSelect=document.getElementById("exercise");
exercises.forEach(e=>{
  let opt=document.createElement("option"); 
  opt.value=e; opt.textContent=e; 
  exerciseSelect.appendChild(opt);
})

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

    // Milestone cheer
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
  setTimeout(()=>{
    cheer.style.opacity=1;
    cheer.style.transform="translateX(-50%) translateY(-20px)";
  },10);
  setTimeout(()=>{
    cheer.style.opacity=0;
    cheer.style.transform="translateX(-50%) translateY(-50px)";
  },2500);
  setTimeout(()=>document.body.removeChild(cheer),3000);
}

/* ---------- BADGES ---------- */
function updateBadges(){
  const earned=data.badges||[];
  let plankTime=data.progress[today()]?.["Plank (sec)"]||0;
  const todayProgress=data.progress[today()] || {};
  for(let b of badgeList){
    if(!earned.includes(b.id) && b.check({...todayProgress,streak:data.streak.count,plank:plankTime})) {
      earned.push(b.id);
      animateBadge(b.id);
    }
  }
  data.badges=earned;
}

/* Animate newly earned badge */
function animateBadge(badgeId){
  const badgeElems=document.querySelectorAll("#badgeList li");
  badgeElems.forEach(li=>{
    if(li.textContent.includes(badgeList.find(b=>b.id===badgeId).name)){
      li.classList.add("new-badge");
      setTimeout(()=>li.classList.remove("new-badge"),1000);
    }
  });
}

/* ---------- METRICS ---------- */
function saveMetrics(){
  const h = height.value, w = weight.value;
  const armVal = arm.value, thighVal = thigh.value, calfVal = calf.value;
  if(!h || !w) return;
  const monthKey = `metrics-${new Date().toISOString().slice(0,7)}`;
  data.metrics[monthKey] = {height: h, weight: w, arm: armVal, thigh: thighVal, calf: calfVal};
  
  const bmiVal = ((w * 703) / (h * h)).toFixed(1);
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
    const w=canvas.width/streakDates.length*0.8;
    const h=Math.min(data.streak.count*5,100);
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
function launchConfetti(){
  const duration = 2000;
  const end = Date.now() + duration;

  const confettiContainer = document.createElement("canvas");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = "100%";
  confettiContainer.style.height = "100%";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = 2000;
  document.body.appendChild(confettiContainer);

  const ctx = confettiContainer.getContext("2d");
  const w = confettiContainer.width = window.innerWidth;
  const h = confettiContainer.height = window.innerHeight;

  const pieces = [];
  for(let i=0;i<150;i++){
    pieces.push({
      x: Math.random()*w,
      y: Math.random()*h - h,
      r: Math.random()*6+4,
      d: Math.random()*h,
      color: `hsl(${Math.random()*360}, 100%, 50%)`,
      tilt: Math.random()*10-10,
      tiltAngleIncrement: Math.random()*0.07+0.05
    });
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    pieces.forEach(p=>{
      ctx.beginPath();
      ctx.lineWidth = p.r/2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r/4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/4);
      ctx.stroke();
    });
    update();
  }

  function update(){
    const now = Date.now();
    if(now>end){
      document.body.removeChild(confettiContainer);
      return;
    }
    pieces.forEach(p=>{
      p.y += 3;
      p.tilt += p.tiltAngleIncrement;
      if(p.y>h) p.y = -10;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- DAILY SUMMARY ---------- */
function showDailySummary(){
  const summary=document.createElement("div");
  summary.style.position="fixed";
  summary.style.top="50%";
  summary.style.left="50%";
  summary.style.transform="translate(-50%,-50%)";
  summary.style.background="#4a90e2";
  summary.style.color="white";
  summary.style.padding="20px 30px";
  summary.style.borderRadius="12px";
  summary.style.zIndex=3000;
  summary.style.maxWidth="90%";
  summary.style.boxShadow="0 0 15px rgba(0,0,0,0.5)";
  summary.style.textAlign="center";

  const title=document.createElement("h2");
  title.textContent="📊 Daily Summary";
  summary.appendChild(title);

  const totalTimeEl=document.createElement("p");
  totalTimeEl.textContent=`Total Time Today: ${data.totalTime} sec`;
  summary.appendChild(totalTimeEl);

  const exerciseList=document.createElement("ul");
  for(let ex of exercises){
    const li=document.createElement("li");
    const cur=data.progress[today()]?.[ex]||0;
    li.textContent=`${ex}: ${cur} / ${dailyGoals[ex]}`;
    exerciseList.appendChild(li);
  }
  summary.appendChild(exerciseList);

  const todayBadges = badgeList.filter(b => data.badges.includes(b.id));
  if(todayBadges.length>0){
    const badgeTitle=document.createElement("p");
    badgeTitle.textContent="🏆 Badges Earned:";
    summary.appendChild(badgeTitle);
    const badgeListEl=document.createElement("ul");
    todayBadges.forEach(b=>{
      const li=document.createElement("li");
      li.textContent=b.name;
      badgeListEl.appendChild(li);
    });
    summary.appendChild(badgeListEl);
  }

  const streakEl=document.createElement("p");
  streakEl.textContent=`🔥 Current Streak: ${data.streak.count} days`;
  summary.appendChild(streakEl);

  const closeBtn=document.createElement("button");
  closeBtn.textContent="Close";
  closeBtn.style.marginTop="10px";
  closeBtn.onclick=()=>document.body.removeChild(summary);
  summary.appendChild(closeBtn);

  document.body.appendChild(summary);
}

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
