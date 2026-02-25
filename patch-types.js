import * as fs from 'fs';
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');

content = content.replace(/name_fr\??/g, 'name');
content = content.replace(/[ \t]*name_ar\??:[^\n]*\n/g, '');

content = content.replace(/description_fr\??/g, 'description');
content = content.replace(/[ \t]*description_ar\??:[^\n]*\n/g, '');

fs.writeFileSync('src/lib/database.types.ts', content);
console.log('Done replacing types');
