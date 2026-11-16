// Illustrative model of a generic telecom in 2014. Not a forecast and not a model of any real company.
const CHIP_B = 4;
const OPTS = ['fiber','wireless','enterprise','legacy','ptv','media','cable','abroad','dividend','debt'];
const DEALS = ['ptv','media','cable','abroad'];
const KPIS = ['adds','rev','margin','fcf','churn','homes','video','biz','intl','lev'];
const DEAL_COST = { ptv: 8, media: 12, cable: 10, abroad: 8 };
const START = { debt: 6, base: 11, wireless: 50, legacy: 30, divExpected: 3, borrowMax: 6 };
const Z = { fiber:0, wireless:0, enterprise:0, legacy:0, ptv:0, media:0, cable:0, abroad:0, dividend:.5, debt:.5 };
const fit = o => Object.assign({}, Z, o);
const FIT = {
  network:   fit({ fiber:1, wireless:1, enterprise:.5 }),
  bundle:    fit({ ptv:1, wireless:1, fiber:.5 }),
  content:   fit({ media:1, wireless:1, ptv:.5, fiber:.5 }),
  broadband: fit({ cable:1, fiber:1, wireless:.5 }),
  abroad:    fit({ abroad:1, wireless:1 }),
  business:  fit({ enterprise:1, wireless:1, fiber:.5 })
};
const KZ = { adds:0, rev:0, margin:0, fcf:0, churn:0, homes:0, video:0, biz:0, intl:0, lev:.5 };
const kfit = o => Object.assign({}, KZ, o);
const KFIT = {
  network:   kfit({ churn:1, homes:1, adds:.5 }),
  bundle:    kfit({ video:1, churn:1, adds:1, rev:.5, fcf:.5 }),
  content:   kfit({ rev:1, video:.5, churn:.5, adds:.5, fcf:.5 }),
  broadband: kfit({ homes:1, churn:1, rev:.5, adds:.5 }),
  abroad:    kfit({ intl:1, adds:1, rev:.5, fcf:.5 }),
  business:  kfit({ biz:1, churn:1, rev:.5 })
};
// Tuned so each strategy, fully funded and measured to match, has a similar middle result.
const P = { fiberTake: 2.0, entTake: 2.05, wGrow: .04, tvSyn: .036, mediaMu: 1.16, mediaSyn: .012, cableMu: 1.13, abroadMu: 1.14, block: .15,
            side: { 1: 1, .5: .85, 0: .65 }, dealSide: { 1: 0, .5: -.04, 0: -.10 }, unfunded: .88 };
