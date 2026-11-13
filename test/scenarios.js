const M = require('../src/model.js');
const fut = M.futures(1854, 1000), base = M.baseline(fut);
const R = o => Object.assign(M.emptyAlloc(), o), rep = a => [0,1,2,3].map(()=>R(a));
const S = {
 'Status quo': [M.STATUS_QUO, ['margin','fcf','lev'], 'network'],
 'Network, aligned': [rep({fiber:5,wireless:3,dividend:2}), ['churn','homes','lev'], 'network'],
 'Bundle, aligned': [[R({ptv:8,wireless:4,dividend:2,borrow:4}),R({wireless:5,fiber:2,dividend:3,debt:1}),R({wireless:5,fiber:1,dividend:3,debt:2}),R({wireless:5,fiber:2,dividend:3})], ['video','churn','adds'], 'bundle'],
 'Content, aligned': [[R({wireless:4,dividend:3,debt:3}),R({media:12,wireless:3,dividend:2,borrow:6}),R({wireless:5,dividend:3,debt:3}),R({wireless:5,dividend:3,debt:3})], ['rev','churn','adds'], 'content'],
 'Broadband, aligned': [[R({cable:10,fiber:3,dividend:2,wireless:1,borrow:6}),R({fiber:5,wireless:2,dividend:2,debt:1}),R({fiber:5,wireless:2,dividend:2,debt:2}),R({fiber:5,wireless:2,dividend:2,debt:2})], ['homes','churn','lev'], 'broadband'],
 'Abroad, aligned': [[R({abroad:8,wireless:4,dividend:2,borrow:4}),R({wireless:5,dividend:3,debt:3}),R({wireless:6,dividend:3,debt:2}),R({wireless:6,dividend:3,debt:3})], ['intl','adds','lev'], 'abroad'],
 'Business, aligned': [rep({enterprise:5,wireless:3,dividend:2}), ['biz','churn','lev'], 'business'],
 'Network chosen, TV bought': [[R({ptv:8,wireless:3,dividend:3,borrow:4}),R({wireless:3,fiber:2,legacy:2,dividend:3,debt:1}),R({wireless:3,fiber:2,legacy:2,dividend:3,debt:1}),R({wireless:3,fiber:2,legacy:2,dividend:3,debt:1})], ['rev','margin','video'], 'network'],
 'Business chosen, margin KPIs': [rep({enterprise:5,wireless:3,dividend:2}), ['margin','fcf','rev'], 'business'],
 'Everything, borrowed': [[R({ptv:8,abroad:8,dividend:1,borrow:6}),R({media:12,wireless:2,dividend:3,borrow:6}),R({fiber:2,wireless:2,enterprise:2,legacy:1,dividend:3,borrow:1}),R({fiber:2,wireless:2,enterprise:2,legacy:1,dividend:3,borrow:1})], ['rev','adds','video'], 'content'],
 'Spread thin': [rep({fiber:2,wireless:2,enterprise:2,legacy:1,dividend:3}), ['rev','margin','churn'], 'network'],
};
console.log('scenario'.padEnd(30),'P10  P50  P90  beat  coh core budgetOK');
for (const n in S){ const [r,k,s] = S[n]; const K=[k,k,k,k]; const sim = M.simulate(r,K,s,fut,base); const c = M.coherence(r,K,s);
  const led = M.ledger(r); const ok = r.every((a,t)=> M.spent(a) === led[t].base + a.borrow);
  console.log(n.padEnd(30), sim.p10.toFixed(0).padStart(3), sim.p50.toFixed(0).padStart(4), sim.p90.toFixed(0).padStart(4), (sim.beat*100).toFixed(0).padStart(4)+'%', String(c.score).padStart(4), (c.core*100).toFixed(0).padStart(3)+'%', ok, ok?'':led.map((l,t)=>l.base+r[t].borrow-M.spent(r[t])).join(',')); }
