const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'strongman-peak-data-v1';

const makeSets = (count, weight, reps, targetRpe = '', opts = {}) =>
  Array.from({ length: count }, (_, i) => ({
    weight, reps, targetRpe,
    label: opts.labels?.[i] || `Set ${i + 1}`,
    optional: Boolean(opts.optional?.includes(i))
  }));

const ex = (id, name, plan, sets, note = '', priority = false) => ({ id, name, plan, sets, note, priority });

const PROGRAM = [
  {
    id: 'handover', label: 'Handover', short: '21–27 Sep', phase: 'Coach handover', start: '2026-09-21', end: '2026-09-27',
    days: [
      {
        id: 'upper', name: 'Coach Log / Upper', short: 'Log',
        note: 'Keep the rest of this session exactly as your coach prescribed. These are the competition-lift anchors we are carrying forward.',
        exercises: [
          ex('log-main','Competition Log C&P','100 kg · 3×3', makeSets(3,100,3,'coach'), 'Full clean and press. Do not add weight because it feels good.', true),
          ex('log-backoff','Log Back-off','90 kg · 2×4', makeSets(2,90,4,'coach'), 'Quality volume; finish with reps in reserve.', true)
        ]
      },
      {
        id: 'deadlift', name: 'Coach Deadlift / Back', short: 'Deadlift',
        note: 'Keep the rest of this session exactly as your coach prescribed.',
        exercises: [
          ex('deadlift-main','Competition Deadlift','230 kg × 4', makeSets(1,230,4,'coach'), 'This is our baseline top set.', true),
          ex('deadlift-backoff','Deadlift Back-off','180 kg · 3×6', makeSets(3,180,6,'coach'), 'Controlled volume; no grinders.', true)
        ]
      },
      { id: 'legs', name: 'Coach Leg Day', short: 'Legs', note: 'Follow your coach’s existing leg session this week.', exercises: [] },
      { id: 'support', name: 'Coach Support Day', short: 'Support', note: 'Follow your coach’s existing support/events session this week.', exercises: [] }
    ]
  },
  {
    id: 'w1', label: 'Week 1', short: '28 Sep–4 Oct', phase: 'Build', start: '2026-09-28', end: '2026-10-04',
    days: [
      {
        id:'upper', name:'Log / Upper', short:'Log', note:'Primary objective: quality competition-log volume. Stop any set that becomes a grind.',
        exercises:[
          ex('log-main','Competition Log C&P','102.5 kg · 3×3', makeSets(3,102.5,3,'≤8'), 'Full clean each set. Competition-standard lockout.', true),
          ex('log-backoff','Log Back-off','92.5 kg · 2×4', makeSets(2,92.5,4,'7–8'), 'Keep the clean efficient and the press snappy.', true),
          ex('strict-log','Strict Log Press','3×5 @ RPE 7', makeSets(3,'','5','7'), 'No leg drive. Build the raw press.'),
          ex('incline','Incline Barbell Press','3×8 @ RPE 7–8', makeSets(3,'','8','7–8'), 'Upper chest and triceps; leave reps in reserve.'),
          ex('csr','Chest-Supported Row','4×8–10', makeSets(4,'','8-10','7–8'), 'No lower-back fatigue.'),
          ex('triceps','Cable / DB Triceps Extension','3×10–15', makeSets(3,'','10-15','7–8')),
          ex('rear-delt','Rear Delt / Face Pull','3×15–20', makeSets(3,'','15-20','6–7'))
        ]
      },
      {
        id:'deadlift', name:'Deadlift / Back', short:'Deadlift', note:'The top set drives the peak; accessories should never compromise the next heavy exposure.',
        exercises:[
          ex('deadlift-main','Competition Deadlift','235 kg × 3', makeSets(1,235,3,'≤8'), 'If this is >RPE 8, hold the following week’s progression.', true),
          ex('deadlift-backoff','Deadlift Back-off','185 kg · 3×5', makeSets(3,185,5,'7'), 'Fast, technically identical reps.', true),
          ex('rdl','Romanian Deadlift','3×6 @ RPE 7', makeSets(3,'','6','7'), 'Controlled stretch; no grinders.'),
          ex('csr','Chest-Supported / Cable Row','4×8', makeSets(4,'','8','7–8')),
          ex('pulldown','Lat Pulldown','3×10', makeSets(3,'','10','7–8')),
          ex('hamcurl','Seated / Lying Leg Curl','3×10–12', makeSets(3,'','10-12','7–8')),
          ex('curl','Hammer Curl','2×10–12', makeSets(2,'','10-12','7'))
        ]
      },
      {
        id:'legs', name:'Legs', short:'Legs', note:'Support log cleans and deadlift bracing without creating a second maximal lower-body day.',
        exercises:[
          ex('front-squat','Paused Front Squat','3×5 @ RPE 6–7', makeSets(3,'','5','6–7'), '1–2 second pause; upright torso.'),
          ex('hack','Hack Squat / Leg Press','3×8–10', makeSets(3,'','8-10','7–8')),
          ex('hamcurl','Hamstring Curl','3×10–15', makeSets(3,'','10-15','7–8')),
          ex('unilateral','Step-up / Split Squat','2×8 each side', makeSets(2,'','8','7')),
          ex('core','Weighted Core','3×10–15', makeSets(3,'','10-15','7'))
        ]
      },
      {
        id:'support', name:'Log + Deadlift Support', short:'Support', note:'Technique and speed only. This session should improve the main days, not compete with them.',
        exercises:[
          ex('log-speed','Competition Log — Speed Singles','85 kg · 6×1', makeSets(6,85,1,'5–6'), 'Full clean + press. 60–90 sec rest. Every rep should look the same.', true),
          ex('paused-dead','Paused Deadlift','160 kg · 4×2', makeSets(4,160,2,'5–6'), 'Pause just off the floor; accelerate through lockout.', true),
          ex('cgbp','Close-Grip Bench','3×6 @ RPE 7', makeSets(3,'','6','7')),
          ex('pullover','Cable Pullover','3×10–12', makeSets(3,'','10-12','7'), 'Keep the lats strong without loading the spine.'),
          ex('triceps','Triceps','3×12', makeSets(3,'','12','7')),
          ex('core','Core / Bracing','3 sets', makeSets(3,'','10','7'))
        ]
      }
    ]
  },
  {
    id: 'w2', label: 'Week 2', short: '5–11 Oct', phase: 'Intensify', start: '2026-10-05', end: '2026-10-11',
    days: [
      {
        id:'upper', name:'Log / Upper', short:'Log', note:'Intensity rises while total log reps begin to fall.',
        exercises:[
          ex('log-main','Competition Log C&P','107.5 kg × 2', makeSets(1,107.5,2,'≤8'), 'Clean, settle, aggressive dip and drive.', true),
          ex('log-backoff','Log Back-off','100 kg · 2×3', makeSets(2,100,3,'7–8'), '', true),
          ex('strict-log','Strict Log Press','3×4 @ RPE 7–8', makeSets(3,'','4','7–8')),
          ex('incline','Incline Barbell Press','3×6–8', makeSets(3,'','6-8','7–8')),
          ex('csr','Chest-Supported Row','3×8–10', makeSets(3,'','8-10','7–8')),
          ex('triceps','Triceps Extension','3×10–12', makeSets(3,'','10-12','7–8')),
          ex('rear-delt','Rear Delt / Face Pull','2×15–20', makeSets(2,'','15-20','6–7'))
        ]
      },
      {
        id:'deadlift', name:'Deadlift / Back', short:'Deadlift', note:'The top double should be strong enough to build confidence, not hard enough to need recovery heroics.',
        exercises:[
          ex('deadlift-main','Competition Deadlift','245 kg × 2', makeSets(1,245,2,'≤8'), '', true),
          ex('deadlift-backoff','Deadlift Back-off','195 kg · 3×4', makeSets(3,195,4,'7'), '', true),
          ex('rdl','Romanian Deadlift','2×6 @ RPE 7', makeSets(2,'','6','7')),
          ex('csr','Chest-Supported / Cable Row','3×8', makeSets(3,'','8','7–8')),
          ex('pullover','Cable Pullover','3×10–12', makeSets(3,'','10-12','7')),
          ex('pulldown','Lat Pulldown','2×8–12', makeSets(2,'','8-12','7–8')),
          ex('hamcurl','Hamstring Curl','3×10–12', makeSets(3,'','10-12','7–8'))
        ]
      },
      {
        id:'legs', name:'Legs', short:'Legs', note:'Moderate leg work; nothing should disrupt Wednesday-to-Wednesday deadlift recovery.',
        exercises:[
          ex('front-squat','Paused Front Squat','3×4 @ RPE 6–7', makeSets(3,'','4','6–7')),
          ex('hack','Hack Squat / Leg Press','3×8', makeSets(3,'','8','7')),
          ex('hamcurl','Hamstring Curl','3×10–12', makeSets(3,'','10-12','7–8')),
          ex('unilateral','Step-up / Split Squat','2×8 each side', makeSets(2,'','8','7')),
          ex('core','Weighted Core','3 sets', makeSets(3,'','10','7'))
        ]
      },
      {
        id:'support', name:'Log + Deadlift Support', short:'Support', note:'Still a low-fatigue technical day.',
        exercises:[
          ex('log-speed','Competition Log — Speed Singles','87.5 kg · 6×1', makeSets(6,87.5,1,'5–6'), 'Full competition clean each rep.', true),
          ex('paused-dead','Paused Deadlift','165 kg · 4×2', makeSets(4,165,2,'5–6'), '', true),
          ex('cgbp','Close-Grip Bench','3×6 @ RPE 7', makeSets(3,'','6','7')),
          ex('pullover','Cable Pullover','3×10', makeSets(3,'','10','7')),
          ex('triceps','Triceps','2×10–12', makeSets(2,'','10-12','7')),
          ex('core','Core / Bracing','2–3 sets', makeSets(3,'','10','6–7'))
        ]
      }
    ]
  },
  {
    id: 'w3', label: 'Week 3', short: '12–18 Oct', phase: 'Heavy singles', start: '2026-10-12', end: '2026-10-18',
    days: [
      {
        id:'upper', name:'Log / Upper', short:'Log', note:'First genuinely heavy log exposure. The 112.5 single should be clean and confidence-building.',
        exercises:[
          ex('log-main','Competition Log C&P','112.5 kg × 1', makeSets(1,112.5,1,'≤8.5'), 'No missed reps.', true),
          ex('log-backoff','Log Back-off','105 kg · 2×2', makeSets(2,105,2,'7–8'), '', true),
          ex('strict-log','Strict Log Press','2×4 @ RPE 7', makeSets(2,'','4','7')),
          ex('incline','Incline Barbell Press','3×6 @ RPE 7', makeSets(3,'','6','7')),
          ex('csr','Chest-Supported Row','3×8', makeSets(3,'','8','7')),
          ex('triceps','Triceps Extension','2×10', makeSets(2,'','10','7')),
          ex('rear-delt','Rear Delt / Face Pull','2×15', makeSets(2,'','15','6'))
        ]
      },
      {
        id:'deadlift', name:'Deadlift / Back', short:'Deadlift', note:'This is the current-max confidence week: 255 should move without a grind.',
        exercises:[
          ex('deadlift-main','Competition Deadlift','255 kg × 1', makeSets(1,255,1,'≤8.5'), 'If this is unexpectedly hard, do not force Week 4 to 265–270.', true),
          ex('deadlift-backoff','Deadlift Back-off','205 kg · 3×3', makeSets(3,205,3,'7'), '', true),
          ex('hyper','45° Back Extension','3×10 @ RPE 7', makeSets(3,'','10','7'), 'Use this instead of heavy RDLs now.'),
          ex('csr','Chest-Supported / Cable Row','3×8', makeSets(3,'','8','7')),
          ex('pullover','Cable Pullover','2×10–12', makeSets(2,'','10-12','7')),
          ex('pulldown','Lat Pulldown','2×10', makeSets(2,'','10','7')),
          ex('hamcurl','Hamstring Curl','2×10', makeSets(2,'','10','7'))
        ]
      },
      {
        id:'legs', name:'Legs', short:'Legs', note:'Volume drops. You should leave the gym feeling trained, not depleted.',
        exercises:[
          ex('front-squat','Paused Front Squat','3×3 @ RPE 6–7', makeSets(3,'','3','6–7')),
          ex('hack','Hack Squat / Leg Press','2×8', makeSets(2,'','8','7')),
          ex('hamcurl','Hamstring Curl','2×10', makeSets(2,'','10','7')),
          ex('core','Core / Bracing','2 sets', makeSets(2,'','10','6–7'))
        ]
      },
      {
        id:'support', name:'Log + Deadlift Support', short:'Support', note:'Final secondary deadlift exposure of the block.',
        exercises:[
          ex('log-speed','Competition Log — Speed Singles','90 kg · 5×1', makeSets(5,90,1,'5–6'), '', true),
          ex('paused-dead','Paused / Speed Deadlift','170 kg · 3×2', makeSets(3,170,2,'5–6'), 'Last secondary deadlift exposure.', true),
          ex('cgbp','Close-Grip Bench','2×6 @ RPE 7', makeSets(2,'','6','7')),
          ex('pullover','Cable Pullover','2×10', makeSets(2,'','10','7')),
          ex('triceps','Triceps','2×10', makeSets(2,'','10','7')),
          ex('core','Core / Bracing','2 sets', makeSets(2,'','10','6'))
        ]
      }
    ]
  },
  {
    id: 'w4', label: 'Week 4', short: '19–25 Oct', phase: 'Peak', start: '2026-10-19', end: '2026-10-25',
    days: [
      {
        id:'upper', name:'Log / Upper', short:'Log', note:'Final heavy log. The aim is confidence under near-max weight, not a training PR.',
        exercises:[
          ex('log-main','Competition Log C&P','115 kg × 1', makeSets(1,115,1,'≤8'), 'If this is crisp, move to the optional single below.', true),
          ex('log-optional','Optional Log Single','117.5 kg × 1 — ONLY if 115 ≤RPE 8', makeSets(1,117.5,1,'≤8.5',{ optional:[0] }), 'Skip it if 115 is slow, technically poor, or >RPE 8.', true),
          ex('log-backoff','Log Back-off','105 kg × 2', makeSets(1,105,2,'7'), '', true),
          ex('incline','Incline Barbell Press','2×6 easy', makeSets(2,'','6','6–7')),
          ex('csr','Chest-Supported Row','3×8', makeSets(3,'','8','6–7')),
          ex('triceps','Triceps','2×10', makeSets(2,'','10','6–7')),
          ex('rear-delt','Rear Delt / Face Pull','2×15', makeSets(2,'','15','6'))
        ]
      },
      {
        id:'deadlift', name:'Deadlift / Back', short:'Deadlift', note:'Final heavy deadlift. This is the key 280-readiness session.',
        exercises:[
          ex('deadlift-main','Competition Deadlift','265 kg × 1', makeSets(1,265,1,'≤8.5'), 'If this is clean and ≤RPE 8–8.5, the optional 270 is available.', true),
          ex('deadlift-optional','Optional Deadlift Single','270 kg × 1 — ONLY if 265 ≤RPE 8.5', makeSets(1,270,1,'≤8.5',{ optional:[0] }), 'No grind. No 275. No 280 in training.', true),
          ex('deadlift-backoff','Deadlift Back-off','215 kg · 2×2', makeSets(2,215,2,'6–7'), '', true),
          ex('csr','Chest-Supported / Cable Row','3×8', makeSets(3,'','8','6–7')),
          ex('pulldown','Lat Pulldown','2×10', makeSets(2,'','10','6–7')),
          ex('hamcurl','Hamstring Curl','2×10', makeSets(2,'','10','6–7'))
        ]
      },
      {
        id:'legs', name:'Legs — Reduced', short:'Legs', note:'Maintenance only. Zero reason to create DOMS now.',
        exercises:[
          ex('front-squat','Paused Front Squat','2×3 @ RPE 6', makeSets(2,'','3','6')),
          ex('hack','Hack Squat / Leg Press','2×8 easy', makeSets(2,'','8','6')),
          ex('hamcurl','Hamstring Curl','2×10 easy', makeSets(2,'','10','6')),
          ex('core','Core / Bracing','2 easy sets', makeSets(2,'','10','6'))
        ]
      },
      {
        id:'support', name:'Log Primer / Support', short:'Support', note:'No deadlift here. Finish the block hungry to lift, not fatigued.',
        exercises:[
          ex('log-speed','Competition Log — Easy Singles','92.5 kg · 3×1', makeSets(3,92.5,1,'5–6'), 'Perfect, fast singles only.', true),
          ex('csr','Chest-Supported Row','2×8 easy', makeSets(2,'','8','6')),
          ex('triceps','Triceps','2×10 easy', makeSets(2,'','10','6')),
          ex('core','Core / Bracing','2 easy sets', makeSets(2,'','10','6'))
        ]
      }
    ]
  },
  {
    id: 'taper', label: 'Comp Week', short: '26–31 Oct', phase: 'Taper', start: '2026-10-26', end: '2026-10-31',
    days: [
      {
        id:'upper', name:'Monday — Log Primer', short:'Log primer', note:'Short, crisp, and deliberately underwhelming. Leave feeling better than you arrived.',
        exercises:[
          ex('log-primer','Competition Log','85 kg · 3×1', makeSets(3,85,1,'4–5'), 'No heavy log after this.', true),
          ex('incline','Incline Press','2×5 very easy', makeSets(2,'','5','5–6')),
          ex('csr','Chest-Supported Row','2×8 easy', makeSets(2,'','8','5–6')),
          ex('triceps','Triceps','2×10 easy', makeSets(2,'','10','5–6'))
        ]
      },
      {
        id:'recovery', name:'Tuesday/Wednesday — Recovery', short:'Recover', note:'No deadlifting. Walking, normal mobility, food, hydration and sleep. Optional 15–20 minute easy movement only.', exercises:[]
      },
      {
        id:'rest', name:'Thursday/Friday — Full Rest', short:'Rest', note:'No training. Pack kit, keep routine normal, stay fed and hydrated.', exercises:[]
      },
      {
        id:'competition', name:'Saturday — COMPETE', short:'Compete', note:'Attempts are a starting framework, not a command. Adjust seconds/thirds to how the day is moving.',
        exercises:[
          ex('comp-log','LOG — Planned Attempts','105 / 115 / 120 kg', [
            {weight:105,reps:1,targetRpe:'opener',label:'Attempt 1'},
            {weight:115,reps:1,targetRpe:'second',label:'Attempt 2'},
            {weight:120,reps:1,targetRpe:'target',label:'Attempt 3'}
          ], 'Goal: 120 kg.', true),
          ex('comp-deadlift','DEADLIFT — Planned Attempts','250 / 270 / 280 kg', [
            {weight:250,reps:1,targetRpe:'opener',label:'Attempt 1'},
            {weight:270,reps:1,targetRpe:'second',label:'Attempt 2'},
            {weight:280,reps:1,targetRpe:'target',label:'Attempt 3'}
          ], 'Goal: 280 kg. Adjust the second/third if the opener gives different information than expected.', true)
        ]
      }
    ]
  }
];

