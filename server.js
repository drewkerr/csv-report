// server.js
var express = require('express');
var multer  = require('multer');
var parse = require('csv-parse');
var fs = require('fs');
var upload = multer({ dest: '/tmp' });
var app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', function (request, response) {
  response.render('upload', { title: 'Upload CSV file', error: request.query.error });
});

app.post('/', upload.single('csv'), function (request, response) {
  if (request.file.mimetype == 'text/csv') {
    var report = [];
    var source = fs.createReadStream(request.file.path);
    var linesRead = 0;
    var parser = parse({
        delimiter: ',', 
        columns: true
    });

    parser.on('readable', function(){
      var record;
      while (record = parser.read()) {
        linesRead++;
        report.push(record);
        }
    });

    parser.on('error', function(error){
      console.log(error)
      response.redirect('/?error=Parse error');
    });

    parser.on('end', function(){
      response.render('report', { title: 'Report', report: report });
    });

    source.pipe(parser);

  } else {
    response.redirect('/?error=File error');
  }
});

// Listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
});