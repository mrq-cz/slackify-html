slackify = require("./slackify-html");

describe("Slackify HTML", () => {
  it("simple", () => {
    expect(slackify("test")).toBe("test");
    expect(slackify("test 1")).toBe("test 1");
  });

  it("tags", () => {
    expect(slackify("test <b>bold</b>")).toBe("test *bold*");
    expect(slackify('test <a href="http://example.com">example link</b>')).toBe(
      "test <http://example.com|example link>"
    );
  });

  it("malformed html", () => {
    expect(slackify("test <b>asd")).toBe("test *asd*");
    expect(slackify("<sad>sab tag</sad>")).toBe("sab tag");
    expect(slackify("<sad")).toBe("");
  });

  it("empty", () => {
    expect(slackify("")).toBe("");
  });

  it("vcheck example", () => {
    expect(
      slackify(
        '<b>2.4-SNAPSHOT</b> &bull; revision <a href="https://a-team.csint.cz/stash/projects/webapi/repos/webapi/commits/a245dc97ec7bbe9ed6cb9fc1025dd846fefc7c89">a245dc9</a> &bull; build 2015-09-07 14:06 &bull; wbl 1.3.33 &bull; <a href="http://www.csast.csas.cz/at/webapi/api/v1/version">details &raquo;</a>'
      )
    ).toBe(
      "*2.4-SNAPSHOT* • revision <https://a-team.csint.cz/stash/projects/webapi/repos/webapi/commits/a245dc97ec7bbe9ed6cb9fc1025dd846fefc7c89|a245dc9> • build 2015-09-07 14:06 • wbl 1.3.33 • <http://www.csast.csas.cz/at/webapi/api/v1/version|details »>"
    );
  });

  it("test bold text", () => {
    expect(slackify("<b>totally bold</b>")).toBe("*totally bold*");
    expect(slackify("<p><b>totally bold in paragraph</b></p>")).toBe(
      "*totally bold in paragraph*\n"
    );
    expect(slackify("*already slackified bold*")).toBe(
      "*already slackified bold*"
    );
    expect(slackify("*bold <b>inside</b> asterisks*")).toBe(
      "*bold *inside* asterisks*"
    );
    expect(slackify("*asterisks *inside* asterisks*")).toBe(
      "*asterisks *inside* asterisks*"
    );
    expect(
      slackify("<p>A sentence with<b> bold text </b>in between.</p>")
    ).toBe("A sentence with *bold text* in between.\n");
  });

  it("test bold text with headers", () => {
    expect(slackify("<b><h1>a completely bold title</h1></b>")).toBe(
      "*a completely bold title*\n"
    );
    expect(slackify("<h1><b>a completely bold title</b></h1>")).toBe(
      "*a completely bold title*\n"
    );
    expect(slackify("<h1>*asterisk title*</h1>")).toBe("*asterisk title*\n");
    expect(slackify("<h1>*asterisk title with *bold**</h1>")).toBe(
      "*asterisk title with bold*\n"
    );
    expect(
      slackify("<h1>alternating<b> bold </b>header<b> content </b></h1>")
    ).toBe("*alternating bold header content* \n");
    expect(slackify("<h2>too many *asterisks* bold text</h2>")).toBe(
      "*too many asterisks bold text*\n"
    );
    expect(
      slackify("<h3>header3 <b>bold tag continues </h3> outside</b>")
    ).toBe("*header3 bold tag continues* \n outside");
    expect(
      slackify(
        "<h1>h1 with<b> bold </b>text</h1><h2>h2 with <b>bold</b> text</h2><h3>h3 with <b>bold</b> text</h3><h4>h4 with <b>bold</b> text</h4>"
      )
    ).toBe(
      "*h1 with bold text*\n*h2 with bold text*\n*h3 with bold text*\n*h4 with bold text*\n"
    );
  });

  it("test code block", () => {
    var input =
      '<pre class="ghq-card-content__code-block" data-ghq-card-content-type="CODE_BLOCK" data-ghq-code-block-syntax="JSON" data-ghq-code-block-prism="json"><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">{</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "name": "slackify-html",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "version": "1.0.0",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "description": "convert simple html to slack markdown",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "main": "slackify-html.js",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "scripts": {</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">    "test": "tap tests.js"</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  }</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">}</code></pre>';
    var expected =
      '```\n{\n  "name": "slackify-html",\n  "version": "1.0.0",\n  "description": "convert simple html to slack markdown",\n  "main": "slackify-html.js",\n  "scripts": {\n    "test": "tap tests.js"\n  }\n}\n```\n';
    var output = slackify(input);
    expect(output).toBe(expected);
  });

  it("test code block text only", () => {
    var input =
      '<pre class="ghq-card-content__code-block" data-ghq-card-content-type="CODE_BLOCK" data-ghq-code-block-syntax="Plain Text" data-ghq-code-block-prism="plain"><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</code></pre>';
    var expected =
      "```\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n```\n";
    var output = slackify(input);
    expect(output).toBe(expected);
  });

  it("test blockquote with line breaks/new lines", () => {
    expect(
      slackify("<blockquote>block quote with <br>line<br>breaks</blockquote>")
    ).toBe(">block quote with \n>line\n>breaks\n\n");
    expect(
      slackify(
        "<blockquote>block quote with embedded\n\n newlines</blockquote>"
      )
    ).toBe(">block quote with embedded\n>\n> newlines\n\n");
    expect(
      slackify(
        "<blockquote>block quote with trailing newlines\n\n</blockquote>"
      )
    ).toBe(">block quote with trailing newlines\n>\n\n");
  });

  it("test blockquote with paragraphs and line breaks/new lines", () => {
    expect(
      slackify("<blockquote><p>paragraph in blockquote</p></blockquote>")
    ).toBe(">paragraph in blockquote\n\n");
    expect(
      slackify(
        "<blockquote><p>paragraph<br>with<br>line break blockquote</p></blockquote>"
      )
    ).toBe(">paragraph\n>with\n>line break blockquote\n\n");
    expect(
      slackify(
        "<blockquote><p>paragraph block quote with embedded\n\n newlines</p></blockquote>"
      )
    ).toBe(">paragraph block quote with embedded\n>\n> newlines\n\n");
    expect(
      slackify(
        "<blockquote><p>paragraph block quote with trailing newlines\n\n</p></blockquote>"
      )
    ).toBe(">paragraph block quote with trailing newlines\n>\n>\n\n");
  });

  it("test guru blockquote", () => {
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote text</blockquote>'
      )
    ).toBe(">block quote text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">bold</strong> text</blockquote>'
      )
    ).toBe(">block quote *bold* text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <em class="ghq-card-content__italic" data-ghq-card-content-type="ITALIC">italic</em> text</blockquote>'
      )
    ).toBe(">block quote _italic_ text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <u class="ghq-card-content__underline" style="text-decoration:underline" data-ghq-card-content-type="UNDERLINE">underline</u> text</blockquote>'
      )
    ).toBe(">block quote underline text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <del class="ghq-card-content__strikethrough" style="text-decoration:line-through" data-ghq-card-content-type="STRIKETHROUGH">strikethrough</del> text</blockquote>'
      )
    ).toBe(">block quote ~strikethrough~ text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <mark class="ghq-card-content__highlight" style="background-color:#fde892" data-ghq-card-content-type="HIGHLIGHT">highlight</mark> text</blockquote>'
      )
    ).toBe(">block quote highlight text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <span class="ghq-card-content__text-color" style="color:#9013fe" data-ghq-card-content-type="TEXT_COLOR">color</span> text</blockquote>'
      )
    ).toBe(">block quote color text\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <a href="https://google.com" target="_blank" rel="noopener noreferrer" class="ghq-card-content__link" data-ghq-card-content-type="LINK">link</a></blockquote>'
      )
    ).toBe(">block quote <https://google.com|link>\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <a target="_blank" rel="noopener noreferrer" class="ghq-card-content__file" data-ghq-card-content-type="FILE">file</a></blockquote>'
      )
    ).toBe(">block quote file\n\n");
    expect(
      slackify(
        '<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE"><code class="ghq-card-content__code-snippet" data-ghq-card-content-type="CODE_SNIPPET">block quote guru code snippet</code></blockquote>'
      )
    ).toBe(">`block quote guru code snippet`\n\n");
  });

  it("full example", () => {
    var input = `<h2 class=\"ghq-card-content__medium-heading\" data-ghq-card-content-type=\"MEDIUM_HEADING\">Security <strong class=\"ghq-card-content__bold\" data-ghq-card-content-type=\"BOLD\">Overview</strong> Header</h2><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\"><strong class=\"ghq-card-content__bold\" data-ghq-card-content-type=\"BOLD\">We take the security of your data very seriously!</strong></p><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">In order to instill the necessary confidence, we wanted to provide full transparency on <em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">why</em>, <em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">who</em>, <em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">where</em>, <em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">when</em> and <em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">how</em> we protect your data.</p><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">Given the sensitive nature of your content and need to maintain your privacy being a priority for us, we wanted to share the practices and policies we have put into place.</p><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\"><a href=\"https://www.getguru.com/privacy/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"ghq-card-content__link\" data-ghq-card-content-type=\"LINK\">Privacy Policy</a></p><blockquote class=\"ghq-card-content__block-quote\" data-ghq-card-content-type=\"BLOCK_QUOTE\">Here's a test blockquote<strong class=\"ghq-card-content__bold\" data-ghq-card-content-type=\"BOLD\"> with bolded</strong> information</blockquote><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">Remember this list</p><ol start=\"1\" class=\"ghq-card-content__numbered-list\" data-ghq-card-content-type=\"NUMBERED_LIST\"><li class=\"ghq-card-content__numbered-list-item\" data-ghq-card-content-type=\"NUMBERED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">foo</p></li><li class=\"ghq-card-content__numbered-list-item\" data-ghq-card-content-type=\"NUMBERED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">bar</p></li><li class=\"ghq-card-content__numbered-list-item\" data-ghq-card-content-type=\"NUMBERED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">buz</p></li></ol><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">and this list too..</p><ul class=\"ghq-card-content__bulleted-list\" data-ghq-card-content-type=\"BULLETED_LIST\"><li class=\"ghq-card-content__bulleted-list-item\" data-ghq-card-content-type=\"BULLETED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\"><em class=\"ghq-card-content__italic\" data-ghq-card-content-type=\"ITALIC\">abc</em></p><ul class=\"ghq-card-content__bulleted-list\" data-ghq-card-content-type=\"BULLETED_LIST\"><li class=\"ghq-card-content__bulleted-list-item\" data-ghq-card-content-type=\"BULLETED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">sub1</p></li><li class=\"ghq-card-content__bulleted-list-item\" data-ghq-card-content-type=\"BULLETED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">sub2</p></li></ul></li><li class=\"ghq-card-content__bulleted-list-item\" data-ghq-card-content-type=\"BULLETED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\"><strong class=\"ghq-card-content__bold\" data-ghq-card-content-type=\"BOLD\">def</strong></p></li><li class=\"ghq-card-content__bulleted-list-item\" data-ghq-card-content-type=\"BULLETED_LIST_ITEM\"><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\">xyz</p></li></ul><p class=\"ghq-card-content__paragraph\" data-ghq-card-content-type=\"paragraph\"><code class=\"ghq-card-content__code-snippet\" data-ghq-card-content-type=\"CODE_SNIPPET\">and this</code></p><pre class=\"ghq-card-content__code-block\" data-ghq-card-content-type=\"CODE_BLOCK\" data-ghq-code-block-syntax=\"Plain Text\" data-ghq-code-block-prism=\"plain\"><code class=\"ghq-card-content__code-block-line\" data-ghq-card-content-type=\"CODE_BLOCK_LINE\">blah</code></pre><div class=\"ghq-card-content__table-responsive-wrapper\"><div class=\"ghq-card-content__table-scroller\"><table class=\"ghq-card-content__table\" data-ghq-card-content-type=\"TABLE\" data-ghq-card-content-is-full-width=\"false\" data-ghq-table-header=\"false\" data-ghq-table-column-widths=\"227,227,227\"><colgroup><col style=\"width:227px\"><col style=\"width:227px\"><col style=\"width:227px\"></colgroup><tbody class=\"ghq-card-content__table-body\"><tr class=\"ghq-card-content__table-row\" data-ghq-card-content-type=\"TABLE_ROW\"><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Column 1</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Column 2</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Column 3</td></tr><tr class=\"ghq-card-content__table-row\" data-ghq-card-content-type=\"TABLE_ROW\"><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Foo</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Bar</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">Baz</td></tr><tr class=\"ghq-card-content__table-row\" data-ghq-card-content-type=\"TABLE_ROW\"><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">abc</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">def</td><td class=\"ghq-card-content__table-cell\" data-ghq-card-content-type=\"TABLE_CELL\">ghi</td></tr></tbody></table></div></div>`;
    var expected =
      "*Security Overview Header*\n*We take the security of your data very seriously!*\nIn order to instill the necessary confidence, we wanted to provide full transparency on _why_, _who_, _where_, _when_ and _how_ we protect your data.\nGiven the sensitive nature of your content and need to maintain your privacy being a priority for us, we wanted to share the practices and policies we have put into place.\n<https://www.getguru.com/privacy/|Privacy Policy>\n>Here's a test blockquote *with bolded* information\n\nRemember this list\n1. foo\n\n2. bar\n\n3. buz\n\nand this list too..\n• _abc_ \n  • sub1\n\n  • sub2\n\n\n• *def* \n\n• xyz\n\n`and this`\n```\nblah\n```\n| Column 1 | Column 2 | Column 3 |\n| Foo | Bar | Baz |\n| abc | def | ghi |\n";
    var output = slackify(input);
    expect(output).toBe(expected);
  });

  it("tables with paragraph", () => {
    var input =
      '<table class="ghq-card-content__table" data-ghq-card-content-type="TABLE" data-ghq-card-content-is-full-width="false" data-ghq-table-header="false" data-ghq-table-column-widths="160,160,160"><colgroup><col style="width:550px"><col style="width:160px"><col style="width:160px"></colgroup><tbody class="ghq-card-content__table-body"><tr class="ghq-card-content__table-row" data-ghq-card-content-type="TABLE_ROW"><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">one</p></td><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">dwqtwo</p></td><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">three</p></td></tr><tr class="ghq-card-content__table-row" data-ghq-card-content-type="TABLE_ROW"><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">dwqdwq</p></td><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">dwqdwqdwq</p></td><td class="ghq-card-content__table-cell" data-ghq-card-content-type="TABLE_CELL"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">dwqdwqdwqdwq</p></td></tr></tbody></table>';
    var expected = `| one  | dwqtwo  | three  |
| dwqdwq  | dwqdwqdwq  | dwqdwqdwqdwq  |\n`;

    var output = slackify(input);
    expect(output).toBe(expected);
  });

  it("handles strikethroughs", () => {
    var input =
      '<del class="ghq-card-content__strikethrough" data-ghq-card-content-type="STRIKETHROUGH" style="text-decoration:line-through">strikethrough</del>';
    const expected = "~strikethrough~";

    const output = slackify(input);
    expect(output).toBe(expected);
  });
  
  it("handles bold & link", () => {
    const input =
      '<strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">Work Intake (Request Forms)<br></strong><br><a class="ghq-card-content__link" data-ghq-card-content-type="LINK" href="https://wrike.wistia.com/medias/icpvdlvxa5" target="_blank" rel="noopener noreferrer"><u class="ghq-card-content__underline" data-ghq-card-content-type="UNDERLINE" style="text-decoration:underline">https://wrike.wistia.com/medias/icpvdlvxa5</u></a>';
    const expected = "*Work Intake (Request Forms)*\n\n<https://wrike.wistia.com/medias/icpvdlvxa5|https://wrike.wistia.com/medias/icpvdlvxa5>";

    const output = slackify(input);
    expect(output).toBe(expected);
  });

  it("handle links with hidden br & strip", () => {
    const input =
      '<strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">Work Intake (ad-hoc)</strong><a class="ghq-card-content__link" data-ghq-card-content-type="LINK" href="https://wrike.wistia.com/medias/q97lz2gze7" target="_blank" rel="noopener noreferrer"><br><u class="ghq-card-content__underline" data-ghq-card-content-type="UNDERLINE" style="text-decoration:underline">https://wrike.wistia.com/medias/q97lz2gze7</u></a>';
    const expected = "*Work Intake (ad-hoc)*<https://wrike.wistia.com/medias/q97lz2gze7|https://wrike.wistia.com/medias/q97lz2gze7>";

    const output = slackify(input);
    expect(output).toBe(expected);
  });

  describe("UL and OL", () => {
    describe("Old editor HTML", () => {
      it("should handle non-nested <ul> tags appropriately", () => {
        const input =
          '<ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">1</p></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">2</p></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">3</p></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">4</p></li></ul>';

        const expected = `• 1\n\n• 2\n\n• 3\n\n• 4\n\n`;
        expect(slackify(input)).toBe(expected);
      });
      it("should handle nested <ul> tags appropriately", () => {
        const input =
          '<ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">1st level</p><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">2nd level</p><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">3rd level</p><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">4th level</p></li></ul></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">3rd level back</p></li></ul></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">2nd level back</p></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">2nd level back again</p></li></ul></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><p class="ghq-card-content__paragraph" data-ghq-card-content-type="paragraph">1st level back</p></li></ul>';

        const expected = `• 1st level\n  • 2nd level\n    • 3rd level\n      • 4th level\n\n\n    • 3rd level back\n\n\n  • 2nd level back\n\n  • 2nd level back again\n\n\n• 1st level back\n\n`;
        expect(slackify(input)).toBe(expected);
      });
      it("should handle non-nested <ol> tags appropriately", () => {
        const input =
          '<ol class="ghq-card-content__numbered-list" data-ghq-card-content-type="NUMBERED_LIST" start="1"><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">test 1</li><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">test 2</li><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">test 3</li></ol><p class="ghq-card-content__paragraph ghq-is-empty" data-ghq-card-content-type="paragraph"></p>';
        const expected = "1. test 1\n2. test 2\n3. test 3\n\n";
        expect(slackify(input)).toBe(expected);
      });
    });

    describe("New editor HTML", () => {
      it("should handle non-nested <ul> tags appropriately", () => {
        const input =
          '<ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">1 bullet</li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">2 bullet</li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">3 bullet</li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">4 bullet</li></ul><p class="ghq-card-content__paragraph ghq-is-empty" data-ghq-card-content-type="paragraph"></p>';
        const expected = "• 1 bullet\n• 2 bullet\n• 3 bullet\n• 4 bullet\n\n";

        expect(slackify(input)).toBe(expected);
      });
      it("should handle nested <ul> tags appropriately", () => {
        const input =
          '<ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">1st level</li><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">2nd level</li><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">3rd level</li><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">4th level</li></ul><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">3rd level back</li></ul><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">2nd level back</li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">2nd level back again</li></ul></ul><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">1st level back</li></ul><p class="ghq-card-content__paragraph ghq-is-empty" data-ghq-card-content-type="paragraph"></p>';

        const expected = `• 1st level\n  • 2nd level\n    • 3rd level\n      • 4th level\n    • 3rd level back\n  • 2nd level back\n  • 2nd level back again\n• 1st level back\n\n`;

        expect(slackify(input)).toBe(expected);
      });
      it("should handle non-nested <ol> tags appropriately", () => {
        const input =
          '<ol class="ghq-card-content__numbered-list" data-ghq-card-content-type="NUMBERED_LIST" start="1"><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">1st item</li><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">2nd item</li><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">3rd item</li><li class="ghq-card-content__numbered-list-item" data-ghq-card-content-type="NUMBERED_LIST_ITEM">4th item</li></ol><p class="ghq-card-content__paragraph ghq-is-empty" data-ghq-card-content-type="paragraph"></p>';

        const expected =
          "1. 1st item\n2. 2nd item\n3. 3rd item\n4. 4th item\n\n";

        expect(slackify(input)).toBe(expected);
      });
      it("should handle various different types of markdown formatting within the list content", () => {
        const input =
          '<ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM">regular <code class="ghq-card-content__code-snippet" data-ghq-card-content-type="CODE_SNIPPET">codeblock</code> <strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">bold</strong> <em class="ghq-card-content__italic" data-ghq-card-content-type="ITALIC">italicized</em> <a class="ghq-card-content__link" data-ghq-card-content-type="LINK" href="https://github.com/guruhq/guru-ui/pull/7319/files" target="_blank" rel="noopener noreferrer">hyperlink</a> <del class="ghq-card-content__strikethrough" data-ghq-card-content-type="STRIKETHROUGH" style="text-decoration:line-through">strikethrough</del></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><del class="ghq-card-content__strikethrough" data-ghq-card-content-type="STRIKETHROUGH" style="text-decoration:line-through">strikethrough</del></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><em class="ghq-card-content__italic" data-ghq-card-content-type="ITALIC">ITALICIZED TEXT</em></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">BOLDED TEXT</strong> </li></ul><ul class="ghq-card-content__bulleted-list" data-ghq-card-content-type="BULLETED_LIST"><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD"><em class="ghq-card-content__italic" data-ghq-card-content-type="ITALIC"><code class="ghq-card-content__code-snippet" data-ghq-card-content-type="CODE_SNIPPET">EVERYTHING</code></em></strong></li><li class="ghq-card-content__bulleted-list-item" data-ghq-card-content-type="BULLETED_LIST_ITEM"><a class="ghq-card-content__link" data-ghq-card-content-type="LINK" href="http://google.com" target="_blank" rel="noopener noreferrer">HYPERLINK</a></li></ul><p class="ghq-card-content__paragraph ghq-is-empty" data-ghq-card-content-type="paragraph"></p>';

        const expected =
          "• regular `codeblock` *bold* _italicized_ <https://github.com/guruhq/guru-ui/pull/7319/files|hyperlink> ~strikethrough~ \n• ~strikethrough~ \n• _ITALICIZED TEXT_ \n• *BOLDED TEXT* \n• *_`EVERYTHING`_ *  \n• <http://google.com|HYPERLINK> \n\n";

        expect(slackify(input)).toBe(expected);
      });
    });
  });
});
