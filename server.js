const express = require('express');
const app = express();
const path = require('path');

const createPDF = require('./createPDF');

const PORT = 5000;

app.use('/static', express.static('public'));

app.get('/', function(req, res) {
  createPDF()
    .then(() => {
      res.sendFile(path.join(__dirname + '/index.html'));
    });
});

app.listen(PORT, function() {
  console.log('http://localhost:' + PORT);
});