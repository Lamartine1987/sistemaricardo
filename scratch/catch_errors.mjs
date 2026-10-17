import { spawn } from 'child_process';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--remote-debugging-port=9555',
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-sync',
  '--window-size=375,667',
  '--user-data-dir=C:/Users/Lamartine/.gemini/antigravity/scratch/sistemaricardo/scratch/isolated-edge-9555',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const tabs = await (await fetch('http://127.0.0.1:9555/json')).json();
    const target = tabs.find(t => t.url.includes('5173'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(data.params.exceptionDetails, null, 2));
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', data.params.type, data.params.args.map(a => a.value || a.description));
      }
    };

    setTimeout(() => {
      ws.close();
      edge.kill();
      process.exit(0);
    }, 4000);
  } catch (err) {
    console.error(err);
    edge.kill();
  }
}, 2000);
