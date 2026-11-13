const M = require('../src/model.js');
const fut = M.futures(1854, 1000), base = M.baseline(fut);
const R = (o)=>Object.assign(M.emptyAlloc(), o);
const rep = a => [0,1,2,3].map(()=>R(a));
const S = {
 'Status quo (harvest)': [M.STATUS_QUO, ['margin','fcf','lev'], 'harvest'],
 'Network, coherent': [rep({fiber:5,wireless:3,dividend:2}), ['churn','homes','lev'], 'network'],
 'Network, margin KPIs': [rep({fiber:5,wireless:3,dividend:2}), ['margin','fcf','rev'], 'network'],
 'Network, keeps dividend': [rep({fiber:4,wireless:3,dividend:3}), ['churn','homes','lev'], 'network'],
 'Bundle, coherent': [[R({ptv:8,wireless:3,dividend:3,borrow:4}),R({wireless:4,fiber:2,dividend:3,debt:1}),R({wireless:4,fiber:2,dividend:3,debt:2}),R({wireless:4,fiber:2,dividend:3,debt:1})], ['video','churn','adds'], 'bundle'],
 'Content, coherent': [[R({wireless:3,dividend:3,debt:4}),R({media:12,wireless:2,dividend:2,borrow:6}),R({wireless:4,dividend:3,debt:3}),R({wireless:4,dividend:3,debt:3})], ['rev','churn','lev'], 'content'],
 'Everything, borrowed': [[R({ptv:8,fiber:2,wireless:2,legacy:1,dividend:3,borrow:6}),R({media:12,wireless:2,dividend:3,borrow:6}),R({fiber:2,wireless:2,legacy:1,dividend:3,borrow:1}),R({fiber:2,wireless:2,legacy:1,dividend:3,borrow:1})], ['rev','adds','video'], 'content'],
 'Spread thin, no debt': [rep({fiber:2,wireless:2,legacy:2,dividend:3,debt:1}), ['rev','margin','churn'], 'network'],
 'Harvest, coherent': [rep({legacy:2,wireless:2,dividend:4,debt:2}), ['margin','fcf','lev'], 'harvest'],
};
console.log('scenario'.padEnd(26),'P10  P50  P90  beat  coh  budgetOK');
for (const n in S){ const [r,k,s] = S[n]; const K=[k,k,k,k]; const sim = M.simulate(r,K,s,fut,base); const c = M.coherence(r,K,s);
  const led = M.ledger(r); const ok = r.every((a,t)=> M.spent(a) === led[t].base + a.borrow);
  console.log(n.padEnd(26), sim.p10.toFixed(0).padStart(3), sim.p50.toFixed(0).padStart(4), sim.p90.toFixed(0).padStart(4), (sim.beat*100).toFixed(0).padStart(4)+'%', String(c.score).padStart(4), ok, led.map(l=>l.base).join(',')); }
