var htmlparser = require('htmlparser'),
    Entities = require('html-entities').AllHtmlEntities;

entities = new Entities();

module.exports = function slackify(html) {
  var handler = new htmlparser.DefaultHandler(function (error, dom) {
    // error ignored
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  var dom = handler.dom;
  if (dom)
    return entities.decode(walk(dom));
  else
    return '';
};

function walkList(dom, ordered, nesting) {
  var out = '';
  if (dom) {
    var listItemIndex = 1;
    dom.forEach(function (el) {
      if ('text' === el.type && el.data.trim() !== '') {
        out += el.data;
      }
      else if ('tag' === el.type) {
        switch (el.name) {
          case 'li':
            for (i=0; i < nesting * 2; i++) {
              out += ' ';
            }
            out += (ordered ? listItemIndex++ + '. ' : "• ") + walk(el.children, nesting + 1) + '\n';
            break;
          default:
            out += walk(el.children, nesting + 1);
        }
      }
    });
  }
  return out;
}

function walkPre(dom) {
  var out = '';
  if (dom) {
    dom.forEach(function (el) {
      if ('text' === el.type) {
        out += el.data;
      }
      else if ('tag' === el.type) {
        out += walkPre(el.children);
      }
    });
  }
  return out;
}

function walkTable(dom) {
  var out = '';
  if (dom) {
    dom.forEach(function (el) {
      if ('tag' === el.type) {
        if ('thead' === el.name) {
          out += walkTableHead(el.children);
        }
        else if ('tbody' === el.name) {
          out += walkTableBody(el.children);
        }
      }
    });
  }

  return out;
}

function walkTableHead(dom) {
  var out = '';
  if (dom) {
    var headers = [];
    dom.forEach(function (el) {
      if ('text' === el.type && el.data.trim() !== '') {
        out += el.data;
      }
      else if ('tr' === el.name) {
        out += walkTableHead(el.children);
      }
      else if ('th' === el.name) {
        var header = walkTableHead(el.children);
        headers.push(header);
        out += '| ' + header + ' ';
      }
    });
    if (headers.length > 0) {
      out += ' |\n';
      headers.forEach(function (item) {
        out += '| ';
        for (i = 0; i < item.length; i++) {
          out += '-';
        }
        out += ' ';
      });
      out += ' |\n';
    }
  }

  return out;
}

function walkTableBody(dom) {
  var out = '';
  if (dom) {
    dom.forEach(function (el) {
      if ('text' === el.type && el.data.trim() !== '') {
        out += el.data;
      }
      else if ('td' === el.name) {
        out += '| ' + walkTableBody(el.children) + ' ';
      }
      else if ('tr' === el.name) {
        out += walkTableBody(el.children) + '|\n';
      }
    });
  }
  return out;
}


function walk(dom, nesting) {
  if (!nesting) {
    nesting = 0;
  }
  var out = '';
  if (dom)
    dom.forEach(function (el) {
      if ('text' === el.type) {
        out += el.data;
      }
      else if ('tag' === el.type) {
        switch (el.name) {
          case 'a':
            if (el.attribs && el.attribs.href) {
              out += '<' + el.attribs.href + '|' + walk(el.children) + '>';
            }
            else {
              out += walk(el.children);
            }
            break;
          case 'strong':
          case 'b':
            out += '*' + walk(el.children) + '*';
            break;
          case 'i':
          case 'em':
            out += '_' + walk(el.children) + '_';
            break;
          case 'p':
            out += walk(el.children) + '\n';
            break;
          case 'br':
            out += walk(el.children) + '\n';
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
            out += '*' + walk(el.children) + '*';
            break;
          case 'ol':
          case 'ul':
            out += walkList(el.children, 'ol' === el.name, nesting);
            break;
          case 'code':
            out += '`' + walk(el.children) + '`';
            break;
          case 'pre':
            out += '```\n' + walkPre(el.children) + '```';
            break;
          case 'table':
            out += walkTable(el.children);
            break;
          case 'img':
            var alt = el.attribs.alt;
            out += '<Inline Image' + (alt !== '' ? '('+alt+')' : '') + ': ' + el.attribs.src + '>';
            break;
          default:
            out += walk(el.children);
        }
      }
    });
  return out;
}
