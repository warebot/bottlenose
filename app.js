var fs = require('fs');
var Client = require("./client");
var Server = require("./server");
var HouseKeeper = require("./housekeeper");
var config = require("./config");

var houseKeeper = new HouseKeeper(config.HOUSEKEEPING_INTERVAL);
new Server(houseKeeper).start();

process.on('SIGINT', function() {
    // Delete unix-socket on exit
    fs.unlink(config.SERVER_SOCKET, function (err) {
        if (err) throw err;
        console.log('SOCKET ' + config.SERVER_SOCKET + ' deleted');
        process.exit();
    });
});

// Start some clients and assign a random number between 0-12 that represents how many keep-alive
// messages the client will send
for (var i = 0; i < config.NUM_OF_CLIENTS; i++) {
    var client = new Client(i, config.SERVER_SOCKET, config.KEEPALIVE_INTERVAL, Math.floor((Math.random() * 12) + 0));
    client.register();
    client.start();
}