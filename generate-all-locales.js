const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'src', 'locales');
const batchFiles = [
  'translations_batch1.json',
  'translations_batch2.json',
  'translations_batch3.json',
  'translations_batch4.json',
  'translations_batch5.json'
];

let allTranslations = {};
for (const file of batchFiles) {
  const filePath = path.join(__dirname, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  Object.assign(allTranslations, data);
}

let count = 0;
Object.entries(allTranslations).forEach(([locale, data]) => {
  const dir = path.join(base, locale);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'common.json'), JSON.stringify(data, null, 2), 'utf-8');
  count++;
});

console.log(`Generated ${count} locale files successfully!`);

// Cleanup batch files
for (const file of batchFiles) {
  fs.unlinkSync(path.join(__dirname, file));
}
console.log('Cleaned up batch files.');
