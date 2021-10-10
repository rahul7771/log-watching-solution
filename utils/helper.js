var fs = require('fs');
var async = require('async');
var buffer = new Buffer(1024);

var watchFile = function (fileName, socket) {

    async.waterfall([
            //check whether the file exists or not
            function(next) {
                fs.stat(fileName, function(err, stat) {
                    if(err == null) {
                        console.log('File exists');
                        next();
                    }
                    else {
                        next(err);
                    }
                });
            },

            //if file exist then start watching file
            function(next){
                console.log('Watcher started for: ', fileName);

                //Start watching a file
                fs.watchFile(fileName, function(curr, prev){

                    var prevModifiedTime = new Date(prev.mtime).getTime();
                    var currModifiedTime = new Date(curr.mtime).getTime();

                    if(currModifiedTime > prevModifiedTime) {

                        //open the file
                        fs.open(fileName, 'r', (err, fd) => {
                            if(err){
                                console.log('Error occurred while opening file :  ', err);
                            }
                            else {
                                var lastUpdatedPosition = prev.size;

                                fs.read(fd, buffer, 0, buffer.length, lastUpdatedPosition, function(err, bytesRead) {
                                    if(err){
                                        console.log('Error occurred while reading file.', err);
                                    }
                                    if(bytesRead > 0){
                                        var addedLinesInFile = buffer.slice(0, bytesRead).toString();
                                        updateClient(socket,addedLinesInFile.split("\n"));
                                    }
                                });
                            }
                        });
                    }
                });
                next();
            }
        ],
        //
        function (err){
            if(err) {
                if(err.code == 'ENOENT')
                    console.log('File not found :  ', err);
                else
                    console.log(err);
            }
        }
    );
}

var updateClient = function(socket, logs) {
    //send only if there is some update in log file
    if(logs.length) {
        socket.emit("updateLogOnClient", {data: logs});
    }
}

var streamsLogsToClient = function(socket) {
    // reading log file
    let file = fs.readFileSync("./logs.txt").toString();

    // modifying file content as to be sent
    let logsInFile = file.split("\n")
    let logs = logsInFile.slice((logsInFile.length-10), (logsInFile.length+1));

    updateClient(socket, logs);

    // watch for changes
    watchFile("logs.txt", socket);
}

module.exports = {
    streamsLogsToClient
}
