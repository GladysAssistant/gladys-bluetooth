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
			.then((devicetypes) => {
				// For each DeviceType
				Promise.map(devicetypes, function(devicetype) {
					// Get last change date of the DeviceType
					var lastChanged = new Date(devicetype.lastChanged);
					var delay = now - lastChanged;
					var type = devicetype.type;

					devicetypeId[type] = devicetype.id;

					// Is update needed?
					typeToUpdate[type] = !lastChanged || delay >= delays[type];
					toUpdate = toUpdate || !lastChanged || typeToUpdate[type];

					return Promise.resolve();
				})
					.then(() => {
						if (toUpdate) {
							FlowerPower.discoverById(peripheral.id, (flowerPower) => {
								console.log(`flowerpower - discovered ${flowerPower}`);
								async.series([
									(callback) => {
										flowerPower.once('disconnect', () => {
											console.log(`flowerpower - disconnected`);
										});

										// Define onEvent actions (LiveMode)
										flowerPower.once('sunlightChange', (value) => {
											updatingValueIfNeeded('light', utils.photonsToLux(value));
										});

										flowerPower.once('airTemperatureChange', (value) => {
											updatingValueIfNeeded('airTemperature', value.toFixed(2));
										});

										flowerPower.once('soilTemperatureChange', (value) => {
											updatingValueIfNeeded('soilTemperature', value.toFixed(2));
										});

										flowerPower.once('soilMoistureChange', (value) => {
											updatingValueIfNeeded('moisture', value.toFixed(2));
										});

										flowerPower.once('soilElectricalConductivityChange', (value) => {
											updatingValueIfNeeded('soilEC', (value / 1000).toFixed(2));
										});

										console.log(`flowerpower - connecting...`);
										flowerPower.connect(callback);
									},
									(callback) => {
										flowerPower.discoverServicesAndCharacteristics(callback);
									},
									(callback) => {
										var type = 'batteryLevel';
										if (typeToUpdate[type]) {
											console.log(`flowerpower - updating ${type}`);
											flowerPower.readBatteryLevel((error, value) => {
												utils.sendDeviceState('flowerpower', type, devicetypeId[type], value);
												typeToUpdate[type] = false;
												callback();
											});
										} else callback();
									},/*
									// LiveMode (realtime values)
									(callback) => {
										console.log(`flowerpower - enable LiveMode`);
										flowerPower.enableLiveMode(callback);
									},
									(callback) => {
										setTimeout(callback, 5000);
									},
									(callback) => {
										console.log(`flowerpower - disable LiveMode`);
										flowerPower.disableLiveMode(callback);
									},*/
									// Disconnect
									(callback) => {
										console.log(`flowerpower - disconnect Device ${identifier}`);
										flowerPower.disconnect(callback);
									}
								])
							});
						}
					});
			})
			.catch((err) => {
				console.error('flowerpower - Error while getting DeviceTypes from Gladys:');
				console.error(err);
			});
	}

	function updatingValueIfNeeded(type, value) {
		if (typeToUpdate[type]) {
			console.log(`flowerpower - updating ${type}`);
			typeToUpdate[type] = false;
			return utils.sendDeviceState('flowerpower', type, devicetypeId[type], value);
		}

		return Promise.resolve();
	}
};