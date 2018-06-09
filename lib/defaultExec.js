const rp = require('request-promise');
const emojiStrip = require('emoji-strip');

const shared = require('./shared.js');
const utils = require('./utils.js');
const config = require('../config.js');

module.exports = function defaultExec(peripheral) {
	var identifier = utils.getIdentifier(peripheral);
	var deviceName = peripheral.advertisement.localName;

	// we look in local memory DB is the bluetooth device exists and is known.
	if (shared.devices[identifier]) {

		// if device has a owner, it means that user should be marked as seen in house 
		if (shared.devices[identifier].hasOwnProperty('user') && shared.devices[identifier].user != null) {
			console.log(`Device "${deviceName}" is the peripheral of user ${shared.devices[identifier].user}, it means user is at home ID = ${config.gladysHouseId} ! `);

			var options = {
				method : 'POST',
				uri : `${config.gladysUrl}/user/${shared.devices[identifier].user}/house/${config.gladysHouseId}/seen?token=${config.token}`,
				json : true
			};

			return rp(options)
				.catch((err) => {
					console.error('Error while sending data to Gladys');
					console.error(err);
					console.error(err.statusCode);
				});
		} else {
			console.log(`Device ${deviceName} is not assigned to any user, so we do nothing`);
			return null;
		}
	} else {
		console.log(`Scanned device ${deviceName} but devices does not exist in Gladys. Not saving anything.`);
		return null;
	}
};