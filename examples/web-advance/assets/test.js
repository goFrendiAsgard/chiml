const { hostname, port } = window.location;
const socket = port ? io.connect(`http://${hostname}:${port}`) : io.connect(`http://${hostname}`);