function rng(seed){ let a = seed>>>0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a>>>15, 1|a); t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; }; }
function gauss(r){ let u=0,v=0; while(u===0)u=r(); while(v===0)v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function emptyAlloc(){ const a = { borrow:0 }; OPTS.forEach(o=>a[o]=0); return a; }
function ledger(rounds){
  let debt = START.debt; const out = []; const at = { ptv:-1, media:-1, cable:-1, abroad:-1 };
  for (let t=0; t<4; t++){
    const drag = Math.floor(debt/6); let cash = 0;
    if (at.ptv>=0 && t-at.ptv>=1 && t-at.ptv<=2) cash += 1;
    ['media','cable','abroad'].forEach(d => { if (at[d]>=0 && t-at[d]>=1) cash += 1; });
    const a = rounds[t]; const owned = {}; DEALS.forEach(d => owned[d] = at[d]>=0);
    out.push({ debtStart: debt, drag, cash, base: START.base - drag + cash, owned });
    if (!a) break;
    DEALS.forEach(d => { if (a[d]>0 && at[d]<0) at[d] = t; });
    debt = Math.max(0, debt + a.borrow - a.debt);
  }
  return out;
}
function spent(a){ let s = 0; OPTS.forEach(o => s += a[o]); return s; }
function drawFuture(r){
  const four = sd => [0,1,2,3].map(()=> gauss(r)*sd);
  return { cord: r()*.30, war: r()*.05, take: Math.exp(.25*gauss(r) - .03125), ent: Math.exp(.35*gauss(r) - .06125), rates: r()*.35,
           hits: four(.3), cab: four(.12), fx: four(.28), blocked: r() < P.block };
}
function coreShare(rounds, strategy){ let c = 0, all = 0; rounds.forEach(a => OPTS.forEach(o => { all += a[o]; if (strategy && FIT[strategy][o]===1) c += a[o]; })); return all ? c/all : 0; }
function valueOf(rounds, kpis, strategy, f){
  const F = strategy ? FIT[strategy] : null, side = o => F ? P.side[F[o]] : 1, dside = o => F ? P.dealSide[F[o]] : 0;
  const funded = !strategy || coreShare(rounds, strategy) >= .5, cm = o => (F && F[o]===1 && !funded) ? P.unfunded : 1;
  let W = START.wireless, L = START.legacy, debt = START.debt, harvest = 0, divPaid = 0, divCut = false, divPenalty = 0;
  let fiberVal = 0, fiberChips = 0, entVal = 0, entChips = 0; const own = { ptv:0, media:0, cable:0, abroad:0 };
  const maturity = [1, 1, .8, .5];
  for (let t=0; t<4; t++){
    const a = rounds[t], k = kpis[t] || [], has = id => k.indexOf(id)>=0;
    let kBuild = 1; if (has('margin')) kBuild *= .85; if (has('fcf')) kBuild *= .85; if (has('rev')) kBuild *= .95;
    let take = f.take * P.fiberTake; if (has('homes')) take *= .93; if (has('churn')) take *= 1.05;
    const fEff = a.fiber * kBuild * (has('homes') ? 1.1 : 1);
    fiberChips += fEff; fiberVal += fEff * take * maturity[t] * side('fiber') * cm('fiber');
    const eEff = a.enterprise * kBuild; let et = f.ent * P.entTake; if (has('biz')) et *= 1.08;
    entChips += eEff; entVal += eEff * et * maturity[t] * side('enterprise') * cm('enterprise');
    let war = f.war; if (has('churn')) war *= .7; if (has('adds')) war *= .6;
    const w = a.wireless * kBuild * (t===2 ? 1.25 : 1);
    let g = w>=2 ? (P.wGrow*Math.min(w-2,3) + .015*Math.max(0,w-5)) * side('wireless') * cm('wireless') : -.06*(2-w);
    if (has('adds')) g -= .012;
    if (own.ptv>0 && F && F.ptv===1) g += P.tvSyn * (1.5 - 3.3*f.cord) * cm('ptv');
    if (own.media>0 && F && F.media===1) g += P.mediaSyn * cm('media');
    W *= (1 + g - war);
    L *= .78; harvest += a.legacy * .8 * (has('margin') ? 1.15 : 1);
    if (own.ptv>0){ let d = f.cord - dside('ptv'); if (has('video')) d *= .8; own.ptv *= (1-d) * (has('video') ? .975 : 1) * cm('ptv'); }
    if (own.media>0) own.media *= Math.max(.3, P.mediaMu + f.hits[t] + dside('media')) * cm('media');
    if (own.cable>0) own.cable *= Math.max(.5, P.cableMu + f.cab[t] + dside('cable') + (has('homes') ? .01 : 0)) * cm('cable');
    if (own.abroad>0) own.abroad *= Math.max(.3, P.abroadMu + f.fx[t] + dside('abroad') + (has('intl') ? .02 : 0)) * cm('abroad');
    DEALS.forEach(d => { if (a[d]>0 && own[d]===0) own[d] = DEAL_COST[d]; });
    if (a.cable>0 && f.blocked) own.cable = -1; // regulators block the deal
    divPaid += a.dividend;
    if (a.dividend < START.divExpected){ if (!divCut){ divPenalty += 3; divCut = true; } divPenalty += .3*(START.divExpected - a.dividend); }
    debt = Math.max(0, debt + a.borrow - a.debt);
  }
  let cableVal = own.cable; if (own.cable===-1) cableVal = DEAL_COST.cable - 1.5;
  if (fiberChips >= 12) fiberVal *= 1.15; if (entChips >= 8) entVal *= 1.1;
  let levN = 0; kpis.forEach(k => { if ((k||[]).indexOf('lev')>=0) levN++; }); const rs = f.rates * (1 - .2*levN/4);
  const debtPen = debt + Math.max(0, debt-10)*rs + Math.max(0, debt-14)*.8;
  const cashBack = own.cable===-1 ? 0 : 0;
  const parts = { wireless: W, fiber: fiberVal, enterprise: entVal, legacy: L + harvest, ptv: own.ptv, media: own.media, cable: cableVal, abroad: own.abroad, dividend: divPaid - divPenalty, debt: -debtPen };
  let v = cashBack; for (const p in parts) v += parts[p];
  return { v, parts, endDebt: debt };
}
const STATUS_QUO = [0,1,2,3].map(()=>Object.assign(emptyAlloc(), { wireless:2, legacy:3, dividend:3, debt:2 }));
function futures(seed, n){ const r = rng(seed); const out = []; for (let i=0;i<n;i++) out.push(drawFuture(r)); return out; }
function simulate(rounds, kpis, strategy, fut, base){
  const vals = fut.map(f => valueOf(rounds, kpis, strategy, f).v / base * 100);
  const s = vals.slice().sort((a,b)=>a-b); const q = p => s[Math.min(s.length-1, Math.floor(p*s.length))];
  return { vals, p10: q(.1), p50: q(.5), p90: q(.9), beat: vals.filter(x=>x>=100).length / vals.length };
}
function baseline(fut){ const s = fut.map(f=>valueOf(STATUS_QUO, [[],[],[],[]], null, f).v).sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; }
function project(rounds, kpis){
  const R = rounds.slice(), K = kpis.slice(); const last = R[R.length-1], lk = K[K.length-1];
  while (R.length<4){ const c = Object.assign({}, last); DEALS.forEach(d=>c[d]=0); R.push(c); K.push(lk); }
  return { R, K };
}
function coherence(rounds, kpis, strategy){
  const tot = emptyAlloc(); let all = 0, borrowed = 0;
  rounds.forEach(a => { OPTS.forEach(o => { tot[o] += a[o]; all += a[o]; }); borrowed += a.borrow; });
  let f = 0; OPTS.forEach(o => f += tot[o] * FIT[strategy][o]); f = all ? f/all : 0;
  const core = coreShare(rounds, strategy);
  const sorted = OPTS.map(o=>tot[o]).sort((a,b)=>b-a); const top2 = all ? (sorted[0]+sorted[1])/all : 0;
  let kf = 0, kn = 0; kpis.forEach(k => k.forEach(id => { kf += KFIT[strategy][id]; kn++; })); kf = kn ? kf/kn : 0;
  const led = ledger(rounds); const last = rounds[3];
  const endDebt = Math.max(0, led[3].debtStart + last.borrow - last.debt);
  const bal = Math.max(0, Math.min(1, 1 - (endDebt-10)/12));
  const said_no = OPTS.filter(o => tot[o]===0);
  const pts = { fit: 45*Math.min(1, f/.85), measures: 25*kf, focus: 15*Math.min(1, top2/.6), balance: 15*bal };
  const moved = (() => { const a = rounds[0], q = STATUS_QUO[0]; let d = 0; OPTS.forEach(o => d += Math.abs(a[o]-q[o])); return d / (spent(a) + spent(q)); })();
  return { score: Math.round(pts.fit+pts.measures+pts.focus+pts.balance), pts, tot, all, borrowed, endDebt, said_no, top2, core, funded: core>=.5, moved };
}
const Model = { CHIP_B, OPTS, DEALS, KPIS, DEAL_COST, START, FIT, KFIT, P, emptyAlloc, ledger, spent, futures, simulate, baseline, project, coherence, coreShare, valueOf, STATUS_QUO, rng };
if (typeof module !== 'undefined') module.exports = Model; else globalThis.Model = Model;
