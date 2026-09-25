function bindGlobal(){
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const [weekId,dayId]=b.dataset.start.split('|');view.workout={weekId,dayId};render();window.scrollTo(0,0);});
  document.querySelectorAll('[data-week]').forEach(b=>b.onclick=()=>{view.weekId=b.dataset.week;render();});
  document.querySelectorAll('[data-back-program]').forEach(b=>b.onclick=()=>{view.workout=null;view.page='program';setActiveNav('program');render();});
  document.querySelectorAll('[data-readiness]').forEach(sel=>sel.onchange=()=>{const t=localISO();data.readiness[t]||={sleep:3,energy:3,soreness:3,stress:3};data.readiness[t][sel.dataset.readiness]=Number(sel.value);saveData();render();});

  if(view.workout){
    const {weekId,dayId}=view.workout,week=getWeek(weekId),day=week.days.find(d=>d.id===dayId),s=sessionFor(weekId,dayId);
    document.querySelectorAll('[data-warmup]').forEach(btn=>btn.onclick=()=>{s.warmup[btn.dataset.warmup]=!s.warmup[btn.dataset.warmup];saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();});
    document.querySelectorAll('.set-row').forEach(row=>{const eId=row.dataset.exercise,idx=Number(row.dataset.index);s.exercises[eId]||=[];const write=()=>{const entry=s.exercises[eId][idx]||={};entry.weight=row.querySelector('.actual-weight').value;entry.reps=row.querySelector('.actual-reps').value;entry.rpe=row.querySelector('.actual-rpe').value;saveData();};row.querySelectorAll('input').forEach(i=>i.onchange=write);row.querySelector('.set-complete').onclick=()=>{write();const entry=s.exercises[eId][idx]||={};entry.done=!entry.done;if(entry.done){const prescribed=day.exercises.find(e=>e.id===eId)?.sets[idx];if(!entry.weight&&prescribed?.weight!==''&&prescribed?.weight!=null)entry.weight=prescribed.weight;if(!entry.reps&&prescribed?.reps&&!String(prescribed.reps).includes('-'))entry.reps=prescribed.reps;}saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();};});
    const cMin=document.getElementById('cardioMinutes'), cRpe=document.getElementById('cardioRpe');
    const saveCardio=()=>{s.cardio.minutes=cMin?.value||'';s.cardio.rpe=cRpe?.value||'';saveData();}; if(cMin)cMin.onchange=saveCardio;if(cRpe)cRpe.onchange=saveCardio;
    document.getElementById('cardioDone')?.addEventListener('click',()=>{saveCardio();s.cardio.done=!s.cardio.done;saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();});
    const note=document.getElementById('sessionNote');if(note)note.onchange=()=>{s.sessionNote=note.value;saveData();};
    document.querySelectorAll('[data-complete-session]').forEach(b=>b.onclick=()=>{s.completedAt=s.completedAt?null:new Date().toISOString();saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();});
  }

  document.getElementById('saveTargets')?.addEventListener('click',()=>{['competitionDate','logPB','logTarget','deadliftPB','deadliftTarget'].forEach(id=>{const el=document.getElementById(id);data.profile[id]=id==='competitionDate'?el.value:Number(el.value)||0;});saveData();render();});
  document.getElementById('exportPlan')?.addEventListener('click',()=>downloadJSON(activePlan,`${activePlan.id}.json`));
  document.getElementById('importPlan')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const plan=validatePlan(JSON.parse(await file.text()));activePlan=plan;PROGRAM=plan.weeks;localStorage.setItem(PLAN_STORAGE_KEY,JSON.stringify(plan));syncProfileFromPlan();view={page:'program',weekId:getCurrentWeek().id,workout:null};setActiveNav('program');alert(`Programme imported: ${plan.name}`);render();}catch(err){alert(`Plan import failed: ${err.message}`);}});
  document.getElementById('resetPlan')?.addEventListener('click',async()=>{if(!confirm('Restore the bundled competition plan as the active programme? Your logged training will be kept.'))return;try{activePlan=await fetchBundledPlan();PROGRAM=activePlan.weeks;localStorage.setItem(PLAN_STORAGE_KEY,JSON.stringify(activePlan));syncProfileFromPlan();view.weekId=getCurrentWeek().id;render();}catch(err){alert(err.message);}});
  document.getElementById('exportData')?.addEventListener('click',()=>downloadJSON({appVersion:APP_VERSION,exportedAt:new Date().toISOString(),plan:activePlan,data},`operation-strongman-backup-${localISO()}.json`));
  document.getElementById('importData')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(parsed.plan){activePlan=validatePlan(parsed.plan);PROGRAM=activePlan.weeks;localStorage.setItem(PLAN_STORAGE_KEY,JSON.stringify(activePlan));}data={...defaultData(),...(parsed.data||parsed),profile:{...planProfile(activePlan),...((parsed.data||parsed).profile||{})}};saveData();view.weekId=getCurrentWeek().id;alert('Backup imported.');render();}catch(err){alert(`Backup import failed: ${err.message}`);}});
  document.getElementById('resetData')?.addEventListener('click',()=>{if(confirm('Clear all logged training, warm-ups, cardio, readiness and notes?')){data=defaultData();saveData();render();}});
}

document.addEventListener('click',e=>{const nav=e.target.closest('[data-nav]');if(nav)navigate(nav.dataset.nav);});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn')?.classList.remove('hidden');});
document.getElementById('installBtn')?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById('installBtn')?.classList.add('hidden');});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));}

(async function boot(){
  try{activePlan=await loadActivePlan();PROGRAM=activePlan.weeks;data=loadData();view.weekId=getCurrentWeek()?.id||PROGRAM[0]?.id;setActiveNav('home');render();}
  catch(err){document.getElementById('main').innerHTML=`<div class="card"><h2>Could not load the programme</h2><p class="muted">${esc(err.message)}</p></div>`;}
})();
