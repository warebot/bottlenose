/**
 * Created by warebot on 2/14/15.
 */


function Housekeeper(keepAliveExpiration){
    this.keepAliveExpiraton = keepAliveExpiration
}

// removeDeadClients returns a new copy the `connections` dictionary representing
// only active clients
Housekeeper.prototype.sweep = function (connections) {
    var _connections = {};
    var currentTime = (new Date()).getTime();
    for (var clientId in connections) {
        if (currentTime - connections[clientId].lastKeepAlive < this.keepAliveExpiraton) {
            _connections[clientId] = connections[clientId];
        } else {
            console.log("[CLIENT " + clientId + "] IS MOST LIKELY DEAD");
        }
    }
    return _connections;
}

module.exports = Housekeeper

