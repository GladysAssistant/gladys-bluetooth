const EventEmitter = require('events');

const UUID_BASE = (x) => `0000${x}00001000800000805f9b34fb`
const DATA_SERVICE_UUID = UUID_BASE('1204'); //'0000120400001000800000805f9b34fb';
const DATA_CHARACTERISTIC_UUID = UUID_BASE('1a01'); //'00001a0100001000800000805f9b34fb';
const FIRMWARE_CHARACTERISTIC_UUID = UUID_BASE('1a02'); //'00001a0200001000800000805f9b34fb';
const REALTIME_CHARACTERISTIC_UUID = UUID_BASE('1a00'); //'00001a0000001000800000805f9b34fb';
const REALTIME_META_VALUE = Buffer.from([ 0xA0, 0x1F ]);

const SERVICE_UUIDS = [ DATA_SERVICE_UUID ];
const CHARACTERISTIC_UUIDS = [ DATA_CHARACTERISTIC_UUID, FIRMWARE_CHARACTERISTIC_UUID, REALTIME_CHARACTERISTIC_UUID ];

class MiFlora extends EventEmitter {
	constructor(macAddress) {
		super();
		this._macAddress = macAddress;
	}

	connectDevice(peripheral) {
		// Prevent simultaneous connection to the same device
		if (peripheral.state === 'disconnected') {
			peripheral.connect();

			peripheral.once('connect', function() {
				this.listenDevice(peripheral, this);
			}.bind(this));
		}
	}

	disconnectDevice(peripheral) {
		if (peripheral.state === 'connected') {
			peripheral.disconnect();
		}
	}

	listenDevice(peripheral, context) {
		peripheral.discoverSomeServicesAndCharacteristics(SERVICE_UUIDS, CHARACTERISTIC_UUIDS, function(error, services, characteristics) {
			characteristics.forEach(function(characteristic) {
				switch (characteristic.uuid) {
				case DATA_CHARACTERISTIC_UUID:
					//console.log('reading data');
					characteristic.read(function(error, data) {
						context.parseData(peripheral, data);
					});
					break;

				case FIRMWARE_CHARACTERISTIC_UUID:
					//console.log('reading firmware');
					characteristic.read(function(error, data) {
						context.parseFirmwareData(peripheral, data);
					});
					break;

				case REALTIME_CHARACTERISTIC_UUID:
					//console.log('enabling realtime');
					characteristic.write(REALTIME_META_VALUE, false);
					break;

				default:
					console.log(`found characteristic uuid ${characteristic.uuid} but not matched the criteria`);
					break;
				}
			});
		});
	}

	parseData(peripheral, data) {
		let temperature = data.readUInt16LE(0) / 10;
		let light = data.readUInt32LE(3);
		let moisture = data.readUInt16BE(6);
		let fertility = data.readUInt16LE(8);

		let deviceData = {
			deviceId : peripheral.id,
			temperature : temperature,
			light : light,
			moisture : moisture,
			fertility : fertility
		};
		this.emit('data', deviceData);
	}

	parseFirmwareData(peripheral, data) {
		let batteryLevel = parseInt(data.toString('hex', 0, 1), 16);
		let firmwareVersion = data.toString('ascii', 2, data.length);

		let firmware = {
			deviceId : peripheral.id,
			batteryLevel : batteryLevel,
			firmwareVersion : firmwareVersion
		};
		this.emit('firmware', firmware);
	}
}

module.exports = MiFlora;