var tap = require('tap'),
    slackify = require('./slackify-html');

tap.test('simple', function simple(t) {
  t.equals(slackify('test'), 'test');
  t.equals(slackify('test 1'), 'test 1');
  t.end();
});

tap.test('tags', function tags(t) {
  t.equals(slackify('test <b>bold</b>'), 'test *bold*');
  t.equals(slackify('test <a href="http://example.com">example link</b>'), 'test <http://example.com|example link>');
  t.end();
});

tap.test('malformed html', function invalid(t) {
  t.equals(slackify('test <b>asd'), 'test *asd*');
  t.equals(slackify('<sad>sab tag</sad>'), 'sab tag');
  t.equals(slackify('<sad'), '');
  t.end();
});

tap.test('empty', function empty(t) {
  t.equals(slackify(''), '');
  t.end();
});

tap.test('vcheck example', function vcheck(t) {
  t.equals(slackify('<b>2.4-SNAPSHOT</b> &bull; revision <a href="https://a-team.csint.cz/stash/projects/webapi/repos/webapi/commits/a245dc97ec7bbe9ed6cb9fc1025dd846fefc7c89">a245dc9</a> &bull; build 2015-09-07 14:06 &bull; wbl 1.3.33 &bull; <a href="http://www.csast.csas.cz/at/webapi/api/v1/version">details &raquo;</a>'),
    '*2.4-SNAPSHOT* • revision <https://a-team.csint.cz/stash/projects/webapi/repos/webapi/commits/a245dc97ec7bbe9ed6cb9fc1025dd846fefc7c89|a245dc9> • build 2015-09-07 14:06 • wbl 1.3.33 • <http://www.csast.csas.cz/at/webapi/api/v1/version|details »>');
  t.end();
});

tap.test('test bold text', function boldtext(t) {
  t.equals(slackify('<b>totally bold</b>'), '*totally bold*');
  t.equals(slackify('<p><b>totally bold in paragraph</b></p>'), '*totally bold in paragraph*\n');
  t.equals(slackify('*already slackified bold*'), '*already slackified bold*');
  t.equals(slackify('*bold <b>inside</b> asterisks*'), '*bold *inside* asterisks*');
  t.equals(slackify('*asterisks *inside* asterisks*'), '*asterisks *inside* asterisks*');
  t.equals(slackify('<p>A sentence with<b> bold text </b>in between.</p>'), 'A sentence with *bold text* in between.\n');
  t.end();
});

tap.test('test bold text with headers', function boldheaders(t) {
  t.equals(slackify('<b><h1>a completely bold title</h1></b>'), '*a completely bold title*\n');
  t.equals(slackify('<h1><b>a completely bold title</b></h1>'), '*a completely bold title*\n');
  t.equals(slackify('<h1>*asterisk title*</h1>'), '*asterisk title*\n');
  t.equals(slackify('<h1>*asterisk title with *bold**</h1>'), '*asterisk title with bold*\n');
  t.equals(slackify('<h1>alternating<b> bold </b>header<b> content </b></h1>'), '*alternating bold header content* \n');
  t.equals(slackify('<h2>too many *asterisks* bold text</h2>'), '*too many asterisks bold text*\n');
  t.equals(slackify('<h3>header3 <b>bold tag continues </h3> outside</b>'), '*header3 bold tag continues* \n outside');
  t.equals(slackify('<h1>h1 with<b> bold </b>text</h1><h2>h2 with <b>bold</b> text</h2><h3>h3 with <b>bold</b> text</h3><h4>h4 with <b>bold</b> text</h4>'), '*h1 with bold text*\n*h2 with bold text*\n*h3 with bold text*\n*h4 with bold text*\n');
  t.end();
});

tap.test('test code block', function codeblock(t) {
  var input = '<pre class="ghq-card-content__code-block" data-ghq-card-content-type="CODE_BLOCK" data-ghq-code-block-syntax="JSON" data-ghq-code-block-prism="json"><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">{</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "name": "slackify-html",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "version": "1.0.0",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "description": "convert simple html to slack markdown",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "main": "slackify-html.js",</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  "scripts": {</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">    "test": "tap tests.js"</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">  }</code><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">}</code></pre>';
  var expected = '```\n{\n  "name": "slackify-html",\n  "version": "1.0.0",\n  "description": "convert simple html to slack markdown",\n  "main": "slackify-html.js",\n  "scripts": {\n    "test": "tap tests.js"\n  }\n}\n```\n';
  var output = slackify(input);
  t.equals(output,expected);
  t.end();
});

