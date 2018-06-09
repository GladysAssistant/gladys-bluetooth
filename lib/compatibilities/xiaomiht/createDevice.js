const utils = require('../../utils.js');
const globalConfig = require('../../../config');

module.exports = function createDevice(peripheral) {
	var device = {
		name : 'Xiaomi HT',
		protocol : 'bluetooth',
		service : 'xiaomiht',
		identifier : utils.getIdentifier(peripheral)
	};

	var types = [
		{
			name : 'Temperature',
			type : 'temperature',
			identifier : 'temperature',
			sensor : true,
			unit : '°C',
			min : -30,
			max : 50
		},
		{
			name : 'Moisture',
			type : 'moisture',
			identifier : 'moisture',
			sensor : true,
			unit : '%',
			min : 0,
			max : 100
		},
		{
			name : 'Battery Level',
			type : 'batteryLevel',
			identifier : 'batteryLevel',
			sensor : true,
			unit : '%',
			min : 0,
			max : 100
		}
	];

	return utils.createDevice(device, types);
};