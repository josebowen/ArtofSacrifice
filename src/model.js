// Illustrative model of a generic telecom. Not a forecast and not a model of any real company.
const CHIP_B = 4; // each chip is $4 billion
const OPTS = ['fiber','wireless','legacy','ptv','media','dividend','debt'];
const KPIS = ['adds','rev','margin','fcf','churn','homes','video','lev'];
const DEAL_COST = { ptv: 8, media: 12 };
const START = { debt: 6, base: 11, wireless: 50, legacy: 30, divExpected: 3, borrowMax: 6 };
const FIT = {
  network: { fiber:1, wireless:1, debt:.5, dividend:.5, legacy:0, ptv:0, media:0 },
  bundle:  { ptv:1, wireless:1, fiber:.5, debt:.5, dividend:.5, legacy:0, media:0 },
  content: { media:1, wireless:1, fiber:.5, ptv:.5, debt:.5, dividend:.5, legacy:0 },
  harvest: { dividend:1, debt:1, legacy:1, wireless:.5, fiber:0, ptv:0, media:0 }
};
const KFIT = {
  network: { churn:1, homes:1, lev:.5, adds:.5, rev:0, margin:0, fcf:0, video:0 },
  bundle:  { video:1, churn:1, adds:1, rev:.5, lev:.5, homes:.5, margin:0, fcf:0 },
  content: { rev:1, video:.5, churn:.5, adds:.5, lev:.5, homes:0, margin:0, fcf:0 },
  harvest: { margin:1, fcf:1, lev:1, churn:.5, adds:0, rev:0, homes:0, video:0 }
};
function rng(seed){ let a = seed>>>0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a>>>15, 1|a); t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; }; }
function gauss(r){ let u=0,v=0; while(u===0)u=r(); while(v===0)v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function emptyAlloc(){ return { fiber:0, wireless:0, legacy:0, ptv:0, media:0, dividend:0, debt:0, borrow:0 }; }
// Budget for each round, given the rounds already played.
function ledger(rounds){
  let debt = START.debt; const out = []; let ptvAt = -1, mediaAt = -1;
  for (let t=0; t<4; t++){
    const drag = Math.floor(debt/6);
    let cash = 0;
    if (ptvAt>=0 && t-ptvAt>=1 && t-ptvAt<=2) cash += 1;
    if (mediaAt>=0 && t-mediaAt>=1) cash += 1;
    const base = START.base - drag + cash;
    const a = rounds[t];
    out.push({ debtStart: debt, drag, cash, base, ptvOwned: ptvAt>=0, mediaOwned: mediaAt>=0 });
    if (!a) break;
    if (a.ptv>0 && ptvAt<0) ptvAt = t;
    if (a.media>0 && mediaAt<0) mediaAt = t;
    debt = Math.max(0, debt + a.borrow - a.debt);
  }
  return out;
}
function spent(a){ return a.fiber+a.wireless+a.legacy+a.ptv+a.media+a.dividend+a.debt; }
function drawFuture(r){
  return { cord: .04 + r()*.32, war: r()*.05, take: 2.1*Math.exp(.25*gauss(r) - .03125), rates: r()*.35,
           hits: [0,1,2,3].map(()=> Math.max(.3, .97 + .3*gauss(r))) };
}
// Value at year 8 for one future. rounds: 4 allocations, kpis: 4 arrays, strategy id.
function valueOf(rounds, kpis, strategy, f){
  let W = START.wireless, L = START.legacy, debt = START.debt;
  let fiberVal = 0, fiberChips = 0, harvest = 0, divPaid = 0, divCut = false, divPenalty = 0;
  let ptv = 0, media = 0;
  const maturity = [1, 1, .8, .5];
  for (let t=0; t<4; t++){
    const a = rounds[t], k = kpis[t] || [];
    const has = id => k.indexOf(id)>=0;
    let kBuild = 1; if (has('margin')) kBuild *= .85; if (has('fcf')) kBuild *= .85; if (has('rev')) kBuild *= .95;
    let take = f.take; if (has('homes')) take *= .93; if (has('churn')) take *= 1.05;
    const fEff = a.fiber * kBuild * (has('homes') ? 1.1 : 1);
    fiberChips += fEff; fiberVal += fEff * take * maturity[t];
    let war = f.war; if (has('churn')) war *= .7; if (has('adds')) war *= .6;
    if (ptv>0 && strategy==='bundle') war *= .7;
    const w = a.wireless * kBuild * (t===2 ? 1.25 : 1);
    let g = w>=2 ? .04*Math.min(w-2,3) + .015*Math.max(0,w-5) : -.06*(2-w);
    if (has('adds')) g -= .012;
    if (has('rev') && a.ptv===0 && a.media===0 && ptv===0 && media===0) g -= .01;
    W *= (1 + g - war);
    L *= .78; harvest += a.legacy * .8 * (has('margin') ? 1.15 : 1);
    if (ptv>0){ let d = f.cord; if (has('video')) d *= .8; ptv *= (1-d); if (has('video')) ptv *= .975; }
    if (media>0){ let q = f.hits[t]; q *= strategy==='content' ? 1.03 : .93; media *= q; }
    if (a.ptv>0 && ptv===0) ptv = DEAL_COST.ptv * 1.15;
    if (a.media>0 && media===0) media = DEAL_COST.media;
    divPaid += a.dividend;
    if (a.dividend < START.divExpected){ if (!divCut){ divPenalty += 3; divCut = true; } divPenalty += .3*(START.divExpected - a.dividend); }
    debt = Math.max(0, debt + a.borrow - a.debt);
  }
  if (fiberChips >= 12) fiberVal *= 1.15;
  let levN = 0; kpis.forEach(k => { if ((k||[]).indexOf('lev')>=0) levN++; }); const rs = f.rates * (1 - .2*levN/4);
  const debtPen = debt + Math.max(0, debt-10)*rs + Math.max(0, debt-14)*.8;
  const parts = { wireless: W, fiber: fiberVal, legacy: L + harvest, ptv, media, dividend: divPaid - divPenalty, debt: -debtPen };
  let v = 0; for (const p in parts) v += parts[p];
  return { v, parts, endDebt: debt };
}
const STATUS_QUO = [0,1,2,3].map(()=>({ fiber:0, wireless:2, legacy:3, ptv:0, media:0, dividend:3, debt:2, borrow:0 }));
function futures(seed, n){ const r = rng(seed); const out = []; for (let i=0;i<n;i++) out.push(drawFuture(r)); return out; }
function simulate(rounds, kpis, strategy, fut, base){
  const vals = fut.map(f => valueOf(rounds, kpis, strategy, f).v / base * 100);
  const s = vals.slice().sort((a,b)=>a-b); const q = p => s[Math.min(s.length-1, Math.floor(p*s.length))];
  return { vals, p10: q(.1), p50: q(.5), p90: q(.9), beat: vals.filter(x=>x>=100).length / vals.length };
}
function baseline(fut){ const s = fut.map(f=>valueOf(STATUS_QUO, [[],[],[],[]], 'harvest', f).v).sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; }
// Repeat the last committed round for the rounds not yet played (deals are not repeated).
function project(rounds, kpis){
  const R = rounds.slice(), K = kpis.slice(); const last = R[R.length-1], lk = K[K.length-1];
  while (R.length<4){ R.push(Object.assign({}, last, { ptv:0, media:0 })); K.push(lk); }
  return { R, K };
}
function coherence(rounds, kpis, strategy){
  const tot = emptyAlloc(); let all = 0, borrowed = 0;
  rounds.forEach(a => { OPTS.forEach(o => { tot[o] += a[o]; all += a[o]; }); borrowed += a.borrow; });
  let fit = 0; OPTS.forEach(o => fit += tot[o] * FIT[strategy][o]); fit = all ? fit/all : 0;
  const sorted = OPTS.map(o=>tot[o]).sort((a,b)=>b-a); const top2 = all ? (sorted[0]+sorted[1])/all : 0;
  let kf = 0, kn = 0; kpis.forEach(k => k.forEach(id => { kf += KFIT[strategy][id]; kn++; })); kf = kn ? kf/kn : 0;
  const led = ledger(rounds); const last = rounds[3];
  const endDebt = Math.max(0, led[3].debtStart + last.borrow - last.debt);
  const bal = Math.max(0, Math.min(1, 1 - (endDebt-8)/12));
  const said_no = OPTS.filter(o => tot[o]===0);
  const pts = { fit: 40*fit, focus: 25*Math.min(1, top2/.65), measures: 20*kf, balance: 15*bal };
  return { score: Math.round(pts.fit+pts.focus+pts.measures+pts.balance), pts, tot, all, borrowed, endDebt, said_no, top2 };
}
const Model = { CHIP_B, OPTS, KPIS, DEAL_COST, START, FIT, KFIT, emptyAlloc, ledger, spent, futures, simulate, baseline, project, coherence, valueOf, STATUS_QUO, rng };
if (typeof module !== 'undefined') module.exports = Model; else globalThis.Model = Model;
