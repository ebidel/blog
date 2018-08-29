---
title: Making file inputs a pleasure to look at
published: 2011-12-22
---

<p>I&rsquo;ve seen a lot of people ask how to 1.) apply custom styles to a <code>&lt;input type="file"&gt;</code> and 2.) programmatically open the browser&rsquo;s file dialog with JavaScript. Turns out, the first is a cinch WebKit. The second comes with a couple of caveats.</p>

<p>If you want to skip ahead, there&rsquo;s a <a href="http://html5-demos.appspot.com/static/styled_file_input.html" target="_blank">demo</a>.</p>

<h1>Custom file inputs in WebKit</h1>

<p>The first example on that demo page shows how to style your basic file input into something great. To achieve magnificence, we start with some standard issue markup:</p>

```
<input type="file" class="button" multiple>
```

<p>followed by some semi-rowdy CSS that to hide the <code>::-webkit-file-upload-button</code> pseudo-element and create a fake button using <code>:before</code> content:</p>

```
.button::-webkit-file-upload-button {
  visibility: hidden;
}
.button:before {
  content: 'Select some files';
  display: inline-block;
  background: -webkit-linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}
.button:hover:before {
  border-color: black;
}
.button:active:before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}
```

<p>Reference: <img src="https://78.media.tumblr.com/tumblr_lwmagoBrrs1qlvegx.png" style="vertical-align:middle;" alt="i'm just a reference" title="i'm just a reference"/></p>

<p>Since this one is only available in WebKit, I&rsquo;ve left out the other vendor prefixes.</p>

<h1>Programmatically opening a file dialog</h1>

<p>No browser that I know of lets you simulate a manual click on a file input without user intervention. The reason is security. Browsers require that a user make an explicit manual click (user-initiated click) somewhere on the page. However, once that happens, it&rsquo;s straightforward to hijack the click and route it to a file input.</p>

<p>My second technique (<a href="https://twitter.com/#!/ebidel/status/26056441022382080" target="_blank">see this tweet</a>) for styling a file input works across the modern browsers. It requires a bit of extra markup but allows us to &ldquo;send&rdquo; the user&rsquo;s click to a file input.</p>

<p>The trick is to hide the <code>&lt;input type="file"&gt;</code> by setting it to <code>visibility: hidden;</code> and subbing in an extra <code>&lt;button&gt;</code> to hand the user&rsquo;s actual click:</p>

```
<style>
#fileElem {
  /* Note: display:none on the input won't trigger the click event in WebKit.
    Setting visibility: hidden and height/width:0 works great. */
  visibility: hidden;
  width: 0;
  height: 0;
}
#fileSelect {
  /* style the button any way you want */
}
&lt;/style&gt;

&lt;input type="file" id="fileElem" multiple&gt;
&lt;button id="fileSelect"&gt;Select some files&lt;/button&gt;

&lt;script&gt;
document.querySelector('#fileSelect').addEventListener('click', function(e) {
  // Use the native click() of the file input.
  document.querySelector('#fileElem').click();
}, false);
</script>
```

<p>Reference: <img src="https://78.media.tumblr.com/tumblr_lwml6yuC3P1qlvegx.png" style="vertical-align:middle;" alt="i'm just a reference" title="i'm just a reference"/></p>

<p>You&rsquo;ll be even cooler if you use custom events:</p>

```
function click(el) {
  var evt = document.createEvent('Event');
  evt.initEvent('click', true, true);
  el.dispatchEvent(evt);
}

document.querySelector('#fileSelect').onclick = function(e) {
  // Simulate the click on fileInput with a custom event.
  click(document.querySelector('#fileElem'));
};
```

<h1>Caveat</h1>

<p>Most browsers require the <code>fileInput.click()</code> to be called within 1000ms of the user-initiated click. For example, waiting 1.5s will fail because it&rsquo;s too long after the user initiates a click:</p>

```
document.querySelector('#fileSelect').onclick = function(e) {
  setTimeout(function() {
    document.querySelector('#fileElem').click(); // Will fail.
  }, 1500);
};
```

<p>The cap gives you the chance to call <code>window.open</code>, adjust UI, whatever before the file dialog opens.</p>

<p><a href="http://html5-demos.appspot.com/static/styled_file_input.html" target="_blank">Live demo</a></p>
