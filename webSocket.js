'use strict';
var fs = require("fs"),
    http = require("http"),
    path = require("path"),
    socketIo = require("socket.io"),
    url = require("url"),
    server,
    clientCntr = 0,
    port = process.argv[2] || 8000;

/**
 * FIlE SERVER SERVING STATIC FILES
 * WHEN THE PATH IS ROOT SERVE THE websocket.html file
 * WHEN THE FILE DOESNT EXIST SERVE 404
 */
server = http.createServer(function (req, res) {
    var readStream, uri, fullPath;
    uri = url.parse(req.url).pathname;
    if (uri === "/") { //when the path is root serve the websocket.html
        uri = path.join(uri, "websocket.html");
    }
    fullPath = path.join(process.cwd(), uri);
    fs.exists(fullPath, function (exists) {
        if (!exists) { //if file doesnt exists serve 404
            res.writeHead(404,  {"Content-Type": "text/plain"});
            res.write("404 not found\n\r");
            res.end();
            return;
        }
        res.statusCode = 200;
        readStream = fs.createReadStream(fullPath);
        readStream.pipe(res);
    });
}).listen(port, function () {
    console.log("Listening at http://localhost:" + port);
});

socketIo.listen(server).on("connection", function (socket) {
    clientCntr += 1;
    socket.send("Server says I am connected to you! you are number " + clientCntr);
    socket.on("message", function (msg) {
        var myObj =  JSON.parse(msg);
        console.log("Message Recieved " + myObj);
        socket.broadcast.send(JSON.stringify(myObj));
    });
});
