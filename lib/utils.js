// global functions
const rp = require('request-promise');
const globalConfig = require('../config.js');

module.exports = {
	getIdentifier: function getIdentifier(peripheral) {
		if (peripheral.address && peripheral.address !== 'unknown') {
			return peripheral.address;
		} else {
			return peripheral.id;
		}
	},

	createDevice : function createDevice(device, types) {
		var options = {
			method : 'POST',
			uri : `${globalConfig.gladysUrl}/device?token=${globalConfig.token}`,
			body : {
				device ,
				types
			},
			json : true
		};

		return rp(options)
			.then(function (newDevice) {
				console.log(`Device "${device.name}" inserted with success !`);
				return newDevice;
			});
	},

	setDevicestate : function setDevicestate(id, value) {
		var options = {
			method : 'POST',
			uri : `${globalConfig.gladysUrl}/devicestate?token=${globalConfig.token}`,
			body : {
				devicetype : id,
				value : value
			},
			json : true
		};

		return rp(options);
	},

	intervalToDelay : function intervalToDelay(interval) {
		// Convert minutes to milliseconds
		return parseInt(interval, 10) * 60000;
	},

	photonsToLux : function photonsToLux(value) {
		return (value * 1250).toFixed(0);
	}
};