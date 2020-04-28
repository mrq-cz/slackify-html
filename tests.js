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

tap.test('fix h1, h2, h3, h4 with bold text', function headers(t) {
  var input = `<h1>h1 with <b>bold</b> text</h1><h2>h2 with <b>bold</b> text</h2><h3>h3 with <b>bold</b> text</h3><h4>h4 with <b>bold</b> text</h4>`;
  var expected = '*h1 with bold text*\n*h2 with bold text*\n*h3 with bold text*\n*h4 with bold text*\n';
  var output = slackify(input);
    t.equals(output, expected);
  t.end();
});

tap.test('full example', function vcheck(t) {
  var input = `<div class="ghq-markdown-content" ><h2>Security Overview Header</h2>
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
<li>def</li>
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
var expected = '*Security Overview Header*\n*We take the security of your data very seriously!*\n\n In order to instill the necessary confidence, we wanted to provide full transparency on _why_, _who_, where, when and how we protect your data.\n\n Given the sensitive nature of your content and need to maintain your privacy being a priority for us, we wanted to share the practices and policies we have put into place.\n\n<https://www.getguru.com/privacy/|Privacy Policy>\n\nRemember this list\n1. foo\n2. bar\n3. buz\n\nand this list too...\n* _abc_\n  * sub 1\n  * sub 2\n* def\n* xyz\n\n\`and this\`\n\n\`\`\`\nblah\n\`\`\`\n\n![](https://qaup.getguru.com/5240119b-9752-443a-9172-73204f8599eb/94acdc58-32c2-44d3-9843-7a2a5cb3fbf5.bc70afa3-1798-4c87-a2fe-21e3f855e35a.jpeg)\n\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Foo | Bar | Baz |\n| abc | def | ghi |';
var output = slackify(input);
  t.equals(output,
    expected);
  t.end();
});
