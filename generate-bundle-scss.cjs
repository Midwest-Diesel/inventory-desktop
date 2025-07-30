const fs = require('fs');
const path = require('path');


const COMPONENTS_DIR = path.resolve('src/styles/components');
const SETTINGS_DIR = path.resolve('src/styles/settings');
const OUTPUT_FILE = path.resolve('src/styles/bundle.scss');

function getScssFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getScssFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.scss') &&
      !entry.name.startsWith('bundle')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function generateBundle() {
  const componentFiles = getScssFiles(COMPONENTS_DIR);
  const settingFiles = getScssFiles(SETTINGS_DIR);

  const allFiles = [...settingFiles, ...componentFiles];

  const imports = allFiles.map(file => {
    const relative = path.relative(path.dirname(OUTPUT_FILE), file).replace(/\\/g, '/');
    const noUnderscore = relative.replace(/^_/, '').replace(/\.scss$/, '');
    return `@use '${noUnderscore}';`;
  });

  fs.writeFileSync(OUTPUT_FILE, imports.join('\n') + '\n');
}

generateBundle();
