---
title: Using http/2 for App Engine Local Development
published: 2016-09-14
---

<p>I&rsquo;ve been using <a href="https://cloud.google.com/appengine/docs/about-the-standard-environment" target="_blank">App Engine</a> for many years to develop web apps at Google. Most of the open source projects I&rsquo;ve worked on use it for its simplicity and scalability. A couple of examples are the <a href="https://events.google.com/io2016/" target="_blank">Google I/O web app</a>, the Chrome team&rsquo;s <a href="https://www.chromestatus.com/features" target="_blank">Chromestatus.com</a>, <a href="https://www.polymer-project.org/1.0/" target="_blank">Polymer&rsquo;s site</a>, <a href="https://developers.chrome.com/home" target="_blank">developers.chrome.com</a>, and <a href="https://developers.google.com/web/fundamentals/?hl=en" target="_blank">WebFundamentals</a>, just to name a few. Heck, I&rsquo;m even using it to build my wedding website!</p>

<h2>http/2 brings development and production closer together</h2>

<p>I could say a ton of nice things about App Engine, but one of its huge drawbacks is that the local development environment is far from Google&rsquo;s production environment (where your app actually runs). One of the most important differences is that <strong>App Engine&rsquo;s development server uses http/1.1 and Google&rsquo;s infrastructure uses http/2 (h2)</strong>.</p>

<p>Besides being 16 years in the making, h2 offers many performance improvements over it&rsquo;s 1.1 predecessor: multiplexing, header compression, server push). In a nutshell, this is difference between the two:</p>

<p><img src="https://78.media.tumblr.com/9d13dc545a79af5a44e63e10d8e0fc07/tumblr_odi8wqdOvF1r0c89zo1_1280.jpg" alt="http/1.1 vs. http/2"/></p>

<p>One of things I&rsquo;m most excited about is that <strong>h2 makes development closer to production</strong>. By that I mean the <strong>shape of a web app doesn&rsquo;t change when we hit the deploy button</strong>.</p>

<p>If you&rsquo;re like me, you probably develop source code in small, individual files. That&rsquo;s good for organization, maintainability, and our general sanity :) But for production, we create an entirely different story. We roll sprite sheets, domain shard, concatenate CSS, and bundle massive amounts of JS together to squeeze out every last drop of performance. With h2, all of those techniques become a thing of the past; and in fact, anti-patterns.</p>

<blockquote>
  <p>The h2 protocol makes it more efficient to serve many small files rather than a few large ones.</p>
</blockquote>

<p>Small, individual files <em>can</em>  lead to improved performance through better HTTP caching. For example, a one-line change won&rsquo;t invalidate 300KB of bundled JavaScript. Instead, a single file gets evicted from the browser&rsquo;s cache and the rest of your code is left alone.</p>

<p>So&hellip;http/2 is pretty great. All major browsers support it and large cloud/CDN providers have finally started to bake it in. The place that&rsquo;s still lacking is our development setups (remember my peeve about keeping dev ~= prod).</p>

<p>Since I use App Engine all the time, I wanted a way to close the gap between its prod and dev environment and utilize http/2 on App Engine&rsquo;s dev server. Turns out, that&rsquo;s not too hard to do.</p>

<h2>Enabling h2 with the App Engine dev server</h2>

<p>It&rsquo;s hard to performance tune an app when the HTTP protocol it uses locally is different than that of production. We want both environments to be as close as possible to each other.</p>

<p>To get <code>dev_appserver.py</code> serving resources over h2, I setup a reverse proxy using a server that supports h2 out of the box. I recommend <a href="https://nginx.org/en/" target="_blank">nginx</a> because it&rsquo;s fast, easy to setup, and easy to configure. The second thing we&rsquo;ll need to do is setup <code>localhost</code> to serve off <code>https</code>. That sounds scary, but it&rsquo;s fairly straightfoward</p>

