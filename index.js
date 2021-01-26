const { spawn } = require('child_process');
const config = require('./config');
const fancontrol = require('./lib/fanControl');

var wait = false;

function runTemperatureCommand(callback) {

    const stdoutbuff = [];
    const stderrbuff = [];

    let cmd = '-s "show temp"';

    let hpasmcli = spawn('hpasmcli', ['-s', '"show temp"'], {shell: true})
    hpasmcli.stdout.on('data', function(data) {
        stdoutbuff.push(data.toString());
    });

    //console.log(hpasmcli);

    hpasmcli.stderr.on('data', function(data) {
        stderrbuff.push(data.toString());
    });

    hpasmcli.on('exit', function(code) {
        var out = {
            command: 'hpasmcli ' + cmd,
            stdout: stdoutbuff.join(''),
            stderr: stderrbuff.join(''),
            exitcode: code
        }
        if (code != 0) {
            callback(stderrbuff.join(), out);
        } else {
            callback(false, out);
        }
    });

}

function getSystemTemperature(callback) {
    runTemperatureCommand(function(err, resp) {
        if(err) {
            //console.log(resp);
        } else {
            //console.log(resp.stdout);
            let lines = resp.stdout.split('\n')
            let rows = []
            let colindex = 0;
            for(let i = 3; i <= lines.length - 4; i++) {
                let curval = [];
                let columns = []
                //console.log('"' + lines[i] + '"');
                for(let j = 0; j <= lines[i].length - 1; j++) {
                    if(lines[i][j]==' ') {
                        if(curval.length==0) {
                            
                        } else {
                            columns.push(curval.join(''));
                            curval = [];
                        }
                    } else {
                        curval.push(lines[i][j]);
                    }
                }
                if(curval.length > 0) {
                    columns.push(curval.join(''));
                }
                rows.push(columns);
            }
            //console.log(rows)
            let temps = {}
            for(let i = 0; i <= rows.length - 1; i++) {
                if(!temps.hasOwnProperty(rows[i][1])) {
                    temps[rows[i][1]] = [];
                }

                let thresholdc;
                let thresholdf;
                let tempc;
                let tempf;

                if(rows[i][2].split('/').length > 1) {
                    //console.log(rows[i][2].split('/').length);
                    //console.log(rows[i][2].split('/'));
                    thresholdc = parseInt(rows[i][3].split('/')[0].replace('C', ''));
                    thresholdf = parseInt(rows[i][3].split('/')[1].replace('F', ''));
                    tempc = parseInt(rows[i][2].split('/')[0].replace('C', ''));
                    tempf = parseInt(rows[i][2].split('/')[1].replace('F', ''));
                } else {
                    thresholdc = false;
                    thresholdf = false;
                    tempc = false;
                    tempf = false;
                }

                let temp = {
                    id: rows[i][0],
                    temp: {
                        fahrenheit: tempf,
                        celsius: tempc
                    },
                    threshold: {
                        fahrenheit: thresholdf,
                        celsius: thresholdc
                    }
                }
                temps[rows[i][1]].push(temp);
            }
            callback(false, temps);
        }
    })
}

function getAllTemperatures(component, unit, formula, callback) {
    getSystemTemperature(function(err, resp) {
        if(err) {
            callback(err, false);
        } else {
            //console.log(util.inspect(resp, {showHidden: false, depth: null}))
            let temps = [];
            for(let i = 0; i <= resp[component].length - 1; i++) {
                if(resp[component][i].temp[unit]) {
                    temps.push(resp[component][i].temp[unit])
                }
            }
            if(formula=='SUM') {
                callback(false, temps.reduce(function(acc, val) { return acc + val; }, 0));
            } else if(formula=='AVG') {
                callback(false, temps.reduce(function(acc, val) { return acc + val; }, 0) / temps.length);
            } else {
                callback('Invalid formula specified. Must be SUM or AVG', false);
            }
        }
    })
}

function monitorLoop() {
    getAllTemperatures('SYSTEM_BD', 'fahrenheit', 'SUM', function(err, resp) {
        if(err) {
            console.error(err);
        } else {
            if(resp > parseInt(config.threshold)) {
                console.log(Date() + ' - ' + resp);
                if(wait) {
                    console.log(Date() + ' - Temperature threshold exceeded, but wait timer hasn\'t expired.');
                } else {
                    console.log(Date() + ' - Temperature threshold exceeded. Starting fan.')
                    wait = true;
                    fancontrol.startFan(config.fan_duration, false, function(err, resp) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log(resp);
                        }
                    });
                    setTimeout(function() {
                        console.log(Date() + ' - Fan should go off now.');
                        wait = false;
                    }, parseInt(config.fan_duration) * 1000 );
                    setTimeout(function() {
                        console.log(Date() + ' - Wait timer expired.');
                        wait = false;
                    }, parseInt(config.fan_duration) * 1000 * 2 );
                }
            } else {
                //console.log(Date() + ' ' + resp);
            }
            setTimeout(function() {
                monitorLoop();
            }, 5000)
        }
    })
}

getAllTemperatures('SYSTEM_BD', 'fahrenheit', 'SUM', function(err, resp) {
    if(err) {
        console.error(err);
    } else {
        console.log(resp);
    }
})

monitorLoop();
/*fancontrol.startFan(config.fan_duration, false, function(err, resp) {
    if(err) {
        console.log(err);
    } else {
        console.log(resp);
    }
});*/