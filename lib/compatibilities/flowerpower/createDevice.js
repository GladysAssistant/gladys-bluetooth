const utils = require('../../utils.js');
const globalConfig = require('../../../config');

module.exports = function createDevice(peripheral) {
	var device = {
		name : 'Flower Power',
		protocol : 'bluetooth',
		service : 'flowerpower',
		identifier : utils.getIdentifier(peripheral)
	};

	var types = [
		{
			name : 'Air Temperature',
			type : 'airTemperature',
			identifier : 'airTemperature',
			sensor : true,
			unit : '°C',
			min : -30,
			max : 50
		}, {
			name : 'Soil Temperature',
			type : 'soilTemperature',
			identifier : 'soilTemperature',
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
			name : 'Soil Electrical Conductivity',
			type : 'soilEC',
			identifier : 'soilEC',
			sensor : true,
			unit : 'mS/cm',
			min : 0,
			max : 10
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