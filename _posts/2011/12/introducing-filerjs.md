---
title: Introducing filer.js
published: 2011-12-27
---

<p>Some 1300+ lines of code, 106 <a href="https://github.com/ebidel/filer.js/tree/master/tests" target="_blank">tests</a>, and a year after I first started it, I&rsquo;m happy to officially unleash <strong><a href="https://github.com/ebidel/filer.js" target="_blank">filer.js</a></strong>; a wrapper library for the <a href="http://ericbidelman.tumblr.com/post/8165285763/my-book-is-finally-out-using-the-html5-filesystem" target="_blank">HTML5 Filesystem API</a>.</p>

<p>Unlike other libraries [<a href="https://github.com/ajaxorg/webfs" target="_blank">1</a>, <a href="http://code.google.com/p/closure-library/source/browse/trunk/closure/goog/fs/fs.js" target="_blank">2</a>], <strong>filer.js</strong> takes a different approach and incorporates some lessons I learned while implementing the <a href="http://code.google.com/p/gdata-python-client/source/browse/src/gdata/docs/client.py?r=d045d2d934e25266a02ff1e45c82fb68591e08e0" target="_blank">Google Docs Python client library</a>. Namely, the library reuses familiar UNIX commands (<code>cp</code>, <code>mv</code>, <code>rm</code>) for its API. My goal was to a.) make the HTML5 API more approachable for developers that have done file I/O in other languages, and b.) make repetitive operations (renaming, moving, duplicating) easier.</p>

<p>So, say you wanted to list the files in a given folder. There&rsquo;s an <code>ls()</code> for that:</p>

<pre><code>var filer = new Filer();
filer.init({size: 1024 * 1024}, onInit.bind(filer), onError);

function onInit(fs) {
  filer.ls('/', function(entries) {
    // entries is an Array of file/directories in the root folder.
  }, onError);
}

function onError(e) { ... }
</code></pre>

<p>A majority of <strong>filer.js</strong> calls are asynchronous. That&rsquo;s because the underlying HTML5 API is also asynchronous. However, the library is extremely versatile and tries to be your friend whenever possible. In most cases, callbacks are optional. <strong>filer.js</strong> is also good at accepting multiple types when working with entries. It accepts entries as string paths, <a href="http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-filesystemurls" target="_blank">filesystem: URLs</a>, or as the <code>FileEntry</code>/<code>DirectoryEntry</code> object.</p>

<p>For example, <code>ls()</code> is happy to take your filesystem: URL or your <code>DirectoryEntry</code>:</p>

<pre><code>// These will produce the same results.
filer.ls(filer.fs.root.toURL(), function(entries) { ... });
filer.ls(filer.fs.root, function(entries) { ... });
filer.ls('/', function(entries) { ... });
</code></pre>

<p>The library clocks in at 24kb (5.6kb compressed). I&rsquo;ve thrown together a complete <a href="http://html5-demos.appspot.com/static/filesystem/filer.js/demos/index.html" target="_blank">sample app</a> to demonstrate most of <strong>filer.js</strong>&rsquo;s functionality:</p>

<figure style="text-align:center"><a href="http://html5-demos.appspot.com/static/filesystem/filer.js/demos/index.html" target="_blank"><figure class="tmblr-full" data-orig-height="188" data-orig-width="400" data-orig-src="https://github.com/ebidel/filer.js/raw/master/demos/images/demo_screenshot.png"><img src="https://78.media.tumblr.com/40a6fcc2ed6352e8abb65ee774a1731a/tumblr_inline_p8nnpvs2du1qlvegx_540.png" data-orig-height="188" data-orig-width="400" data-orig-src="https://github.com/ebidel/filer.js/raw/master/demos/images/demo_screenshot.png"/></figure></a><figcaption>Try the (<a href="http://html5-demos.appspot.com/static/filesystem/filer.js/demos/index.html" target="_blank">DEMO</a>)</figcaption></figure><p>Lastly, there&rsquo;s room for improvement:</p>

<ol><li>Incorporate Chrome&rsquo;s <a href="http://code.google.com/chrome/whitepapers/storage.html" target="_blank">Quota Management API</a></li>
<li>Make usage in Web Workers more friendly (there is a synchronous API).</li>
</ol><p>I look forward to your feedback and pull requests!</p>