<blockquote>
  <p>SSL is not a requirement of the h2 protocol but <strong>all browsers have mandated it for http/2 to work</strong> and many <a href="https://www.chromium.org/Home/chromium-security/deprecating-powerful-features-on-insecure-origins" target="_blank">new</a> (service worker) and <a href="https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/2LXKVWYkOus/gT-ZamfwAKsJ" target="_blank">old</a> (<code>getUserMedia</code>, geo location) web platorm APIs are requiring it.</p>
</blockquote>

<h3>Setting up nginx as reverse proxy to App Engine</h3>

<p>First, I installed nginx using <a href="http://brew.sh/" target="_blank">Homebrew</a>:</p>

<pre><code>brew install --with-http2 nginx
</code></pre>

<p>Nginx is supposed to support h2 out of the box <a href="https://www.nginx.com/blog/nginx-1-9-5/" target="_blank">since v1.9.5</a>, but I had to install it using <code>--with-http2</code> to get the goodies.</p>

<p>Homebrew installs nginx to <code>~/homebrew/etc/nginx</code> and will server static assets from <code>~/homebrew/var/www/</code>.</p>

<p>The Nginx install also creates a <code>~/homebrew/etc/nginx/servers</code> directory where you can stick custom server configurations.</p>

<p>To add a server, create <code>~/homebrew/etc/nginx/servers/appengine.conf</code> with:</p>

<pre><code>server {
    listen          3000;
    server_name     localhost;

    # If nginx cant find file, forward request to GAE dev server.
    location / {
        try_files   $uri   @gae_server;
    }

    location @gae_server {
        proxy_pass   http://localhost:8080;
    }
}
</code></pre>

<p>What this does is forward any requests that nginx can&rsquo;t find (right now that&rsquo;s all of them) to your GAE app running on <code>8080</code>.</p>

<p>Next, fire up your GAE app on <code>8080</code>:</p>

<pre><code>cd your_gae_app;
dev_appserver.py . --port 8080
</code></pre>

<p>and start nginx:</p>

<pre><code>nginx
</code></pre>

<p>If you need to stop the server, run:</p>

<p>nginx -s stop</p>

<p>At this point, you should be able to open <code>http://localhost:3000/</code> and see your GAE app! Requests are still over http/1.1 because we haven&rsquo;t setup SSL yet.</p>

<p><img src="https://78.media.tumblr.com/bee25237e7382944188670ba89282e4b/tumblr_odi8wqdOvF1r0c89zo2_1280.png" alt="Still on http 1.1"/></p>

<h2>Enabling SSL for localhost (ngnix)</h2>

<p>First, generate a self-signing certificate in <code>~/homebrew/etc/nginx/</code>:</p>

<pre><code>sudo openssl req -x509 -sha256 -newkey rsa:2048 \
    -keyout cert.key -out cert.pem \
    -days 1024 -nodes -subj '/CN=localhost'
</code></pre>

<p>This will create a private key (<code>cert.key</code>) and a certificate (<code>cert.pem</code>) for the domain <code>localhost</code>.</p>

<p>Next, modify <code>appengine.conf</code> like so:</p>

<pre><code>server {
    listen          443 ssl http2;
    server_name     localhost;

    ssl                        on;
    ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
    ssl_certificate            cert.pem; # or /path/to/cert.pem
    ssl_certificate_key        cert.key; # or /path/to/cert.key

    location / {
        try_files   $uri   @gae_server;
    }

    location @gae_server {
        proxy_pass   http://localhost:8080;
    }
}
</code></pre>

<p>The first couple of lines enable the <code>ssl</code> and <code>http2</code> modules on <code>localhost:443</code>. The next few instruct the server to read your private key and certificate (the ones you just generated). The rest of the file remains the same as before.</p>

<p>The OS will throw permission errors for opening ports under 1024, so you&rsquo;ll need to run <code>nginx</code> using <code>sudo</code> this time. The following command worked for me but you might be able to get away with just <code>sudo nginx</code>:</p>

<p>Start nginx using <code>sudo</code>:</p>

<pre><code>sudo ~/homebrew/bin/nginx
</code></pre>

