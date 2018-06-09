const utils = require('../../utils.js');
const globalConfig = require('../../../config');

module.exports = function createDevice(peripheral) {
	var device = {
		name : 'Flower care',
		protocol : 'bluetooth',
		service : 'miflora',
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
			name : 'Light',
			type : 'light',
			identifier : 'light',
			sensor : true,
			unit : 'lux',
			min : 0,
			max : 100000
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
			name : 'Fertility',
			type : 'fertility',
			identifier : 'fertility',
			sensor : true,
			unit : 'µS/cm',
			min : 0,
			max : 1000
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