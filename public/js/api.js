function setStatus(s) {
  document.getElementById('sync-dot').className = s;
}

function clientTimestamp() { return Date.now() / 1000; }

async function apiFetch(path, options = {}) {
  setStatus('syncing');
  try {
    const res = await fetch(serverUrl + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    setStatus('ok');
    return { ok: res.ok, data };
  } catch (err) {
    setStatus('error');
    throw err;
  }
}

async function pullAll() {
  if (!serverUrl) return;
  try {
    const { data } = await apiFetch('/items');
    localItems = {};
    data.forEach(item => { localItems[item.id] = item; });
    render();
  } catch (_) {}
}
