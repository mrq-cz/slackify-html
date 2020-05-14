var slackify = require('./slackify-html');
var fs = require('fs');
fs.readFile('/Users/petermichel/Desktop/delme.html', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(slackify(data));
});
