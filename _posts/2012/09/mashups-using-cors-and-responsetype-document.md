---
title: Mashups using CORS and responseType='document'
published: 2012-09-08
---

<p>I always forget that you can request a resource as a <code>Document</code> using XHR2. Combine this with <a href="http://enable-cors.org/" target="_blank">CORS</a> and things get pretty nice. No need to parse HTML strings and turn them into DOM yourself.</p>

<p>For <a href="http://www.html5rocks.com" target="_blank">html5rocks.com</a>, we support CORS on all of our content. It&rsquo;s trivial to pull down the tutorials page and query the DOM directly using  <code>querySelector()</code>/<code>querySelectorAll()</code> on the XHR&rsquo;s response.</p>

<p>Demo: <a href="http://jsbin.com/bovetayuwu" target="_blank">http://jsbin.com/bovetayuwu</a></p>

<p><a href="https://gist.github.com/3581825" target="_blank">https://gist.github.com/3581825</a></p>
