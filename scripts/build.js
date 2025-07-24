import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy static files to public directory
const staticFiles = ['index.html', 'styles.css', 'script.js'];

staticFiles.forEach(file => {
  const source = path.join(__dirname, '..', file);
  const dest = path.join(publicDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`Copied ${file} to public directory`);
  }
});

// Create a simple server.js for GitHub Pages
const serverJs = `// Simple server for GitHub Pages
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(\`Server is running on port \${port}\`);
});
`;

fs.writeFileSync(path.join(publicDir, 'server.js'), serverJs);
console.log('Created server.js for GitHub Pages');

console.log('Build completed successfully!');
