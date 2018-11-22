const http = require('http');

let app = http.createServer((req, res) => {  
    // Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // Send back a response and end the connection
    res.end('Hello World!\n');
  });


app.listen(80, '127.0.0.1');  
console.log('Node server running on port 80');  

// var express = require('express');
// var app = express();
// app.get('/', function (req, res) {
//     res.send('Hello World!');
//  });

// while (true) {}

// console.log("this fails");

// require("electron")().use(require("electron").static("public")).listen(8080);