<p>Open <code>https://localhost/</code> (note the &ldquo;https&rdquo;) and you&rsquo;ll get a big ol&rsquo; security warning from the browser:</p>

<p><img src="https://78.media.tumblr.com/735c5d0fa41542c889b885af6e5a78e3/tumblr_odi8wqdOvF1r0c89zo7_r1_1280.png" alt="localhost SSL cert warning"/></p>

<p>Don&rsquo;t worry! We know that we&rsquo;re legit. Click &ldquo;ADVANCED&rdquo;, and then &ldquo;Proceed to localhost (unsafe)&rdquo;.</p>

<p><strong>Note</strong>: if you really want the green lock, check out the instructions <a href="https://tech.finn.no/2015/09/25/setup-nginx-with-http2-for-local-development/" target="_blank">here</a> to add the self signed certificate as a trusted certificate in MacOS System Keychain.</p>

<p>Hitting refresh again on <code>https://localhost/</code> should give you responses over h2:</p>

<p><img src="https://78.media.tumblr.com/0243cbedb2bdcceec6f258184804639d/tumblr_odi8wqdOvF1r0c89zo3_1280.png" alt="localhost over SSL"/></p>

<p>Take this in. <strong>Your local GAE app is running over SSL and using http/2</strong> to serve requests!</p>

<h2>What about h2 server push?</h2>

<p><strong>Tip</strong> see my drop-in <a href="https://github.com/GoogleChrome/http2push-gae" target="_blank">http2push-gae</a> library for doing h2 push on Google App Engine.</p>

<p>At the time of writing, Nginx doesn&rsquo;t support h2 server push, but that doesn&rsquo;t mean we can&rsquo;t test with it locally!</p>

<p><a href="https://h2o.examp1e.net/" target="_blank">h2o</a> is another modern h2 server that&rsquo;s even easier to <a href="https://h2o.examp1e.net/configure/http2_directives.html" target="_blank">configure</a>, comes with an up-to-date h2 implementation, and supports server push out of the box.</p>

<p>First, install h2o using Homebrew:</p>

<pre><code>brew install h2o
</code></pre>

<p>By default, <code>h2o</code> installs to  <code>~/homebrew/bin/h2o</code> and will serve static files from <code>~/homebrew/var/h2o/</code>. You can change where files are served by editing <code>~/homebrew/etc/h2o/h2o.conf</code>.</p>

<p>Start a web server and verify that you see the default index.html page on <code>http://localhost:8080/</code>:</p>

<pre><code>h2o -c ~/homebrew/etc/h2o/h2o.conf
</code></pre>

<p>Next, create a new config, <code>~/homebrew/etc/h2o/appengine.conf</code>:</p>

<pre><code>hosts:
  "localhost":
    listen:
      port: 3000
    paths:
      "/":
        proxy.reverse.url: http://localhost:8080/
</code></pre>

<p>In the example, I&rsquo;ve done the same thing as the ngnix setup. We&rsquo;ve setup a server on port <code>3000</code> that will forward all requests to App Engine running on port <code>8080</code>.</p>

<h3>Enabling SSL for localhost (h2o)</h3>

<p>First, copy over your cert and key from the ngnix steps above (or generate new ones):</p>

<pre><code>cp ~/homebrew/etc/nginx/cert.key ~/homebrew/etc/h2o/
cp ~/homebrew/etc/nginx/cert.pem ~/homebrew/etc/h2o/
</code></pre>

<p>Modify <code>~/homebrew/etc/h2o/appengine.conf</code> to include an entry for <code>localhost:443</code>:</p>

<pre><code>hosts:
  "localhost:443":
    listen:
      port: 443
      ssl:
        certificate-file: cert.pem
        key-file:         cert.key
    paths:
      "/":
        proxy.reverse.url: http://localhost:8080/
</code></pre>

<p>Start the server using <code>sudo</code> (again, because we&rsquo;re opening a special port, <code>443</code>):</p>

