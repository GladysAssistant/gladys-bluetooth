const emojiStrip = require('emoji-strip');
const defaultExec = require('./defaultExec.js');

// Compatibilities
const miflora = require('./compatibilities/miflora');
const xiaomiht = require('./compatibilities/xiaomiht');
const flowerpower = require('./compatibilities/flowerpower');

module.exports = function deviceSeen(peripheral) {
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
		miflora().exec(peripheral);
		return null;
		break;

	// Mijia Hygrothermograph (MJ_HT_V1)
	case '4c:65:a8:':
		xiaomiht().exec(peripheral);
		return null;
		break;

	// Parrot Flower Power (flowerpower)
	case 'a0:14:3d:':
		flowerpower().exec(peripheral);
		return null;
		break;

	default:
		return defaultExec(peripheral);
		break;
	}
};