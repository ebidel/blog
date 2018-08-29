---
title: Creating .webm video from getUserMedia()
published: 2012-09-13
---

<p>There&rsquo;s a ton of motivation for being able to record live video. One scenario: you&rsquo;re capturing video from the webcam. You add some post-production touchups in your favorite online video editing suite. You upload the final product to YouTube and share it out to friends. Stardom proceeds.</p>

<p><a href="http://dev.w3.org/2011/webrtc/editor/webrtc-20111004.html#mediastreamrecorder" target="_blank"><code>MediaStreamRecorder</code></a> is a WebRTC API for recording <code>getUserMedia()</code> streams (<a href="http://www.htmlfivecan.com/#58" target="_blank">example code</a>). It allows web apps to create a file from a live audio/video session.</p>

<p><strong><code>MediaStreamRecorder</code> is <a href="http://crbug.com/113676" target="_blank">currently unimplemented</a> in the Chrome</strong>. However, all is not lost thanks to <a href="https://github.com/antimatter15/whammy" target="_blank">Whammy.js</a>. Whammy is a library that encodes .webm video from a list of .webp images, each represented as dataURLs.</p>

<p>As a proof of concept, I&rsquo;ve created a demo that captures live video from the webcam and creates a .webm file from it.</p>

<p style="text-align:center;">
<a href="https://html5-demos.appspot.com/static/getusermedia/record-user-webm.html" target="_blank">LAUNCH DEMO</a>
</p>

<p>The demo also uses <a href="http://updates.html5rocks.com/2011/08/Downloading-resources-in-HTML5-a-download" target="_blank">a[download]</a> to let users download their file.</p>

<h3>Creating webp images from <code>&lt;canvas&gt;</code></h3>

<p>The first step is to feed <code>getUserMedia()</code> data into a <code>&lt;video&gt;</code> element:</p>

<pre><code>var video = document.querySelector('video');
video.autoplay = true; // Make sure we're not frozen!

// Note: not using vendor prefixes!
navigator.getUserMedia({video: true}, function(stream) {
  video.src = window.URL.createObjectURL(stream);
}, function(e) {
  console.error(e);
});
</code></pre>

<p>Next, draw an individual video frame into a <code>&lt;canvas&gt;</code>:</p>

<pre><code>var canvas = document.querySelector('canvas');
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
</code></pre>

<p>Chrome supports <code>canvas.toDataURL("image/webp")</code>. This allows us to read back the <code>&lt;canvas&gt;</code> as a .webp image and encode is as a dataURL, all in one swoop:</p>

<pre><code>var url = canvas.toDataURL('image/webp', 1); // Second param is quality.
</code></pre>

<p>Since this only gives us an single frame, we need to repeat the draw/read pattern using a <code>requestAnimationFrame()</code> loop. That&rsquo;ll give us webp frames at 60fps:</p>

<pre><code>var rafId;
var frames = [];
var CANVAS_WIDTH = canvas.width;
var CANVAS_HEIGHT = canvas.height;

function drawVideoFrame(time) {
  rafId = requestAnimationFrame(drawVideoFrame);
  ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  frames.push(canvas.toDataURL('image/webp', 1));
};

rafId = requestAnimationFrame(drawVideoFrame); // Note: not using vendor prefixes!
</code></pre>

<p>\m/</p>

<p>The last step is to bring in Whammy. The library includes a static method <code>fromImageArray()</code> that creates a <code>Blob</code> (file) from an array of dataURLs. Perfect! That&rsquo;s just what we have.</p>

<p>Let&rsquo;s package all of this goodness up in a <code>stop()</code> method:</p>

<pre><code>function stop() {
  cancelAnimationFrame(rafId);  // Note: not using vendor prefixes!

  // 2nd param: framerate for the video file.
  var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);

  var video = document.createElement('video');
  video.src = window.URL.createObjectURL(webmBlob);

  document.body.appendChild(video);
}
</code></pre>

<p>When <code>stop()</code> is called, the <code>requestAnimationFrame()</code> recursion is terminated and the .webm file is created.</p>

<h3>Performance and Web Workers</h3>

<p>Encoding webp images using <code>canvas.toDataURL('image/webp')</code> takes ~120ms on my MBP. When you do something crazy like this in <code>requestAnimationFrame()</code> callback, the framerate of the live <code>getUserMedia()</code> video stream noticeably drops. It&rsquo;s too much for the UI thread to handle.</p>

<p><strong>Having the browser encode webp in C++ is far faster than encoding the .webp image in JS</strong>.</p>

<p>My tests using  <a href="http://libwebpjs.hohenlimburg.org/" target="_blank">libwebpjs</a> in a Web Worker were horrendously slow. The idea was to each frame as a <code>Uint8ClampedArray</code> (raw pixel arrays), save them in an array, and <code>postMessage()</code> that data to the Worker. The worker was responsible for encoding each pixel array into webp. The whole process took up to 20+ seconds to encode a single second&rsquo;s worth of video. Not worth it.</p>

<p><strong>It&rsquo;s too bad <code>CanvasRenderingContext2D</code> doesn&rsquo;t exist in the Web Worker context</strong>. That would solved a lot of the perf issues.</p>
