module.exports = function() {
	var exec = require('./exec.js');
	var createDevice = require('./createDevice.js');

	return {
		exec : exec,
		createDevice : createDevice
	};
};