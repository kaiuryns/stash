function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render() {
  const list = document.getElementById('items-list');
  const ids  = Object.keys(localItems);

  if (ids.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div>Nenhum item ainda.<br>Toca o <strong>+</strong> para adicionar.</div>`;
    return;
  }

  list.innerHTML = ids
    .sort((a, b) => localItems[a].created_at - localItems[b].created_at)
    .map(id => {
      const item = localItems[id];
      const name = item.payload?.text || '';
      const qty  = item.payload?.qty  ?? 1;
      const ts   = new Date(item.updated_at * 1000).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
      return `
        <div class="item-card" id="card-${id}">
          <div class="item-main">
            <div class="item-name" id="name-${id}">${esc(name)}</div>
            <input class="item-name-input" id="input-${id}" value="${esc(name)}" onkeydown="onEditKey(event,${id})"/>
            <div class="item-sub">#${id} · ${ts}</div>
          </div>
          <div class="item-qty">
            <button class="iq-btn minus" onclick="adjustQty(${id},-1)">−</button>
            <span class="iq-val" id="qty-${id}">${qty}</span>
            <button class="iq-btn" onclick="adjustQty(${id},1)">+</button>
          </div>
          <div class="item-actions">
            <button class="act-btn" id="edit-btn-${id}" onclick="startEdit(${id})" title="Editar">✏️</button>
            <button class="act-btn save" id="save-btn-${id}" onclick="saveEdit(${id})" style="display:none" title="Salvar">✓</button>
            <button class="act-btn delete" onclick="deleteItem(${id})" title="Excluir">🗑</button>
          </div>
        </div>`;
    }).join('');
}
