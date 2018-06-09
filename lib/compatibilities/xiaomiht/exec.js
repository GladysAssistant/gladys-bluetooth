const Promise = require('bluebird');
const rp = require('request-promise');
const emojiStrip = require('emoji-strip');
const XiaomiServiceReader = require('xiaomi-gap-parser');

const shared = require('../../shared.js');
const utils = require('../../utils.js');
const globalConfig = require('../../../config.js');
const config = require('./config.js');

var delays = {
	temperature : utils.intervalToDelay(config.updateIntervalTemperature),
	moisture : utils.intervalToDelay(config.updateIntervalMoisture),
	batteryLevel : utils.intervalToDelay(config.updateIntervalBatteryLevel)
};

var tmpEventId = [ 4100, 4109 ];
var humEventId = [ 4102, 4109 ];
var batEventId = [ 4106 ];

module.exports = function exec(peripheral) {
	var now = new Date();
	var identifier = utils.getIdentifier(peripheral);

	// We look in local memory DB is the bluetooth device exists and is known.
	if (shared.devices[identifier]) {
		var localDevicetypes;
		var toUpdate = false;

		const {advertisement, id, rssi, address} = peripheral;
		const {localName, serviceData, serviceUuids} = advertisement;
		var xiaomiData = null;

		for (let i in serviceData) {
			if (serviceData[i].uuid.toString('hex') === 'fe95') {
				xiaomiData = serviceData[i].data;
			}
		}

		if (xiaomiData) {
			console.log(`xiaomiHT - data received: ${JSON.stringify(XiaomiServiceReader.readServiceData(xiaomiData))}`);
			var data = XiaomiServiceReader.readServiceData(xiaomiData);

			var options = {
				method : 'GET',
				uri : `${globalConfig.gladysUrl}/device/${shared.devices[identifier].id}/devicetype?token=${globalConfig.token}`,
				json : true
			};

			rp(options)
				.then(function(devicetypes) {
					localDevicetypes = devicetypes;

					// For each devicetype
					Promise.map(devicetypes, function(devicetype) {
						// Get last change date of the devicetype
						var lastChanged = new Date(devicetype.lastChanged);
						var delay = now - lastChanged;

						// Is update needed?
						toUpdate = !lastChanged || delay >= delays[devicetype.type];
					}).then(function() {
						if (toUpdate) {
							Promise.map(localDevicetypes, function(devicetype) {
								sendDevicestate(devicetype, data.event);
							})
								.then(function() {
									console.log(`xiaomiHT - data received OK`);
									if (peripheral.state === 'connected') {
										//console.log(`xiaomiHT - disconnectDevice ${identifier}`);
										peripheral.disconnect();
									}
								});
						}
					});
				})
				.catch(function(err) {
					console.error('xiaomiHT - Error while getting devicetypes to Gladys:');
					console.error(err);
				});
		}
	}

	function sendDevicestate(devicetype, event) {
		var lastChanged = new Date(devicetype.lastChanged);
		var delay = now - lastChanged;
		var type = devicetype.type;
		var data = event.data;
		var eventId = event.eventID;

		switch (type) {
		case 'temperature': // 4100, 4109
			if (tmpEventId.includes(eventId)) {
				if (!lastChanged || delay >= delays[type]) {
					utils.setDevicestate(devicetype.id, data.tmp)
						.then(function(parsedResult) {
							console.log(`DeviceType "${parsedResult.devicetype}" and DeviceState "${type}" inserted with success !`);
						})
						.catch(function(err) {
							console.error(`xiaomiHT - Error while sending ${type} to Gladys:`);
							console.error(err);
						});
				}
			}
			break;

		case 'moisture': // 4102, 4109
			if (humEventId.includes(eventId)) {
				if (!lastChanged || delay >= delays[type]) {
					utils.setDevicestate(devicetype.id, data.hum)
						.then(function(parsedResult) {
							console.log(`DeviceType "${parsedResult.devicetype}" and DeviceState "${type}" inserted with success !`);
						})
						.catch(function(err) {
							console.error(`xiaomiHT - Error while sending ${type} to Gladys:`);
							console.error(err);
						});
				}
			}
			break;

		case 'batteryLevel': // 4106
			if (batEventId.includes(eventId)) {
				if (!lastChanged || delay >= delays[type]) {
					utils.setDevicestate(devicetype.id, data.bat)
						.then(function(parsedResult) {
							console.log(`DeviceType "${parsedResult.devicetype}" and DeviceState "${type}" inserted with success !`);
						})
						.catch(function(err) {
							console.error(`xiaomiHT - Error while sending ${type} to Gladys:`);
							console.error(err);
						});
				}
			}
			break;

		default:
			break;
		}
	}
};
