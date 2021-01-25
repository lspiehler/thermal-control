const https = require('https');
const config = require('../config');
const fs = require('fs');

var access_token = config.access_token;

function request(params, callback) {
    var data = [];

    var req = https.request(params.options, function(res) {

        res.on('data', function(chunk) {
            data.push(chunk);
        });

        res.on('end', function(){
            let responsebody = JSON.parse(new Buffer.concat(data).toString());
            let response = {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers,
                data: responsebody
            }
            if(response.error_message) {
                callback(response.error_message, response);
            } else {
                callback(false, response);
            }
        });

        res.on('error', function(e){
            callback(e.message, false);
        });
    });

    req.on('error', function(e){
        callback(e.message, false);
    });

    if(params.body) {
        req.write(JSON.stringify(params.body));
    } else {
        //req.write();
    }

    req.end();
}

function startFan(seconds, refreshed, callback) {
    var options = {
        host: 'smartdevicemanagement.googleapis.com',
        port: 443,
        path: '/v1/enterprises/' + config.project_id + '/devices/' + config.device_id + ':executeCommand',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    }

    var body = {
        "command" : "sdm.devices.commands.Fan.SetTimer",
        "params" : {
            "timerMode" : "ON",
            "duration" : seconds + "s"
        }
    }

    request({options: options, body: body}, function(err, resp) {
        if(err) {
            callback(err, resp);
        } else {
            if(resp.statusCode==401) {
                if(refreshed) {
                    callback(err, resp);
                } else {
                    var options = {
                        host: 'www.googleapis.com',
                        port: 443,
                        path: '/oauth2/v4/token?client_id=' + config.client_id + '&client_secret=' + config.client_secret + '&refresh_token=' + config.refresh_token + '&grant_type=refresh_token',
                        method: 'POST'
                    }

                    request({options: options}, function(err, resp) {
                        if(err) {
                            callback(err, resp);
                        } else {
                            updateToken(resp.data, function(err) {
                                if(err) {
                                    callback(err, resp);
                                } else {
                                    startFan(config.fan_duration, true, callback);
                                }
                            });
                        }
                    });
                }
            } else if(resp.statusCode==200) {
                callback(false, resp);
            } else {
                callback(resp, resp);
            }
        }
    })
}

function updateToken(token, callback) {
    access_token = token.access_token;
    //console.log(token);
    fs.writeFile(__dirname + '/../cache/token.js', JSON.stringify(token), function(err) {
        if(err) {
            callback(err);
        } else {
            callback(false);
        }
    });
}

module.exports = {
    startFan: function(seconds, refreshed, callback) {
        startFan(seconds, refreshed, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, resp);
            }
        });
    }
}