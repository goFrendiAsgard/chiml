// init socket
const { hostname, port, protocol } = window.location;
const socket = port ? io.connect(`${protocol}//${hostname}:${port}`) : io.connect(`${protocol}//${hostname}`);

// emit snip 10
socket.emit('snip', 73);
socket.emit('snap', 37);

socket.on('snip', (message) => {
  console.log(`snip ${message}`);
});

socket.on('snap', (message) => {
  console.log(`snap ${message}`);
});