const DEFAULTS = {
  profile: {
    competitionDate: '2026-10-31', competitionName: 'Log + Deadlift',
    logPB: 115, logTarget: 120, deadliftPB: 260, deadliftTarget: 280
  },
  sessions: {}, readiness: {}, notes: {}, installedHintDismissed: false
};

let data = loadData();
let view = { page:'home', weekId:getCurrentWeek()?.id || 'w1', workout:null };
let deferredPrompt = null;

function deepMerge(base, incoming) {
  const out = structuredClone(base);
  if (!incoming) return out;
  Object.keys(incoming).forEach(k => {
    if (incoming[k] && typeof incoming[k] === 'object' && !Array.isArray(incoming[k]) && typeof out[k] === 'object') {
      out[k] = { ...out[k], ...incoming[k] };
    } else out[k] = incoming[k];
  });
  return out;
}
function loadData(){
  try { return deepMerge(DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
  catch { return structuredClone(DEFAULTS); }
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function localISO(d = new Date()) {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fmtDate(iso){ return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short'}); }
function daysToComp(){
  const today = new Date(`${localISO()}T00:00:00`);
  const comp = new Date(`${data.profile.competitionDate}T00:00:00`);
  return Math.max(0, Math.ceil((comp-today)/86400000));
}
function getCurrentWeek(){
  const t=localISO();
  return PROGRAM.find(w => t>=w.start && t<=w.end) || (t<PROGRAM[0].start ? PROGRAM[0] : PROGRAM.at(-1));
}
function getWeek(id){ return PROGRAM.find(w=>w.id===id) || PROGRAM[1]; }
function keyFor(weekId, dayId){ return `${weekId}::${dayId}`; }
function sessionFor(weekId, dayId){
  const key=keyFor(weekId,dayId);
  if(!data.sessions[key]) data.sessions[key]={ startedAt:null, completedAt:null, exercises:{}, sessionNote:'' };
  return data.sessions[key];
}
function sessionProgress(week, day){
  const s=sessionFor(week.id,day.id);
  const all=day.exercises.flatMap(e=>e.sets.map((_,i)=>({e:e.id,i}))).filter(x=>!day.exercises.find(e=>e.id===x.e).sets[x.i].optional);
  if(!all.length) return s.completedAt ? 100 : 0;
  const done=all.filter(x=>s.exercises?.[x.e]?.[x.i]?.done).length;
  return Math.round(done/all.length*100);
}
function trainingBest(type){
  let best=0;
  for(const week of PROGRAM){ for(const day of week.days){ for(const exercise of day.exercises){
    const name=exercise.name.toLowerCase();
    const relevant = type==='log' ? (name.includes('competition log') || name.startsWith('log')) : name.includes('competition deadlift');
    if(!relevant) continue;
    const s=data.sessions[keyFor(week.id,day.id)];
    const rows=s?.exercises?.[exercise.id] || [];
    rows.forEach(r=>{ if(r.done && Number(r.weight)>best) best=Number(r.weight); });
  }}}
  return best || '—';
}
function nextSession(){
  const current=getCurrentWeek();
  const startIdx=Math.max(0,PROGRAM.findIndex(w=>w.id===current.id));
  for(let wi=startIdx; wi<PROGRAM.length; wi++){
    const w=PROGRAM[wi];
    for(const d of w.days){ if(!sessionFor(w.id,d.id).completedAt) return {week:w,day:d}; }
  }
  return {week:PROGRAM.at(-1),day:PROGRAM.at(-1).days.at(-1)};
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }

function setActiveNav(page){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
}
function navigate(page){ view.page=page; view.workout=null; setActiveNav(page); render(); window.scrollTo({top:0,behavior:'smooth'}); }

function render(){
  const main=document.getElementById('main');
  if(view.workout) renderWorkout(main,view.workout.weekId,view.workout.dayId);
  else if(view.page==='program') renderProgram(main);
  else if(view.page==='history') renderHistory(main);
  else if(view.page==='settings') renderSettings(main);
  else renderHome(main);
  bindGlobal();
}

function renderHome(main){
  const current=getCurrentWeek();
  const next=nextSession();
  const today=localISO();
  const r=data.readiness[today] || {sleep:3,energy:3,soreness:3,stress:3};
  const score=readinessScore(r);
  main.innerHTML=`
    <section class="hero">
      <span class="eyebrow">${esc(current.phase)}</span>
      <h1>${daysToComp()} days</h1>
      <p>until ${esc(data.profile.competitionName)} · ${fmtDate(data.profile.competitionDate)}</p>
      <div class="hero-grid">
        <div class="stat"><small>Log PB</small><strong>${data.profile.logPB} kg <span class="target">→ ${data.profile.logTarget}</span></strong></div>
        <div class="stat"><small>Log training best</small><strong>${trainingBest('log')} kg</strong></div>
        <div class="stat"><small>Deadlift PB</small><strong>${data.profile.deadliftPB} kg <span class="target">→ ${data.profile.deadliftTarget}</span></strong></div>
        <div class="stat"><small>Deadlift training best</small><strong>${trainingBest('deadlift')} kg</strong></div>
      </div>
    </section>

    <div class="dashboard-grid section">
      <div>
        <section class="section">
          <div class="section-title"><div><h2>Next session</h2><small>${next.week.label} · ${next.week.short}</small></div><span class="phase">${next.week.phase}</span></div>
          <button class="card card-button" data-start="${next.week.id}|${next.day.id}">
            <div class="day-card"><div><h3>${esc(next.day.name)}</h3><div class="meta">${next.day.exercises.length ? `${next.day.exercises.length} exercises` : 'Recovery / planned rest'}</div></div><span class="arrow">→</span></div>
          </button>
          <button class="primary-btn full" style="margin-top:10px" data-start="${next.week.id}|${next.day.id}">START / OPEN SESSION</button>
        </section>

        <section class="section">
          <div class="section-title"><div><h2>This week</h2><small>${current.label} · ${current.short}</small></div></div>
          <div class="grid program-days">
            ${current.days.map(d=>{
              const p=sessionProgress(current,d); return `<button class="card card-button" data-start="${current.id}|${d.id}"><div class="day-card"><div><strong>${esc(d.short)}</strong><div class="meta">${p}% complete</div></div><span class="${p===100?'badge-good':'muted'}">${p===100?'✓':'→'}</span></div><div class="progress-bar" style="margin-top:10px"><span style="width:${p}%"></span></div></button>`;
            }).join('')}
          </div>
        </section>
      </div>

      <section class="section">
        <div class="section-title"><div><h2>Readiness</h2><small>1 = poor · 5 = excellent</small></div></div>
        <div class="card">
          <div class="readiness-grid">
            ${['sleep','energy','soreness','stress'].map(k=>`<label class="field">${k[0].toUpperCase()+k.slice(1)}<select data-readiness="${k}">${[1,2,3,4,5].map(v=>`<option value="${v}" ${Number(r[k])===v?'selected':''}>${v}</option>`).join('')}</select></label>`).join('')}
          </div>
          <div class="readiness-score" style="margin-top:12px"><div><strong>${score}/100</strong><small> today</small></div></div>
          <p class="muted" style="margin-bottom:0">Low readiness is information, not a challenge. Use it alongside warm-up speed and the programmed RPE caps.</p>
        </div>
        <div class="callout" style="margin-top:12px"><strong>Peak rule:</strong> no training lift is more important than arriving fresh enough to hit 120 / 280 on 31 October.</div>
      </section>
    </div>`;
}

function readinessScore(r){
  // soreness/stress are entered as 1 poor -> 5 excellent for simplicity.
  return Math.round((['sleep','energy','soreness','stress'].reduce((a,k)=>a+Number(r[k]||3),0)/20)*100);
}

function renderProgram(main){
  const week=getWeek(view.weekId);
  main.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">Competition peak</span><h1 style="margin:6px 0 0">Programme</h1></div></div>
    <div class="week-tabs">${PROGRAM.map(w=>`<button class="week-tab ${w.id===week.id?'active':''}" data-week="${w.id}">${w.label}</button>`).join('')}</div>
    <section class="section">
      <div class="section-title"><div><h2>${week.label} · ${week.phase}</h2><small>${week.short}</small></div></div>
      <div class="grid program-days">
      ${week.days.map(day=>{
        const p=sessionProgress(week,day);
        const headline=day.exercises.slice(0,2).map(e=>e.plan).join(' · ') || day.note;
        return `<button class="card card-button" data-start="${week.id}|${day.id}"><div class="day-card"><div><h3>${esc(day.name)}</h3><div class="meta">${esc(headline)}</div></div><span class="arrow">→</span></div><div class="progress-bar" style="margin-top:12px"><span style="width:${p}%"></span></div></button>`;
      }).join('')}
      </div>
    </section>`;
}

function renderWorkout(main,weekId,dayId){
  const week=getWeek(weekId); const day=week.days.find(d=>d.id===dayId); const s=sessionFor(weekId,dayId);
  if(!s.startedAt) { s.startedAt=new Date().toISOString(); saveData(); }
  const p=sessionProgress(week,day);
  main.innerHTML=`
    <div class="workout-layout">
      <div>
        <div class="workout-head">
          <div><span class="eyebrow">${week.label} · ${week.phase}</span><h1>${esc(day.name)}</h1><p>${esc(day.note)}</p></div>
          <button class="ghost-btn" data-back-program>Plan</button>
        </div>
        ${day.exercises.length ? day.exercises.map(e=>renderExercise(week,day,e,s)).join('') : `<div class="card"><h3>${esc(day.short)}</h3><p>${esc(day.note)}</p><button class="primary-btn full" data-complete-session>MARK COMPLETE</button></div>`}
        ${day.exercises.length ? `<div class="card session-note"><label class="field">Session notes<textarea id="sessionNote" placeholder="Technique, pain, recovery, anything worth remembering…">${esc(s.sessionNote||'')}</textarea></label></div>`:''}
      </div>
      <aside class="workout-side">
        <div class="card">
          <span class="eyebrow">Session progress</span>
          <h2 style="font-size:38px;margin:8px 0">${p}%</h2>
          <div class="progress-bar"><span style="width:${p}%"></span></div>
          <div class="inline-actions" style="margin-top:14px">
            <button class="primary-btn" data-complete-session>${s.completedAt?'COMPLETED ✓':'FINISH SESSION'}</button>
          </div>
          ${s.completedAt?`<p class="badge-good">Completed ${new Date(s.completedAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>`:''}
        </div>
        <div class="card" style="margin-top:12px"><strong>Targets</strong><p class="muted">Log ${data.profile.logPB} → <b style="color:var(--accent)">${data.profile.logTarget}</b> kg<br>Deadlift ${data.profile.deadliftPB} → <b style="color:var(--accent)">${data.profile.deadliftTarget}</b> kg</p></div>
      </aside>
    </div>`;

  document.querySelectorAll('.set-row').forEach(row=>{
    const eId=row.dataset.exercise, idx=Number(row.dataset.index);
    const actual=s.exercises?.[eId]?.[idx] || {};
    row.querySelector('.actual-weight').value=actual.weight ?? '';
    row.querySelector('.actual-reps').value=actual.reps ?? '';
    row.querySelector('.actual-rpe').value=actual.rpe ?? '';
    row.querySelector('.set-complete').classList.toggle('done',Boolean(actual.done));
  });
}

function renderExercise(week,day,e,s){
  return `<section class="card exercise-card ${e.priority?'priority':''}">
    <div class="exercise-top"><div><h3>${esc(e.name)}</h3><div class="exercise-plan">${esc(e.plan)}</div></div>${e.priority?'<span class="phase">PRIORITY</span>':''}</div>
    ${e.note?`<p class="exercise-note">${esc(e.note)}</p>`:''}
    <div class="set-table">
      ${e.sets.map((set,i)=>{
        const prescribedWeight=set.weight!==''?`${set.weight}kg`:'choose';
        const prescribedReps=String(set.reps);
        return `<div class="set-row" data-exercise="${e.id}" data-index="${i}">
          <div class="set-label">${esc(set.label || `Set ${i+1}`)}${set.optional?'<br><span class="badge-warn">optional</span>':''}</div>
          <label>kg<span class="prescribed">${prescribedWeight}</span><input class="actual-weight" type="number" inputmode="decimal" step="0.5" min="0"></label>
          <label>reps<span class="prescribed">${prescribedReps}</span><input class="actual-reps" type="number" inputmode="numeric" step="1" min="0"></label>
          <label>RPE<span class="prescribed">${esc(set.targetRpe||'—')}</span><input class="actual-rpe" type="number" inputmode="decimal" step="0.5" min="1" max="10"></label>
          <button class="set-complete" aria-label="Complete set">✓</button>
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

function renderHistory(main){
  const items=[];
  for(const w of PROGRAM){ for(const d of w.days){ const s=data.sessions[keyFor(w.id,d.id)]; if(s?.startedAt || s?.completedAt){
    let setsDone=0, total=0, maxWeight=0;
    d.exercises.forEach(e=>{ e.sets.forEach((set,i)=>{ if(!set.optional) total++; const a=s.exercises?.[e.id]?.[i]; if(a?.done){setsDone++; maxWeight=Math.max(maxWeight,Number(a.weight)||0);} }); });
    items.push({w,d,s,setsDone,total,maxWeight});
  }}}
  items.sort((a,b)=>new Date(b.s.completedAt||b.s.startedAt)-new Date(a.s.completedAt||a.s.startedAt));
  main.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">Training log</span><h1 style="margin:6px 0 0">History</h1></div></div>
    <div class="grid">
      ${items.length?items.map(x=>`<button class="card card-button" data-start="${x.w.id}|${x.d.id}"><div class="history-item"><div><strong>${esc(x.d.name)}</strong><small>${x.w.label} · ${x.s.completedAt?'Completed':'In progress'}${x.maxWeight?` · top logged ${x.maxWeight} kg`:''}</small></div><span class="${x.s.completedAt?'badge-good':'muted'}">${x.s.completedAt?'✓':`${x.setsDone}/${x.total}`}</span></div>${x.s.sessionNote?`<p>${esc(x.s.sessionNote)}</p>`:''}</button>`).join(''):`<div class="card"><p class="muted">No sessions logged yet. Open a workout and your history will appear here.</p></div>`}
    </div>`;
}

function renderSettings(main){
  main.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">Local-first</span><h1 style="margin:6px 0 0">Data & targets</h1></div></div>
    <div class="grid">
      <section class="card"><h3>Competition</h3>
        <div class="readiness-grid">
          <label class="field">Date<input id="competitionDate" type="date" value="${esc(data.profile.competitionDate)}"></label>
          <label class="field">Log PB<input id="logPB" type="number" step="0.5" value="${data.profile.logPB}"></label>
          <label class="field">Log target<input id="logTarget" type="number" step="0.5" value="${data.profile.logTarget}"></label>
          <label class="field">Deadlift PB<input id="deadliftPB" type="number" step="0.5" value="${data.profile.deadliftPB}"></label>
          <label class="field">Deadlift target<input id="deadliftTarget" type="number" step="0.5" value="${data.profile.deadliftTarget}"></label>
        </div>
        <button id="saveTargets" class="primary-btn" style="margin-top:12px">SAVE TARGETS</button>
      </section>
      <section class="card"><h3>Backup</h3><p class="muted">Everything is stored in this browser on this device. Export a backup occasionally, especially before clearing browser data.</p>
        <div class="inline-actions"><button id="exportData" class="ghost-btn">EXPORT JSON</button><label class="ghost-btn" for="importData">IMPORT JSON</label><input id="importData" class="file-input" type="file" accept="application/json"></div>
      </section>
      <section class="card"><h3>Reset</h3><p class="muted">Clears logged sets, readiness and notes. The programme itself remains built into the app.</p><button id="resetData" class="danger-btn">RESET TRAINING DATA</button></section>
      <section class="card"><p class="muted">Strongman Peak v${APP_VERSION} · Offline-capable PWA</p></section>
    </div>`;
}

function bindGlobal(){
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{
    const [weekId,dayId]=b.dataset.start.split('|'); view.workout={weekId,dayId}; render(); window.scrollTo(0,0);
  });
  document.querySelectorAll('[data-week]').forEach(b=>b.onclick=()=>{view.weekId=b.dataset.week;render();});
  document.querySelectorAll('[data-back-program]').forEach(b=>b.onclick=()=>{view.workout=null;view.page='program';setActiveNav('program');render();});

  document.querySelectorAll('[data-readiness]').forEach(sel=>sel.onchange=()=>{
    const t=localISO(); data.readiness[t] ||= {sleep:3,energy:3,soreness:3,stress:3}; data.readiness[t][sel.dataset.readiness]=Number(sel.value); saveData(); renderHome(document.getElementById('main')); bindGlobal();
  });

  if(view.workout){
    const {weekId,dayId}=view.workout; const week=getWeek(weekId), day=week.days.find(d=>d.id===dayId), s=sessionFor(weekId,dayId);
    document.querySelectorAll('.set-row').forEach(row=>{
      const eId=row.dataset.exercise, idx=Number(row.dataset.index); s.exercises[eId] ||= [];
      const write=()=>{ const entry=s.exercises[eId][idx] ||= {}; entry.weight=row.querySelector('.actual-weight').value; entry.reps=row.querySelector('.actual-reps').value; entry.rpe=row.querySelector('.actual-rpe').value; saveData(); };
      row.querySelectorAll('input').forEach(i=>i.onchange=write);
      row.querySelector('.set-complete').onclick=()=>{
        write(); const entry=s.exercises[eId][idx] ||= {}; entry.done=!entry.done; if(entry.done){
          const prescribed=day.exercises.find(e=>e.id===eId)?.sets[idx];
          if(!entry.weight && prescribed?.weight!=='') entry.weight=prescribed.weight;
          if(!entry.reps && prescribed?.reps && !String(prescribed.reps).includes('-')) entry.reps=prescribed.reps;
        }
        saveData(); renderWorkout(document.getElementById('main'),weekId,dayId); bindGlobal();
      };
    });
    const note=document.getElementById('sessionNote'); if(note) note.onchange=()=>{s.sessionNote=note.value;saveData();};
    document.querySelectorAll('[data-complete-session]').forEach(b=>b.onclick=()=>{ s.completedAt=s.completedAt?null:new Date().toISOString(); saveData(); renderWorkout(document.getElementById('main'),weekId,dayId); bindGlobal(); });
  }

  document.getElementById('saveTargets')?.addEventListener('click',()=>{
    ['competitionDate','logPB','logTarget','deadliftPB','deadliftTarget'].forEach(id=>{ const el=document.getElementById(id); data.profile[id]=id==='competitionDate'?el.value:Number(el.value); }); saveData(); render();
  });
  document.getElementById('exportData')?.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({version:APP_VERSION,exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`strongman-peak-backup-${localISO()}.json`; a.click(); URL.revokeObjectURL(a.href);
  });
  document.getElementById('importData')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0]; if(!file) return;
    try{ const parsed=JSON.parse(await file.text()); data=deepMerge(DEFAULTS,parsed.data||parsed); saveData(); alert('Backup imported.'); render(); } catch{ alert('That file could not be imported.'); }
  });
  document.getElementById('resetData')?.addEventListener('click',()=>{
    if(confirm('Clear all logged training and readiness data?')){ data={...structuredClone(DEFAULTS),profile:{...data.profile}}; saveData(); render(); }
  });
}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-nav]'); if(nav) navigate(nav.dataset.nav);
});

window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); deferredPrompt=e; document.getElementById('installBtn')?.classList.remove('hidden');
});
document.getElementById('installBtn')?.addEventListener('click',async()=>{
  if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('installBtn')?.classList.add('hidden');
});

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }

setActiveNav('home'); render();
