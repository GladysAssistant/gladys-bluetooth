const config = require('./config.js');
const scan = require('./lib/scan.js');
const deviceSeen = require('./lib/deviceSeen.js');
const getDevices = require('./lib/getDevices.js');
const shared = require('./lib/shared.js');
const Promise = require('bluebird');

var services = config.services.split(',');

// retry every 10 seconds
const RETRY_IN_SECONDS = 10;

// refresh devices every hour
const REFRESH_DEVICES_FREQUENCY_IN_SECONDS = 3600;

function getDevicesWithRetry(){
    return Promise.map(services, function(service){
        return getDevices(service);
    })
    .catch((err) => {
        console.log(`Error while getting devices from Gladys, retrying in ${RETRY_IN_SECONDS} seconds.`);
        console.log(err);
        setTimeout(getDevicesWithRetry, RETRY_IN_SECONDS*1000);
    });
}

getDevicesWithRetry();
setInterval(getDevicesWithRetry, REFRESH_DEVICES_FREQUENCY_IN_SECONDS*1000);
scan(deviceSeen);