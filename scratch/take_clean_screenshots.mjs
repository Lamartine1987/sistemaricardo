import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'http://localhost:5173';

const edge = spawn(edgePath, [
  '--remote-debugging-port=9333',
  '--headless',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=C:/Users/Lamartine/.gemini/antigravity/scratch/sistemaricardo/scratch/edge-profile-clean',
  targetUrl
]);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await sleep(3500);
  try {
    const listRes = await fetch('http://127.0.0.1:9333/json');
    const tabs = await listRes.json();
    const targetTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost'));
    if (!targetTab) {
      console.log('No page tab found. All tabs:', tabs.map(t => t.url));
      edge.kill();
      process.exit(1);
    }

    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onopen = async () => {
      console.log('Connected to Edge DevTools');
      await sleep(1500);

      // 1. Desktop Screenshot (1440x900)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(1000);
      const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/clean_desktop_hero.png', Buffer.from(desktopShot.data, 'base64'));
      console.log('Saved scratch/clean_desktop_hero.png');

      // Scroll a bit down to capture cases on desktop
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1000)' });
      await sleep(800);
      const desktopCases = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/clean_desktop_cases.png', Buffer.from(desktopCases.data, 'base64'));
      console.log('Saved scratch/clean_desktop_cases.png');

      // 2. Mobile Screenshot (390x844 iPhone 14 style)
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await sleep(1000);
      const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/clean_mobile_hero.png', Buffer.from(mobileShot.data, 'base64'));
      console.log('Saved scratch/clean_mobile_hero.png');

      ws.close();
      edge.kill();
      console.log('Done!');
      process.exit(0);
    };
  } catch (err) {
    console.error('Error during screenshot capture:', err);
    edge.kill();
    process.exit(1);
  }
}

run();
