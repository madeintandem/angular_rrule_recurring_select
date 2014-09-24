var express = require('express');
var app = express();
var port = process.env.PORT || 8001;
app.use(express.static('demo'));
app.listen(port);
console.log("Server started at: " + "http://localhost:".concat(port));
