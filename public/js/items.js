async function addItem() {
  const name = document.getElementById('new-name').value.trim();
  if (!name) { document.getElementById('new-name').focus(); return; }

  closePanel();
  try {
    const { data } = await apiFetch('/items', {
      method: 'POST',
      body: JSON.stringify({ payload: { text: name, qty: newQty }, client_timestamp: clientTimestamp() }),
    });
    localItems[data.id] = data;
    document.getElementById('new-name').value = '';
    newQty = 1;
    document.getElementById('new-qty-val').textContent = '1';
    render();
  } catch (_) {}
}

async function adjustQty(id, delta) {
  const item   = localItems[id];
  const newVal = Math.max(0, (item.payload?.qty ?? 1) + delta);

  localItems[id] = { ...item, payload: { ...item.payload, qty: newVal } };
  document.getElementById(`qty-${id}`).textContent = newVal;

  try {
    const { data } = await apiFetch(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ payload: { ...item.payload, qty: newVal }, client_timestamp: clientTimestamp() }),
    });
    if (data.conflict) {
      localItems[id] = data.current;
      render();
    } else {
      localItems[id] = data;
    }
  } catch (_) {}
}

function startEdit(id) {
  document.getElementById(`name-${id}`).classList.add('editing');
  document.getElementById(`input-${id}`).classList.add('editing');
  document.getElementById(`edit-btn-${id}`).style.display = 'none';
  document.getElementById(`save-btn-${id}`).style.display = 'flex';
  document.getElementById(`input-${id}`).focus();
}

function onEditKey(e, id) {
  if (e.key === 'Enter') saveEdit(id);
  if (e.key === 'Escape') cancelEdit(id);
}

function cancelEdit(id) {
  const item = localItems[id];
  document.getElementById(`input-${id}`).value = item.payload?.text || '';
  document.getElementById(`name-${id}`).classList.remove('editing');
  document.getElementById(`input-${id}`).classList.remove('editing');
  document.getElementById(`edit-btn-${id}`).style.display = 'flex';
  document.getElementById(`save-btn-${id}`).style.display = 'none';
}

async function saveEdit(id) {
  const text = document.getElementById(`input-${id}`).value.trim();
  const item = localItems[id];
  cancelEdit(id);

  try {
    const { data } = await apiFetch(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ payload: { ...item.payload, text }, client_timestamp: clientTimestamp() }),
    });
    if (data.conflict) {
      localItems[id] = data.current;
    } else {
      localItems[id] = data;
    }
    render();
  } catch (_) {}
}

async function deleteItem(id) {
  const card = document.getElementById(`card-${id}`);
  card.style.opacity = '0.4';
  try {
    const { data } = await apiFetch(`/items/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ client_timestamp: clientTimestamp() }),
    });
    if (data.conflict) {
      localItems[id] = data.current;
      render();
    } else {
      delete localItems[id];
      render();
    }
  } catch (_) { card.style.opacity = '1'; }
}
