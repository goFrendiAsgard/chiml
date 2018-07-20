const { hostname, port } = window.location;
const socket = port ? io.connect(`https://${hostname}:${port}`) : io.connect(`https://${hostname}`);