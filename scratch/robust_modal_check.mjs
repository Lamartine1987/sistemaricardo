import { spawn } from 'child_process';
import fs from 'fs';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--remote-debugging-port=9444',
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-sync',
  '--window-size=375,667',
  '--user-data-dir=C:/Users/Lamartine/.gemini/antigravity/scratch/sistemaricardo/scratch/isolated-edge-9444',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const tabs = await (await fetch('http://127.0.0.1:9444/json')).json();
    const target = tabs.find(t => t.url.includes('5173'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);

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
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        mobile: true
      });

      const mockCase = {
        id: 'case-test-123',
        patientName: 'teste',
        caseCode: 'IMP-2026-134',
        dentistId: 'dentist-1',
        dentistName: 'Ricardo Campos',
        dentistCro: 'Aguardando CRO',
        dentistPhone: '(81) 99969-4866',
        dentistEmail: 'ricardo@exemplo.com',
        status: 'PLANNING',
        priority: 'STANDARD',
        serviceType: 'SURGICAL_GUIDE',
        implantBrand: 'Neodent Helix',
        surgicalKit: 'Kit Cirurgia Guiada Neodent',
        fixationTeeth: 'Região 11 e 21',
        clinicalPreviewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        clinicalPreviewVideoName: 'video_planejamento.mp4',
        createdAt: '2026-10-14T10:00:00Z',
        dueDate: '2026-10-20T18:00:00Z',
        payment: {
          status: 'PENDING',
          amount: 320.00
        },
        files: [
          {
            id: 'f-1',
            name: '323242001_shell_model.stl',
            size: '24.6 MB',
            type: 'GUIDE_STL',
            isLocked: true,
            uploadedAt: '2026-10-14T10:05:00Z',
            downloadUrl: '#'
          },
          {
            id: 'f-2',
            name: 'Tomografia_DICOM_Paciente.dcm',
            size: '162.9 MB',
            type: 'TOMOGRAPHY',
            isLocked: false,
            uploadedAt: '2026-10-14T10:05:00Z',
            downloadUrl: '#'
          }
        ]
      };

      console.log('Injecting session and selectedCase...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('implantprecision_view_mode', 'DASHBOARD');
          localStorage.setItem('implantprecision_auth_user', JSON.stringify({ email: 'lamartinecezar3@gmail.com', displayName: 'Lamartine Cezar' }));
          localStorage.setItem('implantprecision_selected_case', JSON.stringify(${JSON.stringify(mockCase)}));
        })()`
      });

      // Wait for load event
      const loadPromise = new Promise(resolve => {
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.method === 'Page.loadEventFired') {
            ws.removeEventListener('message', handler);
            resolve();
          }
        };
        ws.addEventListener('message', handler);
      });

      await send('Page.navigate', { url: 'http://localhost:5173/' });
      console.log('Waiting for loadEventFired...');
      await loadPromise;
      console.log('Page loaded! Waiting for React render...');
      await new Promise(r => setTimeout(r, 2000));

      const debugEval = await send('Runtime.evaluate', {
        expression: `(() => {
          return {
            title: document.title,
            bodyLen: document.body.innerHTML.length,
            hasModal: Boolean(document.querySelector('.fixed.inset-0')),
            bodyPreview: document.body.innerText.slice(0, 300)
          };
        })()`,
        returnByValue: true
      });
      console.log('DEBUG EVAL:', debugEval.result.value);

      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 500));

      const modalShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/fixed_modal_mobile.png', Buffer.from(modalShot.data, 'base64'));
      console.log('Successfully saved scratch/fixed_modal_mobile.png');

      ws.close();
      edge.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    edge.kill();
  }
}, 3000);
