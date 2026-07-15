@echo off
SET NODE_DIR=C:\Users\kk\.cache\node-lts\node-v20.14.0-win-x64
SET PATH=%NODE_DIR%;%PATH%
echo ECOSPHERE Dev Server
echo Node: 
node --version
echo npm:
npm --version
echo.
echo Starting development server...
npm run dev
