/**
 * Created by warebot on 2/14/15.
 */

var assert = require("assert")
var HouseKeeper = require("../housekeeper")
describe('Array', function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    })
})


describe('HouseKeeper', function(){
    describe('#sweep', function(){
        it('should return an empty connections dictionary when lastKeepAlive time has expired', function(){
            var connections = {
                "test_client": {
                    id: "testclient", lastKeepAlive: 12
                }
            }
            var houseKeeper = new HouseKeeper(1000)
            var _connections = houseKeeper.sweep(connections)
            assert.equal(0, Object.keys(_connections).length)
        })
    })
})


describe('HouseKeeper', function(){
    describe('#sweep', function(){
        it('should never delete a client/connection with a valid lastKeepAlive time', function(){
            var connections = {
                "test_client": {
                    id: "testclient", lastKeepAlive: (new Date()).getTime()
                }
            }
            var houseKeeper = new HouseKeeper(1000)
            var _connections = houseKeeper.sweep(connections)
            assert.equal("testclient", _connections["test_client"].id)
        })
    })
})