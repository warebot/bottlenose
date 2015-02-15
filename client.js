/**
 * Created by warebot on 2/12/15.
 */
var net = require("net");
var MESSAGE_TYPE = require("./messages")
// Timer
function keepAliveTimer(callback, interval) {
    return setInterval(callback, interval);
}


function Client(id, serverSocket, keepAliveInterval, maxKeepAliveMessages) {
    this.id = id;
    this.serverSocket = serverSocket;
    this.keepAliveInterval = keepAliveInterval;
    this.keepAliveMessagesSent = 0;
    this.maxKeepAliveMessages = maxKeepAliveMessages;
    this.client = net.connect({path: this.serverSocket}, function () {
    })
}


Client.prototype.register = function () {
    this.client.write(JSON.stringify({id: this.id, msg: MESSAGE_TYPE.REGISTER}));
};


Client.prototype.start = function () {
    var self = this;

    this.keepAliveTimer = keepAliveTimer(function () {
        if (self.keepAliveMessagesSent <= self.maxKeepAliveMessages) {
            self.client.write(JSON.stringify({id: self.id, msg: MESSAGE_TYPE.KEEPALIVE}));
            self.keepAliveMessagesSent = self.keepAliveMessagesSent + 1;
        }
    }, self.keepAliveInterval);

    this.client.on('data', function (data) {
        self.messagesRecieved += 1;
        console.log('[' + self.id + '] ' + data);
    });

}
module.exports = Client;