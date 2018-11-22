var express = require('express');
var app = express();
app.get('/', function (req, res) {
    res.send('Hello World!');
  });

// while (true) {}

// console.log("this fails");

// require("electron")().use(require("electron").static("public")).listen(8080);
