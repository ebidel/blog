---
title: 'Web Audio API how-to: Playing audio based on user interaction'
published: 2011-11-28
---

<p>One thing the <a href="http://www.html5rocks.com/tutorials/webaudio/intro/" target="_blank">Web Audio API</a> does particularly well is play sound. Of course, this is something you&rsquo;d expect from an audio API :). That said, the API is complex and it&rsquo;s not immediately obvious on the best way to do something simple like load a sound file and play it based on a button click. That task alone can involve a number of new platform features likes XHR2, <code>FileReader</code> API, and <code>ArrayBuffer</code>s.</p>

<p>So&hellip;I threw together a quick example on how to load a audio file and play/stop it based on the user clicking a button:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;!-- Author: Eric Bidelman (ericbidelman@chromium.org) --&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;meta charset="utf-8" /&gt;
  &lt;meta http-equiv="X-UA-Compatible" content="chrome=1" /&gt;
  &lt;title&gt;Web Audio API: Simple load + play&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;p&gt;Example of using the Web Audio API to load a sound file
  and start playing on user-click.&lt;/p&gt;
  &lt;input type="file" accept="audio/*"&gt;
  &lt;button onclick="playSound()" disabled&gt;Start&lt;/button&gt;
  &lt;button onclick="stopSound()" disabled&gt;Stop&lt;/button&gt;
&lt;script&gt;
var context = new window.webkitAudioContext();
var source = null;
var audioBuffer = null;

function stopSound() {
  if (source) {
    source.noteOff(0);
  }
}

function playSound() {
  // source is global so we can call .noteOff() later.
  source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = false;
  source.connect(context.destination);
  source.noteOn(0); // Play immediately.
}

function initSound(arrayBuffer) {
  context.decodeAudioData(arrayBuffer, function(buffer) {
    // audioBuffer is global to reuse the decoded audio later.
    audioBuffer = buffer;
    var buttons = document.querySelectorAll('button');
    buttons[0].disabled = false;
    buttons[1].disabled = false;
  }, function(e) {
    console.log('Error decoding file', e);
  });
}

// User selects file, read it as an ArrayBuffer and pass to the API.
var fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', function(e) {
  var reader = new FileReader();
  reader.onload = function(e) {
    initSound(this.result);
  };
  reader.readAsArrayBuffer(this.files[0]);
}, false);

// Load file from a URL as an ArrayBuffer.
// Example: loading via xhr2: loadSoundFile('sounds/test.mp3');
function loadSoundFile(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    initSound(this.response); // this.response is an ArrayBuffer.
  };
  xhr.send();
}
&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</code></pre>

<p><a href="http://html5-demos.appspot.com/static/webaudio/load_and_play.html" target="_blank">Demo</a></p>

<p>As you can see, this example includes two different ways to get an audio file into the Web Audio API: via an <code>&lt;input type="file"&gt;</code> and an <code>XMLHttpRequest</code>. Both methods call <code>initSound()</code>, which is passed an <code>ArrayBuffer</code> containing the audio file. That method then decodes the audio and stores the result in a global variable (so it can be reused as play/stop are pressed).</p>

<p>That&rsquo;s it! Straightforward once you see it, right!?</p>
