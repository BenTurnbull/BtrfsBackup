var fileSystem = require('fs');

var rollup = function(streams, targetIndex) {

    if (targetIndex > 0) {
      //TODO: complete
    }

    var streamDirs = fileSystem.readdirSync('data');
    for	(var index = 0; index < streamDirs.length; index++) {
        var streamDate = streamDirs[index];
        var streamSize = fileSystem.statSync('data/' + streamDate + '/stream').size;
        var stats = JSON.parse(fileSystem.readFileSync('data/' + streamDate + '/stats', 'utf8'));
        streams.push({date:streamDate, size:streamSize, hash:stats.hash, duration:stats.duration});
    }
    return streams;
};

module.exports = rollup;
