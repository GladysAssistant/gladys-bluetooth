const Promise = require('bluebird');
const rp = require('request-promise');
const async = require('async');
const FlowerPower = require('flower-power');

const shared = require('../../shared.js');
const utils = require('../../utils.js');
const globalConfig = require('../../../config.js');
const config = require('./config.js');

var delays = {
	light : utils.intervalToDelay(config.updateIntervalLight),
	airTemperature : utils.intervalToDelay(config.updateIntervalAirTemperature),
	soilTemperature : utils.intervalToDelay(config.updateIntervalSoilTemperature),
	moisture : utils.intervalToDelay(config.updateIntervalMoisture),
	soilEC : utils.intervalToDelay(config.updateIntervalSoilEC),
	batteryLevel : utils.intervalToDelay(config.updateIntervalBatteryLevel)
};

module.exports = function exec(peripheral) {
	var now = new Date();
	var identifier = utils.getIdentifier(peripheral);

	// We look in local memory DB is the bluetooth device exists and is known
	if (shared.devices[identifier]) {
		var toUpdate = false;
		var typeToUpdate = [];
		var devicetypeId = [];

		var options = {
			method : 'GET',
			uri : `${globalConfig.gladysUrl}/device/${shared.devices[identifier].id}/devicetype?token=${globalConfig.token}`,
			json : true
		};

		rp(options)
			.then(function(devicetypes) {
				// For each DeviceType
				Promise.map(devicetypes, function(devicetype) {
					devicetypeId[devicetype.type] = devicetype.id;

					// Get last change date of the DeviceType
					var lastChanged = new Date(devicetype.lastChanged);
					var delay = now - lastChanged;

					// Is update needed?
					typeToUpdate[devicetype.type] = !lastChanged || delay >= delays[devicetype.type];
					toUpdate = toUpdate || !lastChanged || typeToUpdate[devicetype.type];
				})
					.then(function() {
						if (toUpdate) {
							FlowerPower.discoverById(peripheral.id, function(flowerPower) {
								console.log(`flowerpower - discovered ${flowerPower}`);
								async.series([
									function(callback) {
										flowerPower.on('disconnect', function() {
											console.log(`flowerpower - disconnected`);
										});

										// Define onEvent actions (LiveMode)
										flowerPower.on('sunlightChange', function(value) {
											updatingValueIfNeeded('light', utils.photonsToLux(value));
										});

										flowerPower.on('airTemperatureChange', function(value) {
											updatingValueIfNeeded('airTemperature', value.toFixed(2));
										});

										flowerPower.on('soilTemperatureChange', function(value) {
											updatingValueIfNeeded('soilTemperature', value.toFixed(2));
										});

										flowerPower.on('soilMoistureChange', function(value) {
											updatingValueIfNeeded('moisture', value.toFixed(2));
										});

										flowerPower.on('soilElectricalConductivityChange', function(value) {
											updatingValueIfNeeded('soilEC', (value / 1000).toFixed(2));
										});

										console.log(`flowerpower - connecting...`);
										flowerPower.connect(callback);
									},
									function(callback) {
										flowerPower.discoverServicesAndCharacteristics(callback);
									},
/* Use LiveMode instead
									function(callback) {
										var type = 'light';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readSunlight(function (error, value) {
												sendDevicestate(type, devicetypeId[type], utils.photonsToLux(value));
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},
									function(callback) {
										var type = 'airTemperature';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readAirTemperature(function (error, value) {
													sendDevicestate(type, devicetypeId[type], value.toFixed(2));
													typeToUpdate[type] = false;
													callback();
										});
										} else callback();
									},
									function(callback) {
										var type = 'soilTemperature';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readSoilTemperature(function (error, value) {
												sendDevicestate(type, devicetypeId[type], value.toFixed(2));
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},
									function(callback) {
										var type = 'moisture';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readSoilMoisture(function (error, value) {
												sendDevicestate(type, devicetypeId[type], value);
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},
									function(callback) {
										var type = 'soilEC';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readSoilElectricalConductivity(function (error, value) {
												sendDevicestate(type, devicetypeId[type], (value / 1000).toFixed(2));
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},
*/
									function(callback) {
										var type = 'batteryLevel';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readBatteryLevel(function(error, value) {
												sendDevicestate(type, devicetypeId[type], value);
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},
									// LiveMode (realtime values)
									function(callback) {
										console.log(`flowerpower - enable LiveMode`);
										flowerPower.enableLiveMode(callback);
									},
									function(callback) {
										setTimeout(callback, 5000);
									},
									function(callback) {
										console.log(`flowerpower - disable LiveMode`);
										flowerPower.disableLiveMode(callback);
									},
									// Disconnect
									function(callback) {
										console.log(`flowerpower - disconnect Device ${identifier}`);
										flowerPower.disconnect(callback);
									}
								])
							});
						}
					});
			})
			.catch(function(err) {
				console.error('flowerpower - Error while getting DeviceTypes from Gladys:');
				console.error(err);
			});
	}

	function updatingValueIfNeeded(type, value) {
		if (typeToUpdate[type]) {
			console.log(`flowerpower - updating ${type}`);
			sendDevicestate(type, devicetypeId[type], value);
			typeToUpdate[type] = false;
		}
	}
};

function sendDevicestate(type, id, value) {
	utils.setDevicestate(id, value)
		.then(function(parsedResult) {
			console.log(`flowerpower - DeviceType "${parsedResult.devicetype}" and DeviceState "${type}" inserted with success !`);
		})
		.catch(function(err) {
			console.error(`flowerpower - Error while sending ${type} to Gladys:`);
			console.error(err);
		});
}
