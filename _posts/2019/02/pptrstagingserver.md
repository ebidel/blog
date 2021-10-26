---
title: Puppeteer is my new dev server
published: 2019-02-14
excerpt: How we used headless Chrome and Puppeteer to create a development server for web.dev.
---

<style>
img.screenshot-table {
  width: 400px;
  max-width: 50vw;
}
.cutoff {
  position: relative;
}
.cutoff img {
  object-fit: cover;
  object-position: 0 0;
  height: 250px;
}
.cutoff::before {
  position: absolute;
  content: '';
  height: 100%;
  width: 100%;
  left: 0;
  background: linear-gradient(transparent 75%, #fff 95%);
}
</style>

## Launching a website without a dev server

Last year, my team launched [web.dev](https://web.dev/) at [Chrome Dev Summit 2018](https://developer.chrome.com/devsummit/). If you haven't heard of web.dev, it's
a new educational resource for web developers that focuses on interactive
learning. For example, we embed Glitch codelabs so developers can
tinker with code as they read through documentation. We also integrated
tools like [Lighthouse](https://developers.google.com/web/tools/lighthouse/)
directly into the docs so developers can run + iterate on their site
performance...all without leaving our dev guides! <img src="https://web.dev/images/lockup.svg" title="web.dev logo" alt="web.dev logo" style="height:50px" class="pull-right">

One of the challenges with working on web.dev is due to its architecture.
Essentially, half of the codebase (backend, core frontend, CSS/JS custom elements) is internal to Google. This critical code is internal so we can host, test, and build the site using Google's shared infrastructure for developer documentation, called "DevSite". The non critical stuff (e.g. written content) was externalized on Github to foster content contributions from the community. However, this multi-repo sitch left us with a problem:

> We had no way to run web.dev locally.

To illustrate the issue, fire up a Node server in a local checkout of web.dev's content repo (`git co https://github.com/GoogleChrome/web.dev`). Styles are missing, template includes aren't processed, and entire sections are flat out missing. There's not much
to get excited about.

<div class="layout horizontal around">
  <figure>
    <img src="/img/posts/2018/12/web.dev-home-unstyled.png" class="screenshot" style="max-height:300px" alt="Locally serving a web.dev page" title="Locally serving a web.dev page">
    <figcaption>Homepage served locally.</figcaption>
  </figure>
  <figure>
    <img src="/img/posts/2018/12/wev.dev-styled.png" class="screenshot" style="max-height:300px">
    <figcaption>Homepage as it renders on the site.</figcaption>
  </figure>
</div>

Our challenge was to fix this -- provide a tool for previewing content from
Github without having the full source of the page. How did we do that? We faked it!

## Faking a dev server

A typical development server is a web server that runs locally on your machine.
As you develop your site, it loads pages and tries to mimic production as much as possible.
You can review changes, try out new features before they're shipped...you know the drill.
For web.dev, we didn't have this luxury. But we needed _some_ tool for contributors to preview their stuff.

Our solution was to build a "content preview server" using [Headless Chrome][headlessarticle] and [Puppeteer][pptr]. When an author wants to make a change on web.dev, we:

1. Fetch the live version of page from web.dev.

- Read the local checkout of the page from disk.
- Replace any template includes with the actual content.
- Replace the page body with the update content changes.

In other words, web.dev's preview server doesn't serve pages. It **renders articles in the look and feel** of the site.

> web.dev's preview server doesn't serve pages. It **renders articles in the look and feel** of the site.

That's go through each of these steps, one by one.

### Step 1: fetch the live page from its web.dev URL

First, we launch headless Chrome using Puppeteer using the lib's one-liner:

```
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({headless: true});
```

With a `browser` instance to interactive with, we load the page from its URL. We'll call this the **remote page**. Loading the remote page gives us an important starting point for previewing a page: a fully rendered article. Since the production URL hosts the site CSS, built JS, and populated HTML templates, we don't need to maintain these resources ourselves.

```
/**
 * @param {string} url Remote page to load.
 * @return {!Page}
 */
async function fetchRemotePage(url) {
  const page = await browser.newPage();
  const resp = await page.goto(url, {waitUntil: 'domcontentloaded'});

  // If author is creating a new page, it won't have an URL yet.
  // Instead, use a generic page (index.html) for rendering the content.
  if (resp.status() === 404) {
    return fetchRemotePage('https://web.dev/');
  }

  return page;
}
```

**Note**: if the user is creating a new page, it won't have a web.dev URL just yet.
To handle new pages, we fetch the homepage as the "base" template because it's generic and doesn't have special layout.

As an example, if you were to run `fetchRemotePage('https://web.dev/learn')`,
this is what you would see in full "headful" Chrome:

<figure>
  <div class="cutoff">
    <img src="/img/posts/2018/12/learn-normal.png" class="screenshot screenshot-table">
  </div>
</figure>

### Step 2: read the local version of the page

The second step is to get a copy of the author's local content that they want to preview.
Let's call this a **local page**. A local page is an .html file that contains
a mixture of markup and plain markdown. We read this file from the same folder path
as its URL on the web.dev. For example, we want to preview `https://web.dev/foo/bar`,
we read `./foo/bar/index.html`.

```
/**
 * Read a local page from disk.
 * @param {string} path File path to read.
 * @return {!Promise<?string>} Resolves with the HTML of the file, null if path
 *     doesn't exist or there was another error.
 */
async function readLocalPageContent(path) {
  let filePath = `./${path}.html`;
  try {
    // If the .html file doesn't exist, path may be describing a folder, in
    // which case we should try the index.html file in that folder.
    if (!fs.existsSync(filePath)) {
      filePath = `./${path}/index.html`;
    }

    // Open a new tab. Create a new page by filling it with the file's HTML.
    const page = await browser.newPage();
    const html = fs.readFileSync(filePath, {encoding: 'utf-8'});
    await page.setContent(html);

    // The written content appears in <body>. Extract the stringified page
    // body and ignore other parts of the page.
    const body = await page.evaluate('document.body.innerHTML');

    await page.close(); // done with the tab.

    return body;
  } catch (err) {
    console.warn(err);
  }

  return null;
}
```

Running `readLocalPageContent()` gets us one step closer to a preview, but it
returns the raw file content as-is. We're still missing the template includes:

<figure>
  <div class="cutoff">
    <img src="/img/posts/2018/12/web.dev-home-unstyled.png" class="screenshot screenshot-table" alt="Local copy of page content" title="Local copy of page content">
  </div>
</figure>

### Step 3: populate template includes

As seen in the previous screenshot, pages can contain
includes that get put together by web.dev's server:

```
{% include "_root-cards.html" %}
```

To render these locally, we created a simple regex to scan local page
files for `{% include %}` pragmas and replace them with the referenced file
content.

```
/**
 * Replaces page's {% include "file.html" %} pragmas with content of the file.
 * @param {?string} html
 * @return {?string}
 */
function replaceIncludes(html) {
  if (!html) {
    return null;
  }
  const re = /{% include "(.*)\.html" %}/g;
  return html.replace(re, (match, filename, offset) => {
    const file = `./build/${filename}.html`;
    return fs.readFileSync(file, {encoding: 'utf-8'});
  });
}
```

Running this function replaces a pragma like `{% include "_root-cards.html" %}` with
the content in `_root-cards.html`. Visually, that looks like this:

<figure>
  <div class="cutoff">
    <img src="/img/posts/2018/12/web.dev-local.png" class="screenshot screenshot-table">
  </div>
</figure>

### Step 4: Swap-in local changes

At this point we have two things:

1. A local page with updated HTML but lacks all of the site's layout/styling.
2. A remote version of the page that contains the site's layout/styling but contains outdated HTML.

Merging these two will produce the result we need! Using Puppeteer, we can
manipulate the remote page's DOM and replace the outdated content with the new stuff.
The method for that is `page.evaluate()`, which allows you to run code in the
context of a page:

```
// Replace remote page body area with new content.
await page.evaluate((html) => {
  const mainSection = document.querySelector('.devsite-article-body');
  mainSection.innerHTML = html;
}, localPageHTML);
```

**Note**: The second argument to `page.evaluate()` is how you pass a variable from
Node into the page. In this case, the variable is the HTML string from [Step 3](#step-3-populate-template-includes).

<figure>
  <div class="cutoff">
    <img src="/img/posts/2018/12/web.dev-learn-cutout.png" class="screenshot screenshot-table">
  </div>
  <figcaption>Section of the live page that gets replaced</figcaption>
</figure>

### Putting it all together

With the methods we've created in steps 1-4, we have all the pieces necessary
to define a magical `constructPage()` that returns the final HTML for the
preview server to render.

```
let browser; // Reuse browser instance throughout lifetime of preview server.

/**
 * Constructs a page by fetching it from web.dev, then merging it with the
 * the local version on disk.
 * @param {string} path File path to render.
 * @return {!Promise<?string>} Serialized page output as an html string or null
 *     if the local page file does not exist.
 */
export async function constructPage(path) {
  path = path.slice(1); // strip leading '/'.
  const url = `https://web.dev/${path}`;

  // Launch new instance of browser to reuse it across renders.
  if (!browser) {
    browser = await puppeteer.launch({headless: true});
  }

  // Read local version of the page. Replace {% include %} with their content.
  const localPageHTML = replaceIncludes(await readLocalPageContent(path));
  if (!localPageHTML) {
    return null;
  }

  const page = await fetchRemotePage(url);

  // Replace main body of the remote page with the local changes.
  await page.evaluate(localPageHTML => {
    const mainContentArea = document.querySelector('.devsite-article-body');
    mainContentArea.innerHTML = localPageHTML;
  }, localPageHTML);

  const finalHTML = await page.content(); // serialized HTML of assembled page.

  await page.close();

  return finalHTML;
}
```

#### Server code

The actual preview server for web.dev is tiny. It's an [Express][servercode] app
that uses [Puppeteer][pptr] and headless Chrome to render previews. The
`constructPage()` method from above does all of the heavy lifting and returns
the constructed page to users.

```
import express from 'express';

const app = express();

app.use('/', async (req, res, next) => {
  // URLs on web.dev have no extension (/learn instead of /learn.html).
  // If there is an extension in the URL, drop to next route and try to
  // handle the request as a static file.
  const path = req.path;
  if (path && path.split('.').length > 1) {
    return next();
  }

  const html = await constructPage({path});  // covered below.
  res.status(200).send(html);
});

// Catch all other requests as a static file.
app.use(express.static('build', {extensions: ['html', 'htm']}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Started server on ${PORT}. Press Ctrl+C to quit.`);
});
```

## Conclusion

Puppeteer is a powerful tool for manipulating web pages in Node. For web.dev,
we used it to mimic a dev server without having all the required files to
render a full page. The process was simple: pull a page from its production URL,
inject the local edits, and serve the result to authors. What I liked about this approach is that we didn't need traditional tools or build pipelines to preview web.dev content. A headless browser and DOM APIs were our build tools!

If you want to explore more in this space check out my article, "[Headless Chrome: an answer to server-side rendering JS sites][headlessssr]".

p.s. Happy Valentine's Day! ❤️

[servercode]: https://github.com/GoogleChrome/web.dev/tree/master/server
[headlessarticle]: https://developers.google.com/web/updates/2017/04/headless-chrome
[headlessssr]: https://developers.google.com/web/tools/puppeteer/articles/ssr
[pptr]: https://developers.google.com/web/tools/puppeteer/
