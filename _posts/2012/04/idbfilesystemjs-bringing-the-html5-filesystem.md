---
title: idb.filesystem.js - Bringing the HTML5 Filesystem API to More Browsers
published: 2012-04-23
---

<p>The <a href="http://ericbidelman.tumblr.com/post/8165285763/my-book-is-finally-out-using-the-html5-filesystem" target="_blank">HTML5 Filesystem API</a> is a versatile API that addresses many of the uses cases that the other offline APIs don&rsquo;t. It can remedy their shortcomings, like making it difficult to  <a href="http://updates.html5rocks.com/2012/04/Taking-an-Entire-Page-Offline-using-the-HTML5-FileSystem-API" target="_blank">dynamically caching a page</a>. I&rsquo;m looking at you AppCache!</p>

<p>My ♥ for the API is deep&ndash;so much so that I wrote a <a href="http://ericbidelman.tumblr.com/post/8165285763/my-book-is-finally-out-using-the-html5-filesystem" target="_blank">book</a> and released a library called <a href="https://github.com/ebidel/filer.js" target="_blank">filer.js</a> to help promote its adoption. While filer aims to make the API more consumable, it fails to address the elephant in the room: <a href="http://caniuse.com/#search=filesystem" target="_blank">browser support</a>.</p>

<p><strong>Introducing idb.filesystem.js</strong></p>

<p>Today, I&rsquo;m happy to bring the HTML5 Filesystem API to more browsers by releasing <a href="https://github.com/ebidel/idb.filesystem.js" target="_blank"><strong>idb.filesystem.js</strong></a>.</p>

<p>idb.filesystem.js is a well <a href="https://github.com/ebidel/idb.filesystem.js/tree/master/tests" target="_blank">tested</a> JavaScript <a href="http://remysharp.com/2010/10/08/what-is-a-polyfill/" target="_blank">polyfill</a> implementation of the Filesystem API intended for browsers that lack native support. Right now that&rsquo;s everyone but Chrome. The library works by using IndexedDB as an underlying storage layer. This means any <a href="http://caniuse.com/#search=indexeddb" target="_blank">browser supporting IndexedDB</a>, now supports the Filesystem API! All you need to do is make Filesystem API calls and the rest is magic.</p>

<p><strong>Demos</strong></p>

<p>I&rsquo;ve thrown together two demo apps to demonstrate the library&rsquo;s usage. The first is a basic example. It allows you to create empty files/folders, drag files into the app from the desktop, and navigate into a folder or preview a file by clicking its name:</p>

<figure style="text-align:center"><a href="http://html5-demos.appspot.com/static/filesystem/idb.filesystem.js/demos/basic/index.html" target="_blank"><figure class="tmblr-full" data-orig-height="361" data-orig-width="712" data-orig-src="https://github.com/ebidel/idb.filesystem.js/raw/master/demos/basic/images/demo_screenshot.png"><img src="https://78.media.tumblr.com/bfc309486485f67fa756d551e0f85e75/tumblr_inline_p8nnpvA6yU1qlvegx_540.png" data-orig-height="361" data-orig-width="712" data-orig-src="https://github.com/ebidel/idb.filesystem.js/raw/master/demos/basic/images/demo_screenshot.png"/></figure></a><figcaption>Try the (<a href="http://html5-demos.appspot.com/static/filesystem/idb.filesystem.js/demos/basic/index.html" target="_blank">demo</a>) in Firefox 11+</figcaption></figure><p>Want to use filer.js&rsquo;s API with idb.filesystem.js? No problem. 90% of filer.js works out of the box with idb.filesystem.js. In fact, the <a href="http://html5-demos.appspot.com/static/filesystem/idb.filesystem.js/demos/playground/index.html" target="_blank">second demo</a> is a slightly modified version of filer.js&rsquo;s playground app, showing that the two libraries can work in harmony. \m/</p>

<p>What&rsquo;s exciting is that both of these apps work in FF, Chrome, and presumably other browsers that implement storing binary data in IndexedDB.</p>

<p>I look forward to your feedback and pull requests!</p>
