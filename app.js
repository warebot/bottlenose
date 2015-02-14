var Client = require("./client")
var net = require('net')

var HOST = 'localhost'
// Unix socket used for client/server communication
var PORT = '/tmp/bottlenose_code.sock'
// Interval used to expire stale connections
var keepAliveExpiration = 10000
// Interval used by clients to send keep-alive messages
var keepAliveInterval = 5000
// Interval used by the server to send time-messages to all connected clients
var timeMessageInterval = 1000
// Number of clients (connections) to start
var numOfClients = 5
// Keeps track of all clients and open sockets
var connections = {}


// Triggers a TIME MSG for every tick configured by `timeMessageInterval`
setInterval(function () {
    for (var clientId in connections) {
        connections[clientId].clientSocket.write("[TIME MSG] " + (new Date()).getTime())
    }
}, timeMessageInterval);


// refreshClientConnection updates the `lastKeepAlive` value received from a client
function refreshClientConnection(clientId, socket) {
    connections[clientId] = {lastKeepAlive: (new Date()).getTime(), clientSocket: socket}
}


function registerClient(clientId, socket) {
    connections[clientId] = {lastKeepAlive: (new Date()).getTime(), clientSocket: socket}
}


// removeDeadClients returns a new copy the `connections` dictionary representing
// only active clients
function removeDeadClients() {
    var _connections = {}
    var currentTime = (new Date()).getTime()
    for (var clientId in connections) {
        if (currentTime - connections[clientId].lastKeepAlive < keepAliveExpiration) {
            _connections[clientId] = connections[clientId]
        } else {
            console.log("[CLIENT " + clientId + "] IS MOST LIKELY DEAD")
        }
    }
    return _connections
}
// Performs housekeeping based on the configured `keepAliveExpiration` setting
setInterval(function () {
    console.log("------ HOUSEKEEPING -----")
    connections = removeDeadClients()
}, keepAliveExpiration);


// Creates a server that receives json messages from clients with a `KEEPALIVE` or `REGISTER` message type
var server = net.createServer(function (sock) {
    sock.on('data', function (data) {
        msg = JSON.parse(data)
        if (msg.msg == "REGISTER") {
            registerClient(msg.id, sock)
        } else if (msg.msg == "KEEPALIVE") {
            console.log("[KEEPALIVE RECEIVED] [" + msg.id + "]")
            refreshClientConnection(msg.id, sock)
        }
    });

    sock.on('close', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

}).listen(PORT, 'localhost');

server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use. To force start, remove the socket: ' + PORT);
        process.exit(1)
    }
})


console.log('Server listening on ' + HOST + ':' + PORT);

for (var i = 0; i < numOfClients; i++) {
    var client = new Client(i, PORT, keepAliveInterval)
    client.register()
    client.start()
}