tap.test('test code block text only', function codeblocktextonly(t) {
  var input = '<pre class="ghq-card-content__code-block" data-ghq-card-content-type="CODE_BLOCK" data-ghq-code-block-syntax="Plain Text" data-ghq-code-block-prism="plain"><code class="ghq-card-content__code-block-line" data-ghq-card-content-type="CODE_BLOCK_LINE">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</code></pre>';
  var expected = '```\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n```\n';
  var output = slackify(input);
  t.equals(output,expected);
  t.end();
});

tap.test('test blockquote', function blockquote(t) {
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote text</blockquote>'), '>block quote text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <strong class="ghq-card-content__bold" data-ghq-card-content-type="BOLD">bold</strong> text</blockquote>'), '>block quote *bold* text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <em class="ghq-card-content__italic" data-ghq-card-content-type="ITALIC">italic</em> text</blockquote>'), '>block quote _italic_ text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <u class="ghq-card-content__underline" style="text-decoration:underline" data-ghq-card-content-type="UNDERLINE">underline</u> text</blockquote>'), '>block quote underline text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <del class="ghq-card-content__strikethrough" style="text-decoration:line-through" data-ghq-card-content-type="STRIKETHROUGH">strikethrough</del> text</blockquote>'), '>block quote strikethrough text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <mark class="ghq-card-content__highlight" style="background-color:#fde892" data-ghq-card-content-type="HIGHLIGHT">highlight</mark> text</blockquote>'), '>block quote highlight text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE">block quote <span class="ghq-card-content__text-color" style="color:#9013fe" data-ghq-card-content-type="TEXT_COLOR">color</span> text</blockquote>'), '>block quote color text');
  t.equals(slackify('<blockquote class="ghq-card-content__block-quote" data-ghq-card-content-type="BLOCK_QUOTE"><code class="ghq-card-content__code-snippet" data-ghq-card-content-type="CODE_SNIPPET">block quote guru code snippet</code></blockquote>'), '>`block quote guru code snippet`');
  t.end();
});

tap.test('full example', function vcheck(t) {
  var input = `<div class="ghq-markdown-content" ><h2>Security <b>Overview</b> Header</h2>
<p><strong>We take the security of your data very seriously!</strong></p>
<p>In order to instill the necessary confidence, we wanted to provide full transparency on <em>why</em>, <em>who</em>, <em>where</em>, <em>when</em> and <em>how</em> we protect your data.</p>
<p>Given the sensitive nature of your content and need to maintain your privacy being a priority for us, we wanted to share the practices and policies we have put into place.</p>
<p><a href="https://www.getguru.com/privacy/" target="_blank">Privacy Policy</a></p>
<p>Remember this list</p>
<ol>
<li>foo</li>
<li>bar</li>
<li>buz</li>
</ol>
<p>and this list too...</p>
<ul>
<li><em>abc</em>
<ul>
<li>sub 1</li>
<li>sub 2</li>
</ul>
</li>
<li><b>def</b></li>
<li>xyz</li>
</ul>
<p><code>and this</code></p>
<pre><code><span class="ghq-hljs-keyword">blah
</span></code></pre>
<p><img src="https://qaup.getguru.com/5240119b-9752-443a-9172-73204f8599eb/94acdc58-32c2-44d3-9843-7a2a5cb3fbf5.bc70afa3-1798-4c87-a2fe-21e3f855e35a.jpeg" alt=""></p>
<table>
<thead>
<tr>
<th>Column 1</th>
<th>Column 2</th>
<th>Column 3</th>
</tr>
</thead>
<tbody>
<tr>
<td>Foo</td>
<td>Bar</td>
<td>Baz</td>
</tr>
<tr>
<td>abc</td>
<td>def</td>
<td>ghi</td>
</tr>
</tbody>
</table>
</div>`;
var expected = '*Security Overview Header*\n\n*We take the security of your data very seriously!*\n\nIn order to instill the necessary confidence, we wanted to provide full transparency on _why_, _who_, _where_, _when_ and _how_ we protect your data.\n\nGiven the sensitive nature of your content and need to maintain your privacy being a priority for us, we wanted to share the practices and policies we have put into place.\n\n<https://www.getguru.com/privacy/|Privacy Policy>\n\nRemember this list\n\n1. foo\n2. bar\n3. buz\n\nand this list too...\n\n• _abc_\n  • sub 1\n  • sub 2\n\n\n• *def*\n• xyz\n\n\`and this\`\n\n\`\`\`\nblah\n\n\n\`\`\`\n\n<Inline Image: https://qaup.getguru.com/5240119b-9752-443a-9172-73204f8599eb/94acdc58-32c2-44d3-9843-7a2a5cb3fbf5.bc70afa3-1798-4c87-a2fe-21e3f855e35a.jpeg>\n\n| Column 1 | Column 2 | Column 3  |\n| -------- | -------- | --------  |\n| Foo | Bar | Baz |\n| abc | def | ghi |\n\n';
var output = slackify(input);
  t.equals(output,
    expected);
  t.end();
});
