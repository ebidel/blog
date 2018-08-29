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
// const GA_ACCOUNT = 'UA-114816386-1';
const app = express();

const env = nunjucks.configure(['./templates', POSTS_DIR], {
  autoescape: true,
  express: app,
  watch: DEV,
});

marked.setOptions({
  gfm: true,
  headerIds: true,
  tables: true,
  highlight: function(code, lang) {
    return highlight.highlightAuto(code).value;
  },
});

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

// Handle / dynamically.
app.get('/', (req, res, next) => {
  return res.render(`pages/index.html`, {PROD});
});

app.get('/posts/:year/:month/:file', (req, res, next) => {
  const file = req.params.file;
  const year = req.params.year;
  const month = req.params.month;

  const post = posts.get(`${POSTS_DIR}/${year}/${month}/${file}.md`);

  // const content = fs.readFileSync(path, {encoding: 'utf-8'});
  res.render('post.html', {year, month, file, post});
  // res.send(marked(content));
});

app.get('/:page', async (req, res, next) => {
  const page = req.params.page;

  // res.send(fs.readFileSync('./public/index.html', {encoding: 'utf-8'}));

  let data = {PROD};
  if (page === 'posts') {
    data = Object.assign({posts: await posts.list(POSTS_DIR)}, data);
  }

  return res.render(`pages/${page}.html`, data);
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`App listening on port ${PORT}`); /* eslint-disable-line */
  console.log('Press Ctrl+C to quit.'); /* eslint-disable-line */
  console.log('Populating posts...');
  await posts.list(POSTS_DIR);
  console.log('Done.');
});

