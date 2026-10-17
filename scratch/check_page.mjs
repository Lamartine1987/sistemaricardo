import { spawn } from 'child_process';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--remote-debugging-port=9222',
  '--headless',
  '--disable-gpu',
  '--window-size=375,667',
  '--user-data-dir=C:/Users/Lamartine/.gemini/antigravity/scratch/sistemaricardo/scratch/edge-profile-test',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
    console.log('Tabs:', tabs.length);
    const target = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: 'JSON.stringify({ title: document.title, headings: Array.from(document.querySelectorAll("h1, h2, h3, button")).map(el => el.innerText.slice(0, 30)) })'
        }
      }));
    };
    ws.onmessage = (e) => {
      console.log('EVAL:', JSON.parse(e.data).result.result.value);
      ws.close();
      edge.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    edge.kill();
  }
}, 3000);
