var
    http = require("http"),
    fs = require("fs"),
    path = require("path"),
    express = require("express"),
    bodyParser = require("body-parser"),
    multer = require("multer"),
    buzzerNumbers = require("./buzzerNumbers.js");

var accountSid = buzzerNumbers.TWILIO_ACCOUNT_SID,
    authToken = buzzerNumbers.TWILIO_AUTH_TOKEN,
    passcode = buzzerNumbers.configCode;

var app = express();
var server = http.createServer(app);

var timeShout = function(){
    var nowTime = new Date();
    return (nowTime.getMonth() +1).toString() + '/'+ nowTime.getDate().toString() + " " +
        nowTime.getHours().toString() + ":"+ nowTime.getMinutes().toString();
};

var client = require("twilio")(accountSid, authToken);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.set('views', './views');
app.set('view engine', 'jade');

app.use('/static', express.static('public'));

app.route('/')
.post(function(req, res) {
    var buzzerNumberList = buzzerNumbers.numberList;
    function isBuzzerNumber(num, arr) {
        return !(arr.indexOf(num) === -1);
    }

    if ( isBuzzerNumber(req.body.From, buzzerNumberList) ) {
    // if (req.body.From == '+12014869434') {
        console.log('call accepted at ' + timeShout() + 'GMT');
        res.header('Content-Type', 'text/xml');
        res.render('scenario2');
    } else {
        console.log(req.body.From);
        console.log('call diverted at ' + timeShout() + 'GMT');
        res.header('Content-Type', 'text/xml');
        res.render('scenario1');
    }
});

// // This happens after you gather the digits
app.route('/gather')
.post(function(req, res) {
  if (req.body.Digits == passcode) {
      console.log('success!');
      res.header('Content-Type', 'text/xml');
      res.render('scenarioY');
  } else {
      console.log('failure');
      res.header('Content-Type', 'text/xml');
      res.render('scenarioX');
  }
   
});

// Text me via form
app.route('/form')
.get(function (req, res) {
    res.render('form');
    res.end();
})
.post(function (req, res) {
    client.messages.create({
        to: req.body.phone,
        from: "+12065698957",
        body: req.body.msg
    });
    res.end();
});

server.listen(process.env.PORT || 8080, process.env.IP || '0.0.0.0', function(){
    var addr = server.address();
    console.log('Server running at', addr.address + ':' + addr.port);
});