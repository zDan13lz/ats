var store = {};

export function saveSession(id, data) {
  store[id] = {
    data: data,
    expires: Date.now() + 30 * 60 * 1000,
  };
  cleanup();
}

export function getSession(id) {
  var entry = store[id];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete store[id];
    return null;
  }
  return entry.data;
}

export function deleteSession(id) {
  delete store[id];
}

function cleanup() {
  var now = Date.now();
  var keys = Object.keys(store);
  for (var i = 0; i < keys.length; i++) {
    if (now > store[keys[i]].expires) delete store[keys[i]];
  }
}