/**
 * Created by warebot on 2/12/15.
 */
var net = require("net");

// Timer
function keepAliveTimer(callback, interval) {
    return setInterval(callback, interval);
}


function Client(id, serverSocket, keepAliveInterval) {
    this.id = id
    this.serverSocket = serverSocket
    this.keepAliveInterval = keepAliveInterval
    this.messagesRecieved = 0
    this.client = net.connect({path: this.serverSocket}, function () {
    })

}


Client.prototype.register = function () {
    this.client.write(JSON.stringify({id: this.id, msg: "REGISTER"}))
};


Client.prototype.start = function () {
    var self = this
    this.keepAliveTimer = keepAliveTimer(function () {
        self.client.write(JSON.stringify({id: self.id, msg: "KEEPALIVE"}))
    }, self.keepAliveInterval)

    this.client.on('data', function (data) {
        self.messagesRecieved += 1
        console.log('[' + self.id + '] ' + data);

        // Let's simulate some congestion with every message we receive
        if (self.messagesRecieved > 6) {
            clearInterval(self.keepAliveTimer)
            self.keepAliveTimer = keepAliveTimer(function () {
                self.client.write(JSON.stringify({id: self.id, msg: "KEEPALIVE"}))
            }, self.keepAliveInterval + self.messagesRecieved * 2000)
        }
    });

}
module.exports = Client;