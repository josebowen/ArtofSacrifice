(function(){
const M = Model, $ = s => document.querySelector(s), app = $('#app'), ov = $('#ov');
const Q = new URLSearchParams(location.search), FAST = Q.has('fast') || matchMedia('(prefers-reduced-motion:reduce)').matches;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const STEPS = ['intro','guess','diag','choose','r0','r1','r2','r3','futures','debrief','reveal'];
const NAMES = ['Start','Opening guess','Diagnose','Choose','Cycle 1','Cycle 2','Cycle 3','Cycle 4','1,000 futures','Debrief','The real case'];
let S, histDone = false;
function reset(){
  const seed = Q.has('seed') ? +Q.get('seed') : (Date.now() % 1e9);
  const fut = M.futures(seed, 1000);
  histDone = false; S = { step:'intro', guess:null, diag:null, strat:null, rounds:[], kpis:[], cur:M.emptyAlloc(), curK:[], seed, fut, base:M.baseline(fut), strip:[], memoLog:[], drawn:null, sim:null, self:null, order:shuffle(98, seed) };
}
function shuffle(n, seed){ const r = M.rng(seed+7), a = [...Array(n).keys()]; for (let i=n-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
const t = () => S.rounds.length;
const led = () => M.ledger(S.rounds.concat([S.cur]))[t()];
const avail = () => led().base + S.cur.borrow;
const left = () => avail() - M.spent(S.cur);
const bil = n => '$' + (n*M.CHIP_B) + ' billion';
const pct = b => (b<1 ? Math.min(99, Math.round(b*100)) : 100) + '%';
const plural = (n, w) => n + ' ' + w + (n===1 ? '' : 's');

function go(step){ S.step = step; render(); scrollTo(0,0); const h = app.querySelector('h1,h2'); if (h){ h.tabIndex = -1; h.focus({preventScroll:true}); } }
function dots(){ const i = STEPS.indexOf(S.step); $('#dots').innerHTML = STEPS.map((s,j)=>`<div class="dot ${j<i?'done':''} ${j===i?'on':''}"></div>`).join(''); $('#stepname').textContent = NAMES[i]; }
function render(){ dots(); ({intro, guess, diag, choose, futures, debrief, reveal}[S.step] || round)(); }

function intro(){
  app.innerHTML = `<section class="hero"><p class="mute" style="letter-spacing:.14em;text-transform:uppercase;font-size:14px">A strategy simulation. About eight minutes.</p>
  <h1>The Art of Sacrifice</h1>
  <p>You are the new chief executive of ${C.company}, a large American phone company. You have four budget cycles and more good ideas than money.</p>
  <p>Read the dashboard. Choose a strategy. Place your capital. Decide what your people are paid to hit. Then see 1,000 futures.</p>
  <button class="cta" data-go="guess">Take the chair</button></section>`;
}
function radios(name, items, sel){ return items.map(a=>`<label class="choice"><input type="radio" name="${name}" value="${a[0]}" ${sel===a[0]?'checked':''}><span>${esc(a[1])}</span></label>`).join(''); }
function guess(){
  app.innerHTML = `<section class="card" style="max-width:820px;margin:6vh auto"><h2>One question first</h2><p class="mute">This is not scored.</p>
  <fieldset><legend>${C.guess.q}</legend>${radios('guess', C.guess.a, S.guess)}</fieldset>
  <div class="foot"><span></span><button class="cta" data-go="diag" ${S.guess?'':'disabled'}>Continue</button></div></section>`;
}
function diag(){
  const pick = C.diag.a.find(a=>a[0]===S.diag);
  app.innerHTML = `<h2>${C.company} today</h2><p class="mute">A fictional company. The figures are illustrative.</p>
  <div class="grid g3" style="margin:14px 0">${C.tiles.map(x=>`<div class="card tile"><div class="k">${x[0]}</div><b>${x[1]}</b><div>${x[2]}</div></div>`).join('')}</div>
  <div class="card"><fieldset><legend>${C.diag.q}</legend>${radios('diag', C.diag.a, S.diag)}</fieldset>
  ${pick?`<div class="fb" role="status">${pick[2]} <span class="mute">This step is not scored.</span></div>`:''}
  <div class="foot"><span></span><button class="cta" data-go="choose" ${S.diag?'':'disabled'}>Choose a strategy</button></div></div>`;
}
function choose(){
  app.innerHTML = `<h2>Where will you play, and how will you win?</h2><p class="mute">Carriers have chosen each of these. Your score will measure whether your capital and your measures match the one you pick.</p>
  <div class="grid g4" style="margin:14px 0">${Object.keys(C.strategies).map(id=>{ const s=C.strategies[id]; return `<button class="strat ${S.strat===id?'sel':''}" data-strat="${id}" aria-pressed="${S.strat===id}"><h3>${s.name}</h3><div class="k">Where to play</div><div>${s.where}</div><div class="k">How to win</div><div>${s.how}</div></button>`; }).join('')}</div>
  <div class="foot"><span class="mute">Each chip you place later is ${bil(1)}.</span><button class="cta" data-go="r0" ${S.strat?'':'disabled'}>Open the first budget</button></div>`;
}
function startRound(){
  const prev = S.rounds[t()-1]; S.cur = M.emptyAlloc();
  if (prev){ ['fiber','wireless','legacy','dividend','debt'].forEach(o=>S.cur[o]=prev[o]); S.curK = S.kpis[t()-1].slice();
    let over = -left(); const order = ['debt','legacy','dividend','wireless','fiber']; let i = 0;
    while (over>0 && i<200){ const o = order[i%5]; if (S.cur[o]>0){ S.cur[o]--; over--; } i++; }
    S.cur.debt = Math.min(S.cur.debt, led().debtStart); }
}
function round(){
  const i = t(), L = led(), l = left(), nw = C.news[i], a = S.cur;
  const stepper = o => { const max = o==='debt' ? L.debtStart : 99;
    return `<div class="row"><div><div class="nm">${C.opts[o].name}</div><div class="nt">${C.opts[o].note}</div><div class="chips">${'<i class="chip"></i>'.repeat(a[o])}</div></div>
    <div class="step"><button data-dec="${o}" aria-label="Less ${C.opts[o].name}" ${a[o]<=0?'disabled':''}>&minus;</button><div class="n" id="n-${o}">${a[o]}</div><button data-inc="${o}" aria-label="More ${C.opts[o].name}" ${(l<=0||a[o]>=max)?'disabled':''}>+</button></div></div>`; };
  const deal = o => { const owned = o==='ptv'?L.ptvOwned:L.mediaOwned, open = C.dealRounds[o].indexOf(i)>=0, on = a[o]>0;
    const lab = owned ? 'Owned' : (!open ? 'Not for sale' : (on ? 'Buying' : 'Buy for ' + M.DEAL_COST[o]));
    return `<div class="row"><div><div class="nm">${C.opts[o].name}</div><div class="nt">${C.opts[o].note} Costs ${M.DEAL_COST[o]} chips.</div><div class="chips">${'<i class="chip"></i>'.repeat(a[o])}</div></div>
    <button class="deal ${on?'on':''}" data-deal="${o}" aria-pressed="${on}" ${(owned||!open)?'disabled':''}>${lab}</button></div>`; };
  app.innerHTML = `<div class="news"><span class="yr">${nw[0]}</span><span>${nw[1]}</span></div>
  <div class="board"><div class="card"><h2>Place your capital</h2>
    <p class="mute">You have ${plural(L.base,'chip')} this cycle. Each chip is ${bil(1)}.${L.drag?` Interest on your debt took ${plural(L.drag,'chip')}.`:''}${L.cash?` Acquired businesses added ${plural(L.cash,'chip')}.`:''}</p>
    <div class="meter" style="margin:4px 0 8px"><div class="left ${l<0?'bad':(l===0?'ok':'')}" id="left">${l<0?`Over by ${-l}. Remove chips or borrow.`:(l===0?'All capital placed':`${plural(l,'chip')} left to place`)}</div></div>
    ${stepper('fiber')}${stepper('wireless')}${stepper('legacy')}${deal('ptv')}${deal('media')}${stepper('dividend')}${stepper('debt')}
    <div class="borrow"><div class="row"><div><div class="nm">Borrow</div><div class="nt">Up to ${M.START.borrowMax} more chips this cycle. It lets you fund more and choose less.</div><div class="chips">${'<i class="chip b"></i>'.repeat(a.borrow)}</div></div>
    <div class="step"><button data-dec="borrow" aria-label="Borrow less" ${a.borrow<=0?'disabled':''}>&minus;</button><div class="n" id="n-borrow">${a.borrow}</div><button data-inc="borrow" aria-label="Borrow more" ${a.borrow>=M.START.borrowMax?'disabled':''}>+</button></div></div></div>
  </div>
  <div class="grid"><div class="card"><h3>Pay your people on three measures</h3><p class="mute small">They will hit what you measure.</p>
    <div class="kp">${M.KPIS.map(k=>`<button data-kpi="${k}" class="${S.curK.indexOf(k)>=0?'on':''}" aria-pressed="${S.curK.indexOf(k)>=0}">${C.kpis[k]}</button>`).join('')}</div></div>
    <div class="card"><h3>${C.company} territory</h3><canvas id="map" height="190"></canvas>
      <div class="stat"><span>Your strategy</span><b>${C.strategies[S.strat].name}</b></div>
      <div class="stat"><span>Debt</span><b>${bil(L.debtStart + a.borrow - a.debt)}</b></div>
      ${S.strip.length?'<canvas id="strip" height="'+(34+S.strip.length*26)+'"></canvas>':''}</div>
    <button class="cta" id="commit" data-commit="1" ${(l===0&&S.curK.length===3)?'':'disabled'} style="justify-self:stretch">${l!==0?'Place all your capital':(S.curK.length!==3?'Pick three measures':'Commit this cycle')}</button>
  </div></div>`;
  drawMap(); if (S.strip.length) drawStrip($('#strip'), S.strip);
}
function ctx2d(c){ const d = Math.min(2, devicePixelRatio||1), w = c.clientWidth, h = +c.getAttribute('height'); c.width = w*d; c.height = h*d; c.style.height = h+'px'; const x = c.getContext('2d'); x.scale(d,d); return [x,w,h]; }
function drawMap(){
  const c = $('#map'); if (!c) return; const [x,w,h] = ctx2d(c); const all = S.rounds.concat([S.cur]);
  let fib = 0, wl = 0; all.forEach(a=>{ fib += a.fiber; wl += a.wireless; }); const lit = Math.min(98, Math.round(fib*3.3));
  const cols = 14, rows = 7, gx = w/(cols+.5), gy = (h-20)/(rows+.3), r = Math.min(gx,gy)*.28, age = all.length;
  const litSet = new Set(S.order.slice(0, lit)); const glow = Math.min(1, wl/(all.length*4));
  for (let j=0;j<rows;j++) for (let i=0;i<cols;i++){ const id = j*cols+i, cx = gx*(i+.6+(j%2)*.5), cy = gy*(j+.65);
    if (glow>0 && id%5===2){ x.beginPath(); x.arc(cx,cy,r*(2.2+glow*1.8),0,7); x.strokeStyle = `rgba(92,200,232,${.12+glow*.4})`; x.lineWidth = 1.2; x.stroke(); }
    x.beginPath(); x.arc(cx,cy,r,0,7);
    if (litSet.has(id)){ x.shadowColor = '#f0a94a'; x.shadowBlur = 10; x.fillStyle = '#f5c26b'; } else { x.shadowBlur = 0; x.fillStyle = `rgba(150,165,190,${Math.max(.12,.42-age*.07)})`; }
    x.fill(); x.shadowBlur = 0; }
  x.font = '12px Inter'; x.fillStyle = '#9aa8be'; x.fillText('Amber is fiber. Rings are wireless. Grey is copper.', 4, h-3);
}
const AX = [55, 185];
function drawStrip(c, strip){
  const [x,w,h] = ctx2d(c); const px = v => 78 + (Math.max(AX[0],Math.min(AX[1],v))-AX[0])/(AX[1]-AX[0])*(w-90);
  x.font = '12px Inter'; x.fillStyle = '#9aa8be'; x.fillText('Year 8 value if you repeat this cycle. 100 is status quo.', 0, 12);
  x.strokeStyle = '#9aa8be'; x.setLineDash([3,3]); x.beginPath(); x.moveTo(px(100),18); x.lineTo(px(100),h); x.stroke(); x.setLineDash([]);
  strip.forEach((s,i)=>{ const y = 34+i*26; x.fillStyle = '#9aa8be'; x.fillText('Cycle '+(i+1), 0, y+4);
    x.fillStyle = 'rgba(224,180,90,.35)'; x.fillRect(px(s.p10), y-6, Math.max(2,px(s.p90)-px(s.p10)), 12);
    x.fillStyle = '#e0b45a'; x.fillRect(px(s.p50)-1.5, y-9, 3, 18); x.fillStyle = '#eef2f8'; x.fillText(Math.round(s.p50), Math.min(w-22, px(s.p90)+6), y+4); });
}
function commit(){
  const L = led(), a = Object.assign({}, S.cur), k = S.curK.slice(), i = t();
  const ms = memos(a, k, S.strat, L); S.memoLog.push(ms); S.rounds.push(a); S.kpis.push(k);
  const P = M.project(S.rounds, S.kpis); const sim = M.simulate(P.R, P.K, S.strat, S.fut, S.base); S.strip.push(sim);
  ov.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mh"><h2 id="mh" tabindex="-1">What your people did in ${C.news[i][0].toLowerCase()}</h2>
  ${ms.map(m=>`<div class="memo ${m.tag}"><div class="t">${C.kpis[m.id]} ${m.tag==='fits'?'<i>Fits your strategy</i>':(m.tag==='conflicts'?'<i>Works against your strategy</i>':'')}</div>${m.text}</div>`).join('')}
  <canvas id="strip2" height="${34+S.strip.length*26}" style="margin-top:14px"></canvas>
  <div class="foot"><span class="mute small">The bar runs from the 10th to the 90th percentile of 1,000 futures.</span><button class="cta" data-next="1">${i<3?'Next cycle':'Run 1,000 futures'}</button></div></div></div>`;
  drawStrip($('#strip2'), S.strip); $('#mh').focus();
}
function next(){ ov.innerHTML = ''; if (t()<4){ startRound(); go('r'+t()); } else { S.sim = M.simulate(S.rounds, S.kpis, S.strat, S.fut, S.base); go('futures'); } }

function dice(f){
  const o = [['Customers leaving pay TV', f.cord<.14?'slowly':(f.cord<.25?'steadily':'fast')], ['Wireless price war', f.war<.017?'mild':(f.war<.034?'moderate':'severe')],
    ['Fiber sign ups', f.take<1.8?'low':(f.take<2.4?'typical':'high')], ['Interest rates', f.rates<.12?'barely rose':(f.rates<.24?'rose':'rose sharply')]];
  if (S.rounds.some(a=>a.media>0)){ const m = f.hits.reduce((p,c)=>p+c,0)/4; o.push(['Studio releases', m<.9?'missed':(m<1.05?'were mixed':'were hits')]); }
  return o;
}
function futures(){
  const s = S.sim;
  app.innerHTML = `<h2>Your plan in 1,000 futures</h2><p class="mute">Each dot is one possible year 8. The futures differ in how fast customers leave pay TV, how hard rivals cut prices, how many homes sign up for fiber, how far rates rise and how the studio performs.</p>
  <div class="card"><canvas id="hist" height="330"></canvas>
  <div class="grid g4" style="margin-top:10px"><div class="tile"><div class="k">Weak future, 10th percentile</div><b>${Math.round(s.p10)}</b></div><div class="tile"><div class="k">Middle future</div><b>${Math.round(s.p50)}</b></div><div class="tile"><div class="k">Strong future, 90th percentile</div><b>${Math.round(s.p90)}</b></div><div class="tile"><div class="k">Beat the status quo plan</div><b>${pct(s.beat)}</b></div></div>
  <div id="drawbox" class="fb" style="display:none" role="status"></div>
  <div class="foot"><span class="mute small">100 is the middle result of the status quo plan: hold wireless, maintain copper, pay the dividend, pay down debt.</span><span><button class="cta" id="drawBtn" data-draw="1">Draw your future</button> <button class="cta" id="toDeb" data-go="debrief" style="display:none">Debrief</button></span></div></div>`;
  animHist(); if (S.drawn!=null) showDraw();
}

function animHist(){
  const c = $('#hist'), [x,w,h] = ctx2d(c), s = S.sim, binW = 4, nb = Math.ceil((AX[1]-AX[0])/binW), counts = new Array(nb).fill(0);
  const raw = s.vals.map(v=>{ const b = Math.max(0, Math.min(nb-1, Math.floor((v-AX[0])/binW))); return [b, counts[b]++]; });
  const mx = Math.max.apply(null, counts), bw = (w-20)/nb; let d = 14, cols = 1;
  for (; d>2; d-=.5){ cols = Math.max(1, Math.floor((bw-2)/d)); if (Math.ceil(mx/cols)*d <= h-56) break; }
  const rr = d*.4, pos = raw.map(r=>[r[0], Math.floor(r[1]/cols), r[1]%cols]);
  const cxOf = q => 10 + q[0]*bw + (bw-cols*d)/2 + (q[2]+.5)*d, cyOf = q => h-32-(q[1]+.5)*d;
  const px = v => 10 + (v-AX[0])/binW*bw; const start = performance.now(), dur = (FAST || histDone) ? 0 : 2200;
  function frame(now){ const p = dur ? Math.min(1,(now-start)/dur) : 1; x.clearRect(0,0,w,h);
    x.strokeStyle = '#2a3750'; x.beginPath(); x.moveTo(0,h-28); x.lineTo(w,h-28); x.stroke();
    x.font = '12px Inter'; x.fillStyle = '#9aa8be'; for (let v=60; v<=180; v+=20){ x.fillText(v, px(v)-8, h-10); }
    x.setLineDash([4,4]); x.strokeStyle = '#9aa8be'; x.beginPath(); x.moveTo(px(100),10); x.lineTo(px(100),h-28); x.stroke(); x.setLineDash([]); x.fillText('Status quo', px(100)+6, 20);
    const n = Math.floor(p*pos.length);
    for (let i=0;i<n;i++){ const cx = cxOf(pos[i]), cy = cyOf(pos[i]); x.beginPath(); x.arc(cx,cy,rr,0,7); x.fillStyle = pos[i][0]*binW+AX[0] >= 100 ? 'rgba(224,180,90,.85)' : 'rgba(154,168,190,.7)'; x.fill(); }
    if (S.drawn!=null && p===1){ const cx = cxOf(pos[S.drawn]), cy = cyOf(pos[S.drawn]); x.beginPath(); x.arc(cx,cy,rr+5,0,7); x.strokeStyle = '#5cc8e8'; x.lineWidth = 3; x.stroke(); x.beginPath(); x.arc(cx,cy,rr+1,0,7); x.fillStyle = '#5cc8e8'; x.fill(); x.lineWidth = 1; }
    if (p<1) requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
}
function draw(){ const r = M.rng(S.seed+99); S.drawn = Math.floor(r()*1000); showDraw(); histDone = true; animHist(); }
function showDraw(){
  const v = S.sim.vals[S.drawn], f = S.fut[S.drawn], b = $('#drawbox'); if (!b) return;
  const rank = Math.round(S.sim.vals.filter(z=>z<=v).length/10);
  b.style.display = 'block'; b.innerHTML = `<b>Your future: ${Math.round(v)}.</b> That is the ${ord(rank)} percentile of your own 1,000. ${dice(f).map(d=>`${d[0]}: ${d[1]}.`).join(' ')}`;
  $('#drawBtn').style.display = 'none'; $('#toDeb').style.display = '';
}
function ord(n){ n = Math.max(1, Math.min(99, n)); const s = ['th','st','nd','rd'], v = n%100; return n + (s[(v-20)%10] || s[v] || s[0]); }

function moves(co){
  const out = [], cyc = a => a.length===1 ? 'cycle '+a[0] : 'cycles '+a.slice(0,-1).join(', ')+' and '+a[a.length-1];
  const bad = []; S.rounds.forEach((a,i)=>{ if ((a.fiber+a.wireless)>2 && (S.kpis[i].indexOf('margin')>=0 || S.kpis[i].indexOf('fcf')>=0)) bad.push(i+1); });
  if (bad.length) out.push(`In ${cyc(bad)} you funded the network and paid your people on margin or cash flow. They slowed the build to hit the measure.`);
  if (co.borrowed>0){ const drag = M.ledger(S.rounds).reduce((p,l)=>p+l.drag,0); out.push(`You borrowed ${plural(co.borrowed,'chip')} over four cycles. Interest took ${plural(drag,'chip')} of your capital. You ended with ${bil(co.endDebt)} of debt.`); }
  const cut = []; S.rounds.forEach((a,i)=>{ if (a.dividend<M.START.divExpected) cut.push(i+1); });
  if (cut.length) out.push(`You paid less than the expected dividend in ${cyc(cut)}. Shareholders marked the company down, and the chips went elsewhere.`);
  ['ptv','media'].forEach(o=>{ S.rounds.forEach((a,i)=>{ if (a[o]>0 && M.FIT[S.strat][o]===0) out.push(`In cycle ${i+1} you chose to ${C.opts[o].name.toLowerCase()}. Your stated strategy was ${C.strategies[S.strat].name}.`); }); });
  const dead = []; S.memoLog.forEach((ms,i)=>ms.forEach(m=>{ if (/Nobody could act/.test(m.text)) dead.push(i+1); }));
  if (dead.length) out.push(`In ${cyc([...new Set(dead)])} one of your three measures tracked a business you had not funded.`);
  if (!out.length) out.push('Your capital and your measures pointed the same way in every cycle.');
  return out.slice(0,4);
}
function debrief(){
  const co = M.coherence(S.rounds, S.kpis, S.strat); S.co = co;
  if (!S.self){ app.innerHTML = `<section class="card" style="max-width:760px;margin:8vh auto"><h2>Before the debrief</h2><fieldset><legend>How well did your capital match your strategy?</legend>${radios('self', [['hi','Closely'],['mid','Partly'],['lo','Loosely']], null)}</fieldset></section>`; return; }
  const v = S.sim.vals[S.drawn], good = v>=100, coh = co.score>=70;
  const quad = (coh?'Coherent plan. ':'Scattered plan. ') + (good?'Good draw.':'Bad draw.');
  const funded = M.OPTS.filter(o=>co.tot[o]>0), g = C.guess.a.find(a=>a[0]===S.guess);
  const bar = (n, v, max) => `<div class="b"><span>${n}</span><div class="tr"><i style="width:${Math.round(v/max*100)}%"></i></div><span>${Math.round(v)} of ${max}</span></div>`;
  app.innerHTML = `<h2>Debrief</h2>
  <div class="grid g2"><div class="card"><div class="tile"><div class="k">Coherence score</div></div><div class="big">${co.score}</div>
    <p class="mute">You rated the match as ${({hi:'close',mid:'partial',lo:'loose'})[S.self]}. The score measures fit between your strategy, your capital and your measures. It does not say which strategy is right.</p>
    <div class="bars">${bar('Capital fits strategy', co.pts.fit, 40)}${bar('Focus', co.pts.focus, 25)}${bar('Measures fit', co.pts.measures, 20)}${bar('Balance sheet', co.pts.balance, 15)}</div></div>
   <div class="card"><h3>${quad}</h3>
    <p>Your plan beat the status quo plan in ${pct(S.sim.beat)} of 1,000 futures. The future you drew came in at ${Math.round(v)}.</p>
    <h3 style="margin-top:14px">What you said no to</h3><div>${co.said_no.length ? co.said_no.map(o=>`<span class="pill no">${C.opts[o].name}</span>`).join('') : '<span class="pill">Nothing. You funded all seven.</span>'}</div>
    <h3 style="margin-top:14px">What you funded</h3><div>${funded.map(o=>`<span class="pill">${C.opts[o].name}: ${co.tot[o]}</span>`).join('')}</div>
    <p class="mute" style="margin-top:10px">At the start you said a company should fund “${g[1].toLowerCase()}.” You funded ${funded.length} of 7 options. Your two largest took ${Math.round(co.top2*100)}% of your capital.</p></div></div>
  <div class="card" style="margin-top:16px"><h3>Your moves</h3>${moves(co).map(m=>`<div class="memo">${m}</div>`).join('')}
    <p style="margin-top:14px"><b>${C.transfer}</b></p>
    <div class="foot"><button class="ghost" data-about="1">How the score and the model work</button><button class="cta" data-go="reveal">See the real case</button></div></div>`;
}
function reveal(){
  const sup = ks => ks.map(k=>{ const n = Object.keys(C.sources).indexOf(k)+1; return `<sup><a href="${C.sources[k][1]}" target="_blank" rel="noopener">[${n}]</a></sup>`; }).join('');
  const own = o => { const i = S.rounds.findIndex(a=>a[o]>0); return i>=0 ? 'Bought in cycle '+(i+1) : 'Passed'; };
  const co = S.co || M.coherence(S.rounds, S.kpis, S.strat); const cut = S.rounds.some(a=>a.dividend<M.START.divExpected);
  app.innerHTML = `<h2>A real company sat at this table in 2014</h2>
  <p class="mute">This is the public record of AT&amp;T. The simulation is a generic model. It does not show what AT&amp;T would have earned on another path.</p>
  <div class="grid g2" style="margin-top:14px"><div class="card"><h3>The record</h3><div class="tl">${C.timeline.map(e=>`<div class="y">${e[0]}</div><div>${esc(e[1])}${sup(e[2])}</div>`).join('')}</div></div>
  <div class="card"><h3>Side by side</h3><table><tr><th></th><th>You</th><th>AT&amp;T</th></tr>
   <tr><td>Satellite TV</td><td>${own('ptv')}</td><td>Bought DIRECTV in 2015</td></tr>
   <tr><td>Film and TV studio</td><td>${own('media')}</td><td>Bought Time Warner in 2018</td></tr>
   <tr><td>Debt</td><td>${bil(M.START.debt)} to ${bil(co.endDebt)}</td><td>$82.1 billion total debt in 2014. $180.4 billion net debt in June 2018.</td></tr>
   <tr><td>Dividend</td><td>${cut?'Paid less than expected at least once':'Paid in full every cycle'}</td><td>$1.85 a share in 2014. $2.08 before the 2022 change. $1.11 after.</td></tr>
   <tr><td>Later</td><td>${co.said_no.length ? 'Said no to ' + plural(co.said_no.length,'option') : 'Funded all seven options'}</td><td>Exited both businesses between 2021 and 2024 and named 5G and fiber as its focus.</td></tr></table>
   <p class="mute small" style="margin-top:10px">Sources are numbered and listed under About. Total debt and net debt are different measures.</p>
   <div class="foot"><button class="ghost" data-about="1">About and sources</button><button class="cta" data-again="1">Play again</button></div></div></div>`;
}
function about(){
  const src = Object.keys(C.sources).map((k,i)=>{ const s = C.sources[k]; return `<li>${esc(s[0])}${s[1]?`. <a href="${s[1]}" target="_blank" rel="noopener">Link</a>`:''}</li>`; }).join('');
  ov.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="ah"><h2 id="ah" tabindex="-1">About this simulation</h2>
  <h3>What is real</h3><p>The final screen reports AT&amp;T's public record from company filings and press releases. Every figure there has a numbered source below.</p>
  <h3>What is modeled</h3><p>${C.company} is fictional. Its dashboard, the chip values and the 1,000 futures are an illustrative model written for this demo. The model is not a forecast and not a model of AT&amp;T. Its main assumptions: fiber returns about twice its cost when it has time to mature. Wireless needs two chips a cycle to hold its value. Legacy spending returns less than it costs. Pay TV loses between 4% and 36% of its value each cycle. A studio is worth more to a company whose strategy is built around it. Debt above ten chips gets more expensive when rates rise. Cutting the dividend costs value once and frees capital after that.</p>
  <h3>How your people respond</h3><p>The staff responses are illustrative. They follow the pattern Steven Kerr described in 1975: people do what is rewarded.</p>
  <h3>How the score works</h3><p>Capital fits strategy, 40 points. Focus, 25 points, full marks when your two largest uses take 65% of capital. Measures fit strategy, 20 points. Balance sheet, 15 points. The fit tables are the author's judgment, built on the strategy cascade in Playing to Win and on Porter's argument that strategy requires trade-offs. Strategy has no computable right answer, and reasonable people would weight these differently.</p>
  <h3>Sources</h3><ol>${src}</ol>
  <p class="mute small">Built by José Antonio Bowen with Claude Fable 5.2 as an eight minute demo for <a href="https://weteachwithai.com/vibe-coding/" target="_blank" rel="noopener">weteachwithai.com</a>. No tracking. Nothing you enter leaves this page.</p>
  <div class="foot"><span></span><button class="cta" data-close="1">Close</button></div></div></div>`;
  $('#ah').focus();
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
  if (d.go){ if (d.go==='r0') startRound(); go(d.go); }
  else if (d.strat){ S.strat = d.strat; render(); }
  else if (d.inc){ const o = d.inc; if (o==='borrow'){ if (S.cur.borrow<M.START.borrowMax) S.cur.borrow++; } else if (left()>0) S.cur[o]++; render(); }
  else if (d.dec){ if (S.cur[d.dec]>0) S.cur[d.dec]--; render(); }
  else if (d.deal){ S.cur[d.deal] = S.cur[d.deal] ? 0 : M.DEAL_COST[d.deal]; render(); }
  else if (d.kpi){ const i = S.curK.indexOf(d.kpi); if (i>=0) S.curK.splice(i,1); else if (S.curK.length<3) S.curK.push(d.kpi); render(); }
  else if (d.commit){ if (left()===0 && S.curK.length===3) commit(); }
  else if (d.next) next();
  else if (d.draw) draw();
  else if (d.about || b.id==='aboutBtn') about();
  else if (d.close) ov.innerHTML = '';
  else if (d.again){ reset(); go('intro'); }
});
document.addEventListener('change', e => { const i = e.target; if (i.name==='guess'){ S.guess = i.value; render(); } if (i.name==='diag'){ S.diag = i.value; render(); } if (i.name==='self'){ S.self = i.value; render(); } });
document.addEventListener('keydown', e => { if (e.key==='Escape' && ov.querySelector('[data-close]')) ov.innerHTML = ''; });
let rz; addEventListener('resize', ()=>{ clearTimeout(rz); rz = setTimeout(()=>{ if (/^r\d/.test(S.step)){ drawMap(); if ($('#strip')) drawStrip($('#strip'), S.strip); } if (S.step==='futures') animHist(); }, 150); });
reset(); render();
window.__demo = { state: () => S, go, model: M,
  play(plan){ S.guess = plan.guess||'all'; S.diag = plan.diag||'core'; S.strat = plan.strat; S.rounds = []; S.kpis = []; S.strip = []; S.memoLog = [];
    plan.rounds.forEach((a,i)=>{ S.cur = Object.assign(M.emptyAlloc(), a); S.curK = plan.kpis[i] || plan.kpis[0]; if (left()!==0) throw new Error('round '+i+' left '+left()); commit(); ov.innerHTML = ''; });
    S.sim = M.simulate(S.rounds, S.kpis, S.strat, S.fut, S.base); go('futures'); } };
})();
