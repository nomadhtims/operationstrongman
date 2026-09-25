
function renderHome(main){
  const current=getCurrentWeek(), next=nextSession(), today=localISO();
  const r=data.readiness[today]||{sleep:3,energy:3,soreness:3,stress:3}; const countdown=daysToComp();
  main.innerHTML=`
    <section class="hero"><span class="eyebrow">${esc(current?.phase||activePlan.name)}</span><h1>${countdown===null?esc(activePlan.name):`${countdown} days`}</h1><p>${countdown===null?'Current training block':`until ${esc(data.profile.competitionName)} · ${fmtDate(data.profile.competitionDate)}`}</p>
      <div class="hero-grid">
        <div class="stat"><small>Log PB</small><strong>${data.profile.logPB||'—'} kg <span class="target">${data.profile.logTarget?`→ ${data.profile.logTarget}`:''}</span></strong></div>
        <div class="stat"><small>Log training best</small><strong>${trainingBest('log')} kg</strong></div>
        <div class="stat"><small>Deadlift PB</small><strong>${data.profile.deadliftPB||'—'} kg <span class="target">${data.profile.deadliftTarget?`→ ${data.profile.deadliftTarget}`:''}</span></strong></div>
        <div class="stat"><small>Deadlift training best</small><strong>${trainingBest('deadlift')} kg</strong></div>
      </div>
    </section>
    <div class="dashboard-grid section"><div>
      <section class="section"><div class="section-title"><div><h2>Next session</h2><small>${next.week.label} · ${next.week.short||''}</small></div><span class="phase">${esc(next.week.phase||'Training')}</span></div>
        <button class="card card-button" data-start="${next.week.id}|${next.day.id}"><div class="day-card"><div><h3>${esc(next.day.name)}</h3><div class="meta">${(next.day.warmup||[]).length} warm-up items · ${(next.day.exercises||[]).length} exercises${next.day.cardio?' · cardio':''}</div></div><span class="arrow">→</span></div></button>
        <button class="primary-btn full" style="margin-top:10px" data-start="${next.week.id}|${next.day.id}">START / OPEN SESSION</button>
      </section>
      <section class="section"><div class="section-title"><div><h2>This week</h2><small>${current.label} · ${current.short||''}</small></div></div><div class="grid program-days">${current.days.map(d=>{const p=sessionProgress(current,d);return `<button class="card card-button" data-start="${current.id}|${d.id}"><div class="day-card"><div><strong>${esc(d.short||d.name)}</strong><div class="meta">${p}% complete</div></div><span class="${p===100?'badge-good':'muted'}">${p===100?'✓':'→'}</span></div><div class="progress-bar" style="margin-top:10px"><span style="width:${p}%"></span></div></button>`}).join('')}</div></section>
    </div>
    <section class="section"><div class="section-title"><div><h2>Readiness</h2><small>1 = poor · 5 = excellent</small></div></div><div class="card"><div class="readiness-grid">${['sleep','energy','soreness','stress'].map(k=>`<label class="field">${k[0].toUpperCase()+k.slice(1)}<select data-readiness="${k}">${[1,2,3,4,5].map(v=>`<option value="${v}" ${Number(r[k])===v?'selected':''}>${v}</option>`).join('')}</select></label>`).join('')}</div><div class="readiness-score" style="margin-top:12px"><div><strong>${readinessScore(r)}/100</strong><small> today</small></div></div><p class="muted" style="margin-bottom:0">Use readiness alongside warm-up speed and the programmed RPE caps.</p></div></section></div>`;
}

function renderProgram(main){
  const week=getWeek(view.weekId||getCurrentWeek().id); view.weekId=week.id;
  main.innerHTML=`<div class="section-title"><div><span class="eyebrow">${esc(activePlan.name)}</span><h1 style="margin:6px 0 0">Programme</h1></div></div>
    <div class="week-tabs">${PROGRAM.map(w=>`<button class="week-tab ${w.id===week.id?'active':''}" data-week="${w.id}">${esc(w.label)}</button>`).join('')}</div>
    <section class="section"><div class="section-title"><div><h2>${esc(week.label)} · ${esc(week.phase||'Training')}</h2><small>${esc(week.short||'')}</small></div></div><div class="grid program-days">${week.days.map(day=>{const p=sessionProgress(week,day),headline=(day.exercises||[]).slice(0,2).map(e=>e.plan).join(' · ')||day.note||'Recovery';return `<button class="card card-button" data-start="${week.id}|${day.id}"><div class="day-card"><div><h3>${esc(day.name)}</h3><div class="meta">${esc(headline)}</div></div><span class="arrow">→</span></div><div class="progress-bar" style="margin-top:12px"><span style="width:${p}%"></span></div></button>`}).join('')}</div></section>`;
}

