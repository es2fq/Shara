var port = process.env.PORT || 8080;
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', express.static(path.join(__dirname + '/Shara')));

app.listen(port, function() {
    console.log("Listening to port " + port);
});
