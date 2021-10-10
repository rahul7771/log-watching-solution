var socket = io.connect("http://localhost:8080");
var logContainer = document.getElementById("logs");

// socket connection on server side
socket.on("updateLogOnClient", function(log){
  if(log) {
    var updatedLog = "";
    var logSize = log.data.length;

    // updating DOM
    for(var i = 0; i < logSize; i++) {
      updatedLog += `<p>${log.data[i]}</p>`;
    }
    logContainer.innerHTML +=  updatedLog;
  }
});
