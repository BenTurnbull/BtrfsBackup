var express = require('express');
var sequest = require('sequest');
var SSH = require('simple-ssh');
var fs = require('fs');
var os = require('os');
var router = express.Router();

/* POST submit a backup. */
router.post('/api/backups', function(req, res, next) {
    var address = req.body.address;
    var password = req.body.password;

    var user = address.substring(0, address.search('@'));
    var host = address.substring(address.search('@') + 1, address.length);
    console.log('user: ' + user);
    console.log('host: ' + host);

    var scripts = 'scripts/';
    var btrfs_client = 'btrfs_client';
    var remoteClient = '~/' + btrfs_client;
    var writer = sequest.put(address, remoteClient, {
        password: password
    });

    var e;
    writer.on('error', function(err) {
        console.log('writer error message: ' + err.message);
        e = err.code;
        res.sendStatus(500);
    });

    writer.on('close', function () {
        if (e !== undefined) {
            return;
        }

        console.log('client pushed');

        var ssh = new SSH({
            host: host,
            user: user,
            pass: password
        });

        ssh.on('error', function(stderr) {
            console.log('ssh error: ' + stderr);
        });

        var thisAddress = getNetworkAddress();

        ssh.exec('echo ' + password + ' | sudo --stdin chmod +x ' + remoteClient + ' && ' +
                 'echo ' + password + ' | sudo --stdin --background nohup ' + remoteClient + ' -p /home backup ' + thisAddress,
        {
            pty: true,
            out: console.log.bind(console)
        }).start();

        res.send([]);
    });

    try {
        fs.createReadStream(scripts + btrfs_client).pipe(writer);
    } catch (err) {
        console.log('error pushing client code: ' + err.code);
        res.sendStatus(500);
    }
});

var getNetworkAddress = function() {
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses[0];
}

module.exports = router;
