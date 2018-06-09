const rp = require('request-promise');
const emojiStrip = require('emoji-strip');

const utils = require('./utils.js');
const config = require('../config.js');

// Compatibilities
const miflora = require('./compatibilities/miflora');
const xiaomiht = require('./compatibilities/xiaomiht');
const flowerpower = require('./compatibilities/flowerpower');

module.exports = function createDevice(peripheral) {
	// If the bluetooth device does not have a name, 
	// don't handle it
	if (!peripheral.advertisement.localName) {
		return;
	}

	var localName = emojiStrip(peripheral.advertisement.localName);

	console.log(`Found Bluetooth peripheral, name = ${localName}, id = ${peripheral.id}, address = ${peripheral.address}.`);

	switch (peripheral.address.substring(0, 9)) {
	// Xiaomi Flower Care (mi flora)
	case 'c4:7c:8d:':
		return miflora().createDevice(peripheral);
		break;

	// Xiaomi Hygrothermographe (xiaomi ht)
	case '4c:65:a8:':
		return xiaomiht().createDevice(peripheral);
		break;

	// Parrot Flower Power (flowerpower)
	case 'a0:14:3d:':
		return flowerpower().createDevice(peripheral);
		break;

	default:
		return createDefaultDevice(peripheral);
		break;
	}
};

function createDefaultDevice(peripheral) {
	var device = {
		name : emojiStrip(peripheral.advertisement.localName),
		protocol : 'bluetooth',
		service : 'bluetooth',
		identifier : utils.getIdentifier(peripheral)
	};

	var types = [
		{
			name : 'rssi',
			type : 'multilevel',
			identifier : 'rssi',
			sensor : true,
			units : 'dBm',
			min : -9999,
			max : 9999
		}
	];

	return utils.createDevice(device, types);
}