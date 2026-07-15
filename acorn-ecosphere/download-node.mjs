// Script to download Node.js LTS with npm to local user directory
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NODE_VERSION = '20.14.0';
const DEST_DIR = 'C:\\Users\\kk\\.cache\\node-lts';
const ZIP_PATH = path.join(DEST_DIR, 'node.zip');
const DOWNLOAD_URL = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip`;

console.log(`Downloading Node.js v${NODE_VERSION}...`);
console.log(`URL: ${DOWNLOAD_URL}`);
console.log(`Destination: ${DEST_DIR}`);

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const file = fs.createWriteStream(ZIP_PATH);
let downloaded = 0;

https.get(DOWNLOAD_URL, (res) => {
  const total = parseInt(res.headers['content-length'] || '0', 10);
  res.on('data', (chunk) => {
    downloaded += chunk.length;
    if (total > 0) {
      process.stdout.write(`\rDownloaded: ${Math.round(downloaded / total * 100)}%`);
    }
  });
  res.pipe(file);
  file.on('finish', () => {
    console.log('\nDownload complete! Extracting...');
    try {
      execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${DEST_DIR}' -Force"`, { stdio: 'inherit' });
      console.log('Extracted successfully!');
      const nodeBin = `${DEST_DIR}\\node-v${NODE_VERSION}-win-x64`;
      console.log(`Node bin path: ${nodeBin}`);
      // Test it
      const ver = execSync(`"${nodeBin}\\node.exe" --version`).toString().trim();
      const npmVer = execSync(`"${nodeBin}\\npm.cmd" --version`).toString().trim();
      console.log(`node: ${ver}`);
      console.log(`npm: ${npmVer}`);
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Download error:', err.message);
});
