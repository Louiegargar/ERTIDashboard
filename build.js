// build.js — regenerate assets/app.bundle.js from the .jsx source files.
// Run with:  node build.js
// Uses the vendored Babel (no global install needed). The app loads the bundle,
// so there is NO in-browser Babel at runtime (no console warning, no CDN).
const fs = require('fs'), path = require('path');
let Babel; try { Babel = require('./assets/vendor/babel.min.js'); }
catch (e) { Babel = require('@babel/standalone'); }
const A = path.join(__dirname, 'assets') + '/';
const ORDER = ['ui.jsx','charts.jsx','kpi-modal.jsx','tab-executive.jsx','tab-revenue.jsx',
  'tab-output.jsx','tab-wip.jsx','tab-manpower.jsx','tab-skills.jsx','tab-people.jsx',
  'tab-import.jsx','tab-settings.jsx','app.jsx'];
let out = '// AUTO-GENERATED from assets/*.jsx by build.js — do not edit directly.\n';
for (const f of ORDER) out += '\n/* === ' + f + ' === */\n' +
  Babel.transform(fs.readFileSync(A + f, 'utf8'), { presets: ['react'], filename: f }).code + '\n';
fs.writeFileSync(A + 'app.bundle.js', out);
console.log('built assets/app.bundle.js (' + Math.round(out.length / 1024) + 'KB) from ' + ORDER.length + ' files');
