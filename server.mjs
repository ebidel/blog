// import fs from 'fs';
// import url from 'url';
// const URL = url.URL;
import express from 'express';
// import firebaseAdmin from 'firebase-admin';
import nunjucks from 'nunjucks';
import markdown from 'nunjucks-markdown';
import marked from 'marked';
import highlight from 'highlight.js';

import * as posts from './posts.mjs';

const POSTS_DIR = '_posts';

/* eslint-disable */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error('errorHandler', err);
  res.status(500).send({errors: `${err}`});
}
/* eslint-enable */

const DEV = process.env.DEV || false;
const PROD = !DEV;
const PORT = process.env.PORT || 8080;
// const GA_ACCOUNT = 'UA-24818445-1';
const app = express();

marked.setOptions({
  gfm: true,
  headerIds: true,
  tables: true,
  highlight: function(code, lang) {
    return highlight.highlightAuto(code).value;
  },
});

const env = nunjucks.configure(['./templates', POSTS_DIR], {
  autoescape: true,
  express: app,
  watch: DEV,
});

env.addFilter('limit', (arr, limit) => arr.slice(0, limit));

markdown.register(env, marked);

app.use(function forceSSL(req, res, next) {
  const fromCron = req.get('X-Appengine-Cron');
  if (!fromCron && req.hostname !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// app.use(function enableCors(req, res, next) {
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
//   next();
// });

// app.get('/:demoPage', (req, res, next) => {
//   // const demoPage = req.params.demoPage;
//   // console.log(demoPage)
//   res.send(fs.readFileSync('./public/index.html', {encoding: 'utf-8'}));
// });

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

  const post = posts.get(`${POSTS_DIR}/${year}/${month}/${file}.md`);

  // const content = fs.readFileSync(path, {encoding: 'utf-8'});
  // res.send(marked(content));
  res.render('post.html', {year, month, file, post});
});

// Provide this data to all subsequent handler.
app.use(async function includeData(req, res, next) {
  res.locals.data = {
    PROD,
    posts: await posts.list(POSTS_DIR),
  };
  next();
});

// Handle / dynamically.
app.get('/', (req, res, next) => {
  return res.render(`pages/index.html`, res.locals.data);
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

app.use(errorHandler); // catch all.

app.listen(PORT, async () => {
  console.log(`App listening on port ${PORT}`); /* eslint-disable-line */
  console.log('Press Ctrl+C to quit.'); /* eslint-disable-line */
  // console.log('Populating posts...');
  // await posts.list(POSTS_DIR);
  // console.log('Done.');
});

