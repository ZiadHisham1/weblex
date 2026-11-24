const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = 'project-dump.txt';
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.turbo'];
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'project-dump.txt', 'dump-code.js'];
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.css', '.md', '.env', '.cjs', '.mjs'];

let outputContent = `# Project Code Dump\nGenerated on: ${new Date().toLocaleString()}\n\n`;

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(filepath, callback);
      }
    } else {
      if (!IGNORE_FILES.includes(file)) {
        const ext = path.extname(file);
        // Special case for files with no extension like .env
        const isEnvFile = file.startsWith('.env');
        if (ALLOWED_EXTENSIONS.includes(ext) || isEnvFile) {
          callback(filepath);
        }
      }
    }
  }
}

console.log('Scanning files...');

walkDir(process.cwd(), (filepath) => {
  const relativePath = path.relative(process.cwd(), filepath);
  
  // Skip files inside hidden folders like .vscode or .github
  if (relativePath.startsWith('.')) return;

  const content = fs.readFileSync(filepath, 'utf8');
  
  // Determine language for markdown syntax highlighting
  let lang = path.extname(filepath).replace('.', '');
  if (lang === 'prisma') lang = 'graphql';
  if (filepath.includes('.env')) lang = 'bash';

  outputContent += `\n---\n## File: \`${relativePath}\`\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
  console.log(`+ Added ${relativePath}`);
});

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`\n✅ Successfully generated ${OUTPUT_FILE}`);