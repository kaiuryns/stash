function changeNewQty(delta) {
  newQty = Math.max(0, newQty + delta);
  document.getElementById('new-qty-val').textContent = newQty;
}

function togglePanel() {
  const open = document.getElementById('new-panel').classList.toggle('open');
  document.getElementById('fab').classList.toggle('open', open);
  document.getElementById('overlay').classList.toggle('open', open);
  if (open) setTimeout(() => document.getElementById('new-name').focus(), 300);
}

function closePanel() {
  document.getElementById('new-panel').classList.remove('open');
  document.getElementById('fab').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}
