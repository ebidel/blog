// import fs from 'fs';
// import url from 'url';
// const URL = url.URL;
import express from 'express';
// import firebaseAdmin from 'firebase-admin';
import nunjucks from 'nunjucks';
import markdown from 'nunjucks-markdown';
import marked from 'marked';
// import highlight from 'highlight.js';
import RSSFeed from './rss.mjs';

import serverHelpers from './server-helpers.mjs';
import * as posts from './posts.mjs';

const POSTS_DIR = '_posts';
const DEV = process.env.DEV || false;
const PORT = process.env.PORT || 8080;
// const GA_ACCOUNT = 'UA-24818445-1';
const app = express();

const env = nunjucks.configure(['./templates', POSTS_DIR], {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
  express: app,
  watch: DEV,
});
env.addFilter('limit', (arr, limit) => arr.slice(0, limit));

// const renderer = new marked.Renderer();
// renderer.heading = function(text, level) {
//   const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
//   return `
//     <h${level}>
//       <a name="${escapedText}" class="anchor" href="#${escapedText}">
//         <span class="header-link"></span>
//       </a>
//       ${text}
//     </h${level}>`;
// };
marked.setOptions({
  gfm: true,
  headerIds: true,
  tables: true,
  // breaks: false,
  // pendantic: false,
  // sanitize: true,
  // smartLists: true,
  // renderer,
  // TODO: highlight js casues v8 crash on node gae runtime on pptr article.
  // highlight: (code, lang) => {
  //   return highlight.highlightAuto(code).value;
  // },
});
markdown.register(env, marked);

app.use(serverHelpers.forceSSL);
// app.use(serverHelpers.enableCors);
app.use(serverHelpers.addRequestHelpers);

// Try resource as static, first.
app.use(express.static('public', {extensions: ['html', 'htm']}));
app.use(express.static('node_modules'));

// TODO: check cache headers on this.
app.get('/sw.js', (req, res, next) => {
  res.sendFile('/js/sw.js', {root: './public'});
});

app.get('/posts/:year/:month/:file', (req, res, next) => {
  const file = req.params.file;
  const year = req.params.year;
  const month = req.params.month;
  const useCache = 'nocache' in req.query ? false : true;

  const post = posts.get(`${POSTS_DIR}/${year}/${month}/${file}.md`, useCache);

  // const content = fs.readFileSync(path, {encoding: 'utf-8'});
  // res.send(marked(content));
  res.render('post.html', {year, month, file, post, DEV});
});

// Provide this data to all subsequent handler.
app.use(async function includeData(req, res, next) {
  res.locals.data = {
    DEV,
    posts: await posts.list(POSTS_DIR),
  };
  next();
});

// Handle / dynamically.
app.get('/', (req, res, next) => {
  return res.render(`pages/index.html`, res.locals.data);
});

app.get('/rss.xml', (req, res, next) => {
  const feedUrl = req.getCurrentUrl();
  const xml = (new RSSFeed(feedUrl)).create(res.locals.data.posts);
  res.set('Content-Type', 'application/rss+xml');
  return res.status(200).send(xml);
});

app.get('/posts', async (req, res, next) => {
  const posts = res.locals.data.posts;

  const postsByYear = new Map();
  posts.map(post => {
    const year = post.data.published.getFullYear();
    if (postsByYear.has(year)) {
      postsByYear.get(year).push(post);
    } else {
      postsByYear.set(year, [post]);
    }
  });
  const data = Object.assign({years: postsByYear.entries()}, res.locals.data);
  return res.render('pages/posts.html', data);
});

app.get('/:page', async (req, res, next) => {
  return res.render(`pages/${req.params.page}.html`, res.locals.data);
});

app.use(serverHelpers.errorHandler); // catch all.

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`); /* eslint-disable-line */
  console.log('Press Ctrl+C to quit.'); /* eslint-disable-line */
  // console.log('Populating posts...');
  // await posts.list(POSTS_DIR);
  // console.log('Done.');
});