<pre><code>sudo ~/homebrew/bin/h2o -c ~/homebrew/etc/h2o/appengine.conf
</code></pre>

<p>Be sure you&rsquo;ve started the GAE dev server (<code>dev_appserver.py . --port 8080</code>), and open <code>https://localhost</code> to see your running GAE app. Any resources that contain a <code>Link rel=preload</code> header will be server pushed by h2o:</p>

<p><img src="https://78.media.tumblr.com/b2915ef3edb0fa91b2271560c2350a4b/tumblr_odi8wqdOvF1r0c89zo4_1280.png" alt="h2 pushed resources"/></p>

<p>If you want to determine if a resource is being pushed, look for the <code>x-http2-push: pushed</code> header in the response. h2o will set that header on pushed resources. Alternatively, you can drill into Chrome&rsquo;s <code>chrome://net-internals</code> to <a href="https://github.com/GoogleChrome/http2push-gae/blob/master/EXPLAINER.md#verify-resources-are-pushed" target="_blank">verify pushed resources</a>.</p>

<p><img src="https://78.media.tumblr.com/62c7f560b8a55ba2794906d2287ea357/tumblr_odi8wqdOvF1r0c89zo5_250.png" alt="&lt;code&gt;x-http2-push: pushed&lt;/code&gt; header"/></p>

<h2>Maximize perf: speeding up static resources</h2>

<p>If you want even more speed, you can have nginx or h2o serve your static files directly instead proxying them to the dev server. Both servers are much faster than <code>dev_appserver.py</code> and will better mimic production App Engine.</p>

<h3>Configuring Ngnix to server static resources</h3>

<p>Add <code>root /path/to/gae_app/src;</code> to your server config:</p>

<pre><code>server {
    listen          443 ssl http2;
    server_name     localhost;
    root            /path/to/gae_app/src; # add this

    ssl                        on;
    ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;
    ssl_certificate            cert.pem;
    ssl_certificate_key        cert.key;

    location / {
        try_files   $uri   @gae_server;
    }

    location @gae_server {
        proxy_pass   http://localhost:8080;
    }
}
</code></pre>

<p>If nginx can find the file within your <code>root</code>, it will serve it directly rather than (needlessly) forwarding it to App Engine. All other requests will be proxied to App Engine as usual.</p>

<h3>Configuring h2o to server static resources</h3>

<p>Likewise, h2o can be instructed to serve your static files using <code>file.dir</code>. Just specify a URL request -&gt; /path/to/src mapping:</p>

<pre><code>hosts:
  "localhost:443":
    listen:
      port: 443
      ssl:
        certificate-file: cert.pem
        key-file:         cert.key
    paths:
      "/":
        proxy.reverse.url: http://localhost:8080/
      "/static":
        file.dir: /path/to/gae_app/static # add this
</code></pre>

<p>Now, all files under <code>https://localhost/static/*</code> will be served by h2o instead of GAE.</p>

<p><strong>Tip</strong>: Check your dev server logs to confirm ngnix/h2o are handling the static files. If requests don&rsquo;t show when you refresh the page, you&rsquo;re good to go. If requests show up, check that you&rsquo;re using the correct path for <code>root</code> or <code>file.dir</code>.</p>

<hr><p>And with that, Voila! We&rsquo;ve got the App Engine development server running fully over http/2.</p>

<p><br/><br/></p>

<h4>Credits</h4>

<p>These were invaluable resources when researching this post:</p>

<ul><li><a href="https://tech.finn.no/2015/09/25/setup-nginx-with-http2-for-local-development/" target="_blank">https://tech.finn.no/2015/09/25/setup-nginx-with-http2-for-local-development/</a></li>
<li><a href="http://desmondbrand.com/blog/2011/12/05/using-nginx-as-a-reverse-proxy-for-speedy-app-engine-development/" target="_blank">http://desmondbrand.com/blog/2011/12/05/using-nginx-as-a-reverse-proxy-for-speedy-app-engine-development/</a></li>
</ul>
