var express = require("express")
var fs = require("fs");
var {streamsLogsToClient} = require('./utils/helper');
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

// socket connection on server side
io.on("connection", function(socket) {
  console.log("User connected.. ");

  streamsLogsToClient(socket);

});


app.use("/js", express.static(__dirname + '/assets'));
app.get("/log", function(req, res){
  res.sendFile(__dirname + "/static/index.html")
})


// serve listening on this port
server.listen(8080, function() {
  console.log("App listening on port 8080");
});
