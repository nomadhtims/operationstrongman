const APP_VERSION = '2.2.0';
const STORAGE_KEY = 'strongman-peak-data-v1'; // Keep the old key so existing logs can migrate.
const PLAN_STORAGE_KEY = 'operation-strongman-active-plan-v2';
const BUNDLED_PLAN_URL = './default-plan-meta.json';

let activePlan = null;
let PROGRAM = [];
let data = null;
let view = { page:'home', weekId:null, workout:null };
let deferredPrompt = null;

function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }
function localISO(d = new Date()) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function fmtDate(iso){ if(!iso) return '—'; return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
function downloadJSON(obj, filename){ const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); }


function normalisePlanConstraints(plan){
  const minLog=Number(plan?.constraints?.logMinKg||80);
  if(!minLog) return plan;
  for(const week of plan.weeks||[]){
    for(const day of week.days||[]){
      const logExercise=(day.exercises||[]).find(e=>e.name?.toLowerCase().includes('log') && (e.sets||[]).some(s=>Number(s.weight)>0));
      const firstLogWeight=logExercise ? Number((logExercise.sets||[]).find(s=>Number(s.weight)>0)?.weight||0) : 0;
      for(const item of day.warmup||[]){
        if(!item.name?.toLowerCase().includes('log')) continue;
        if(firstLogWeight && firstLogWeight<=minLog){
          item.prescription=`${minLog} kg is the empty log; use the first 1–2 programmed singles as the specific warm-up after movement prep`;
        } else if(firstLogWeight){
          item.prescription=`${minLog} kg × 2–3 crisp reps/singles, then make sensible jumps to ${firstLogWeight} kg`;
        } else {
          item.prescription=`Start with the empty ${minLog} kg log; no loaded log work below this`;
        }
        item.note=`Empty log = ${minLog} kg. Use the mobility/activation drills before touching the implement.`;
      }
    }
  }
  return plan;
}

function validatePlan(plan){
  if(!plan || typeof plan !== 'object') throw new Error('Plan must be a JSON object.');
  if(!plan.id || !plan.name) throw new Error('Plan needs an id and name.');
  if(!Array.isArray(plan.weeks) || !plan.weeks.length) throw new Error('Plan needs a non-empty weeks array.');
  for(const week of plan.weeks){
    if(!week.id || !Array.isArray(week.days)) throw new Error(`Week ${week.label || week.id || '?'} is missing id/days.`);
    for(const day of week.days){
      if(!day.id || !day.name || !Array.isArray(day.exercises)) throw new Error(`A day in ${week.label || week.id} is missing id/name/exercises.`);
      day.warmup ||= [];
      for(const exercise of day.exercises){
        if(!exercise.id || !exercise.name || !Array.isArray(exercise.sets)) throw new Error(`Exercise in ${day.name} is missing id/name/sets.`);
        const minLog=Number(plan.constraints?.logMinKg||80);
        if(minLog && exercise.name.toLowerCase().includes('log')){
          for(const set of exercise.sets){ const w=Number(set.weight); if(w>0 && w<minLog) throw new Error(`${exercise.name} prescribes ${w} kg, below the ${minLog} kg empty-log minimum.`); }
        }
      }
    }
  }
  return normalisePlanConstraints(plan);
}

async function fetchBundledPlan(){
  const r=await fetch(BUNDLED_PLAN_URL,{cache:'no-store'}); if(!r.ok) throw new Error('Could not load bundled plan.');
  const meta=await r.json(); const files=meta.weekFiles||[]; delete meta.weekFiles;
  const weeks=await Promise.all(files.map(async file=>{const wr=await fetch(file,{cache:'no-store'});if(!wr.ok)throw new Error(`Could not load ${file}.`);return wr.json();}));
  return validatePlan({...meta,weeks});
}
async function loadActivePlan(){
  let saved=null;
  try { const raw=localStorage.getItem(PLAN_STORAGE_KEY); if(raw) saved=validatePlan(JSON.parse(raw)); } catch(e){ console.warn('Stored plan invalid',e); }
  const bundled=await fetchBundledPlan();
  // Keep imported future blocks. If the active plan is this bundled block, automatically pick up
  // programme revisions without touching the separate training-log store.
  if(saved && saved.id!==bundled.id) return saved;
  if(saved && Number(saved.revision||0)>=Number(bundled.revision||0)) return saved;
  localStorage.setItem(PLAN_STORAGE_KEY,JSON.stringify(bundled));
  return bundled;
}
function planProfile(plan){
  const t=plan?.competition?.targets || {};
  return {
    competitionDate: plan?.competition?.date || '', competitionName: plan?.competition?.name || plan?.name || 'Training block',
    logPB: Number(t.logPB)||0, logTarget:Number(t.logTarget)||0, deadliftPB:Number(t.deadliftPB)||0, deadliftTarget:Number(t.deadliftTarget)||0
  };
}
function defaultData(){ return { profile:planProfile(activePlan, sessions:{}, readiness:{}, notes:{}, installedHintDismissed:false }; }
function loadData(){
  const base=defaultData();
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(!saved) return base;
    return { ...base, ...saved, profile:{...base.profile,...(saved.profile||{})}, sessions:saved.sessions||{}, readiness:saved.readiness||{}, notes:saved.notes||{} };
  } catch { return base; }
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function syncProfileFromPlan(){ data.profile={...data.profile,...planProfile(activePlan))}; saveData(); }

