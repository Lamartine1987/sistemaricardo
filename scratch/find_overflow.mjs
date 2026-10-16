import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = process.argv[2] || 'https://sistemaricardo-8d8d1.web.app';

console.log('Starting Edge for URL:', targetUrl);
const edge = spawn(edgePath, [
  '--remote-debugging-port=9222',
  '--headless',
  '--disable-gpu',
  '--window-size=375,667',
  '--user-data-dir=C:\\Users\\Lamartine\\.gemini\\antigravity\\scratch\\sistemaricardo\\scratch\\edge-profile',
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
    console.log('Tabs:', tabs.length);
    const targetTab = tabs.find(t => t.type === 'page');
    if (!targetTab) {
      console.log('No page tab found');
      edge.kill();
      return;
    }

    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      console.log('WebSocket connected');
      // Wait a moment for page to load
      await sleep(2000);

      // Set device metrics override to exact mobile viewport (375x667)
      await new Promise(res => {
        ws.send(JSON.stringify({
          id: 2,
          method: 'Emulation.setDeviceMetricsOverride',
          params: {
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            mobile: true
          }
        }));
        setTimeout(res, 300);
      });

      // Switch to DASHBOARD viewMode via localStorage and reload
      await new Promise(res => {
        ws.send(JSON.stringify({
          id: 20,
          method: 'Runtime.evaluate',
          params: {
            expression: `(() => {
              localStorage.setItem('implantprecision_view_mode', 'DASHBOARD');
              location.reload();
            })()`
          }
        }));
        setTimeout(res, 2500);
      });

      // After reload, set device metrics again
      await new Promise(res => {
        ws.send(JSON.stringify({
          id: 21,
          method: 'Emulation.setDeviceMetricsOverride',
          params: {
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            mobile: true
          }
        }));
        setTimeout(res, 500);
      });

      const evalMsg = {
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            const overflows = [];
            document.querySelectorAll('*').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > 376 || el.scrollWidth > 376) {
                overflows.push({
                  tag: el.tagName,
                  class: el.className?.toString?.().slice(0, 80),
                  rectRight: Math.round(rect.right),
                  rectWidth: Math.round(rect.width),
                  scrollWidth: el.scrollWidth,
                  text: el.innerText ? el.innerText.slice(0, 40).replace(/\\n/g, ' ') : ''
                });
              }
            });
            return JSON.stringify({ docWidth, scrollWidth, bodyWidth, overflowCount: overflows.length, overflows: overflows.slice(0, 20) });
          })()`,
          returnByValue: true
        }
      };
      ws.send(JSON.stringify(evalMsg));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 3) {
        console.log('DASHBOARD OVERFLOW REPORT (at 375px):');
        console.log(data.result.result.value);

        // Now capture screenshot
        ws.send(JSON.stringify({
          id: 4,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      } else if (data.id === 4) {
        const buffer = Buffer.from(data.result.data, 'base64');
        import('fs').then(fs => {
          fs.writeFileSync('scratch/exact_dashboard_375.png', buffer);
          console.log('Saved scratch/exact_dashboard_375.png');
          ws.close();
          edge.kill();
          process.exit(0);
        });
      }
    };
  } catch (err) {
    console.error('Error:', err);
    edge.kill();
  }
}

run();
