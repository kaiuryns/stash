let localItems = {};
let serverUrl  = '';
let newQty     = 1;

function connect() {
  serverUrl = location.protocol !== 'file:' ? location.origin : '';
  pullAll();
  connectWS();
}

connect();
