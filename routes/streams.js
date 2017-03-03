var express = require('express');
var getStreams = require('../functions/streams');
var rollup = require('../functions/rollup');
var router = express.Router();

/* GET streams listing. */
router.get('/api/streams', function(req, res, next) {
    var streams = getStreams();
    res.send(streams);
});

/* GET a stream. */
router.get('/api/streams/:stream', function(req, res, next) {
    var streamDate = req.params.stream;
    res.sendFile('stream', {root:'data/'+streamDate+'/'}, function(err){
        if (err !== undefined)
        console.log('Error sending file: ' + err);
    });
});

/* POST a stream. starts a rollup */
router.post('/api/streams/:stream', function(req, res, next) {
    var streamDate = req.params.stream;
    var streams = getStreams();
    var targetIndex = getIndexForDate(streams, streamDate);
    if (targetIndex === -1) {
        res.status(500).send('Index for date not found');
    } else {
        setTimeout(rollup, 0, streams, targetIndex);
        res.send([]);
    }
});

var getIndexForDate = function(streams, date) {
    for (var index = 0; index < streams.length; index++) {
        if (streams[index].date === date) {
            return index;
        }
    }
    return -1;
};

module.exports = router;
