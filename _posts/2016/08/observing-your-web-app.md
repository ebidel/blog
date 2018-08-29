---
title: Observing your web app
published: 2016-08-16
---

<p>TL;DR: a dozen+ examples of monitoring changes in a web application.</p>

<hr><p>The web has lots of APIs for knowing what&rsquo;s going on in your app. You can monitor mucho stuff and observe just about any type of change.</p>

<p>Changes range from simple things like DOM mutations and catching client-side errors to more complex notifications like knowing when the user&rsquo;s battery is about to run out. The thing that remains constant are the ways to deal with them: callbacks, promises, events.</p>

<p>Below are some of use cases that I came up with. By no means is the list exhaustive. They&rsquo;re mostly examples for observing the structure of an app, its state, and the properties of the device it&rsquo;s running on.</p>

<p>Listen for <strong>DOM events</strong> (both native and custom):</p>

<pre><code>window.addEventListener('scroll', e =&gt; { ... });   // user scrolls the page.

el.addEventListener('focus', e =&gt; { ... });        // el is focused.
img.addEventListener('load', e =&gt; { ... });        // img is done loading.
input.addEventListener('input', e =&gt; { ... });     // user types into input.

el.addEventListener('custom-event', e =&gt; { ... }); // catch custom event fired on el.
</code></pre>

<p>Listen for <strong>modifications to the DOM</strong>:</p>

<pre><code>const observer = new MutationObserver(mutations =&gt; { ... });
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true
});
</code></pre>

<p>Know when the <strong>URL</strong> changes:</p>

<pre><code>window.onhashchange = e =&gt; console.log(location.hash);
window.onpopstate = e =&gt; console.log(document.location, e.state);
</code></pre>

<p>Know when the <strong>app is being viewed fullscreen</strong>:</p>

<pre><code>document.addEventListener('fullscreenchange', e =&gt; console.log(document.fullscreenElement));
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API" target="_blank">Read more</a></p>

<p>Know when someone is sending you a <strong>message</strong>:</p>

<pre><code>// Cross-domain / window /worker.
window.onmessage = e =&gt; { ... };

// WebRTC.
const dc = (new RTCPeerConnection()).createDataChannel();
dc.onmessage = e =&gt; { ... };
</code></pre>

<p>Know about <strong>client-side errors</strong>:</p>

<pre><code>// Client-size error?
window.onerror = (msg, src, lineno, colno, error) =&gt; { ... };

// Unhandled rejected Promise?
window.onunhandledrejection = e =&gt; console.log(e.reason);
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror" target="_blank">Read more</a></p>

<p>Listen for changes to <strong>responsiveness</strong>:</p>

<pre><code>const media = window.matchMedia('(orientation: portrait)');
media.addListener(mql =&gt; console.log(mql.matches));

// Orientation of device changes.
window.addEventListener('orientationchange', e =&gt; {
  console.log(screen.orientation.angle)
});
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/Events/orientationchange" target="_blank">Read more</a></p>

<p>Listen for changes to <strong>network connectivity</strong>:</p>

<pre><code>// Online/offline events.
window.addEventListener('online', e =&gt; console.assert(navigator.onLine));
window.addEventListener('offline', e =&gt; console.assert(!navigator.onLine));

// Network Information API
navigator.connection.addEventListener('change', e =&gt; {
  console.log(navigator.connection.type,
              navigator.connection.downlinkMax);
});
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API" target="_blank">Read more</a></p>

<p>Listen for changes to the device <strong>battery</strong>:</p>

<pre><code>navigator.getBattery().then(battery =&gt; {
  battery.addEventListener('chargingchange', e =&gt; console.log(battery.charging));
  battery.addEventListener('levelchange', e =&gt; console.log(battery.level));
  battery.addEventListener('chargingtimechange', e =&gt; console.log(battery.chargingTime));
  battery.addEventListener('dischargingtimechange', e =&gt; console.log(battery.dischargingTime));
});
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API" target="_blank">Read more</a></p>

<p>Know when the <strong>tab/page is visible</strong> or in focus:</p>

<pre><code>document.addEventListener('visibilitychange', e =&gt; console.log(document.hidden));
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API" target="_blank">Read more</a></p>

<p>Know when the <strong>user&rsquo;s position</strong> changes:</p>

<pre><code>navigator.geolocation.watchPosition(pos =&gt; console.log(pos.coords))
</code></pre>

<p>Know when the <strong>permission of an API</strong> changes:</p>

<pre><code>const q = navigator.permissions.query({name: 'geolocation'})
q.then(permission =&gt; {
  permission.addEventListener('change', e =&gt; console.log(e.target.state));
});
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API" target="_blank">Read more</a></p>

<p>Know when another <strong>tab updates <code>localStorage</code>/<code>sessionStorage</code></strong>:</p>

<pre><code>window.addEventListener('storage', e =&gt; alert(e))
</code></pre>

<p>Know when an <strong>element enters/leaves the viewport</strong> (e.g. &ldquo;Is this element visible?&rdquo;):</p>

