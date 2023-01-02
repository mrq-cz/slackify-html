var htmlparser = require("htmlparser"),
  Entities = require("html-entities").AllHtmlEntities;

entities = new Entities();

module.exports = function slackify(html) {
  var handler = new htmlparser.DefaultHandler(function (error, dom) {
    // error ignored
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  var dom = handler.dom;
  if (dom) return entities.decode(walk(dom));
  else return "";
};

function walkList(dom, ordered, nesting, start) {
  var out = "";
  if (dom) {
    var listItemIndex = start ? start : 1;
    dom.forEach(function (el) {
      if ("text" === el.type && el.data.trim() !== "") {
        out += el.data;
      } else if ("tag" === el.type) {
        switch (el.name) {
          case "li":
            // Add indentation based on the nesting level
            for (i = 0; i < nesting * 2; i++) {
              out += " ";
            }
            // Add the bullet or number, followed by the text content of the li element
            out +=
              (ordered ? listItemIndex++ + ". " : "• ") +
              walkList(el.children, ordered, nesting) +
              "\n";
            break;
          case "p":
            // Add the text content of the p element
            out += walkList(el.children, ordered, nesting) + "\n";
            break;
          default:
            // Recursively process the children of the element
            out += walkList(el.children, ordered, nesting + 1);
        }
      }
    });
  }
  return out;
}

function walkPre(dom) {
  var out = "";
  if (dom) {
    dom.forEach(function (el) {
      if ("text" === el.type) {
        out += el.data;
      } else if ("tag" === el.type) {
        out += walkPre(el.children) + "\n";
      }
    });
  }
  return out;
}

function walkTable(dom) {
  var out = "";
  if (dom) {
    dom.forEach(function (el) {
      if ("tag" === el.type) {
        if ("thead" === el.name) {
          out += walkTableHead(el.children);
        } else if ("tbody" === el.name) {
          out += walkTableBody(el.children);
        }
      }
    });
  }

  return out;
}

function walkTableHead(dom) {
  var out = "";
  if (dom) {
    var headers = [];
    dom.forEach(function (el) {
      if ("text" === el.type && el.data.trim() !== "") {
        out += el.data;
      } else if ("tr" === el.name) {
        out += walkTableHead(el.children);
      } else if ("th" === el.name) {
        var header = walkTableHead(el.children);
        headers.push(header);
        out += "| " + header + " ";
      }
    });
    if (headers.length > 0) {
      out += " |\n";
      headers.forEach(function (item) {
        out += "| ";
        for (i = 0; i < item.length; i++) {
          out += "-";
        }
        out += " ";
      });
      out += " |\n";
    }
  }

  return out;
}

function walkTableBody(dom) {
  var out = "";
  if (dom) {
    dom.forEach(function (el) {
      if ("text" === el.type && el.data.trim() !== "") {
        out += el.data;
      } else if ("td" === el.name) {
        out += "| " + walk(el.children, 0, true) + " ";
      } else if ("tr" === el.name) {
        out += walkTableBody(el.children).replace(/\n/gi, " ") + "|\n";
      }
    });
  }
  return out;
}

function walk(dom, nesting) {
  if (!nesting) {
    nesting = 0;
  }
  var out = "";
  if (dom)
    dom.forEach(function (el) {
      if ("text" === el.type) {
        out += el.data;
      } else if ("tag" === el.type) {
        switch (el.name) {
          case "a":
            if (el.attribs && el.attribs.href) {
              out += "<" + el.attribs.href + "|" + walk(el.children) + ">";
            } else {
              out += walk(el.children);
            }
            break;
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "strong":
          case "b":
            content = walk(el.children);
            var contentArr = content.split("\n");
            var innerOutput = "";
            for (var i = 0; i < contentArr.length; i++) {
              content = contentArr[i];
              if (content.trim() !== "") {
                var prefixSpace = false;
                var suffixSpace = false;
                if (content && content.charAt(0) === " ") {
                  content = content.substr(1, content.length);
                  prefixSpace = true;
                }
                if (content && content.charAt(content.length - 1) === " ") {
                  content = content.substr(0, content.length - 1);
                  suffixSpace = true;
                }
                if (prefixSpace) {
                  innerOutput += " ";
                }
                if (
                  el.name === "h1" ||
                  el.name === "h2" ||
                  el.name === "h3" ||
                  el.name === "h4"
                ) {
                  content = content.replace(/\*/g, "");
                  innerOutput += "*" + content + "*";
                } else if (
                  content.charAt(0) === "*" &&
                  content.charAt(content.length - 1) === "*"
                ) {
                  innerOutput += content;
                } else {
                  innerOutput += "*" + content + "*";
                }
                if (suffixSpace) {
                  innerOutput += " ";
                }
              }
              if (i < contentArr.length - 1) {
                innerOutput += "\n";
              }
            }
            out += innerOutput;

            switch (el.name) {
              case "h1":
              case "h2":
              case "h3":
              case "h4":
                out += "\n";
                break;
            }
            break;
          case "i":
          case "em":
            content = walk(el.children);
            var contentArr = content.split("\n");
            var innerOutput = "";
            for (var i = 0; i < contentArr.length; i++) {
              content = contentArr[i];
              if (content.trim() !== "") {
                var prefixSpace = false;
                var suffixSpace = false;
                if (content && content.charAt(0) === " ") {
                  content = content.substr(1, content.length);
                  prefixSpace = true;
                }
                if (content && content.charAt(content.length - 1) === " ") {
                  content = content.substr(0, content.length - 1);
                  suffixSpace = true;
                }
                if (prefixSpace) {
                  innerOutput += " ";
                }
                innerOutput += "_" + content + "_";
                if (suffixSpace) {
                  innerOutput += " ";
                }
                out += innerOutput;
              }
              if (i < contentArr.length - 1) {
                out += "\n";
              }
            }
            break;
          case "div":
            out += walk(el.children);
            if (
              el.attribs &&
              el.attribs.class === "ghq-card-content__paragraph"
            ) {
              out += "\n";
            }
            break;
          case "p":
            out += walk(el.children) + "\n";
            break;
          case "br":
            out += walk(el.children) + "\n";
            break;
          case "ol":
          case "ul":
            var startIndex = el.attribs ? el.attribs.start : false;
            out += walkList(el.children, "ol" === el.name, nesting, startIndex);
            break;
          case "code":
            out += "`" + walk(el.children) + "`";
            break;
          case "pre":
            out += "```\n" + walkPre(el.children) + "```\n";
            break;
          case "table":
            out += walkTable(el.children);
            break;
          case "img":
            var alt = el.attribs.alt;
            out +=
              "<Inline Image" +
              (alt !== "" ? "(" + alt + ")" : "") +
              ": " +
              el.attribs.src +
              ">";
            break;
          case "blockquote":
            content = walk(el.children);
            var innerOutput = "";
            var contentArr = content.split("\n");
            contentArr.forEach((item) => {
              if (el.name === "br" || el.name === "p") {
                innerOutput += ">" + item;
              } else {
                innerOutput += ">" + item + "\n";
              }
            });
            if (innerOutput.endsWith("\n>\n")) {
              innerOutput = innerOutput.substr(0, innerOutput.length - 2);
            }
            out += innerOutput + "\n";
            break;
          default:
            out += walk(el.children);
        }
      }
    });
  return out;
}
