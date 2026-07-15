const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const NODE_VERSION = '20.14.0';
const DEST_DIR = 'C:\\Users\\kk\\.cache\\node-lts';
const ZIP_PATH = DEST_DIR + '\\node.zip';
const URL = 'https://nodejs.org/dist/v' + NODE_VERSION + '/node-v' + NODE_VERSION + '-win-x64.zip';

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
console.log('Downloading Node.js v' + NODE_VERSION + '...');

const file = fs.createWriteStream(ZIP_PATH);
let dl = 0;

https.get(URL, (res) => {
  const total = parseInt(res.headers['content-length'] || '0', 10);
  res.on('data', c => {
    dl += c.length;
    process.stdout.write('\r' + Math.round(dl / total * 100) + '% (' + Math.round(dl/1024/1024) + 'MB)');
  });
  res.pipe(file);
  file.on('finish', () => {
    console.log('\nDownload done. Extracting...');
    execSync(
      'powershell -Command "Expand-Archive -Path \'' + ZIP_PATH + '\' -DestinationPath \'' + DEST_DIR + '\' -Force"',
      { stdio: 'inherit' }
    );
    const bin = DEST_DIR + '\\node-v' + NODE_VERSION + '-win-x64';
    const nodeVer = execSync('"' + bin + '\\node.exe" --version').toString().trim();
    const npmVer = execSync('"' + bin + '\\npm.cmd" --version').toString().trim();
    console.log('node: ' + nodeVer);
    console.log('npm: ' + npmVer);
    console.log('SUCCESS_PATH:' + bin);
  });
}).on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});
