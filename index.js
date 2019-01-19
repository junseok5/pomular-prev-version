var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);

// ejs rendering setting
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home.html');
})

// Server listener
var port = process.env.PORT || 3001;

server.listen(port, function(){
  console.log('Test server is running on port ' + port);
});
