/**
 * Created by warebot on 2/14/15.
 */
var net = require("net")
var config = require("./config")
var MESSAGE_TYPE = require("./messages")

// Keeps track of all clients and open sockets
var connections = {}

function Server(houseKeeper) {
    this.host = config.HOST
    this.socket = config.SERVER_SOCKET
    this.houseKeeper = houseKeeper
}


// refreshClientConnection updates the `lastKeepAlive` value received from a client
// We ignore messages for clientIds/connections that have been previously expired
function refreshClientConnection(clientId) {
    if (connections[clientId] != null) {
        console.log("[KEEPALIVE RECEIVED] [" + clientId + "]");
        connections[clientId].lastKeepAlive = (new Date()).getTime();
    }
}


function registerClient(clientId, socket) {
    connections[clientId] = {lastKeepAlive: (new Date()).getTime(), clientSocket: socket};
}

Server.prototype.start = function () {
    var self = this;
    var server = net.createServer(function (sock) {
        sock.on('data', function (data) {
            msg = JSON.parse(data);
            if (msg.msg == MESSAGE_TYPE.REGISTER) registerClient(msg.id, sock);
            if (msg.msg == MESSAGE_TYPE.KEEPALIVE) refreshClientConnection(msg.id);
        });

        sock.on('close', function (data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });

    }).listen(this.socket, this.host);

    console.log("[SERVER] binding to " + this.socket);

    // Triggers a TIME MSG for every tick configured by `timeMessageInterval`
    setInterval(function () {
        for (var clientId in connections) {
            connections[clientId].clientSocket.write("[TIME MSG] " + (new Date()).getTime());
        }
    }, config.TIME_MSG_INTERVAL);

    // Triggers a housekeeping sweep every tick based on the `houseKeepingInterval`
    setInterval(function () {
        console.log("------ HOUSEKEEPING -----");
        connections = self.houseKeeper.sweep(connections);
    }, config.HOUSEKEEPING_INTERVAL);

    server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            console.log('Address in use. To force start, remove the socket: ' + self.socket);
            process.exit(1);
        }
    })
}

module.exports = Server;
