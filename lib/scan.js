const noble = require('noble');
const config = require('../config.js');

var peripherals = [];

module.exports = function scan(callback) {
	var bluetoothOn = false;
	var scanInProgress = false;

	function start() {
		if (bluetoothOn) {
			console.log(`Starting Bluetooth Scan for ${config.scanTimeout / 1000} seconds !`);
			peripherals = [];
			noble.startScanning();
			setTimeout(stop, config.scanTimeout);
		}
	}

	function stop() {
		console.log(`Stopping Bluetooth Scan for ${config.scanInterval / 1000} seconds !`);
		noble.stopScanning();
		setTimeout(start, config.scanInterval);
	}

	noble.on('stateChange', (state) => {
		if (state === 'poweredOn') {
			bluetoothOn = true;
			start();
		}

		if (state === 'poweredOff') {
			bluetoothOn = false;
			noble.stopScanning();
		}
	});

	noble.on('discover', (peripheral) => {
		// If peripheral is not yet discovered,
		if (peripherals.indexOf(peripheral) < 0) {
			// add it to the list
			peripherals.push(peripheral);

			callback(peripheral);

			// When peripheral is disconnected,
			peripheral.once('disconnect', (peripheral) => {
				// restart noble scanning, 
				// to prevent scanning stop on peripheral connection
				if (!scanInProgress) {
					noble.startScanning();
				}
			});
		}
	});

	noble.on('scanStart', () => {
		console.log('Bluetooth Scan started');
		scanInProgress = true;
	});

	noble.on('scanStop', () => {
		console.log('Bluetooth Scan stopped');
		scanInProgress = false;
	});
};