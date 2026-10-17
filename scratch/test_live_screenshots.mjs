import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'http://localhost:5173';

console.log('Starting Edge with forward slash profile path...');
const edge = spawn(edgePath, [
  '--remote-debugging-port=9222',
  '--headless',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-fre',
  '--window-size=375,667',
  '--user-data-dir=C:/Users/Lamartine/.gemini/antigravity/scratch/sistemaricardo/scratch/edge-profile',
  targetUrl
]);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await sleep(3000);
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    const targetTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost'));
    if (!targetTab) {
      console.log('No localhost page tab found among:', tabs.map(t => t.url));
      edge.kill();
      return;
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
      console.log('Setting device metrics...');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        mobile: true
      });
      await sleep(1500);

      console.log('Navigating to dashboard...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Acessar Plataforma') || b.innerText.includes('Painel')));
          if (btn) btn.click();
        })()`
      });
      await sleep(4000);

      // Wait for cases and click case card
      console.log('Finding case card...');
      const clickRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const cards = document.querySelectorAll('.cursor-pointer');
          for (const c of cards) {
            if (c.innerText && (c.innerText.includes('IMP-') || c.innerText.includes('teste'))) {
              c.click();
              return 'Clicked case card!';
            }
          }
          return 'No card found. Total cards: ' + cards.length;
        })()`,
        returnByValue: true
      });
      console.log('Result:', clickRes.result.value);
      await sleep(2500);

      const modalShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/fixed_modal_mobile.png', Buffer.from(modalShot.data, 'base64'));
      console.log('Saved scratch/fixed_modal_mobile.png');

      ws.close();
      edge.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    edge.kill();
  }
}

run();
