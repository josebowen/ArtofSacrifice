const fs=require('fs'); const src=['src/content.js','src/app.js','src/template.html'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const strings = src.match(/'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g)||[];
const bad = strings.filter(s=>/[—–]| -- | - /.test(s.replace(/\$\{[^}]*\}/g,''))); console.log('dash hits:', bad.length, bad.slice(0,5));
global.Model=require('./../src/model.js'); require('../src/content.js');
const L = C.diag.a.map(a=>a[1].length), G = C.guess.a.map(a=>a[1].length);
console.log('diag option lengths', L, 'spread', ((Math.max(...L)-Math.min(...L))/Math.max(...L)*100).toFixed(0)+'%', 'guess', G);
console.log('residue:', /TODO|FIXME|lorem/i.test(src));
