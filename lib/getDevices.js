const rp = require('request-promise');
const config = require('../config.js');

module.exports = function getDevices(service) {

  // get all bluetooth devices
  var options = {
    method: 'GET',
    uri: `${config.gladysUrl}/device?token=${config.token}&service=${service}&take=1000000`,
    json: true
  };

  return rp(options)
    .then((devices) => {
      console.log(`Just received ${devices.length} devices from "${service}" service, from Gladys. Saving them locally in RAM.`);

      return devices;
    })
    .catch((err) => {
      console.log(err);
      if (err.error.code === 'ECONNREFUSED') {
        // Try again
      }
    });
};