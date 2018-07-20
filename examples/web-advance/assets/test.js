const { hostname, port, protocol } = window.location;
const socket = port ? io.connect(`${protocol}//${hostname}:${port}`) : io.connect(`${protocol}//${hostname}`);