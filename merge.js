import fs from 'fs';
let admin = fs.readFileSync('src/pages/admin/AdminFinancial.tsx', 'utf8');
const plotly = fs.readFileSync('current_plotly.tsx', 'utf8');
const plotlyLines = plotly.split('\n');
const toInsert = plotlyLines.slice(43, 298).join('\n');
admin = admin.replace('import { useState } from \'react\';', 'import { useState } from \'react\';\nimport Plot from \'react-plotly.js\';');
const splitStr = '      {/* ── KPIs ───────────────────────────────────────────────────────────── */}';
admin = admin.replace(splitStr, toInsert + '\n\n' + splitStr);
fs.writeFileSync('src/pages/admin/AdminFinancial.tsx', admin);
