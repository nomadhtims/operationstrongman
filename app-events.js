function bindGlobal(){
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const [weekId,dayId]=b.dataset.start.split('|');view.workout={weekId,dayId};render();window.scrollTo(0,0);});
  document.querySelectorAll('[data-week]').forEach(b=>b.onclick=()=>{view.weekId=b.dataset.week;render();});
  document.querySelectorAll('[data-back-program]').forEach(b=>b.onclick=()=>{view.workout=null;view.page='program';setActiveNav('program');render();});
  document.querySelectorAll('[data-readiness]').forEach(sel=>sel.onchange=()=>{const t=localISO();data.readiness[t]||={sleep:3,energy:3,soreness:3,stress:3};data.readiness[t][sel.dataset.readiness]=Number(sel.value);saveData();render();});

  if(view.workout){
    const {weekId,dayId}=view.workout,week=getWeek(weekId),day=week.days.find(d=>d.id===dayId),s=sessionFor(weekId,dayId);
    document.querySelectorAll('[data-warmup]').forEach(btn=>btn.onclick=()=>{s.warmup[btn.dataset.warmup]=!s.warmup[btn.dataset.warmup];saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();});
    document.querySelectorAll('.set-row').forEach(row=>{
      const eId=row.dataset.exercise,idx=Number(row.dataset.index),exercise=day.exercises.find(e=>e.id===eId),prescribed=exercise?.sets?.[idx]||{};
      s.exercises[eId]||=[];
      const entry=s.exercises[eId][idx]||={};
      if(entry.asPlanned===undefined){
        const wDiff=entry.weight!==''&&entry.weight!=null&&prescribed.weight!==''&&prescribed.weight!=null&&Number(entry.weight)!==Number(prescribed.weight);
        const rDiff=entry.reps!==''&&entry.reps!=null&&prescribed.reps!==''&&prescribed.reps!=null&&String(entry.reps)!==String(prescribed.reps);
        entry.asPlanned=!(wDiff||rDiff);
      }
      const rpe=row.querySelector('.actual-rpe'), actualWeight=row.querySelector('.actual-weight'), actualReps=row.querySelector('.actual-reps');
      const saveRpe=()=>{entry.rpe=rpe?.value||'';saveData();}; if(rpe)rpe.onchange=saveRpe;
      if(actualWeight)actualWeight.onchange=()=>{entry.weight=actualWeight.value;saveData();};
      if(actualReps)actualReps.onchange=()=>{entry.reps=actualReps.value;saveData();};
      row.querySelector('.plan-status')?.addEventListener('click',()=>{
        entry.asPlanned=entry.asPlanned===false;
        entry.done=false;
        if(entry.asPlanned){entry.weight=prescribed.weight??'';entry.reps=prescribed.reps??'';}
        else {entry.weight='';entry.reps='';}
        entry.rpe=rpe?.value||entry.rpe||'';
        saveData(); renderWorkout(document.getElementById('main'),weekId,dayId); bindGlobal();
      });
      row.querySelector('.set-complete')?.addEventListener('click',()=>{
        entry.rpe=rpe?.value||entry.rpe||'';
        if(entry.done){entry.done=false;saveData();renderWorkout(document.getElementById('main'),weekId,dayId);bindGlobal();return;}
        if(entry.asPlanned!==false){
          entry.asPlanned=true; entry.weight=prescribed.weight??''; entry.reps=prescribed.reps??'';
        } else {
          entry.weight=actualWeight?.value||entry.weight||''; entry.reps=actualReps?.value||entry.reps||'';
          if(entry.weight==='' || entry.reps===''){alert('Enter the actual weight and reps for a set that was not completed as planned.');return;}
        }
        entry.done=true; saveData(); renderWorkout(document.getElementById('main'),weekId,dayId); bindGlobal();
      });
    });
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
