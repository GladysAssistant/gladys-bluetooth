const rp = require('request-promise');
const config = require('../config.js');
const shared = require('./shared.js');

module.exports = function deviceSeen(peripheral) {

    // if the bluetooth device does not have a name, 
    // don't handle it
    if(!peripheral.advertisement.localName) {
        return ;
    }
    
    var identifier;
    
    if (peripheral.address && peripheral.address !== 'unknown') {
      identifier = peripheral.address;
    } else {
      identifier = peripheral.id;
    }

    // we look in local memory DB is the bluetooth device exists and is known.
    if(shared.devices[identifier]) {

        if(shared.devices[identifier].hasOwnProperty('user') && shared.devices[identifier].user != null) {
            console.log(`Device "${parsedResult.device.name}" is the peripheral of user ${shared.devices[identifier].user}, it means user is at home ID = ${config.gladysHouseId} ! `);

            var options = {
                method: 'POST',
                uri: `${config.gladysUrl}/user/${shared.devices[identifier].user}/house/${config.gladysHouseId}/seen?token=${config.token}`,
                json: true
            };

            return rp(options)
                .catch((err) => {
                    console.log('Error while sending data to Gladys');
                    console.log(err);
                    console.log(err.statusCode);
                });
        } else {
            console.log(`Device ${peripheral.advertisement.localName} is not assigned to any user, so we do nothing`);
            return null;
        }
    } else {
        console.log(`Scanned device ${peripheral.advertisement.localName} but devices does not exist in Gladys. Not saving anything.`);
        return null;
    }
};