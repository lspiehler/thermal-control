require('dotenv').config();
const fs = require('fs');

function getCachedToken() {
    try {
        const data = fs.readFileSync(__dirname + '/cache/token.js', {encoding:'utf8', flag:'r'});
        if(data=='') {
            return process.env.access_token;
        } else {
            const jsoncache = JSON.parse(data);
            return jsoncache.access_token;
        }
    } catch(e) {
        return process.env.access_token;
    }
}

module.exports = {
    access_token: getCachedToken(),
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    refresh_token: process.env.refresh_token,
    project_id: process.env.project_id,
    device_id: process.env.device_id,
    fan_duration: process.env.fan_duration,
    threshold: process.env.threshold
}