function getCurrentWeek(){
  const t=localISO();
  return PROGRAM.find(w => w.start && w.end && t>=w.start && t<=w.end) || (PROGRAM.find(w=>w.start && t<w.start) || PROGRAM.at(-1) || PROGRAM[0]);
}
function getWeek(id){ return PROGRAM.find(w=>w.id===id) || PROGRAM[0]; }
function keyFor(weekId,dayId){ return `${activePlan.id}::${weekId}::${dayId}`; }
function legacyKeyFor(weekId,dayId){ return `${weekId}::${dayId}`; }
function sessionFor(weekId,dayId){
  const key=keyFor(weekId,dayId);
  if(!data.sessions[key]){
    const legacy=data.sessions[legacyKeyFor(weekId,dayId)];
    data.sessions[key]=legacy ? deepClone(legacy) : {startedAt:null,completedAt:null,exercises:{},warmup:{},cardio:{},sessionNote:''};
    data.sessions[key].warmup ||= {}; data.sessions[key].cardio ||= {}; data.sessions[key].exercises ||= {};
    saveData();
  }
  return data.sessions[key];
}
function requiredProgressItems(day){
  const warm=(day.warmup||[]).map(x=>({type:'warmup',id:x.id}));
  const sets=(day.exercises||[]).flatMap(e=>e.sets.map((set,i)=>({type:'set',exercise:e.id,index:i,optional:Boolean(set.optional)}))).filter(x=>!x.optional);
  const cardio=day.cardio?.required ? [{type:'cardio',id:day.cardio.id||'cardio'}] : [];
  return [...warm,...sets,...cardio];
}
function sessionProgress(week,day){
  const s=sessionFor(week.id,day.id); const items=requiredProgressItems(day);
  if(!items.length) return s.completedAt?100:0;
  const done=items.filter(x=>x.type==='warmup'?s.warmup?.[x.id]:x.type==='cardio'?s.cardio?.done:s.exercises?.[x.exercise]?.[x.index]?.done).length;
  return Math.round(done/items.length*100);
}
function daysToComp(){ if(!data.profile.competitionDate) return null; const today=new Date(`${localISO()}T00:00:00`), comp=new Date(`${data.profile.competitionDate}T00:00:00`); return Math.max(0,Math.ceil((comp-today)/86400000)); }
function trainingBest(type){
  let best=0;
  for(const w of PROGRAM) for(const d of w.days) for(const e of d.exercises||[]){
    const n=e.name.toLowerCase(); const relevant=type==='log'?(n.includes('log') && !n.includes('strict')):n.includes('deadlift'); if(!relevant) continue;
    const rows=sessionFor(w.id,d.id).exercises?.[e.id]||[]; rows.forEach(r=>{if(r.done&&Number(r.weight)>best)best=Number(r.weight);});
  }
  return best||'—';
}
function nextSession(){
  const current=getCurrentWeek(); const start=Math.max(0,PROGRAM.findIndex(w=>w.id===current.id));
  for(let wi=start;wi<PROGRAM.length;wi++) for(const d of PROGRAM[wi].days) if(!sessionFor(PROGRAM[wi].id,d.id).completedAt) return {week:PROGRAM[wi],day:d};
  return {week:PROGRAM.at(-1),day:PROGRAM.at(-1).days.at(-1)};
}
function readinessScore(r){ return Math.round((['sleep','energy','soreness','stress'].reduce((a,k)=>a+Number(r[k]||3),0)/20)*100); }

function setActiveNav(page){ document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===page)); }
function navigate(page){ view.page=page; view.workout=null; setActiveNav(page); render(); window.scrollTo({top:0,behavior:'smooth'}); }
function render(){
  const main=document.getElementById('main');
  document.getElementById('brandSubtitle').textContent=activePlan?.subtitle || activePlan?.name || 'Programme-driven training';
  if(view.workout) renderWorkout(main,view.workout.weekId,view.workout.dayId);
  else if(view.page==='program') renderProgram(main);
  else if(view.page==='history') renderHistory(main);
  else if(view.page==='settings') renderSettings(main);
  else renderHome(main);
  bindGlobal();
}