function renderWarmup(day,s){
  if(!(day.warmup||[]).length) return '';
  return `<section class="card warmup-card"><div class="exercise-top"><div><span class="section-kicker">PREP</span><h3>Warm-up & movement prep</h3></div><span class="phase">${day.warmup.length} steps</span></div><p class="exercise-note">Brief, controlled stretching and movement prep. Do not turn the warm-up into a workout.</p><div class="warmup-list">${day.warmup.map(item=>`<button class="warmup-item ${s.warmup?.[item.id]?'done':''}" data-warmup="${esc(item.id)}"><span class="warmup-check">${s.warmup?.[item.id]?'✓':'○'}</span><span><strong>${esc(item.name)}</strong><small>${esc(item.prescription||'')}</small>${item.note?`<em>${esc(item.note)}</em>`:''}</span></button>`).join('')}</div></section>`;
}
function renderExercise(e,s){
  return `<section class="card exercise-card ${e.priority?'priority':''}"><div class="exercise-top"><div><h3>${esc(e.name)}</h3><div class="exercise-plan">${esc(e.plan||'')}</div></div>${e.priority?'<span class="phase">PRIORITY</span>':''}</div>${e.note?`<p class="exercise-note">${esc(e.note)}</p>`:''}<div class="set-table">${e.sets.map((set,i)=>{
    const a=s.exercises?.[e.id]?.[i]||{};
    const asPlanned=a.asPlanned!==false;
    const prescription=[set.weight!==''&&set.weight!=null?`${set.weight} kg`:null,set.reps!==''&&set.reps!=null?`× ${set.reps}`:null].filter(Boolean).join(' ') || 'As prescribed';
    return `<div class="set-row ${a.done?'done':''}" data-exercise="${esc(e.id)}" data-index="${i}" data-as-planned="${asPlanned?'true':'false'}">
      <div class="set-main"><div class="set-label">${esc(set.label||`Set ${i+1}`)}${set.optional?' <span class="badge-warn">optional</span>':''}</div><div class="set-prescription">${esc(prescription)}</div>${set.targetRpe?`<small class="set-target">Target RPE ${esc(set.targetRpe)}</small>`:''}</div>
      <label class="set-rpe">RPE<input class="actual-rpe" type="number" inputmode="decimal" step="0.5" min="1" max="10" value="${esc(a.rpe??'')}"></label>
      <div class="set-actions"><button class="plan-status ${asPlanned?'planned':'adjusted'}" type="button">${asPlanned?'AS PLANNED':'NOT AS PLANNED'}</button><button class="set-complete ${a.done?'done':''}" type="button">${a.done?'COMPLETED ✓':(asPlanned?'COMPLETE AS PLANNED':'COMPLETE ADJUSTED')}</button></div>
      <div class="set-adjustments ${asPlanned?'hidden':''}"><label>Actual kg<input class="actual-weight" type="number" inputmode="decimal" step="0.5" min="0" value="${esc(asPlanned?'':(a.weight??''))}"></label><label>Actual reps<input class="actual-reps" type="number" inputmode="numeric" step="1" min="0" value="${esc(asPlanned?'':(a.reps??''))}"></label><p class="adjustment-help">Enter what you actually completed, then tap <strong>Complete adjusted</strong>.</p></div>
    </div>`;
  }).join('')}</div></section>`;
}
function renderCardio(day,s){
  if(!day.cardio) return '';
  const c=s.cardio||{};
  return `<section class="card cardio-card"><div class="exercise-top"><div><span class="section-kicker">CARDIO</span><h3>${esc(day.cardio.name)}</h3><div class="exercise-plan">${esc(day.cardio.target||'')}</div></div>${day.cardio.required?'<span class="phase">PLANNED</span>':'<span class="muted">optional</span>'}</div>${day.cardio.note?`<p class="exercise-note">${esc(day.cardio.note)}</p>`:''}<div class="cardio-grid"><label class="field">Actual minutes<input id="cardioMinutes" type="number" inputmode="numeric" min="0" value="${esc(c.minutes||'')}"></label><label class="field">Actual RPE<input id="cardioRpe" type="number" inputmode="decimal" min="1" max="10" step="0.5" value="${esc(c.rpe||'')}"></label><button id="cardioDone" class="${c.done?'primary-btn':'ghost-btn'}">${c.done?'COMPLETED ✓':'MARK CARDIO DONE'}</button></div></section>`;
}
function renderWorkout(main,weekId,dayId){
  const week=getWeek(weekId), day=week.days.find(d=>d.id===dayId), s=sessionFor(weekId,dayId); if(!s.startedAt){s.startedAt=new Date().toISOString();saveData();}
  const p=sessionProgress(week,day);
  main.innerHTML=`<div class="workout-layout"><div><div class="workout-head"><div><span class="eyebrow">${esc(week.label)} · ${esc(week.phase||'Training')}</span><h1>${esc(day.name)}</h1><p>${esc(day.note||'')}</p></div><button class="ghost-btn" data-back-program>Plan</button></div>
    ${renderWarmup(day,s)}${(day.exercises||[]).map(e=>renderExercise(e,s)).join('')}${renderCardio(day,s)}
    ${((day.exercises||[]).length||(day.warmup||[]).length||day.cardio)?`<div class="card session-note"><label class="field">Session notes<textarea id="sessionNote" placeholder="Technique, pain, recovery, anything worth remembering…">${esc(s.sessionNote||'')}</textarea></label></div>`:`<div class="card"><p>${esc(day.note||'Recovery / rest day.')}</p></div>`}
    </div><aside class="workout-side"><div class="card"><span class="eyebrow">Session progress</span><h2 style="font-size:38px;margin:8px 0">${p}%</h2><div class="progress-bar"><span style="width:${p}%"></span></div><div class="inline-actions" style="margin-top:14px"><button class="primary-btn" data-complete-session>${s.completedAt?'COMPLETED ✓':'FINISH SESSION'}</button></div>${s.completedAt?`<p class="badge-good">Completed ${new Date(s.completedAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>`:''}</div><div class="card" style="margin-top:12px"><strong>Block</strong><p class="muted">${esc(activePlan.name)}<br>${activePlan.notes?esc(activePlan.notes):''}</p></div></aside></div>`;
}

function renderHistory(main){
  const items=[]; for(const w of PROGRAM) for(const d of w.days){const s=data.sessions[keyFor(w.id,d.id)];if(s?.startedAt||s?.completedAt){let setsDone=0,total=0,maxWeight=0;(d.exercises||[]).forEach(e=>e.sets.forEach((set,i)=>{if(!set.optional)total++;const a=s.exercises?.[e.id]?.[i];if(a?.done){setsDone++;const logged=a.asPlanned===false?Number(a.weight):Number(a.weight||set.weight);maxWeight=Math.max(maxWeight,logged||0);}}));items.push({w,d,s,setsDone,total,maxWeight});}}
  items.sort((a,b)=>new Date(b.s.completedAt||b.s.startedAt)-new Date(a.s.completedAt||a.s.startedAt));
  main.innerHTML=`<div class="section-title"><div><span class="eyebrow">${esc(activePlan.name)}</span><h1 style="margin:6px 0 0">History</h1></div></div><div class="grid">${items.length?items.map(x=>`<button class="card card-button" data-start="${x.w.id}|${x.d.id}"><div class="history-item"><div><strong>${esc(x.d.name)}</strong><small>${esc(x.w.label)} · ${x.s.completedAt?'Completed':'In progress'}${x.maxWeight?` · top logged ${x.maxWeight} kg`:''}</small></div><span class="${x.s.completedAt?'badge-good':'muted'}">${x.s.completedAt?'✓':`${x.setsDone}/${x.total}`}</span></div>${x.s.sessionNote?`<p>${esc(x.s.sessionNote)}</p>`:''}</button>`).join(''):`<div class="card"><p class="muted">No sessions logged in this active programme yet.</p></div>`}</div>`;
}

function renderSettings(main){
  main.innerHTML=`<div class="section-title"><div><span class="eyebrow">Importable programming</span><h1 style="margin:6px 0 0">Data & programme</h1></div></div><div class="grid">
    <section class="card"><h3>Active programme</h3><p><strong>${esc(activePlan.name)}</strong><br><span class="muted">${esc(activePlan.subtitle||'')} · ${PROGRAM.length} weeks · schema v${activePlan.schemaVersion||1}</span></p><p class="muted">Future blocks can be imported as JSON. Importing a plan changes the active programme but does <strong>not</strong> delete your training log.</p><div class="inline-actions"><label class="primary-btn" for="importPlan">IMPORT PLAN JSON</label><input id="importPlan" class="file-input" type="file" accept="application/json"><button id="exportPlan" class="ghost-btn">EXPORT CURRENT PLAN</button><a class="ghost-btn link-btn" href="./plan-template.json" download>PLAN TEMPLATE</a><button id="resetPlan" class="ghost-btn">RESTORE BUNDLED PLAN</button></div></section>
    <section class="card"><h3>Competition / targets</h3><div class="readiness-grid"><label class="field">Date<input id="competitionDate" type="date" value="${esc(data.profile.competitionDate||'')}"></label><label class="field">Log PB<input id="logPB" type="number" step="0.5" value="${data.profile.logPB||''}"></label><label class="field">Log target<input id="logTarget" type="number" step="0.5" value="${data.profile.logTarget||''}"></label><label class="field">Deadlift PB<input id="deadliftPB" type="number" step="0.5" value="${data.profile.deadliftPB||''}"></label><label class="field">Deadlift target<input id="deadliftTarget" type="number" step="0.5" value="${data.profile.deadliftTarget||''}"></label></div><button id="saveTargets" class="primary-btn" style="margin-top:12px">SAVE TARGETS</button></section>
    <section class="card"><h3>Full backup</h3><p class="muted">Exports both the active plan and all browser training data. Use this before changing phones or clearing browser data.</p><div class="inline-actions"><button id="exportData" class="ghost-btn">EXPORT FULL BACKUP</button><label class="ghost-btn" for="importData">IMPORT FULL BACKUP</label><input id="importData" class="file-input" type="file" accept="application/json"></div></section>
    <section class="card"><h3>Reset training data</h3><p class="muted">Clears logged sets, warm-ups, cardio, readiness and notes. It does not delete the active programme.</p><button id="resetData" class="danger-btn">RESET TRAINING DATA</button></section>
    <section class="card"><p class="muted">Operation Strongman v${APP_VERSION} · Local-first · Offline-capable PWA</p></section></div>`;
}

