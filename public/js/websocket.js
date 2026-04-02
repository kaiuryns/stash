let ws = null;

function connectWS() {
  const wsUrl = serverUrl.replace('http://', 'ws://');
  ws = new WebSocket(wsUrl + '/ws');

  ws.onmessage = (e) => {
    const { event, data } = JSON.parse(e.data);
    if (event === 'created' || event === 'updated') {
      localItems[data.id] = data;
      render();
    } else if (event === 'deleted') {
      delete localItems[data.id];
      render();
    }
  };

  ws.onopen  = () => {
    setStatus('ok');
    setInterval(() => { if (ws.readyState === 1) ws.send('ping'); }, 30000); };
  ws.onclose = () => { setStatus('error'); setTimeout(connectWS, 3000); };
  ws.onerror = () => ws.close();
}
