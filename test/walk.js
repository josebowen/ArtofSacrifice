const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const out = path.join(__dirname, 'out'); require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [name, vp] of [['desk', { width: 1600, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: name==='phone'?2:1 }); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_/.test(m.text())) errs.push(m.text()); });
    let n = 0; const shot = async l => p.screenshot({ path: `${out}/${name}-${String(n++).padStart(2,'0')}-${l}.png`, fullPage: name==='phone' });
    const click = async s => { await p.locator(s).first().click(); };
    const times = async (s, k) => { for (let i = 0; i < k; i++) await click(s); };
    await p.goto('file://' + path.join(__dirname, '..', 'index.html') + '?fast=1&seed=1854'); await shot('intro');
    await click('[data-go=guess]'); await p.locator('label.choice').nth(0).click(); await shot('guess'); await click('[data-go=diag]');
    await p.locator('label.choice').nth(1).click(); await shot('diag-wrong'); await p.locator('label.choice').nth(0).click(); await click('[data-go=choose]');
    await click('[data-strat=network]'); await shot('choose'); await click('[data-go=r0]');
    await times('[data-inc=fiber]', 5); await times('[data-inc=wireless]', 3); await times('[data-inc=dividend]', 2);
    if (!(await p.locator('[data-inc=legacy]').isDisabled())) errs.push('plus should be disabled at zero left');
    await click('[data-deal=ptv]'); const over = await p.locator('#left').innerText(); if (!/Over by 8/.test(over)) errs.push('deal over text: ' + over);
    if (!(await p.locator('#commit').isDisabled())) errs.push('commit should be disabled when over');
    await shot('r1-over'); await click('[data-deal=ptv]');
    for (const k of ['churn', 'homes', 'margin']) await click(`[data-kpi=${k}]`);
    await shot('r1'); await click('#commit'); await shot('r1-memo'); await click('[data-next]');
    // cycle 2: swap margin for lev, borrow 2 and add to fiber
    await click('[data-kpi=margin]'); await click('[data-kpi=lev]'); await times('[data-inc=borrow]', 2); await times('[data-inc=fiber]', 2); await shot('r2');
    await click('#commit'); await click('[data-next]');
    const l3 = await p.locator('#left').innerText(); await shot('r3'); 
    while (!/All capital placed/.test(await p.locator('#left').innerText())) { const t = await p.locator('#left').innerText(); if (/Over/.test(t)) await click('[data-dec=dividend]'); else await click('[data-inc=debt]'); }
    await click('#commit'); await shot('r3-memo'); await click('[data-next]');
    while (!/All capital placed/.test(await p.locator('#left').innerText())) { const t = await p.locator('#left').innerText(); if (/Over/.test(t)) await click('[data-dec=dividend]'); else await click('[data-inc=wireless]'); }
    await shot('r4'); await click('#commit'); await click('[data-next]'); await p.waitForTimeout(200); await shot('futures');
    await click('#drawBtn'); await p.waitForTimeout(200); await shot('drawn'); await click('#toDeb');
    await p.locator('label.choice').nth(1).click(); await shot('debrief'); await click('[data-go=reveal]'); await shot('reveal');
    await click('#aboutBtn'); await shot('about'); await click('[data-close]');
    const st = await p.evaluate(() => { const s = __demo.state(); return { rounds: s.rounds, co: s.co, sim: [s.sim.p10, s.sim.p50, s.sim.p90, s.sim.beat], l3: 0 }; });
    console.log(name, 'errors:', errs.length ? errs : 'none', 'r3 start:', l3, JSON.stringify(st));
    await p.close();
  }
  await b.close();
})();
