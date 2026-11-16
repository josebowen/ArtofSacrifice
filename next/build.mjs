import { readFileSync, writeFileSync } from 'node:fs';
const r = f => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const js = [r('model.js'), r('content.js'), r('effort.js'), r('app.js')].join('\n');
const html = r('template.html').replace('/*CSS*/', () => r('style.css')).replace('/*JS*/', () => js);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html', html.length, 'bytes');
