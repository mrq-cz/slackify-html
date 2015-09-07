# slackify-html

convert html to [slack markdown](https://slack.zendesk.com/hc/en-us/articles/202288908-Formatting-your-messages)

example usage:
```
var slackify = require('slackify-html');

var text = slackify('this <a href="http://github.com">link</a> is <b>important</b>');
// text variable contains 'this <http://github.com|link> is *important*' 
```
