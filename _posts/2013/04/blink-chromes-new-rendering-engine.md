---
title: Blink. Chrome's new rendering engine
published: 2013-04-03
---

<p>Chrome is departing WebKit as its rendering engine. This is <a href="http://blog.chromium.org/2013/04/blink-rendering-engine-for-chromium.html" target="_blank">big news</a> for web developers, so I thought I&rsquo;d write up my personal take on the matter. Please realize these are my own thoughts and not those of Google.</p>

<p>The new engine is called <a href="http://www.chromium.org/blink" target="_blank">Blink</a>. It&rsquo;s open source and based WebKit.</p>

<h2>&ldquo;You&rsquo;re kidding, right!?&rdquo;</h2>

<p>That was my reaction when I first heard the news. It was quickly followed by: &ldquo;Won&rsquo;t this segment the web even further?&rdquo; and &ldquo;Great. An additional rendering engine I have to test.&rdquo; Being a web developer, I feel your pain.</p>

<p>Honestly, I was extremely skeptical about the decision at first.  After several conversations with various members of the web platform team here at Google, I was slowly convinced it might not be such a terrible idea after all. In fact, I&rsquo;m now convinced it&rsquo;s a good idea for the long term health and innovation of browsers.</p>

<h2>Reflecting on Chrome&rsquo;s mission</h2>

<p>Many of you will be in the same skeptic boat I was. But I think it&rsquo;s worth remembering the continuing goals of the Chromium project.</p>

<p>From day one the Chrome team&rsquo;s mission has been to build the best browser possible. Speed, security, and simplicity are in its blood. Over the last four years, I have gained a deep respect for our engineering team. They&rsquo;re some of the most brilliant engineers in the world. If their consensus is that <strong>Chrome cannot be the best browser it can be with WebKit at its core</strong>, I fully trust and support that decision. After all, these folks know how to build browsers. If you think about it some more things start to make sense. The architecture of today&rsquo;s web browser is dramatically different than it was back in 2001 (when WebKit was designed).</p>

<p>The irony in all of this is that we were soon destined to have three render engines with <a href="http://my.opera.com/ODIN/blog/300-million-users-and-move-to-webkit" target="_blank">Opera&rsquo;s impending move to WebKit</a>. Even today, Mozilla/Samsung <a href="https://blog.mozilla.org/blog/2013/04/03/mozilla-and-samsung-collaborate-on-next-generation-web-browser-engine/" target="_blank">announced</a> their work on a new engine, called Servo. So, we were at three engines. Now we have 4+. Interesting times indeed.</p>

<h2>Things we can all look forward to</h2>

<p>Ultimately, Chrome is engineering driven project and I&rsquo;m personally excited about the potential this change offers. Here are a few:</p>

<h3>Improved performance &amp; security</h3>

<p>Many <a href="http://www.chromium.org/blink/developer-faq" target="_blank">ideas and proposals</a> have sprung up about things like  <a href="http://www.chromium.org/developers/design-documents/oop-iframes" target="_blank">out of process iframes</a>, moving DOM to JS, multi-threaded layout, faster DOM bindings,&hellip;. Big architectural changes and refactorings means Chrome gets smaller, more secure, and faster over time.</p>

<h3>Increased transparency, accountability, responsibility</h3>

<p>Every feature added to the web platform has a cost. Through efforts like <a href="http://chromestatus.com" target="_blank">Chromium Feature Dashboard - chromestatus.com</a>, developers will be in the full know about what features we&rsquo;re adding. New APIs are going under a fine comb before being released. There&rsquo;s an extensive <a href="http://www.chromium.org/blink#new-features" target="_blank">process for adding new features</a>.</p>

<p>By the way, watch for chromestatus.com to get much more robust in the coming months. I&rsquo;m personally helping with that project. Look forward to it&rsquo;s v2 :)</p>

<h3>No vendor prefixes</h3>

<p><a href="http://paulirish.com/2012/vendor-prefixes-are-not-developer-friendly/" target="_blank">What a debacle vendor prefixes have been</a>! Features in Blink are going to be implemented unprefixed and kept behind the &ldquo;Enable experimental web platform features&rdquo; flag until they&rsquo;re ready for prime time. This is a great thing for authors.</p>

<h3>Testing Testing Testing</h3>

<p>More conformance testing is a win. Period. There&rsquo;s a huge benefit to all browser vendors when things are interoperable. Blink will be no exception.</p>

<h2>Conclusion</h2>

<p>I see Blink as an opportunity to take browser engines to the next level. Innovation needs to happen at all levels of the stack, not just shiny new HTML5 features.</p>

<p>Having multiple rendering engines—similar to having multiple browsers—will spur innovation and over time improve the health of the entire open web ecosystem.</p>

<p>If you have burning questions for Blink&rsquo;s engineering leads (Darin Fisher, Eric Seidel), <a href="http://www.google.com/moderator/#15/e=20ac1d&amp;t=20ac1d.40&amp;v=5" target="_blank">post them</a>. There will be a live video Q&amp;A tomorrow (Thursday, April 4th) at 1PM PST: <a href="http://developers.google.com/live" target="_blank">developers.google.com/live</a></p>