<pre><code>const observer = new IntersectionObserver(changes =&gt; { ... }, {threshold: [0.25]});
observer.observe(document.querySelector('#watchMe'));
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API" target="_blank">Read more</a></p>

<p>Know when an <strong>element changes size</strong>:</p>

<pre><code>const observer = new ResizeObserver(entries =&gt; {
  for (let entry of entries) {
    const cr = entry.contentRect;
    console.log('Element:', entry.target);
    console.log(`Element size: ${cr.width}px x ${cr.height}px`);
    console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
  }
});
observer.observe(document.querySelector('#watchMe'));
</code></pre>

<p><a href="https://developers.google.com/web/updates/2016/10/resizeobserver" target="_blank">Read more</a></p>

<p>Know when the <strong>browser is idle</strong> (to perform extra work):</p>

<pre><code>requestIdleCallback(deadline =&gt; { ... }, {timeout: 2000});
</code></pre>

<p><a href="https://developers.google.com/web/updates/2015/08/using-requestidlecallback?hl=en" target="_blank">Read more</a></p>

<p>Know when the browser fetches a resource, or a <a href="https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API" target="_blank">User Timing</a> event is recorded/measured:</p>

<pre><code>const observer = new PerformanceObserver(list =&gt; console.log(list.getEntries()));
observer.observe({entryTypes: ['resource', 'mark', 'measure']});
</code></pre>

<p><a href="https://developers.google.com/web/updates/2016/06/performance-observer?hl=en" target="_blank">Read more</a></p>

<p>Know when <strong>properties of an object</strong> change (including DOM properties):</p>

<pre><code>// Observe changes to a DOM node's .textContent.
// From <a href="https://gist.github.com/ebidel/d923001dd7244dbd3fe0d5116050d227" target="_blank">https://gist.github.com/ebidel/d923001dd7244dbd3fe0d5116050d227</a>
const proxy = new Proxy(document.querySelector('#target'), {
  set(target, propKey, value, receiver) {
    if (propKey === 'textContent') {
      console.log('textContent changed to: ' + value);
    }
    target[propKey] = value;
  }
});
proxy.textContent = 'Updated content!';
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy" target="_blank">Read more</a></p>

<p>If you&rsquo;re building <strong><a href="https://developers.google.com/web/fundamentals/primers/customelements" target="_blank">custom elements</a></strong> (web components), there are several methods, called reactions, that you can define to observe important things in the element&rsquo;s lifecycle:</p>

<pre><code>class AppDrawer extends HTMLElement {
  constructor() {
    super(); // always need to call super() first in the ctor.
    // Instance of the element is instantiated.
  }
  connectedCallback() {
    // Called every time the element is inserted into the DOM.
  }
  disconnectedCallback() {
    // Called every time the element is removed from the DOM.
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    // An attribute was added, removed, updated, or replaced.
  }
  adoptedCallback() {
    // Called when the element is moved into a new document.
  }
}
window.customElements.define('app-drawer', AppDrawer);
</code></pre>

<p><a href="https://developers.google.com/web/fundamentals/primers/customelements/?hl=en#reactions" target="_blank">Read more</a></p>

<p>Know when a CSP policy has been violated:</p>

<pre><code>document.addEventListener('securitypolicyviolation', e =&gt; {
  console.error('CSP error:',
      `Violated '${e.violatedDirective}' directive with policy '${e.originalPolicy}'`);
});
</code></pre>

<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/SecurityPolicyViolationEvent" target="_blank">Read more</a></p>

<p>Know when your sites uses a deprecated API, hits a browser intervention ,or feature policy violation:</p>

<pre><code>const observer = new ReportingObserver((reports, observer) =&gt; {
  reports.map(report =&gt; {
    console.log(report);
    // ... send report to backend ...
  });
}, {buffered: true});

observer.observe();
</code></pre>

<p><a href="https://www.chromestatus.com/feature/4691191559880704" target="_blank">Read more</a></p>

<p>Wowza! What&rsquo;s crazy is that there are even <a href="https://www.chromestatus.com/features/5705346022637568" target="_blank">more</a>   <a href="https://www.chromestatus.com/features/5558926443544576" target="_blank">APIs</a> in <a href="https://www.chromestatus.com/features/5768542523752448" target="_blank">the</a> <a href="https://www.chromestatus.com/features/5662847321243648" target="_blank">works</a>.</p>

<p>I suppose you could classify some of these examples as techniques or patterns (e.g. reacting to DOM events). However, many are completely new APIs designed for a specific purpose: measuring performance, knowing battery status, online/offline connectivity, etc.</p>

<p>Honestly, it&rsquo;s really impressive how much we have access to these days. There&rsquo;s basically an API for everything.</p>

<hr><p>Mistake? Something missing? Leave a comment.</p>

<p><strong>Update 2016-08-17</strong> - added custom element reaction example</p>

<p><strong>Update 2018-07-23</strong> - added ResizeObserver</p>

<p><strong>Update 2018-07-25</strong> - added CSP <code>securitypolicyviolation</code> example</p>
