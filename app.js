var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(__dirname + '/'));
	
// This is the port for the web server.
// you will need to go to 10.10.10.100:80 to see it
server.listen(80);

io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {

	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		io.sockets.emit('moving', data);
		console.log(data);
	});
});