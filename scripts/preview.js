const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORT = Number(process.env.PORT || 4173);
const WATCH = process.argv.includes('--watch');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8'
};

function runBuild() {
  try {
    execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    console.error('[preview] Build failed:', err.message);
  }
}

runBuild();

if (WATCH) {
  let timer = null;
  const watchTargets = [
    path.join(ROOT_DIR, 'data'),
    path.join(ROOT_DIR, 'src'),
    path.join(ROOT_DIR, 'assets')
  ];
  for (const target of watchTargets) {
    if (!fs.existsSync(target)) continue;
    fs.watch(target, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log(`[watch] Detected change (${filename}), rebuilding...`);
        runBuild();
      }, 180);
    });
  }
}

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!filePath.startsWith(DIST_DIR) || !fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[preview] ATEMPO COFFEE preview running at http://localhost:${PORT}/`);
  if (WATCH) {
    console.log('[preview] Watching data/, src/, assets/ for changes...');
  }
});
