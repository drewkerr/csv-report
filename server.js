// server.js
var express = require('express')
var multer  = require('multer')
var parse = require('csv-parse')
var iconv = require('iconv-lite')
var fs = require('fs')
var upload = multer({ dest: '/tmp' })
var app = express()

// render readable HTML
app.locals.pretty = true
app.set('json spaces', 2)

app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', function (request, response) {
  response.render('upload', { title: 'Upload CSV file', error: request.query.error })
})

app.post('/', upload.single('csv'), function (request, response) {
  //console.log(request.file.mimetype)
  if (request.file.mimetype == 'text/csv' ||
      request.file.mimetype == 'application/vnd.ms-excel') {
    var report = []
    var source = fs.createReadStream(request.file.path).pipe(iconv.decodeStream('win1251'))
    var linesRead = 0;
    var parser = parse({
        delimiter: ',',
        relax: true,
        quote: '"',
        escape: '"',
        skip_empty_lines: true,
        columns: null // new format
    })

    parser.on('readable', function(){
      var record
      while (record = parser.read()) {
        linesRead++
        report.push(record)
        }
    })

    parser.on('error', function(error){
      console.log(error)
      response.redirect('/?error=Parse error');
    })

    parser.on('end', function(){
      response.render('report', { title: 'Report Proofing', report: report })
      //response.json(report)
    })

    source.pipe(parser)

  } else {
    response.redirect('/?error=File error')
  }
})

// Listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
})
