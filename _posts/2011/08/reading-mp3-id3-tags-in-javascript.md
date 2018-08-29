---
title: Reading .mp3 ID3 tags in JavaScript
published: 2011-08-01
---

<p>For a recent project, I needed to read an .mp3&rsquo;s <a href="http://en.wikipedia.org/wiki/ID3" target="_blank">ID3</a> metadata (song title, artist, year, album) in pure JS. The idea was to have the user select a song file, and boom!, its info would display to the user. Good news&hellip;totally easy with the <code>FileReader</code> API and JS typed arrays.</p>

<p>Initially, I did a quick search to find some examples, but all of the examples I found used older techniques like manipulating a binary string. Ugh! We have better tools now for working with binary data in JS. Typed arrays to the rescue, specifically <a href="https://developer.mozilla.org/en/JavaScript_typed_arrays/DataView" target="_blank"><code>DataView</code></a>.</p>

<p><code>DataView</code> is a cousin to <code>ArrayBufferView</code>, which is a &ldquo;view&rdquo; of a portion of an <code>ArrayBuffer</code>.  Array buffers represent chunks of bytes in memory. Multiple views can be created from a single <code>ArrayBuffer</code>. For example, one could create a <code>Int8Array</code> and a <code>Float32Array</code> from the same underlying data. Hence, &ldquo;views&rdquo;. This property makes them extremely versatile for binary data.</p>

<p>For my purposes, <code>DataView</code> turned out to be a perfect container for pulling sections of bytes as a string. However, I found the API to be a bit unintuitive in practice. Fortunately, I stumbled upon <a href="http://blog.vjeux.com/" target="_blank">Christopher Chedeau</a>&rsquo;s <a href="https://github.com/vjeux/jDataView" target="_blank">jDataView</a> a while back and things started making sense. jDataView is an excellent wrapper for <code>DataView</code>, improving much of its jankiness and adding a few extra utility methods for things like seeking and getting at data (e.g. <code>getString()</code>, <code>getChar()</code>).</p>

<p>Here&rsquo;s all the code that I needed:</p>

```
document.querySelector('input[type="file"]').onchange = function(e) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var dv = new jDataView(this.result);

    // "TAG" starts at byte -128 from EOF.
    // See <a href="http://en.wikipedia.org/wiki/ID3" target="_blank">http://en.wikipedia.org/wiki/ID3</a>
    if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
      var title = dv.getString(30, dv.tell());
      var artist = dv.getString(30, dv.tell());
      var album = dv.getString(30, dv.tell());
      var year = dv.getString(4, dv.tell());
    } else {
      // no ID3v1 data found.
    }
  };

  reader.readAsArrayBuffer(this.files[0]);
};
```

<p>Pretty slick.</p>

<p><code>DataView</code> is implemented in Chrome 9+ and Webkit nightlies. However, jDataView provides the <code>DataView</code> API for all the browsers using the best available option between Strings, JS typed arrays, and <code>DataView</code>.</p>
